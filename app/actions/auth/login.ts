"use server";

import { signIn } from "@/auth";
import { z } from "zod";
import { AuthError } from "next-auth";

const schema = z.object({
  username: z.string().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

export async function serverLogin(formData: FormData) {
  // 1. 驗證格式
  const data = schema.safeParse({
    username: formData.get("username")?.toString(),
    password: formData.get("password")?.toString(),
  });

  if (!data.success) {
    return { error: data.error.errors[0].message };
  }

  const { username, password } = data.data;

  try {
    // 2. 執行登入
    // redirect: false 很重要，讓前端來處理跳轉，避免 Server Action 被中斷
    await signIn("credentials", {
      username,
      password,
      redirect: false, 
    });

    // 3. 回傳成功訊號
    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "帳號或密碼錯誤" };
        default:
          return { error: "登入發生未知錯誤" };
      }
    }
    throw error;
  }
}
