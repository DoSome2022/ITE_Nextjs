"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";
import { serverLogin } from "@/app/actions/auth/login";

export default function SignIn() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await serverLogin(formData);

        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          // ✅ 登入成功！強制重整頁面
          // 使用 window.location.href 而不是 router.push
          // 這樣可以確保 Middleware 能夠讀取到最新的 Session Cookie
          window.location.href = "/";
        }
      } catch (err) {
        setError("發生意外錯誤，請稍後再試");
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm border p-6 rounded-lg shadow-md bg-white">
        <h1 className="text-2xl font-bold text-center mb-4">登入</h1>
        
        <div>
          <label className="block text-sm font-medium mb-1">帳號</label>
          <input 
            name="username" 
            type="text" 
            required
            className="w-full border p-2 rounded"
            placeholder="請輸入帳號"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">密碼</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="w-full border p-2 rounded"
            placeholder="請輸入密碼"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {isPending ? "登入中..." : "登入"}
        </button>
      </form>
    </div>
  );
}
