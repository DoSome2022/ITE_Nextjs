"use server"

import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { badRequest, isValidUuid, requireLogin, requireSelfOrAdmin } from "@/lib/auth-guard";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log("in server id :","--end--")
  try {
    const { id } = await params; // 等待 params Promise 解析

    const { session, response } = await requireLogin();
    if (response) return response;
    if (!isValidUuid(id)) return badRequest("無效的用戶 ID 格式");
    const forbidden = requireSelfOrAdmin(session!, id);
    if (forbidden) return forbidden;

    const res = await db.accounts.findMany({
      where: {
        client_id: id, // 使用 client_id 來查找所有匹配的記錄
      },
    });

    if (!res || res.length === 0) {
      return NextResponse.json({ message: "未找到帳戶記錄" }, { status: 404 });
    }

    return NextResponse.json(res);
  } catch (error) {
    console.error("獲取帳戶記錄失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}



// console.log("is work")