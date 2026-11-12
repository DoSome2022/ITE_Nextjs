// app/api/user/Get_Teachers_With_Course/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireLogin, requireRoles } from '@/lib/auth-guard';
import { UserRole } from '@prisma/client';

export async function GET() {
  try {
    const { session, response } = await requireLogin();
    if (response) return response;
    const forbidden = requireRoles(session!, [UserRole.ADMIN]);
    if (forbidden) return forbidden;

    // 獲取所有 TEACHER 角色用戶及其相關課程
    const teachers = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hourlyRate: true, 
        Course: {
          select: {
            id: true,
            title: true,
            timeHours: true,
            Coursedates: true,
            teacherId: true,
          },
        },
      },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers with courses:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}