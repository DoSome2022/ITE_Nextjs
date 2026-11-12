import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireLogin, requireSelfOrAdmin, userSafeSelect } from "@/lib/auth-guard";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {



  try {
    const { id } = await params; // 等待 params Promise 解析
console.log('in server id :', id ,"--end--")
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireSelfOrAdmin(session!, id);
    if (forbidden) return forbidden;

    const res = await db.user.findUnique({
      where: {
        id: String(id), // 確保 id 是字符串類型
      },
      select: userSafeSelect,
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