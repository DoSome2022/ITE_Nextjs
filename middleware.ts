// middleware.ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth-options";


// ⚠️ 關鍵修正：這裡必須加上 trustHost: true
const { auth } = NextAuth({
  ...authConfig,
  trustHost: true, 
});

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/hide/createadmin',
  '/forgot-password',
  '/reset-password',
  '/shop',
  '/complaintFrom',
  '/specialCourse',
  '/Posts',
  // 注意：動態路由在下方正則表達式處理
];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;

  // 1. 如果是 API auth 路由，絕對不要阻擋 (雖然 matcher 已排除，但這裡雙重保險)
  if (currentPath.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. 判斷是否為公開路徑 (包含靜態與動態)
  const isPublicStatic = publicRoutes.includes(currentPath);
  const isShopIdRoute = /^\/shop\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isPostIdRoute = /^\/Posts\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isSpecialCourseIdRoute = /^\/specialCourse\/[a-zA-Z0-9-]+$/.test(currentPath);
  // 新增：確保 admin 下的 createUser 也是公開的 (根據你的列表)
  const isAdminCreateUser = currentPath === '/admin/UserLists/createUser';

  const isPublic = isPublicStatic || isShopIdRoute || isPostIdRoute || isSpecialCourseIdRoute || isAdminCreateUser;

  // 3. 處理重定向邏輯
  // 如果已登入 且 在登入頁 -> 轉去首頁 (優化體驗)
  if (isLoggedIn && currentPath === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 如果未登入 且 不是公開路徑 -> 轉去登入頁
  if (!isLoggedIn && !isPublic) {
    // 使用 callbackUrl 參數，讓使用者登入後能跳回原本想去的頁面
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

// Matcher 保持不變，這樣寫是好的
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
