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
//   trustHost: true,
//   providers: [
//     // 1. Google Provider
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth-options";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },

  // 關鍵修正：強制信任主機（生產環境必加，避免 host 驗證問題）
  trustHost: true,
  debug: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ["pkce"],
      allowDangerousEmailAccountLinking: true,
      
      // ▼▼▼▼▼▼ 新增這一段 profile 設定 ▼▼▼▼▼▼
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          
          // 用 email 的 @ 前面當作 username (例如 alan@gmail.com -> username: "alan")
          // 如果沒有 email，就用 user_加上ID
          username: profile.email ? profile.email.split("@")[0] : `user_${profile.sub}`,
          role: "USER",
        }
      },
      // ▲▲▲▲▲▲ 新增結束 ▲▲▲▲▲▲
    }),

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
            name: user.username,
            email: user.email,
            role: user.role,
            schoolId: user.name, 
          };
        }
        return null;
      },
    }),
  ],
});
