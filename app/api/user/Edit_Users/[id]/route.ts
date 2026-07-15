import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { username, name, email, phone, role, password, address } = body;

    // 驗證必填欄位
    if (!username || !name) {
      return NextResponse.json(
        { error: "用戶名和姓名為必填欄位" },
        { status: 400 }
      );
    }

    // 檢查 username 是否已被其他用戶使用
    const existingUser = await db.user.findUnique({ where: { username } });
    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ error: "該用戶名已被使用" }, { status: 409 });
    }

    // 檢查 email 是否已被其他用戶使用
    if (email) {
      const existingEmail = await db.user.findFirst({
        where: { email, NOT: { id } },
      });
      if (existingEmail) {
        return NextResponse.json({ error: "該電子郵件已被使用" }, { status: 409 });
      }
    }

    // 準備更新資料
    const updateData: any = {
      username,
      name,
      email: email || null,
      phone: phone || null,
      role: role || "STUDENT",
      address: address || null,  // ← 加入地址
    };

    // 如果有提供密碼才更新
    if (password && password !== "••••••••") {
      updateData.password = password;
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        address: true,  // ← 回傳地址
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("更新用戶失敗：", error);
    return NextResponse.json(
      { error: "內部服務器錯誤，更新失敗" },
      { status: 500 }
    );
  }
}
