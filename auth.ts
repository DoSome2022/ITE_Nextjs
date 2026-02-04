// // src/auth.ts
// import NextAuth from "next-auth";
// import { PrismaAdapter } from "@auth/prisma-adapter"; // 👈 新增 Adapter
// import { db } from "@/lib/db"; 

// import Credentials from "next-auth/providers/credentials";
// import Google from "next-auth/providers/google"; // 👈 新增 Google
// import bcrypt from "bcryptjs";
// import { authConfig } from "./auth-options";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   ...authConfig,
//   adapter: PrismaAdapter(db), // 👈 加上這一行，Google 用戶才會存入 DB
//   session: { strategy: "jwt" }, // 因為用了 Adapter，必須顯式宣告使用 jwt strategy，否則預設會變成 database session
//   providers: [
//     // 1. Google Provider
//     Google({
//       clientId: process.env.AUTH_GOOGLE_ID,
//       clientSecret: process.env.AUTH_GOOGLE_SECRET,
//       allowDangerousEmailAccountLinking: true, // 👈 允許 Email 自動連結帳號 (例如原本用密碼註冊，後來用 Google 登入)
//     }),

//     // 2. Credentials Provider (保持原本的)
//     Credentials({
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.username || !credentials?.password) {
//           return null;
//         }

//         const username = credentials.username as string;
//         const password = credentials.password as string;

//         const user = await db.user.findUnique({
//           where: { username },
//         });

//         if (!user || !user.password) {
//           return null;
//         }

//         const passwordsMatch = await bcrypt.compare(password, user.password);

//         if (passwordsMatch) {
//           return {
//             id: user.id,
//             name: user.username,
//             email: user.email,
//             role: user.role, 
//             schoolId: user.name // 確保這裡有回傳 schoolId
//           };
//         }
//         return null;
//       },
//     }),
//   ],
// });


// src/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth-options"; // 👈 確認路徑正確

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    // 這裡展開 authConfig 裡的 providers (包含了 Google)
    ...authConfig.providers,

    // 這裡只定義 Credentials，因為它需要用到 db 和 bcrypt (Node.js only)
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;

        const user = await db.user.findUnique({
          where: { username },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.username, // 注意：NextAuth 預設 user.name 對應 name 欄位
            email: user.email,
            role: user.role,
            // 修正你的筆誤：之前寫 schoolId: user.name，應該是 user.schoolId
            // @ts-ignore
            schoolId: user.schoolId 
          };
        }
        return null;
      },
    }),
  ],
});
