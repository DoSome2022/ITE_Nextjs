import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET: 取得單一表單詳情
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const message = await db.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      return NextResponse.json({ error: "表單不存在" }, { status: 404 });
    }

    // 自動標記為已讀（如果還沒讀過）
    if (!message.readAt) {
      await db.contactMessage.update({
        where: { id },
        data: { readAt: new Date() },
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("取得聯絡表單失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}

// PUT: 更新表單（管理員回覆、修改狀態等）
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { adminReply, status } = body;

    // 檢查表單是否存在
    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "表單不存在" }, { status: 404 });
    }

    // 準備更新資料
    const updateData: any = {};

    if (adminReply !== undefined) {
      updateData.adminReply = adminReply;
      updateData.repliedAt = new Date();
      if (status !== "CLOSED") {
        updateData.status = "REPLIED";
      }
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    const updated = await db.contactMessage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("更新聯絡表單失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}

// DELETE: 刪除表單
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "表單不存在" }, { status: 404 });
    }

    await db.contactMessage.delete({ where: { id } });

    return NextResponse.json({ message: "表單已刪除" });
  } catch (error) {
    console.error("刪除聯絡表單失敗：", error);
    return NextResponse.json({ error: "內部服務器錯誤" }, { status: 500 });
  }
}
