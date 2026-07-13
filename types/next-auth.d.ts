
// // types/next-auth.d.ts（覆蓋或合併您現有內容）

// import { UserRole } from "@/prisma/generated/client"; // 或您的 UserRole 位置
// import { DefaultSession, DefaultUser } from "next-auth";

// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       role: UserRole;
//       name?: string | null;
//       email?: string | null;
//       image?: string | null;
//     } & DefaultSession["user"];
//   }

//   interface User extends DefaultUser {
//     id: string;
//     role: UserRole;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//     role?: UserRole;
//   }
// }


// types/next-auth.d.ts
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "TEACHER" | "USER";  // 對應您的 UserRole enum
      loginMethod: string;  // 👈 新增
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "TEACHER" | "USER";
    loginMethod: string;  // 👈 新增
  }
}