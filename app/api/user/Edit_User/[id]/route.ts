import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, phone, address, hourlyRate, username, email } = body;

    // 驗證必要欄位
    if (!name || !phone) {
      return NextResponse.json(
        { error: "姓名和電話為必填欄位" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        phone,
        address: address || null,
        hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : null,
        username,
        email,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("更新教師資料失敗：", error);
    return NextResponse.json(
      { error: "內部服務器錯誤" },
      { status: 500 }
    );
  }
}
