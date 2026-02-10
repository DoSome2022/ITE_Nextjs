
"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";           // 正確：僅快取相關
import { redirect } from "next/navigation";         // 正確：導航相關
import { prisma } from "@/lib/prisma";
import type { PostAdminUpdateInput } from "@/types/post-admin";
import { uploadMultipleToOSS, deleteFromOSS } from "@/lib/oss";

const ADMIN_ROLE = "ADMIN";

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== ADMIN_ROLE) {
    throw new Error("未授權：僅限管理員操作");
  }

  return session.user;
}

function extractFilesFromFormData(formData: FormData): {
  imageFiles: File[];
  videoUrls: string[];
  otherData: Record<string, string>;
  id?: string;
  filesToDelete: string[];
  relatedCourses?: string;
} {
  const imageFiles: File[] = [];
  const videoUrls: string[] = [];
  const otherData: Record<string, string> = {};
  const filesToDelete: string[] = [];
  let relatedCourses: string | undefined;

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0 && value.type.startsWith("image/")) {
        imageFiles.push(value);
      }
      // 可以選擇忽略非圖片檔案，或加入錯誤處理
    } else if (typeof value === "string") {
      const trimmedValue = value.trim();

      if (key.startsWith("delete_")) {
        if (trimmedValue) filesToDelete.push(trimmedValue);
      } else if (key === "video_urls") {
        if (trimmedValue) videoUrls.push(trimmedValue);
      } else if (key === "relatedCourses") {
        // 明確處理 relatedCourses
        if (trimmedValue) {
          relatedCourses = trimmedValue;
        }
      } else if (key === "id") {
        otherData[key] = trimmedValue;
      } else {
        // 其他文字欄位
        otherData[key] = trimmedValue;
      }
    }
  }

  return {
    imageFiles,
    videoUrls,
    otherData,
    filesToDelete,
    id: otherData.id,
    relatedCourses,
  };
}

