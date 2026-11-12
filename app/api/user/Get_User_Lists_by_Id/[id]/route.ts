// app/api/user/Get_User_Lists_by_Id/[id]/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import {
  badRequest,
  isValidUuid,
  requireLogin,
  requireSelfOrAdmin,
  userSafeSelect,
} from "@/lib/auth-guard";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // 等待 params Promise 解析

    const { session, response } = await requireLogin();
    if (response) return response;
    if (!isValidUuid(id)) return badRequest("無效的用戶 ID 格式");
    const forbidden = requireSelfOrAdmin(session!, id);
    if (forbidden) return forbidden;

    const res = await db.user.findUnique({
      where: {
        id: String(id), // 確保 id 是字符串類型
      },
      select: {
        ...userSafeSelect,
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