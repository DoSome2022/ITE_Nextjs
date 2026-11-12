"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

const NEW_STUDENT_WINDOW_DAYS = 7;

interface CustomSession {
  user: {
    id: string;
    name: string | null;
    role: UserRole;
    email: string | null;
    emailVerified: Date | null;
  };
}

interface TimeRangeData {
  timeRange: string;
  starttime: string | null;
  endtime: string | null;
}

interface ProductPriceData {
  id: string;
  title: string;
  price: number;
  real_price: number;
  IsPublic: boolean;
  courseId: string | null;
  specialCourseId: string | null;
}

interface StudentEntry {
  userId: string;
  name: string;
  firstPaidAt: string; // ISO
  lastPaidAt: string; // ISO
  isNew: boolean;
}

interface PriceInfo {
  source: "product" | "embedded" | "none";
  minPrice: number | null;
  maxPrice: number | null;
  minRealPrice: number | null;
  maxRealPrice: number | null;
  productCount: number;
  publicProductCount: number;
  products: ProductPriceData[];
}

interface CourseStatusRow {
  kind: "regular" | "special";
  id: string;
  title: string;
  courseCode: string;
  schoolName: string;
  classroom: string | null;
  weekday: string | null;
  teacherNames: string[];
  startDate: string | null;
  endDate: string | null;
  courseDates: string[];
  timeRanges: TimeRangeData[];
  state: "UPCOMING" | "ONGOING" | "FINISHED" | "UNKNOWN";
  maxStudents: number | null;
  paidStudentCount: number;
  legacyStudentCount: number;
  effectiveStudentCount: number;
  isFull: boolean;
  students: StudentEntry[];
  newStudentCount: number;
  recentPayerCount: number;
  latestEnrollmentAt: string | null;
  price: PriceInfo;
  dataWarnings: string[];
}