async function processFileUploads(
  imageFiles: File[],
  existingImageUrls: string[] = []
): Promise<{ img_url: string[] }> {
  const newImageUrls: string[] = [];

  if (imageFiles.length > 0) {
    const uploadedImageUrls = await uploadMultipleToOSS(imageFiles);
    newImageUrls.push(...uploadedImageUrls);
  }

  return {
    img_url: [...existingImageUrls, ...newImageUrls],
  };
}
// 統一處理新建與更新
export async function createPostAdmin(formData: FormData): Promise<any> {
  await ensureAdmin();

  let shouldRedirect = false;
  let redirectPath = "/admin/PostLists";

  try {
    const { 
      imageFiles, 
      videoUrls, 
      otherData, 
      filesToDelete, 
      id, 
      relatedCourses: rawRelatedCourses 
    } = extractFilesFromFormData(formData);

    if (!otherData.Title?.trim()) {
      throw new Error("標題不能為空");
    }

    // 清理 relatedCourses：移除前後空白，若完全空白則設為 null
    const cleanedRelatedCourses = rawRelatedCourses?.trim() 
      ? rawRelatedCourses.trim() 
      : null;

    let img_url: string[] = [];
    const cleanedVideoUrls = videoUrls.filter(Boolean);

    if (id) {
      // 更新模式
      const existingPost = await prisma.postAdmin.findUnique({
        where: { id },
        select: { img_url: true, video_url: true },
      });

      if (!existingPost) {
        throw new Error("文章不存在");
      }

      if (filesToDelete.length > 0) {
        await deleteFromOSS(filesToDelete);
      }

      const remainingImages = existingPost.img_url.filter(
        (url) => !filesToDelete.includes(url)
      );

      const { img_url: newImgUrls } = await processFileUploads(
        imageFiles,
        remainingImages
      );
      img_url = newImgUrls;

      const updatedPost = await prisma.postAdmin.update({
        where: { id },
        data: {
          Title: otherData.Title,
          SupTitle: otherData.SupTitle || undefined,
          content: otherData.content || undefined,
          author: otherData.author || undefined,
          img_url,
          video_url: cleanedVideoUrls.length > 0 ? cleanedVideoUrls : undefined,
          relatedCourses: cleanedRelatedCourses,  // 使用清理後的值
        },
      });

      // 更新成功日誌
      console.log("[PostAdmin] 更新成功", {
        id: updatedPost.id,
        title: updatedPost.Title,
        updatedAt: updatedPost.updatedAt.toISOString(),
        img_count: updatedPost.img_url.length,
        video_count: updatedPost.video_url?.length ?? 0,
        relatedCourses_length: updatedPost.relatedCourses?.length ?? 0,
        relatedCourses_preview: updatedPost.relatedCourses 
          ? updatedPost.relatedCourses.substring(0, 120) + (updatedPost.relatedCourses.length > 120 ? "..." : "")
          : "無",
        has_content: !!updatedPost.content,
      });

      revalidatePath("/admin/PostLists");
      revalidatePath(`/admin/PostLists/${id}`);
      shouldRedirect = true;
    } else {
      // 新建模式
      const { img_url: newImgUrls } = await processFileUploads(imageFiles);
      img_url = newImgUrls;

      const newPost = await prisma.postAdmin.create({
        data: {
          Title: otherData.Title,
          SupTitle: otherData.SupTitle || null,
          content: otherData.content || null,
          author: otherData.author || null,
          img_url,
          video_url: cleanedVideoUrls,
          relatedCourses: cleanedRelatedCourses,  // 使用清理後的值
        },
      });

      // 新建成功日誌（包含 relatedCourses 預覽）
      console.log("[PostAdmin] 新建成功", {
        id: newPost.id,
        title: newPost.Title,
        createdAt: newPost.createdAt.toISOString(),
        img_count: newPost.img_url.length,
        video_count: newPost.video_url.length,
        relatedCourses_length: newPost.relatedCourses?.length ?? 0,
        relatedCourses_preview: newPost.relatedCourses 
          ? newPost.relatedCourses.substring(0, 120) + (newPost.relatedCourses.length > 120 ? "..." : "")
          : "無",
        has_content: !!newPost.content,
      });

      revalidatePath("/admin/PostLists");
      shouldRedirect = true;
    }
  } catch (error: any) {
    console.error("[PostAdmin] 操作失敗:", {
      message: error.message,
      stack: error.stack ? error.stack.split("\n").slice(0, 4).join("\n") : undefined,
    });
    throw new Error(error.message || "操作失敗，請稍後重試");
  }

  // 重定向必須放在 try-catch 外部
  if (shouldRedirect) {
    redirect(redirectPath);
  }
}

// 簡單文字更新（不涉及檔案）
export async function simpleUpdatePostAdmin(
  data: PostAdminUpdateInput
): Promise<any> {
  await ensureAdmin();

  const { id, ...updateData } = data;

  try {
    const post = await prisma.postAdmin.update({
      where: { id },
      data: {
        Title: updateData.Title ?? undefined,
        SupTitle: updateData.SupTitle ?? undefined,
        content: updateData.content ?? undefined,
        author: updateData.author ?? undefined,
        img_url: updateData.img_url ?? undefined,
        video_url: updateData.video_url ?? undefined,
      },
    });

    revalidatePath("/admin/PostLists");
    revalidatePath(`/admin/PostLists/${id}`);
    redirect("/admin/PostLists"); // 若從編輯頁呼叫，導回列表以即時更新

    return { success: true, data: post, message: "文章更新成功" };
  } catch (error: any) {
    console.error("更新文章失敗:", error);
    throw new Error(error.message || "更新文章失敗");
  }
}
// 刪除單篇文章（純 Server Action，重定向為主）
// 刪除單篇文章（Server Action，主導重定向）
export async function deletePostAdmin(id: string): Promise<never> {
  await ensureAdmin();

  let deletionSuccess = false;

  try {
    // 查詢文章是否存在並取得相關檔案 URL
    const post = await prisma.postAdmin.findUnique({
      where: { id },
      select: { img_url: true, video_url: true },
    });

    if (!post) {
      throw new Error("文章不存在");
    }

    // 刪除 OSS 中的相關檔案
    const allUrls = [...post.img_url, ...post.video_url];
    if (allUrls.length > 0) {
      await deleteFromOSS(allUrls);
    }

    // 執行資料庫刪除
    await prisma.postAdmin.delete({
      where: { id },
    });

    // 重新驗證列表頁面快取
    revalidatePath("/admin/PostLists");

    // 記錄成功日誌
    console.log("[PostAdmin] 刪除成功", {
      id,
      deletedAt: new Date().toISOString(),
    });

    deletionSuccess = true;
  } catch (error: any) {
    // 僅記錄真正的錯誤（不包含重定向相關）
    console.error("刪除文章失敗:", {
      id,
      message: error.message,
      stack: error.stack ? error.stack.split("\n").slice(0, 3).join("\n") : undefined,
    });

    // 拋出給客戶端顯示的錯誤訊息
    throw new Error(error.message || "刪除文章失敗，請稍後重試");
  }

  // 成功時才執行重定向（放在 try-catch 外部）
  if (deletionSuccess) {
    redirect("/admin/PostLists");
  }

  // 理論上不會執行到這裡
  throw new Error("刪除流程異常結束");
}

