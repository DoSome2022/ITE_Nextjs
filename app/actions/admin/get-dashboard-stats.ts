'use server';

import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function getDashboardStats() {
  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // ── 並行查詢所有數據 ──
    const [
      totalUsers,
      totalTeachers,
      totalAdmins,
      totalCourses,
      totalSpecialCourses,
      totalProducts,
      totalOrders,
      totalOrdersThisMonth,
      totalOrdersLastMonth,
      revenueData,
      revenueThisMonth,
      revenueLastMonth,
      totalInvoices,
      totalAccounts,
      recentOrders,
      userGrowth,
      courseTypeCounts,
      productStatusCounts,
    ] = await Promise.all([
      // 用戶統計
      db.user.count(),
      db.user.count({ where: { role: 'TEACHER' } }),
      db.user.count({ where: { role: 'ADMIN' } }),
      
      // 課程統計
      db.course.count(),
      db.specialCourse.count(),
      db.product.count(),
      
      // 訂單統計
      db.order.count(),
      db.order.count({
        where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd } },
      }),
      db.order.count({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      
      // 收入統計
      db.order.aggregate({ _sum: { total: true } }),
      db.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: thisMonthStart, lte: thisMonthEnd } },
      }),
      db.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),

      // 財務統計
      db.invoice.count(),
      db.accounts.count(),

      // 最近訂單
      db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            take: 3,
            include: { product: { select: { title: true } } },
          },
        },
      }),

      // 用戶增長（按月）
      db.user.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),

      // 課程類型分布
      db.course.groupBy({
        by: ['weekday'],
        _count: true,
      }),

      // 產品狀態分布
      db.product.groupBy({
        by: ['IsPublic'],
        _count: true,
      }),
    ]);

    // ── 計算成長率 ──
    const orderGrowth = totalOrdersLastMonth > 0
      ? Math.round(((totalOrdersThisMonth - totalOrdersLastMonth) / totalOrdersLastMonth) * 100)
      : totalOrdersThisMonth > 0 ? 100 : 0;

    const revenueGrowth = (revenueLastMonth._sum.total ?? 0) > 0
      ? Math.round((((revenueThisMonth._sum.total ?? 0) - (revenueLastMonth._sum.total ?? 0)) / (revenueLastMonth._sum.total ?? 1)) * 100)
      : (revenueThisMonth._sum.total ?? 0) > 0 ? 100 : 0;

    return {
      // 總覽卡片
      overview: {
        totalUsers,
        totalTeachers,
        totalAdmins,
        totalCourses,
        totalSpecialCourses,
        totalProducts,
        totalOrders,
        totalRevenue: revenueData._sum.total ?? 0,
        totalInvoices,
        totalAccounts,
      },
      
      // 本月 vs 上月
      monthly: {
        ordersThisMonth: totalOrdersThisMonth,
        ordersLastMonth: totalOrdersLastMonth,
        orderGrowth,
        revenueThisMonth: revenueThisMonth._sum.total ?? 0,
        revenueLastMonth: revenueLastMonth._sum.total ?? 0,
        revenueGrowth,
      },

      // 最近訂單
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        customer: order.user.name || order.user.email || '未知',
        items: order.items.map(i => i.product.title).join(', '),
      })),

      // 圖表數據
      charts: {
        userGrowth: userGrowth.map(u => ({
          month: u.createdAt.toLocaleDateString('zh-TW', { month: 'short' }),
          count: u._count,
        })),
        courseDistribution: courseTypeCounts.map(c => ({
          name: c.weekday || '未設定',
          count: c._count,
        })),
        productStatus: productStatusCounts.map(p => ({
          name: p.IsPublic ? '上架' : '下架',
          count: p._count,
        })),
      },
    };
  } catch (error) {
    console.error('獲取儀表板數據失敗:', error);
    return null;
  }
}
