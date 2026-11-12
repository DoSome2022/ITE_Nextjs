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

// 課程摘要 select（詳情用，比列表多 description）
const courseSummarySelect = {
  id: true,
  title: true,
  description: true,
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
  description: true,
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
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "缺少訂單 ID" }, { status: 400 });
    }

    const sessionData = await auth();
    const session = sessionData as unknown as CustomSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權：請先登入" }, { status: 401 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json({ error: "無效的訂單 ID 格式" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
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
                description: true,
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

    if (!order) {
      return NextResponse.json({ error: "找不到訂單" }, { status: 404 });
    }

    // 先查詢再檢查權限：404 與 403 分開
    if (order.userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "無權操作：您無權查看此訂單" },
        { status: 403 }
      );
    }

    return NextResponse.json(order, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("獲取訂單詳情失敗:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無法獲取訂單詳情" },
      { status: 500 }
    );
  }
}