// 批次刪除
export async function deleteMultiplePostAdmins(
  ids: string[]
): Promise<{ success: boolean; message: string }> {
  await ensureAdmin();

  try {
    if (!ids || ids.length === 0) {
      throw new Error("未選擇要刪除的文章");
    }

    const posts = await prisma.postAdmin.findMany({
      where: { id: { in: ids } },
      select: { img_url: true, video_url: true },
    });

    const allUrls = posts.flatMap((post) => [...post.img_url, ...post.video_url]);
    if (allUrls.length > 0) {
      await deleteFromOSS(allUrls);
    }

    await prisma.postAdmin.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/admin/PostLists");
    redirect("/admin/PostLists"); // 批次刪除後導回列表

    return {
      success: true,
      message: `已成功刪除 ${ids.length} 篇文章`,
    };
  } catch (error: any) {
    console.error("批量刪除文章失敗:", error);
    throw new Error("批量刪除文章失敗，請稍後重試");
  }
}

// 獲取文章列表（分頁 + 搜尋）
export async function getPostAdmins({
  page = 1,
  limit = 10,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  try {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { Title: { contains: search, mode: "insensitive" as const } },
            { SupTitle: { contains: search, mode: "insensitive" as const } },
            { content: { contains: search, mode: "insensitive" as const } },
            { author: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.postAdmin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.postAdmin.count({ where }),
      
    ]);

    const formattedPosts = posts.map((post) => ({
      ...post,
      formattedCreatedAt: `${post.createdAt.getFullYear()}/${String(
        post.createdAt.getMonth() + 1
      ).padStart(2, "0")}/${String(post.createdAt.getDate()).padStart(2, "0")}`,
    }));

    return {
      success: true,
      data: {
        posts: formattedPosts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error("獲取文章列表失敗:", error);
    return {
      success: false,
      error: "獲取文章列表失敗",
      data: { posts: [], total: 0, page, limit, totalPages: 0 },
    };
  }
}

// 獲取單篇文章
export async function getPostAdminById(id: string) {
  try {
    if (!id || typeof id !== "string") {
      throw new Error("无效的文章 ID");
    }

    const post = await prisma.postAdmin.findUnique({
      where: { id },
    });

    if (!post) {
      throw new Error("文章不存在");
    }

    return {
      success: true,
      data: post,
    };
  } catch (error: any) {
    console.error("获取文章失败:", error);
    throw new Error(error.message || "获取文章失败");
  }
}

// 獨立檔案上傳（僅圖片）
export async function uploadFiles(
  formData: FormData
): Promise<{ success: boolean; urls: string[]; message?: string }> {
  await ensureAdmin();

  try {
    const { imageFiles } = extractFilesFromFormData(formData);

    if (imageFiles.length === 0) {
      return {
        success: false,
        urls: [],
        message: "未選擇任何檔案",
      };
    }

    const urls = await uploadMultipleToOSS(imageFiles);

    return {
      success: true,
      urls,
      message: `成功上傳 ${urls.length} 個檔案`,
    };
  } catch (error: any) {
    console.error("檔案上傳失敗:", error);
    return {
      success: false,
      urls: [],
      message: error.message || "檔案上傳失敗",
    };
  }
}