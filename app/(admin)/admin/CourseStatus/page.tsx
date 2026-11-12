"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface StudentEntry {
  userId: string;
  name: string;
  firstPaidAt: string;
  lastPaidAt: string;
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
  products: {
    id: string;
    title: string;
    price: number;
    real_price: number;
    IsPublic: boolean;
  }[];
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
  timeRanges: { timeRange: string; starttime: string | null; endtime: string | null }[];
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

interface CourseStatusResponse {
  meta: {
    generatedAt: string;
    newStudentWindowDays: number;
    counts: {
      regular: number;
      special: number;
      withNewStudents: number;
      full: number;
      ongoing: number;
    };
  };
  courses: CourseStatusRow[];
}

const STATE_META: Record<CourseStatusRow["state"], { label: string; className: string }> = {
  UPCOMING: { label: "未開始", className: "bg-yellow-600" },
  ONGOING: { label: "進行中", className: "bg-green-600" },
  FINISHED: { label: "已完結", className: "bg-gray-600" },
  UNKNOWN: { label: "未設定", className: "bg-gray-700" },
};

const WARNING_LABELS: Record<string, string> = {
  PRODUCT_LINKS_BOTH: "商品同時連結普通及特別課程",
  LEGACY_STUDENTS_NOT_IN_ORDERS: "名單有學生無訂單記錄",
};

