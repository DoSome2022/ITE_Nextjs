import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth-options";


const { auth } = NextAuth(authConfig);

const publicRoutes = [
  '/',
  '/login',
  '/hide/createadmin',
  '/forgot-password',
  '/reset-password',
  '/admin/UserLists/createUser',
  '/shop',
  '/register',
  '/about',
  '/complaintFrom',
  '/specialCourse',
  '/Posts'
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. 絕對放行 API 和 Next.js 內部請求 (避免 404 錯誤)
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  const currentPath = nextUrl.pathname;

  // 2. 判斷公開路徑 (包含動態路由)
  const isShopIdRoute = /^\/shop\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isPostIdRoute = /^\/Posts\/[a-zA-Z0-9-]+$/.test(currentPath);
  const isSpecialCourseIdRoute = /^\/specialCourse\/[a-zA-Z0-9-]+$/.test(currentPath);

  const isPublic = publicRoutes.includes(currentPath) || isShopIdRoute || isSpecialCourseIdRoute || isPostIdRoute;

  // 3. 已登入用戶訪問登入頁 -> 踢回首頁
  if (isLoggedIn && currentPath === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 4. 未登入且非公開路徑 -> 踢回登入頁
  if (!isLoggedIn && !isPublic) {
    // 這裡我們不使用 callbackUrl 參數跳轉，避免複雜化，直接回登入頁
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // 這裡的 matcher 很重要，排除靜態資源
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};



// // middleware.ts
// import NextAuth from "next-auth";

// import { NextResponse } from "next/server";
// import { authConfig } from "./auth-options";


// // 初始化一個只用於 Middleware 的 auth helper
// const { auth } = NextAuth(authConfig);

// const publicRoutes = [
//   '/',
//   '/login',
//   '/hide/createadmin',
//   '/forgot-password',
//   '/reset-password',
//   '/admin/UserLists/createUser',
//   '/shop',
//   '/register',
//   '/about',
//   '/complaintFrom',
//   '/specialCourse',
//   '/Posts'
// ];

// export default auth((req) => {
//   const currentPath = req.nextUrl.pathname;
//   const isLoggedIn = !!req.auth; // 直接判斷是否有 auth

//   // 檢查是否匹配動態路由
//   const isShopIdRoute = /^\/shop\/[a-zA-Z0-9-]+$/.test(currentPath);
//   const isPostIdRoute = /^\/Posts\/[a-zA-Z0-9-]+$/.test(currentPath);
//   const isSpecialCourseIdRoute = /^\/specialCourse\/[a-zA-Z0-9-]+$/.test(currentPath);
  
//   // 判斷是否為公開路徑
//   const isPublic = publicRoutes.includes(currentPath) || isShopIdRoute || isSpecialCourseIdRoute || isPostIdRoute;

//   // 如果未登入 且 不是公開路徑 -> 轉跳回首頁或登入頁
//   if (!isLoggedIn && !isPublic) {
//     const newUrl = new URL('/', req.nextUrl.origin); // 轉回首頁
//     // const newUrl = new URL('/login', req.nextUrl.origin); // 或者轉回登入頁(建議)
//     return NextResponse.redirect(newUrl);
//   }

//   return NextResponse.next();
// });

// export const config = {
//   // 排除靜態資源和 API (API路由通常需要自己處理 Auth，不建議全擋)
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };
