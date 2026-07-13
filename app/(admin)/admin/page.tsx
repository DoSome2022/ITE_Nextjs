"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/admin/get-dashboard-stats";

// ── 類型定義 ──
interface DashboardData {
  overview: {
    totalUsers: number;
    totalTeachers: number;
    totalAdmins: number;
    totalCourses: number;
    totalSpecialCourses: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalInvoices: number;
    totalAccounts: number;
  };
  monthly: {
    ordersThisMonth: number;
    ordersLastMonth: number;
    orderGrowth: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
  };
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customer: string;
    items: string;
  }>;
  charts: {
    userGrowth: Array<{ month: string; count: number }>;
    courseDistribution: Array<{ name: string; count: number }>;
    productStatus: Array<{ name: string; count: number }>;
  };
}

// ── 統計卡片元件 ──
const StatCard = ({ title, value, subtitle, trend, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2" style={{ color }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  </div>
);

// ── 長條圖元件 ──
const BarChart = ({ data, title, color }: {
  data: Array<{ name: string; count: number }>;
  title: string;
  color: string;
}) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="flex items-end gap-3 h-40">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-gray-500">{item.count}</span>
            <div
              className="w-full rounded-t-md transition-all hover:opacity-80"
              style={{
                height: `${(item.count / maxCount) * 100}%`,
                backgroundColor: color,
                minHeight: item.count > 0 ? '8px' : '0',
              }}
            />
            <span className="text-xs text-gray-400 truncate w-full text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 主頁面 ──
const AdminPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const stats = await getDashboardStats();
        if (!stats) throw new Error('無法獲取儀表板數據');
        setData(stats as DashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">載入儀表板數據...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200">
          <p className="text-red-500 font-medium">❌ {error || '無法載入數據'}</p>
        </div>
      </div>
    );
  }

  const { overview, monthly, recentOrders, charts } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">管理儀表板</h1>
        <p className="text-gray-500 mt-1">系統營運總覽與統計數據</p>
      </div>

      {/* ===== 核心指標卡片 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="總用戶數"
          value={overview.totalUsers}
          subtitle={`教師 ${overview.totalTeachers} 人 · 管理員 ${overview.totalAdmins} 人`}
          color="#3b82f6"
        />
        <StatCard
          title="本月訂單"
          value={monthly.ordersThisMonth}
          subtitle={`上月 ${monthly.ordersLastMonth} 筆`}
          trend={{ value: monthly.orderGrowth, isPositive: monthly.orderGrowth >= 0 }}
          color="#8b5cf6"
        />
        <StatCard
          title="本月收入"
          value={`HK$${monthly.revenueThisMonth.toLocaleString()}`}
          subtitle={`上月 HK$${monthly.revenueLastMonth.toLocaleString()}`}
          trend={{ value: monthly.revenueGrowth, isPositive: monthly.revenueGrowth >= 0 }}
          color="#10b981"
        />
        <StatCard
          title="課程總數"
          value={overview.totalCourses + overview.totalSpecialCourses}
          subtitle={`一般 ${overview.totalCourses} · 特殊 ${overview.totalSpecialCourses}`}
          color="#f59e0b"
        />
        <StatCard
          title="商品總數"
          value={overview.totalProducts}
          subtitle={`累積訂單 ${overview.totalOrders} 筆`}
          color="#ef4444"
        />
      </div>

      {/* ===== 第二行：更多指標 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="總收入"
          value={`HK$${overview.totalRevenue.toLocaleString()}`}
          color="#6366f1"
        />
        <StatCard
          title="發票數量"
          value={overview.totalInvoices}
          color="#ec4899"
        />
        <StatCard
          title="帳目記錄"
          value={overview.totalAccounts}
          color="#14b8a6"
        />
        <StatCard
          title="管理員人數"
          value={overview.totalAdmins}
          color="#f97316"
        />
      </div>

      {/* ===== 圖表與最近訂單 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 課程分布 */}
        <BarChart
          data={charts.courseDistribution.length > 0
            ? charts.courseDistribution
            : [{ name: '暫無數據', count: 0 }]
          }
          title="📚 課程星期分布"
          color="#3b82f6"
        />

        {/* 產品狀態 */}
        <BarChart
          data={charts.productStatus.length > 0
            ? charts.productStatus
            : [{ name: '暫無數據', count: 0 }]
          }
          title="🏷️ 產品上架狀態"
          color="#10b981"
        />

        
        {/* 用戶增長 */}
        <BarChart
          data={charts.userGrowth.length > 0
            ? charts.userGrowth.reverse().map(item => ({ name: item.month, count: item.count }))
            : [{ name: '暫無數據', count: 0 }]
          }
          title="👥 用戶註冊趨勢"
          color="#8b5cf6"
        />

      </div>

      {/* ===== 最近訂單 ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700">📋 最近訂單</h3>
          <span className="text-xs text-gray-400">最新 5 筆</span>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>暫無訂單記錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-500">訂單編號</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">客戶</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500">商品</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">金額</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-500">狀態</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500">日期</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-gray-600">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-2 text-gray-800">{order.customer}</td>
                    <td className="py-3 px-2 text-gray-500 max-w-[200px] truncate">
                      {order.items}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">
                      HK${order.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PAID' || order.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-600'
                          : order.status === 'PENDING'
                          ? 'bg-yellow-50 text-yellow-600'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {order.status === 'PAID' ? '已付款'
                          : order.status === 'PENDING' ? '待處理'
                          : order.status === 'COMPLETED' ? '已完成'
                          : order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
