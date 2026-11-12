// app/api/SpecialCourse/Create_SpecialCourse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import OSS from "ali-oss";
import { randomUUID } from "crypto";
import { z } from "zod";
import { requireLogin, requireRoles } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

const ossClient = new OSS({
  region: process.env.OSS_REGION!,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
  bucket: process.env.OSS_BUCKET!,
  endpoint: process.env.OSS_ENDPOINT,
});

const uploadToOSS = async (file: File, path: string) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${path}/${randomUUID()}-${file.name}`;
  const result = await ossClient.put(fileName, buffer);
  return { id: randomUUID(), img_url: result.url };
};

const TimeRangeSchema = z.object({
  timeRange: z.string().min(1),
  starttime: z.string().min(1),
  endtime: z.string().min(1),
}).refine(
  (data) => {
    const [sh, sm] = data.starttime.split(":").map(Number);
    const [eh, em] = data.endtime.split(":").map(Number);
    return (eh * 60 + em) > (sh * 60 + sm);
  },
  { message: "結束時間必須晚於開始時間" }
);

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    const formData = await req.formData();

    const getString = (key: string): string => {
      const val = formData.get(key);
      return val ? String(val) : "";
    };

    const getOptionalString = (key: string): string | null => {
      const val = formData.get(key);
      return val && String(val).trim() !== "" ? String(val) : null;
    };

    // 基本字段
    const title = getString("title");
    const description = getString("description");
    const courseCode = getString("courseCode");
    const schoolName = getString("schoolName");
    const teacherId = getString("teacherId");

    if (!title || !courseCode || !schoolName || !teacherId) {
      throw new Error("必填字段缺失");
    }

    const numberOfDays = parseInt(getString("numberOfDays"));
    const timeHours = parseFloat(getString("timeHours"));
    if (isNaN(numberOfDays) || numberOfDays <= 0 || isNaN(timeHours) || timeHours <= 0) {
      throw new Error("數值字段無效");
    }

    const maxStudents = getOptionalString("maxStudents") ? parseInt(getOptionalString("maxStudents")!) : null;

    // 陣列字段（稍後用 update 設置）
    const teacherRaw = getString("teacher");
    const typeRaw = getString("type");
    const coursedatesRaw = getString("Coursedates");

    const teacher: string[] = teacherRaw ? JSON.parse(teacherRaw).filter((t: any) => typeof t === "string") : [];
    const type: string[] = typeRaw ? JSON.parse(typeRaw).filter((t: any) => typeof t === "string") : [];
    const Coursedates: Date[] = coursedatesRaw
      ? JSON.parse(coursedatesRaw)
          .filter((d: any) => typeof d === "string")
          .map((d: string) => new Date(d))
          .filter((d: Date) => !isNaN(d.getTime()))
      : [];

    // 其他字段
    const isPublic = getString("isPublic") === "true";
    const isProduct = getString("isProduct") === "true";
    const courseModulId = getOptionalString("courseModulId") || undefined;
    const weekday = getOptionalString("weekday");
    const classroom = getOptionalString("classroom");

    const startDate = getOptionalString("startDate") ? new Date(getOptionalString("startDate")!) : null;
    const endDate = getOptionalString("endDate") ? new Date(getOptionalString("endDate")!) : null;

    const price = getOptionalString("price") ? parseInt(getOptionalString("price")!) : null;
    const real_price = getOptionalString("real_price") ? parseInt(getOptionalString("real_price")!) : null;
    const Target_Audience = getOptionalString("Target_Audience");
    const Course_Objective = getOptionalString("Course_Objective");
    const Applicable_Scenarios = getOptionalString("Applicable_Scenarios");

    // 時間段
    const timeRangesJson = getString("SpecialCourseTimeRanges");
    const validatedTimeRanges = timeRangesJson
      ? z.array(TimeRangeSchema).parse(JSON.parse(timeRangesJson))
      : [];
    if (validatedTimeRanges.length === 0) throw new Error("至少需要一個時間段");

    // 圖片
    const images = formData.getAll("images") as File[];
    let IMG_URL: { images: { id: string; img_url: string }[] } | undefined = undefined;
    if (images.length > 0) {
      const uploaded = await Promise.all(images.map(f => uploadToOSS(f, "specialCourse/images")));
      const clean = uploaded.map(img => ({ id: img.id, img_url: img.img_url }));
      if (clean.length > 0) IMG_URL = { images: clean };
    }

    // 影片
    const videoRaw = getString("Video_URL");
    let Video_URL: { id: string; video_url: string }[] | undefined = undefined;
    if (videoRaw) {
      try {
        const parsed = JSON.parse(videoRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          Video_URL = parsed
            .filter((v: any) => v && typeof v.video_url === "string")
            .map((v: any) => ({
              id: v.id || randomUUID(),
              video_url: v.video_url,
            }));
        }
      } catch {}
    }

    // === 關鍵：分步創建，避免陣列綁定錯誤 ===
    const result = await db.$transaction(async (tx) => {
      // Step 1: 創建不含陣列欄位的記錄
// 在交易內
const course = await tx.specialCourse.create({
  data: {
    title,
    description,
    courseCode,
    schoolName,
    numberOfDays,
    timeHours,
    teacherId,
    isPublic,
    isProduct,
    courseModulId,
    startDate,
    endDate,
    weekday,
    classroom,
    price,
    real_price,
    Target_Audience,
    Course_Objective,
    Applicable_Scenarios,
    IMG_URL,
    Video_URL,

    // 完全不傳任何 Int? 欄位（包括 maxStudents、numberOfStudents）
    // maxStudents: ... ← 刪除這行
    // numberOfStudents: ... ← 若有也刪除

    // 強制空陣列
    teacher: { set: [] },
    type: { set: [] },
    Coursedates: { set: [] },
  },
});
// 後續 update 設置真實陣列值
await tx.specialCourse.update({
  where: { id: course.id },
  data: {
    ...(maxStudents != null && { maxStudents }), // 若需要可在此重設
    teacher: { set: teacher },
    type: { set: type },
    Coursedates: { set: Coursedates },
  },
});

      // Step 3: 創建時間段
      if (validatedTimeRanges.length > 0) {
        await tx.specialCourseTimeRange.createMany({
          data: validatedTimeRanges.map(tr => ({
            courseId: course.id,
            timeRange: tr.timeRange,
            starttime: tr.starttime,
            endtime: tr.endtime,
          })),
        });
      }

      return tx.specialCourse.findUnique({
        where: { id: course.id },
        include: { SpecialCourseTimeRanges: true },
      });
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    console.error("創建特殊課程失敗:", error);
    return NextResponse.json(
      { success: false, error: error.message || "創建失敗" },
      { status: 500 }
    );
  }
}

// // app/api/SpecialCourse/Create_SpecialCourse/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import OSS from "ali-oss";
// import { randomUUID } from "crypto";

// const ossClient = new OSS({
//   region: process.env.OSS_REGION!,
//   accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
//   accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
//   bucket: process.env.OSS_BUCKET!,
//   endpoint: process.env.OSS_ENDPOINT,
// });

// const uploadToOSS = async (file: File, path: string) => {
//   const buffer = Buffer.from(await file.arrayBuffer());
//   const fileName = `${path}/${randomUUID()}-${file.name}`;
//   const result = await ossClient.put(fileName, buffer);
//   return { id: randomUUID(), img_url: result.url };
// };

// // 解析時間段數據
// function parseTimeRangesData(formData: FormData) {
//   const timeRangesJson = formData.get("SpecialCourseTimeRanges") as string | null;
//   if (timeRangesJson) {
//     try {
//       return JSON.parse(timeRangesJson);
//     } catch (error) {
//       console.error("解析 SpecialCourseTimeRanges 失敗:", error);
//       return [];
//     }
//   }
//   return [];
// }

// // 解析影片 URL 數據
// function parseVideoUrlData(formData: FormData) {
//   const videoUrlJson = formData.get("Video_URL") as string | null;
//   if (videoUrlJson) {
//     try {
//       return JSON.parse(videoUrlJson);
//     } catch (error) {
//       console.error("解析 Video_URL 失敗:", error);
//       return undefined;
//     }
//   }
//   return undefined;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();

//     const title = formData.get("title") as string;
//     const description = formData.get("description") as string;
//     const courseCode = formData.get("courseCode") as string;
//     const schoolName = formData.get("schoolName") as string;
//     const numberOfDays = Number(formData.get("numberOfDays"));
//     const maxStudents = formData.get("maxStudents") ? Number(formData.get("maxStudents")) : null;
//     const timeHours = Number(formData.get("timeHours"));
//     const teacher = JSON.parse(formData.get("teacher") as string);
//     const teacherId = formData.get("teacherId") as string;
//     const isPublic = formData.get("isPublic") === "false";
//     const isProduct = formData.get("isProduct") === "true";
//     const type = JSON.parse(formData.get("type") as string);

//     // 安全處理 courseModulId
//     const rawCourseModulId = formData.get("courseModulId") as string | null;
//     const courseModulId = rawCourseModulId && rawCourseModulId !== "null" && rawCourseModulId !== "" 
//       ? rawCourseModulId 
//       : undefined;

//     const startDate = formData.get("startDate") as string | null;
//     const endDate = formData.get("endDate") as string | null;
//     const Coursedates = JSON.parse(formData.get("Coursedates") as string);
//     const weekday = formData.get("weekday") as string | null;
//     const classroom = formData.get("classroom") as string | null;

//     // Product 欄位
//     const price = formData.get("price") ? Number(formData.get("price")) : null;
//     const real_price = formData.get("real_price") ? Number(formData.get("real_price")) : null;
//     const Target_Audience = formData.get("Target_Audience") as string | null;
//     const Course_Objective = formData.get("Course_Objective") as string | null;
//     const Applicable_Scenarios = formData.get("Applicable_Scenarios") as string | null;

//     // 圖片檔案
//     const images = formData.getAll("images") as File[];

//     // 解析時間段與影片 URL
//     const timeRangesData = parseTimeRangesData(formData);
//     const videoUrlData = parseVideoUrlData(formData);

//     // 上傳圖片
//     const uploadedImages = await Promise.all(
//       images.map((file) => uploadToOSS(file, `specialCourse/images`))
//     );

//     // 圖片 JSON 結構
//     const imgUrlData = uploadedImages.length > 0 
//       ? { images: uploadedImages } 
//       : undefined;

//     // 使用事務創建
//     const result = await db.$transaction(async (tx) => {
//       // 創建 specialCourse
//       const newCourse = await tx.specialCourse.create({
//         data: {
//           title,
//           description,
//           courseCode,
//           schoolName,
//           numberOfDays,
//           maxStudents,
//           timeHours,
//           teacher,
//           teacherId,
//           isPublic,
//           isProduct,
//           type,
//           courseModulId,
//           startDate: startDate ? new Date(startDate) : null,
//           endDate: endDate ? new Date(endDate) : null,
//           Coursedates: Coursedates.map((d: string) => new Date(d)),
//           weekday,
//           classroom,
//           price,
//           real_price,
//           Target_Audience,
//           Course_Objective,
//           Applicable_Scenarios,
//           IMG_URL: imgUrlData,
//           Video_URL: videoUrlData, // 直接存 JSON 陣列
//         },
//       });

//       // 創建時間段
//       if (Array.isArray(timeRangesData) && timeRangesData.length > 0) {
//         await tx.specialCourseTimeRange.createMany({
//           data: timeRangesData.map((tr: any) => ({
//             courseId: newCourse.id,
//             timeRange: tr.timeRange,
//             starttime: tr.starttime ?? null,
//             endtime: tr.endtime ?? null,
//           })),
//         });
//       }

//       // 返回完整資料
//       return await tx.specialCourse.findUnique({
//         where: { id: newCourse.id },
//         include: {
//           SpecialCourseTimeRanges: true,
//         },
//       });
//     });

//     console.log("特殊課程創建成功:", result);
//     return NextResponse.json(result);

//   } catch (error: any) {
//     console.error("Create SpecialCourse error:", error);

//     // 外鍵錯誤（courseModulId 無效）
//     if (error.code === "P2003") {
//       return NextResponse.json(
//         { error: "無效的 courseModulId，請檢查課程模組是否存在" },
//         { status: 400 }
//       );
//     }

//     // 其他錯誤
//     return NextResponse.json(
//       { error: "創建失敗: " + error.message },
//       { status: 500 }
//     );
//   }
// }