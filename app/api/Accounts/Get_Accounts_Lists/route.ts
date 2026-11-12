'use server';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Accounts } from '@prisma/client'; // 假設 Accounts 是 Prisma 模型
import { requireLogin, requireRoles } from '@/lib/auth-guard';
import { UserRole } from '@prisma/client';

export async function GET() {
  console.log("in server GET")
  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    const accounts: Accounts[] = await db.accounts.findMany();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '無法獲取帳戶列表',
      },
      { status: 500 }
    );
  }
}