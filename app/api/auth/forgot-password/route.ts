// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Resend } from "resend";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

const user = await db.user.findUnique({
      where: { email },
    });
    if (!user) {
      return NextResponse.json({ error: "未找到該電郵地址的用戶" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 小時後過期

    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await resend.emails.send({
      from: "no-reply@ite.edu.hk",
      to: email,
      subject: "重置您的密碼",
      html: `
        <p>您好，</p>
        <p>請點擊以下鏈接重置您的密碼：</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>該鏈接將在 1 小時後過期。</p>
        <p>如果您未請求重置密碼，請忽略此郵件。</p>
      `,
    });

    return NextResponse.json({ message: "已發送重置密碼鏈接" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "發送重置密碼鏈接失敗，請稍後再試" },
      { status: 500 }
    );
  }
}