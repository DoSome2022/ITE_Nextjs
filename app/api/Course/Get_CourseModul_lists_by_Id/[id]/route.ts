import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireLogin, requireRoles } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // 等待 params Promise 解析

    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.TEACHER, UserRole.ADMIN]);
    if (forbidden) return forbidden;


    const res = await db.courseModul.findUnique({
      where: {
        id: String(id), // 確保 id 是字符串類型
      },
      include: {
        Courses: true,
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