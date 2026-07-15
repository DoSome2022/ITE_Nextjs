// app/api/user/Get_Teachers_With_Course/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
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