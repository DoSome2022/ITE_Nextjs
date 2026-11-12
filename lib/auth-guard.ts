// lib/auth-guard.ts
// 統一 API 授權檢查 helper（TASK P0-01：API 授權補齊）
// 用法：
//   const { session, response } = await requireLogin();
//   if (response) return response;
//   const forbidden = requireSelfOrAdmin(session!, targetId) ?? requireRoles(session!, [UserRole.ADMIN]);
//   if (forbidden) return forbidden;

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export interface GuardSession {
  user: {
    id: string;
    name: string | null;
    role: UserRole;
    email: string | null;
    emailVerified: Date | null;
  };
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "未授權：請先登入" }, { status: 401 });
}

export function forbidden(message = "無權操作"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/** 未登入 → 回傳 response 非 null；成功 → session */
export async function requireLogin(): Promise<{
  session: GuardSession | null;
  response: NextResponse | null;
}> {
  const sessionData = await auth();
  const session = sessionData as unknown as GuardSession | null;
  if (!session?.user?.id) {
    return { session: null, response: unauthorized() };
  }
  return { session, response: null };
}

/** 角色不符 → 回傳 403；通過 → null */
export function requireRoles(
  session: GuardSession,
  roles: UserRole[]
): NextResponse | null {
  if (!roles.includes(session.user.role)) {
    return forbidden("無權操作：您的角色無權訪問此資源");
  }
  return null;
}

/** 非本人且非 ADMIN → 403；通過 → null */
export function requireSelfOrAdmin(
  session: GuardSession,
  targetId: string
): NextResponse | null {
  if (session.user.role !== UserRole.ADMIN && session.user.id !== targetId) {
    return forbidden("無權操作：您無權訪問其他用戶的資料");
  }
  return null;
}

// 回傳 User 資料時排除 password 的 select 欄位（新 API 一律用呢個）
export const userSafeSelect = {
  id: true,
  username: true,
  email: true,
  emailVerified: true,
  phone: true,
  phoneVerified: true,
  name: true,
  address: true,
  hourlyRate: true,
  role: true,
  teacherholidaysDateTime: true,
  createdAt: true,
  updatedAt: true,
} as const;
