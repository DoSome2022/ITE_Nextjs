import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// POST: 批次查詢多個課程日期的出席狀態
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, dates } = body; // dates: [{ courseId, date }]

    if (!teacherId || !dates || !Array.isArray(dates)) {
      return NextResponse.json(
        { error: "缺少必要參數" },
        { status: 400 }
      );
    }

    // 批次查詢
    const attendances = await db.attendance.findMany({
      where: {
        userId: teacherId,
        OR: dates.map((d: { courseId: string; date: string }) => ({
          courseId: d.courseId,
          date: new Date(d.date),
        })),
      },
    });

    // 轉換為 Map 方便查詢
    const attendanceMap = new Map();
    attendances.forEach((a) => {
      const key = `${a.courseId}_${a.date.toISOString().split("T")[0]}`;
      attendanceMap.set(key, a);
    });

    return NextResponse.json({
      attendances: Object.fromEntries(attendanceMap),
    });
  } catch (error) {
    console.error("批次查詢出席記錄失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}
