// middleware.ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth-options";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const { auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      credentials: {},
      authorize: async () => null,
    }),
  ],
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
  '/core',
  '/ourteam',
  '/privacy-policy',
  '/Contactus',
];

// 靜態資源路徑，不應該被攔截
const staticAssets = [
  '/_next',
  '/images',
  '/favicon.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.css',
  '.js',
  '.webp',
];

// middleware.ts
export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;

  console.log('🔍 Middleware - isLoggedIn:', isLoggedIn, 'path:', currentPath);
  if (req.auth) {
    console.log('🔍 Middleware - user:', req.auth.user);
  }

  // 1. 如果是 API auth 路由，絕對不要阻擋
  if (currentPath.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. 檢查是否為靜態資源
  if (currentPath.includes('.') && !currentPath.startsWith('/user/')) {
    return NextResponse.next();
  }

  // 3. 判斷是否為公開路徑
  const isPublicStatic = publicRoutes.includes(currentPath);
  const isShopIdRoute = /^\/shop\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isPostIdRoute = /^\/Posts\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isSpecialCourseIdRoute = /^\/specialCourse\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isAdminCreateUser = currentPath === '/admin/UserLists/createUser';

  const isPublic = isPublicStatic || isShopIdRoute || isPostIdRoute || isSpecialCourseIdRoute || isAdminCreateUser;

  // 🔴 關鍵修改：攔截所有已登入用戶，如果他們不在正確的用戶頁面
  // if (isLoggedIn) {
  //   const user = req.auth?.user as any;
  //   if (user?.id) {
  //     const correctPath = user.role === 'USER' ? `/user/${user.id}` :
  //                        user.role === 'TEACHER' ? `/teacher/${user.id}` :
  //                        user.role === 'ADMIN' ? '/admin' : null;
  //     if (correctPath) {
  //        return NextResponse.redirect(new URL(correctPath, nextUrl));
  //      }
  //     // 如果當前路徑不是正確的用戶路徑，且不是公開路徑，就導向
  //     // Fix: 加入 !isPublic 判斷
  //     if (correctPath && !currentPath.startsWith(correctPath) && !isPublic) {
  //       console.log(`🛑 User on wrong path: ${currentPath}, redirecting to ${correctPath}`);
  //       const loginMethod = user.loginMethod || 'google';
  //       return NextResponse.redirect(new URL(`${correctPath}?login=${loginMethod}`, nextUrl));
  //     }
  //   }
  // }

    // 🟢 整合後的登入用戶導向邏輯
  if (isLoggedIn) {
    const user = req.auth?.user as any;
    if (user?.id) {
      const correctPath = user.role === 'USER' ? `/user/${user.id}` :
                          user.role === 'TEACHER' ? `/teacher/${user.id}` :
                          user.role === 'ADMIN' ? '/admin' : null;
      
      // 取得當前路徑
      const currentPath = nextUrl.pathname;

      // 判斷是否為首頁
      const isRootPage = currentPath === "/";

      // 判斷是否已經在正確的路徑開頭 (例如 /user/123 在 /user/123/profile 是 OK 的)
      const isOnCorrectPath = correctPath && currentPath.startsWith(correctPath);

      // 🔴 核心邏輯：何時需要導向？
      // 1. 如果我們在首頁 (isRootPage)，不管是不是 public，都要踢去 correctPath
      // 2. 或者，如果我們不在正確路徑 (isOnCorrectPath 為 false)，且這頁不是公開頁面 (!isPublic)
      if (correctPath && !isOnCorrectPath && (isRootPage || !isPublic)) {
        
        // 🛡️ 防止無限迴圈：如果目標路徑跟當前路徑完全一樣，就不要轉了
        if (currentPath === correctPath) {
             return null;
        }

        console.log(`🛑 Redirecting logged-in user from ${currentPath} to ${correctPath}`);
        const loginMethod = user.loginMethod || 'local';
        
        // 使用 URL 建構確保路徑正確
        const redirectUrl = new URL(correctPath, nextUrl);
        // 如果原本不在首頁，可能需要保留 query params，這裡簡單處理只加 loginMethod
        redirectUrl.searchParams.set("login", loginMethod);
        
        return NextResponse.redirect(redirectUrl);
      }
    }
  }


  // 4. 如果已登入且路徑是 /login，永遠放行（雖然上面已經會攔截，但保留作為備用）
  if (isLoggedIn && currentPath === "/login") {
    return NextResponse.next();
  }

  // 5. 如果未登入 且 不是公開路徑 -> 轉去登入頁
  if (!isLoggedIn && !isPublic) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
