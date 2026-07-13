"use client";

import { useState, useEffect } from "react";
import { useRouter,useSearchParams } from "next/navigation";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { serverLogin } from "@/app/actions/auth/login";
// import { signIn } from "@/auth";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const { data: session, status, update } = useSession();

  const searchParams = useSearchParams();



useEffect(() => {
  if (status === 'authenticated' && session?.user?.id) {
    const callbackUrl = searchParams.get('callbackUrl');
    const loginMethod = session.user.loginMethod || 'local'; // 👈 從 session 取得

    if (callbackUrl) {
      // 處理 callbackUrl 已有參數的情況
      const separator = callbackUrl.includes('?') ? '&' : '?';
      router.replace(`${callbackUrl}${separator}login=${loginMethod}`);
      return;
    }

    // 沒有 callbackUrl 才走原本的角色導向
    const { role, id } = session.user;
    const path =
      role === 'USER' ? `/user/${id}?login=${loginMethod}` :
      role === 'TEACHER' ? `/teacher/${id}?login=${loginMethod}` :
      role === 'ADMIN' ? `/admin?login=${loginMethod}` :
      `/shop?login=${loginMethod}`;

    router.replace(path);
  }
}, [status, session, router, searchParams]);
  
  // 表單登入
  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setError("");
  //   setIsLoading(true);

  //   const formData = new FormData(e.currentTarget);
  //   const result = await serverLogin(formData);

  //   // 修改處：如果有錯誤，顯示錯誤訊息，而不是跳轉
  //   if (result?.error) {
  //     setError(result.error); // 設定錯誤訊息，讓它顯示在 input 下方
  //     toast.error(result.error); // 彈出錯誤提示
  //   } else {
  //     // 成功時才更新 session 並跳轉
  //     await update(); // 同步 session
  //     toast.success("登入成功");
      
  //     // 這裡可以選擇手動跳轉，或者依賴上方的 useEffect 自動跳轉
  //     // 因為 update() 後 status 會變為 "authenticated"，useEffect 會觸發
  //     const callbackUrl = searchParams.get('callbackUrl') || '/';
  //     router.replace(callbackUrl); 
  //   }

  //   setIsLoading(false);
  // };

  // 修改 handleSubmit
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  const formData = new FormData(e.currentTarget);

  try {
    // 這裡 await 可能會拋出 "UnrecognizedActionError"
    const result = await serverLogin(formData);

    if (result?.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      await update();
      toast.success("登入成功");
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.replace(callbackUrl);
    }
  } catch (err) {
    // 捕捉 Server Action 找不到 (404) 或其他網絡錯誤
    console.error("Server Action 調用失敗:", err);
    setError("系統連線錯誤，請刷新頁面再試");
    toast.error("系統連線錯誤");
  } finally {
    // 無論成功還是失敗，都要關閉 Loading
    setIsLoading(false);
  }
};



  // Google 登入（關鍵修正）
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    try {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      // 不要指定 callbackUrl
      await signIn("google", { callbackUrl }); 
      // NextAuth 會回調到 /login，useEffect 會在 session 更新後導向
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google 登入失敗";
      setError(msg);
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  // 正在載入 session 時顯示
  if (status === "loading") {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-lg">正在載入...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md mt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">學生登入</h1>

      {/* 表單登入 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="username"
            placeholder="用戶名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-gray-500 disabled:opacity-50"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:border-gray-500 disabled:opacity-50"
            disabled={isLoading}
            required
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isLoading }
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md disabled:opacity-50 transition"
        >
          {isLoading ? "登入中..." : "登入"}
        </button>
      </form>

      {/* Google 登入按鈕 */}
      <div className="mt-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {googleLoading ? (
            "導向 Google..."
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 6.25c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              使用 Google 登入
            </>
          )}
        </button>
      </div>

      {/* 忘記密碼 */}
      <div className="mt-4 text-center">
        <div>
        <a href="/forgot-password" className="text-sm text-blue-400 hover:underline">
          忘記密碼？
        </a>

        </div>
        <a href="/register" className="text-sm text-black-400 hover:underline">
          沒有帳號？在這裹
        </a>
      </div>
    </div>
  );
}
