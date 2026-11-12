// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import OSS from "ali-oss";
import { CreateCourseModulAction } from "@/app/actions/Create/Create_CourseModul";
import { forbidden, requireLogin, requireRoles } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbiddenRole = requireRoles(session!, [UserRole.TEACHER, UserRole.ADMIN]);
    if (forbiddenRole) return forbiddenRole;

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const TeacherId = formData.get("TeacherId") as string;
    const originalFileName = formData.get("originalFileName") as string;
    const file = formData.get("file") as File;

    // 教師只能以自己的 TeacherId 上傳教材
    if (session!.user.role === UserRole.TEACHER && TeacherId !== session!.user.id) {
      return forbidden("無權操作：教師只能上傳自己的教材");
    }

    let teaching_materials = "";
    if (file) {
      const client = new OSS({
        region: process.env.OSS_REGION,
        accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
        endpoint: process.env.OSS_ENDPOINT,
        bucket: process.env.OSS_BUCKET,
      });

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await client.put(`teaching-materials/${TeacherId}/${originalFileName}`, buffer);
      teaching_materials = result.url;
    }

    const courseModulData = {
      title,
      description,
      TeacherId,
      teaching_materials,
      originalFileName,
    };

   const result = await CreateCourseModulAction(courseModulData);
    if ("error" in result) {
      console.error("CreateCourseModulAction failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    console.error("Upload API Error:", errorMessage, error);
    return NextResponse.json({ error: `檔案上傳失敗: ${errorMessage}` }, { status: 500 });
  }
}