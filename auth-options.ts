// // auth-options.ts
// import type { AuthConfig } from "@auth/core/types";
// import { PrismaAdapter } from "@auth/prisma-adapter";
// import CredentialsProvider from "@auth/core/providers/credentials";
// import GoogleProvider from "@auth/core/providers/google";
// import bcrypt from "bcryptjs";
// import { db } from "./lib/db";
// import { z } from "zod";

// export enum UserRole {
//   USER = "USER",
//   ADMIN = "ADMIN",
//   TEACHER = "TEACHER",
// }

// const credentialsSchema = z.object({
//   username: z.string().min(1, "用戶名不能為空"),
//   password: z.string().min(1, "密碼不能為空"),
// });

// // === 自定義 PrismaAdapter：自動生成 username ===
// const adapter = PrismaAdapter(db);

// // 覆蓋 createUser：為 Google 登入自動生成唯一 username
// (adapter as any).createUser = async (profile: any) => {
//   const email = profile.email;
//   const name = profile.name || "User";

//   if (!email) {
//     throw new Error("Google 登入缺少 email");
//   }

//   // 基礎 username：使用 name 或 email 前綴
//   let base = name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
//   if (base.length === 0) {
//     base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
//   }

//   // 確保唯一性
//   let username = base;
//   let counter = 1;
//   while (await db.user.findUnique({ where: { username } })) {
//     username = `${base}_${counter}`;
//     counter++;
//   }

//   // 創建 User（包含必填的 username）
//   return db.user.create({
//     data: {
//       name: profile.name,
//       email: profile.email,
//       emailVerified: profile.email_verified ? new Date() : null,
//       username, // 自動生成
//       role: UserRole.USER, // 預設角色
//     },
//   });
// };

// export const authOptions: AuthConfig = {
//   adapter: adapter as any, // 使用自定義 adapter
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60,
//     updateAge: 24 * 60 * 60,
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "用戶名", type: "text" },
//         password: { label: "密碼", type: "password" },
//       },
//       async authorize(credentials) {
//         try {
//           const parsed = credentialsSchema.safeParse(credentials);
//           if (!parsed.success) throw new Error("無效的輸入資料");

//           const { username, password } = parsed.data;
//           const user = await db.user.findUnique({ where: { username } });

//           if (!user || !user.password) throw new Error("用戶不存在或密碼無效");
//           const match = await bcrypt.compare(password, user.password);
//           if (!match) throw new Error("密碼錯誤");

//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role as UserRole,
//           };
//         } catch (error) {
//           console.error("Credentials authorize error:", error);
//           return null;
//         }
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       if (account?.provider === "google" && profile?.email) {
//         return true; // 交給 adapter.createUser 處理
//       }
//       return true;
//     },

//     async jwt({ token, user, account, profile }) {
//       // 首次登入
//       if (user) {
//         token.id = user.id;
//         token.name = user.name;
//         token.email = user.email;
//         token.role = (user as any).role || UserRole.USER;
//       }

//       // Google 登入後，補 OAuth 關聯
//       if (account?.provider === "google" && profile?.email && token.email) {
//         try {
//           const dbUser = await db.user.findUnique({
//             where: { email: token.email as string },
//           });

//           if (dbUser) {
//             await db.oAuth.upsert({
//               where: { OAuthEmail: profile.email },
//               create: {
//                 OAuthEmail: profile.email,
//                 userId: dbUser.id,
//               },
//               update: {},
//             });

//             token.id = dbUser.id;
//             token.role = dbUser.role as UserRole;
//           }
//         } catch (error) {
//           console.error("JWT Google OAuth 關聯錯誤:", error);
//         }
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id as string;
//         session.user.name = token.name as string;
//         session.user.email = token.email as string;
//         session.user.role = token.role as UserRole;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//     error: "/login",
//   },
//   trustHost: true,
// };

// src/auth-options.ts (請確認檔名與引用一致)
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google"; // 👈 Google 可以放在這裡

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    // 1. Google Provider 放這裡 (Middleware 可見)
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // Credentials 不需要在這裡具體實作，留給 auth.ts 處理
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        token = { ...token, ...session };
        return token;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // @ts-ignore
        token.role = user.role || UserRole.USER;
        // @ts-ignore
        token.name = user.name;
        // @ts-ignore
        token.schoolId = user.schoolId; // 👈 確保這裡有把 user 的資料帶給 token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        // @ts-ignore
        session.user.role = token.role as string;
        // @ts-ignore
        session.user.name = token.name as string;
        // @ts-ignore
        session.user.schoolId = token.schoolId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