function formatDateShort(value: string | null | undefined): string {
  if (!value) return "未設定";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "未設定";
  return d.toLocaleDateString("zh-HK", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("zh-HK", { year: "numeric", month: "short", day: "numeric" });
}

function getTimeRangeText(
  timeRange: string,
  starttime?: string | null,
  endtime?: string | null
): string {
  if (starttime && endtime) return `${starttime} - ${endtime}`;
  if (starttime) return `${starttime} 開始`;
  const labelMap: Record<string, string> = {
    morning: "上午",
    afternoon: "下午",
    evening: "晚上",
    full_day: "全日",
  };
  return labelMap[timeRange] || timeRange || "未設定";
}

function formatPriceHKD(value: number | null | undefined): string {
  if (value == null) return "—";
  return `HK$${value.toLocaleString("zh-HK")}`;
}

function renderPriceCell(price: PriceInfo): string {
  if (price.source === "none") return "未設定";
  if (price.source === "embedded") {
    return formatPriceHKD(price.minRealPrice ?? price.minPrice);
  }
  if (price.minRealPrice != null && price.maxRealPrice != null) {
    if (price.minRealPrice === price.maxRealPrice) {
      return `${formatPriceHKD(price.minRealPrice)}（${price.productCount} 個商品）`;
    }
    return `${formatPriceHKD(price.minRealPrice)} – ${formatPriceHKD(price.maxRealPrice)}（${price.productCount} 個商品）`;
  }
  return "未設定";
}

export default function CourseStatusPage() {
  const [data, setData] = useState<CourseStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("all"); // all / regular / special
  const [stateFilter, setStateFilter] = useState<string>("all"); // all / UPCOMING / ONGOING / FINISHED / UNKNOWN
  const [onlyNewStudents, setOnlyNewStudents] = useState(false);
  const [onlyFull, setOnlyFull] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/Admin/Get_Course_Status");
      if (!response.ok) throw new Error(`請求失敗: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching course status:", err);
      setError("無法獲取課程狀態");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const rows = data?.courses ?? [];

  const filteredRows = rows.filter((row) => {
    if (kindFilter !== "all" && row.kind !== kindFilter) return false;
    if (stateFilter !== "all" && row.state !== stateFilter) return false;
    if (onlyNewStudents && row.newStudentCount === 0) return false;
    if (onlyFull && !row.isFull) return false;

    const q = searchQuery.toLowerCase();
    if (q) {
      const haystack = [
        row.title,
        row.courseCode,
        row.schoolName,
        row.classroom ?? "",
        row.teacherNames.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const meta = data?.meta;
  const newWindowDays = meta?.newStudentWindowDays ?? 7;

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">全課程狀態</h1>
          <div className="flex items-center gap-3">
            {meta && (
              <span className="text-xs text-gray-500">
                更新於 {new Date(meta.generatedAt).toLocaleTimeString("zh-HK")}
              </span>
            )}
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
            >
              重新整理
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        {/* Summary chips */}
        {meta && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{meta.counts.regular}</p>
              <p className="text-xs text-gray-400">普通課程</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{meta.counts.special}</p>
              <p className="text-xs text-gray-400">特別課程</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{meta.counts.withNewStudents}</p>
              <p className="text-xs text-gray-400">有新生課程</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{meta.counts.full}</p>
              <p className="text-xs text-gray-400">已滿課程</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{meta.counts.ongoing}</p>
              <p className="text-xs text-gray-400">進行中課程</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col lg:flex-row gap-3">
          <input
            type="text"
            placeholder="搜尋課程名稱、代碼、老師、學校、課室..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={kindFilter}
            onChange={(e) => {
              setKindFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">全部類型</option>
            <option value="regular">普通課程</option>
            <option value="special">特別課程</option>
          </select>
          <select
            value={stateFilter}
            onChange={(e) => {
              setStateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">全部狀態</option>
            <option value="UPCOMING">未開始</option>
            <option value="ONGOING">進行中</option>
            <option value="FINISHED">已完結</option>
            <option value="UNKNOWN">未設定</option>
          </select>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyNewStudents}
              onChange={(e) => {
                setOnlyNewStudents(e.target.checked);
                setCurrentPage(1);
              }}
              className="h-4 w-4"
            />
            只看有新生
          </label>
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyFull}
              onChange={(e) => {
                setOnlyFull(e.target.checked);
                setCurrentPage(1);
              }}
              className="h-4 w-4"
            />
            只看已滿
          </label>
        </div>

        {/* 表格 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
            </svg>
            載入中...
          </div>
        ) : paginatedRows.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {rows.length === 0 ? "暫無任何課程" : "無符合篩選條件的課程"}
          </p>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="min-w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="px-3 py-3">類型</th>
                  <th className="px-3 py-3">課程</th>
                  <th className="px-3 py-3">老師</th>
                  <th className="px-3 py-3">日期</th>
                  <th className="px-3 py-3">上課時間</th>
                  <th className="px-3 py-3">地點</th>
                  <th className="px-3 py-3">價錢</th>
                  <th className="px-3 py-3">學生</th>
                  <th className="px-3 py-3">新學生（{newWindowDays}日）</th>
                  <th className="px-3 py-3">狀態</th>
                  <th className="px-3 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => {
                  const stateMeta = STATE_META[row.state];
                  const isExpanded = expandedRowId === row.id;

                  return (
                    <Fragment key={row.id}>
                      <tr
                        className={`border-b border-gray-700/60 hover:bg-gray-700/40 transition ${
                          row.newStudentCount > 0 ? "bg-emerald-900/20" : ""
                        }`}
                      >
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              row.kind === "regular" ? "bg-blue-600" : "bg-purple-600"
                            }`}
                          >
                            {row.kind === "regular" ? "普通" : "特別"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium max-w-48 truncate" title={row.title}>
                            {row.title}
                          </p>
                          <p className="text-xs text-gray-400">{row.courseCode || "N/A"}</p>
                        </td>
                        <td className="px-3 py-3">
                          {row.teacherNames.length > 0 ? row.teacherNames.join(", ") : "未設定"}
                        </td>
                        <td className="px-3 py-3">
                          {row.startDate || row.endDate ? (
                            <p>
                              {formatDateShort(row.startDate)} ~ {formatDateShort(row.endDate)}
                            </p>
                          ) : row.courseDates.length > 0 ? (
                            <p>
                              {formatDateShort(row.courseDates[0])} 等 {row.courseDates.length} 堂
                            </p>
                          ) : (
                            <p className="text-gray-500">未設定</p>
                          )}
                          {row.weekday && <p className="text-xs text-gray-400">{row.weekday}</p>}
                        </td>
                        <td className="px-3 py-3">
                          {row.timeRanges.length > 0 ? (
                            row.timeRanges.map((tr, i) => (
                              <p key={i}>{getTimeRangeText(tr.timeRange, tr.starttime, tr.endtime)}</p>
                            ))
                          ) : (
                            <span className="text-gray-500">未設定</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <p>{row.schoolName || "未設定"}</p>
                          {row.classroom && <p className="text-xs text-gray-400">課室: {row.classroom}</p>}
                        </td>
                        <td className="px-3 py-3">{renderPriceCell(row.price)}</td>
                        <td className="px-3 py-3">
                          <p>
                            已付款 {row.paidStudentCount} / 名單 {row.legacyStudentCount}
                            {row.maxStudents != null && ` / 上限 ${row.maxStudents}`}
                          </p>
                          {row.isFull && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-600 inline-block mt-1">
                              已滿
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {row.newStudentCount > 0 ? (
                            <button
                              onClick={() =>
                                setExpandedRowId(isExpanded ? null : row.id)
                              }
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 transition"
                            >
                              +{row.newStudentCount} 新
                              <ChevronDownIcon
                                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${stateMeta.className}`}>
                            {stateMeta.label}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                setExpandedRowId(isExpanded ? null : row.id)
                              }
                              className="text-xs text-blue-400 hover:text-blue-300 text-left"
                            >
                              {isExpanded ? "收起 ▲" : "展開 ▼"}
                            </button>
                            {row.kind === "regular" ? (
                              <Link
                                href={`/admin/CourseLists/${row.id}/Edit`}
                                className="text-xs text-gray-400 hover:text-white"
                              >
                                編輯 →
                              </Link>
                            ) : (
                              <Link
                                href={`/admin/SpecialCourseLists/${row.id}`}
                                className="text-xs text-gray-400 hover:text-white"
                              >
                                詳情 →
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr
                          className="border-b border-gray-700/60 bg-gray-900/60"
                        >
                          <td colSpan={11} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* 學生名單 */}
                              <div>
                                <p className="font-semibold mb-2">
                                  學生名單（{row.students.length} 人，依最近付款排序）
                                </p>
                                {row.students.length === 0 ? (
                                  <p className="text-gray-500 text-sm">暫無付款學生記錄</p>
                                ) : (
                                  <div className="max-h-64 overflow-y-auto">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="text-gray-400 text-left">
                                          <th className="py-1 pr-3">姓名</th>
                                          <th className="py-1 pr-3">首次付款</th>
                                          <th className="py-1 pr-3">最近付款</th>
                                          <th className="py-1">標記</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {row.students.map((s) => (
                                          <tr key={s.userId} className="border-t border-gray-700/50">
                                            <td className="py-1 pr-3">{s.name}</td>
                                            <td className="py-1 pr-3">{formatDateTime(s.firstPaidAt)}</td>
                                            <td className="py-1 pr-3">{formatDateTime(s.lastPaidAt)}</td>
                                            <td className="py-1">
                                              {s.isNew && (
                                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-600">
                                                  NEW
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* 商品價格明細 + 警告 */}
                              <div className="space-y-4">
                                <div>
                                  <p className="font-semibold mb-2">
                                    商品價格（{row.price.products.length} 個）
                                  </p>
                                  {row.price.products.length === 0 ? (
                                    <p className="text-gray-500 text-sm">
                                      {row.price.source === "embedded"
                                        ? "使用特別課程內嵌價格"
                                        : "未設定價錢（未有商品）"}
                                    </p>
                                  ) : (
                                    <div className="space-y-1">
                                      {row.price.products.map((p) => (
                                        <div
                                          key={p.id}
                                          className="flex items-center justify-between text-sm"
                                        >
                                          <span className="truncate pr-3">
                                            {p.title}
                                            {!p.IsPublic && (
                                              <span className="text-xs text-gray-500 ml-1">(非公開)</span>
                                            )}
                                          </span>
                                          <span className="whitespace-nowrap">
                                            <span className="text-gray-400 line-through mr-1">
                                              HK${p.price.toLocaleString("zh-HK")}
                                            </span>
                                            <span className="font-medium">
                                              HK${p.real_price.toLocaleString("zh-HK")}
                                            </span>
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {row.dataWarnings.length > 0 && (
                                  <div className="text-xs text-yellow-500 space-y-1">
                                    {row.dataWarnings.map((w) => (
                                      <p key={w}>⚠️ {WARNING_LABELS[w] ?? w}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 hover:bg-gray-600 transition"
            >
              上一頁
            </button>
            <span className="text-gray-400">
              第 {currentPage} / {totalPages} 頁（共 {filteredRows.length} 課程）
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 hover:bg-gray-600 transition"
            >
              下一頁
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
