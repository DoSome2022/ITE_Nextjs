"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

interface CustomSession {
  user: {
    id: string;
    name: string | null;
    role: UserRole;
    email: string | null;
    emailVerified: Date | null;
  };
}

// 課程摘要 select（列表用）
const courseSummarySelect = {
  id: true,
  title: true,
  courseCode: true,
  schoolName: true,
  classroom: true,
  weekday: true,
  startDate: true,
  endDate: true,
  Coursedates: true,
  teacher: true,
  Teacher: { select: { name: true, username: true } },
  CourseTimeRanges: { select: { timeRange: true, starttime: true, endtime: true } },
};

const specialCourseSummarySelect = {
  id: true,
  title: true,
  courseCode: true,
  schoolName: true,
  classroom: true,
  weekday: true,
  startDate: true,
  endDate: true,
  Coursedates: true,
  teacher: true,
  price: true,
  real_price: true,
  SpecialCourseTimeRanges: { select: { timeRange: true, starttime: true, endtime: true } },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "缺少用戶 ID" }, { status: 400 });
    }

    const sessionData = await auth();
    const session = sessionData as unknown as CustomSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權：請先登入" }, { status: 401 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: "無效的用戶 ID 格式" }, { status: 400 });
    }

    if (session.user.role !== UserRole.ADMIN && session.user.id !== userId) {
      return NextResponse.json(
        { error: "無權操作：您無權查看其他用戶的訂單" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "找不到用戶" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        total: true,
        status: true,
        paymentId: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                real_price: true,
                courseId: true,
                specialCourseId: true,
                Course: { select: courseSummarySelect },
                specialCourse: { select: specialCourseSummarySelect },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(orders, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("獲取用戶訂單失敗:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無法獲取用戶訂單" },
      { status: 500 }
    );
  }
}
