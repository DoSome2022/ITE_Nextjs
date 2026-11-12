// app/api/users/create/route.ts
import { NextResponse } from "next/server";
import { CreateUserSchema } from "@/app/actions/Create/Create_user/schema";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { requireLogin, requireRoles } from "@/lib/auth-guard";

export async function POST(req: Request) {
  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    const body = await req.json();
    const parsedData = CreateUserSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "無效的輸入數據", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { username, password, phone, name, role } = parsedData.data;

    // 檢查用戶名是否已存在
    const existingUser = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "用戶名稱已存在" }, { status: 409 });
    }

    // 使用 bcrypt 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    const user_data = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        phone,
        name,
        role: role as UserRole,
      },
    });

    console.log("-- Create User -- : ", user_data, "-- End --");

    return NextResponse.json({ data: user_data }, { status: 201 });
  } catch (error) {
    console.error("Error creating user: ", error);
    return NextResponse.json(
      { error: "無法創建用戶，請檢查輸入數據或稍後重試" },
      { status: 500 }
    );
  }
}