function parseDateSafe(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function buildPriceInfo(
  products: ProductPriceData[],
  embedded: { price: number | null; real_price: number | null } | null
): PriceInfo {
  const active = products;
  if (active.length === 0) {
    if (embedded && (embedded.price != null || embedded.real_price != null)) {
      return {
        source: "embedded",
        minPrice: embedded.price,
        maxPrice: embedded.price,
        minRealPrice: embedded.real_price,
        maxRealPrice: embedded.real_price,
        productCount: 0,
        publicProductCount: 0,
        products: [],
      };
    }
    return {
      source: "none",
      minPrice: null,
      maxPrice: null,
      minRealPrice: null,
      maxRealPrice: null,
      productCount: 0,
      publicProductCount: 0,
      products: [],
    };
  }

  const publicProducts = active.filter((p) => p.IsPublic);
  const basis = publicProducts.length > 0 ? publicProducts : active;

  return {
    source: "product",
    minPrice: Math.min(...basis.map((p) => p.price)),
    maxPrice: Math.max(...basis.map((p) => p.price)),
    minRealPrice: Math.min(...basis.map((p) => p.real_price)),
    maxRealPrice: Math.max(...basis.map((p) => p.real_price)),
    productCount: active.length,
    publicProductCount: publicProducts.length,
    products: active,
  };
}

function deriveState(
  startDateRaw: string | Date | null | undefined,
  endDateRaw: string | Date | null | undefined,
  courseDatesRaw: (string | Date)[]
): CourseStatusRow["state"] {
  const starts = courseDatesRaw.map(parseDateSafe).filter((d): d is Date => d !== null);
  const start =
    parseDateSafe(startDateRaw) ??
    (starts.length > 0
      ? new Date(Math.min(...starts.map((d) => d.getTime())))
      : null);
  const end =
    parseDateSafe(endDateRaw) ??
    (starts.length > 0
      ? new Date(Math.max(...starts.map((d) => d.getTime())))
      : null);

  if (!start && !end) return "UNKNOWN";
  const now = new Date();
  if (start && now < start) return "UPCOMING";
  if (end && now > end) return "FINISHED";
  return "ONGOING";
}

export async function GET(req: NextRequest) {
  try {
    const sessionData = await auth();
    const session = sessionData as unknown as CustomSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授權：請先登入" }, { status: 401 });
    }

    if (session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "無權操作：僅管理員可查看課程狀態" },
        { status: 403 }
      );
    }

    const cutoff = new Date(
      Date.now() - NEW_STUDENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );

    const [courses, specialCourses, paidItems] = await Promise.all([
      prisma.course.findMany({
        select: {
          id: true,
          title: true,
          courseCode: true,
          schoolName: true,
          classroom: true,
          weekday: true,
          startDate: true,
          endDate: true,
          Coursedates: true,
          maxStudents: true,
          numberOfStudents: true,
          teacher: true,
          teacherId: true,
          Students: true,
          Teacher: { select: { name: true, username: true } },
          CourseTimeRanges: { select: { timeRange: true, starttime: true, endtime: true } },
          Products: {
            where: { OR: [{ isTrash: false }, { isTrash: null }] },
            select: {
              id: true,
              title: true,
              price: true,
              real_price: true,
              IsPublic: true,
              courseId: true,
              specialCourseId: true,
            },
          },
        },
      }),
      prisma.specialCourse.findMany({
        select: {
          id: true,
          title: true,
          courseCode: true,
          schoolName: true,
          classroom: true,
          weekday: true,
          startDate: true,
          endDate: true,
          Coursedates: true,
          maxStudents: true,
          numberOfStudents: true,
          teacher: true,
          teacherId: true,
          price: true,
          real_price: true,
          _count: { select: { Students: true } },
          SpecialCourseTimeRanges: { select: { timeRange: true, starttime: true, endtime: true } },
          products: {
            where: { OR: [{ isTrash: false }, { isTrash: null }] },
            select: {
              id: true,
              title: true,
              price: true,
              real_price: true,
              IsPublic: true,
              courseId: true,
              specialCourseId: true,
            },
          },
        },
      }),
      prisma.orderItem.findMany({
        where: { order: { status: { in: ["PAID", "paid"] } } },
        select: {
          orderId: true,
          order: {
            select: {
              userId: true,
              createdAt: true,
              user: { select: { id: true, name: true, username: true } },
            },
          },
          product: { select: { courseId: true, specialCourseId: true } },
        },
      }),
    ]);

    // 聚合「邊個學生、幾時、買咗邊個課程」（一次過查，避免 N+1）
    interface EnrollmentAcc {
      name: string;
      firstPaidAt: Date;
      lastPaidAt: Date;
    }
    const regularMap = new Map<string, Map<string, EnrollmentAcc>>();
    const specialMap = new Map<string, Map<string, EnrollmentAcc>>();
    const seen = new Set<string>();

    for (const item of paidItems) {
      const paidAt = item.order.createdAt;
      const student = item.order.user;

      const links: Array<["regular" | "special", string | null]> = [
        ["regular", item.product.courseId],
        ["special", item.product.specialCourseId],
      ];

      for (const [kind, courseId] of links) {
        if (!courseId) continue;

        // 同一張單、同一課程、同一學生只計一次
        const dedupeKey = `${kind}:${courseId}:${item.orderId}:${student.id}`;
        if (seen.has(dedupeKey)) continue;
        seen.add(dedupeKey);

        const targetMap = kind === "regular" ? regularMap : specialMap;
        if (!targetMap.has(courseId)) targetMap.set(courseId, new Map());
        const studentMap = targetMap.get(courseId)!;
        const existing = studentMap.get(student.id);

        if (existing) {
          existing.firstPaidAt = new Date(
            Math.min(existing.firstPaidAt.getTime(), paidAt.getTime())
          );
          existing.lastPaidAt = new Date(
            Math.max(existing.lastPaidAt.getTime(), paidAt.getTime())
          );
        } else {
          studentMap.set(student.id, {
            name: student.name || student.username || "未知學生",
            firstPaidAt: paidAt,
            lastPaidAt: paidAt,
          });
        }
      }
    }

    function buildStudents(
      studentMap: Map<string, EnrollmentAcc> | undefined
    ): {
      students: StudentEntry[];
      newStudentCount: number;
      recentPayerCount: number;
      latestEnrollmentAt: string | null;
    } {
      if (!studentMap || studentMap.size === 0) {
        return { students: [], newStudentCount: 0, recentPayerCount: 0, latestEnrollmentAt: null };
      }

      const entries = Array.from(studentMap.entries()).map(([userId, acc]) => ({
        userId,
        ...acc,
        isNew: acc.firstPaidAt >= cutoff,
      }));

      entries.sort(
        (a, b) => b.lastPaidAt.getTime() - a.lastPaidAt.getTime()
      );

      return {
        students: entries.map((e) => ({
          userId: e.userId,
          name: e.name,
          firstPaidAt: e.firstPaidAt.toISOString(),
          lastPaidAt: e.lastPaidAt.toISOString(),
          isNew: e.isNew,
        })),
        newStudentCount: entries.filter((e) => e.isNew).length,
        recentPayerCount: entries.filter((e) => e.lastPaidAt >= cutoff).length,
        latestEnrollmentAt: entries[0] ? entries[0].lastPaidAt.toISOString() : null,
      };
    }

    // 組裝普通課程 row
    const regularRows: CourseStatusRow[] = courses.map((course) => {
      const studentAgg = buildStudents(regularMap.get(course.id));
      const legacyStudentCount = new Set(
        (course.Students || []).filter(Boolean)
      ).size;
      const effectiveStudentCount = Math.max(
        studentAgg.students.length,
        legacyStudentCount
      );
      const price = buildPriceInfo(course.Products as ProductPriceData[], null);
      const dataWarnings: string[] = [];
      if (course.Products.some((p) => p.courseId && p.specialCourseId)) {
        dataWarnings.push("PRODUCT_LINKS_BOTH");
      }
      if (legacyStudentCount > studentAgg.students.length) {
        dataWarnings.push("LEGACY_STUDENTS_NOT_IN_ORDERS");
      }

      const teacherNames = course.teacher.filter(Boolean);
      if (teacherNames.length === 0 && course.Teacher?.name) {
        teacherNames.push(course.Teacher.name);
      }

      return {
        kind: "regular",
        id: course.id,
        title: course.title,
        courseCode: course.courseCode,
        schoolName: course.schoolName,
        classroom: course.classroom,
        weekday: course.weekday,
        teacherNames,
        startDate: course.startDate,
        endDate: course.endDate,
        courseDates: course.Coursedates,
        timeRanges: course.CourseTimeRanges,
        state: deriveState(course.startDate, course.endDate, course.Coursedates),
        maxStudents: course.maxStudents,
        paidStudentCount: studentAgg.students.length,
        legacyStudentCount,
        effectiveStudentCount,
        isFull:
          course.maxStudents != null && effectiveStudentCount >= course.maxStudents,
        students: studentAgg.students,
        newStudentCount: studentAgg.newStudentCount,
        recentPayerCount: studentAgg.recentPayerCount,
        latestEnrollmentAt: studentAgg.latestEnrollmentAt,
        price,
        dataWarnings,
      };
    });

    // 組裝特別課程 row
    const specialRows: CourseStatusRow[] = specialCourses.map((sc) => {
      const studentAgg = buildStudents(specialMap.get(sc.id));
      const legacyStudentCount = sc._count.Students;
      const effectiveStudentCount = Math.max(
        studentAgg.students.length,
        legacyStudentCount
      );
      const price = buildPriceInfo(sc.products as ProductPriceData[], {
        price: sc.price,
        real_price: sc.real_price,
      });
      const dataWarnings: string[] = [];
      if (sc.products.some((p) => p.courseId && p.specialCourseId)) {
        dataWarnings.push("PRODUCT_LINKS_BOTH");
      }
      if (legacyStudentCount > studentAgg.students.length) {
        dataWarnings.push("LEGACY_STUDENTS_NOT_IN_ORDERS");
      }

      return {
        kind: "special",
        id: sc.id,
        title: sc.title,
        courseCode: sc.courseCode,
        schoolName: sc.schoolName,
        classroom: sc.classroom,
        weekday: sc.weekday,
        teacherNames: sc.teacher.filter(Boolean),
        startDate: sc.startDate ? sc.startDate.toISOString() : null,
        endDate: sc.endDate ? sc.endDate.toISOString() : null,
        courseDates: sc.Coursedates.map((d) => d.toISOString()),
        timeRanges: sc.SpecialCourseTimeRanges,
        state: deriveState(sc.startDate, sc.endDate, sc.Coursedates),
        maxStudents: sc.maxStudents,
        paidStudentCount: studentAgg.students.length,
        legacyStudentCount,
        effectiveStudentCount,
        isFull: sc.maxStudents != null && effectiveStudentCount >= sc.maxStudents,
        students: studentAgg.students,
        newStudentCount: studentAgg.newStudentCount,
        recentPayerCount: studentAgg.recentPayerCount,
        latestEnrollmentAt: studentAgg.latestEnrollmentAt,
        price,
        dataWarnings,
      };
    });

    const allRows = [...regularRows, ...specialRows];

    return NextResponse.json(
      {
        meta: {
          generatedAt: new Date().toISOString(),
          newStudentWindowDays: NEW_STUDENT_WINDOW_DAYS,
          counts: {
            regular: regularRows.length,
            special: specialRows.length,
            withNewStudents: allRows.filter((r) => r.newStudentCount > 0).length,
            full: allRows.filter((r) => r.isFull).length,
            ongoing: allRows.filter((r) => r.state === "ONGOING").length,
          },
        },
        courses: allRows,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("獲取課程狀態失敗:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "無法獲取課程狀態" },
      { status: 500 }
    );
  }
}
