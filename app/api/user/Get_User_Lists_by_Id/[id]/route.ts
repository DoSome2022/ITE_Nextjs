// app/api/user/Get_User_Lists_by_Id/[id]/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // 等待 params Promise 解析

    const res = await db.user.findUnique({
      where: {
        id: String(id), // 確保 id 是字符串類型
      },
      include: {
        CourseModul: true,
        specialCourse:true,
        Course:true
      },
    });

    if (!res) {
      return NextResponse.json({ error: "申請記錄未找到" }, { status: 404 });
    }

    return NextResponse.json(res);
  } catch (error) {
    console.error("獲取申請記錄失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}