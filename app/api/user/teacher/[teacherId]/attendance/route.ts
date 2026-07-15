import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: 取得某個老師在某堂課的出席記錄
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const teacherId = url.searchParams.get("teacherId");
    const courseId = url.searchParams.get("courseId");
    const date = url.searchParams.get("date");

    if (!teacherId || !courseId || !date) {
      return NextResponse.json(
        { error: "缺少必要參數" },
        { status: 400 }
      );
    }

    const attendance = await db.attendance.findUnique({
      where: {
        userId_courseId_date: {
          userId: teacherId,
          courseId,
          date: new Date(date),
        },
      },
    });

    return NextResponse.json({ attended: !!attendance, attendance });
  } catch (error) {
    console.error("取得出席記錄失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}

// POST: 標記出席或取消出席
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { teacherId, courseId, date, action } = body;

    if (!teacherId || !courseId || !date || !action) {
      return NextResponse.json(
        { error: "缺少必要參數" },
        { status: 400 }
      );
    }

    const courseDate = new Date(date);

    if (action === "mark") {
      // 標記出席：upsert（存在則更新，不存在則建立）
      const attendance = await db.attendance.upsert({
        where: {
          userId_courseId_date: {
            userId: teacherId,
            courseId,
            date: courseDate,
          },
        },
        update: {
          status: "PRESENT",
        },
        create: {
          userId: teacherId,
          courseId,
          date: courseDate,
          status: "PRESENT",
        },
      });

      return NextResponse.json({
        message: "已標記為出席",
        attended: true,
        attendance,
      });
    } else if (action === "unmark") {
      // 取消出席
      await db.attendance.delete({
        where: {
          userId_courseId_date: {
            userId: teacherId,
            courseId,
            date: courseDate,
          },
        },
      });

      return NextResponse.json({
        message: "已取消出席標記",
        attended: false,
      });
    } else {
      return NextResponse.json({ error: "無效的操作" }, { status: 400 });
    }
  } catch (error) {
    console.error("標記出席失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}
