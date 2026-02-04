// app/actions/auth/login.ts
"use server";

import { signIn } from "@/auth";
import { z } from "zod";
import { AuthError } from "next-auth";

const schema = z.object({
  username: z.string().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});

export async function serverLogin(formData: FormData) {
  const data = schema.safeParse({
    username: formData.get("username")?.toString(),
    password: formData.get("password")?.toString(),
  });

  if (!data.success) {
    return { error: data.error.errors[0].message };
  }

  const { username, password } = data.data;

  try {
    // ⚠️ 這裡改為 redirect: false，並手動處理成功狀態
    // 這樣可以避免 Server Action 為了跳轉而中斷，導致前端收不到回應
    await signIn("credentials", {
      username,
      password,
      redirect: false, 
    });
    
    // 如果沒報錯，代表登入成功
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
    // 這裡通常不會跑到，因為我們設了 redirect: false
    // 但為了保險起見，如果是 Next 的 Redirect 錯誤還是要拋出
    throw error;
  }
}
