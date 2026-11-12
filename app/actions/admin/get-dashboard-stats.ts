'use server';

import { db } from "@/lib/db";

export async function getDashboardStats() {
  try {
    const [
      totalUsers,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalSpecialCourses,
      totalProducts,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'TEACHER' } }),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.course.count(),
      db.specialCourse.count(),
      db.product.count(),
    ]);

    return {
      overview: {
        totalUsers,
        totalTeachers,
        totalAdmins,
        totalCourses,
        totalSpecialCourses,
        totalProducts,
      },
    };
  } catch (error) {
    console.error('獲取儀表板數據失敗:', error);
    return null;
  }
}
