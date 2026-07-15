// app/api/user/teacher/[teacherId]/CourseLists/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ teacherId: string }> }) {
  console.log(" is server")

  try {
    const { teacherId } = await params; // 從 params 取得 teacherId

    // 驗證 teacherId 是否有效
    const teacherExists = await db.user.findUnique({
      where: { id: teacherId },
      select: { id: true },
    });

    if (!teacherExists) {
      return NextResponse.json({ error: "教師不存在" }, { status: 404 });
    }

    // 查詢該老師創建的所有課程
    const courses = await db.course.findMany({
      where: {
        teacherId: teacherId,
      },
      include: {
        CourseModul: true, // 可選：包含相關的 CourseModul 資料
      },
      orderBy: {
        createdAt: "desc", // 按創建時間降序排序
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("獲取教師課程失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}