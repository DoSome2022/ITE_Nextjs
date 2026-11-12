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

// ── 帳目記錄（真實 Stripe 付款數據） ──
interface AccountRecord {
  clientName: string;
  email: string;
  reference: string;
  createdAt: string;
  country: string;
  total: number;
}

const REAL_ACCOUNT_DATA: AccountRecord[] = [
  {
    clientName: "lee chi ho",
    email: "mandyman@orientalpartners.com.hk",
    reference: "pi_3TcIEpFZX1m8hayP1lqGLAvP",
    createdAt: "2026/5/29 下午12:42",
    country: "中國香港特別行政區",
    total: 3280.0,
  },
  {
    clientName: "LAU PO LING",
    email: "hkpollyhk@yahoo.com.hk",
    reference: "pi_3TBqGjFZX1m8hayP049EV3al",
    createdAt: "2026/3/17 下午1:35",
    country: "中國香港特別行政區",
    total: 0.0,
  },
  {
    clientName: "Sio Kun Ng",
    email: "ngsiokun88@hotmail.com",
    reference: "pi_3TB6BiFZX1m8hayP0GXQMmwX",
    createdAt: "2026/3/15 下午12:23",
    country: "中國香港特別行政區",
    total: 3000.0,
  },
];

// 依「建立時間」解析年份與月份並分組（降冪排序）
function groupAccountsByYearMonth(accounts: AccountRecord[]) {
  const groups = new Map<string, { year: number; month: number; items: AccountRecord[] }>();
  for (const acc of accounts) {
    const match = acc.createdAt.match(/^(\d{4})\/(\d{1,2})\//);
    if (!match) continue;
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const key = `${year}-${month}`;
    if (!groups.has(key)) groups.set(key, { year, month, items: [] });
    groups.get(key)!.items.push(acc);
  }
  return Array.from(groups.values()).sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.month - a.month
  );
}

const formatHKD = (n: number) =>
  `HK$${n.toLocaleString("zh-HK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// 解析「建立時間」字串（例如 2026/5/29 下午12:42）取得年份與月份
function parseYearMonth(createdAt: string): { year: number; month: number } | null {
  const match = createdAt.match(/^(\d{4})\/(\d{1,2})\//);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) };
}

// ── 主頁面 ──
const AdminPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const years = REAL_ACCOUNT_DATA
      .map((a) => parseYearMonth(a.createdAt)?.year)
      .filter((y): y is number => y !== undefined);
    return years.length > 0 ? Math.max(...years) : new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
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

  const { overview } = data;

  // ── 依 REAL_ACCOUNT_DATA 計算帳目（訂單、收入、總收入） ──
  const availableYears = Array.from(
    new Set(
      REAL_ACCOUNT_DATA
        .map((a) => parseYearMonth(a.createdAt)?.year)
        .filter((y): y is number => y !== undefined)
    )
  ).sort((a, b) => b - a);

  const yearOptions = availableYears.length > 0 ? availableYears : [selectedYear];

  const filteredRecords = REAL_ACCOUNT_DATA.filter((a) => {
    const ym = parseYearMonth(a.createdAt);
    if (!ym) return false;
    if (ym.year !== selectedYear) return false;
    if (selectedMonth !== 0 && ym.month !== selectedMonth) return false;
    return true;
  });

  const filteredOrders = filteredRecords.length;
  const filteredRevenue = filteredRecords.reduce((s, a) => s + a.total, 0);
  const totalRevenue = REAL_ACCOUNT_DATA.reduce((s, a) => s + a.total, 0);
  const periodLabel = selectedMonth === 0
    ? `${selectedYear} 年（整年）`
    : `${selectedYear} 年 ${selectedMonth} 月`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">管理儀表板</h1>
        <p className="text-gray-500 mt-1">系統營運總覽與統計數據</p>
      </div>

      {/* ===== 年份/月份篩選 ===== */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">年份</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">月份</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>整年</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m} 月</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-gray-500 ml-auto">
          顯示期間：{periodLabel}
        </span>
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
          title="管理員人數"
          value={overview.totalAdmins}
          color="#f97316"
        />
        <StatCard
          title="訂單"
          value={filteredOrders}
          subtitle={periodLabel}
          color="#8b5cf6"
        />
        <StatCard
          title="收入"
          value={formatHKD(filteredRevenue)}
          subtitle={periodLabel}
          color="#10b981"
        />
        {/* <StatCard
          title="課程總數"
          value={overview.totalCourses + overview.totalSpecialCourses}
          subtitle={`一般 ${overview.totalCourses} · 特殊 ${overview.totalSpecialCourses}`}
          color="#f59e0b"
        />
        <StatCard
          title="商品總數"
          value={overview.totalProducts}
          subtitle={`累積訂單 ${REAL_ACCOUNT_DATA.length} 筆`}
          color="#ef4444"
        /> */}
      </div>

      {/* ===== 第二行：更多指標 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="總收入"
          value={formatHKD(totalRevenue)}
          subtitle="累計總額（不分期間）"
          color="#6366f1"
        />
        
      </div>

      {/* ===== 帳目記錄（分年份月份） ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700">💰 帳目記錄</h3>
          <span className="text-xs text-gray-400">
            共 {REAL_ACCOUNT_DATA.length} 筆 · 合計 {formatHKD(REAL_ACCOUNT_DATA.reduce((s, a) => s + a.total, 0))}
          </span>
        </div>

        {REAL_ACCOUNT_DATA.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>暫無帳目記錄</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupAccountsByYearMonth(REAL_ACCOUNT_DATA).map((group) => (
              <div key={`${group.year}-${group.month}`}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-800">
                    {group.year} 年 {group.month} 月
                  </h4>
                  <span className="text-xs text-gray-400">
                    {group.items.length} 筆 · 小計 {formatHKD(group.items.reduce((s, a) => s + a.total, 0))}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-2 px-2 font-medium text-gray-500">客戶名稱</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">電子郵箱</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">Reference No.</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">建立時間</th>
                        <th className="text-left py-2 px-2 font-medium text-gray-500">國家/地區</th>
                        <th className="text-right py-2 px-2 font-medium text-gray-500">總消費 (HKD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((acc) => (
                        <tr key={acc.reference} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-2 px-2 text-gray-800">{acc.clientName}</td>
                          <td className="py-2 px-2 text-gray-500">{acc.email}</td>
                          <td className="py-2 px-2 font-mono text-xs text-gray-600">{acc.reference}</td>
                          <td className="py-2 px-2 text-gray-500 text-xs">{acc.createdAt}</td>
                          <td className="py-2 px-2 text-gray-500">{acc.country}</td>
                          <td className="py-2 px-2 text-right font-medium">{formatHKD(acc.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
