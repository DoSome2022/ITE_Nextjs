"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { getOrderStatusMeta, isPaidStatus } from "@/lib/order-status";

interface CourseTimeRange {
  timeRange: string;
  starttime: string | null;
  endtime: string | null;
}

interface CourseSummary {
  id: string;
  title: string;
  courseCode: string;
  schoolName: string;
  classroom: string | null;
  weekday: string | null;
  startDate: string | null;
  endDate: string | null;
  Coursedates: string[];
  teacher: string[];
  Teacher: { name: string | null; username: string } | null;
  CourseTimeRanges: CourseTimeRange[];
}

interface SpecialCourseSummary {
  id: string;
  title: string;
  courseCode: string;
  schoolName: string;
  classroom: string | null;
  weekday: string | null;
  startDate: string | null;
  endDate: string | null;
  Coursedates: string[];
  teacher: string[];
  price: number | null;
  real_price: number | null;
  SpecialCourseTimeRanges: CourseTimeRange[];
}

interface OrderItemData {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    price: number;
    real_price: number;
    courseId: string | null;
    specialCourseId: string | null;
    Course: CourseSummary | null;
    specialCourse: SpecialCourseSummary | null;
  };
}

interface OrderData {
  id: string;
  total: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemData[];
}

function formatDisplayDate(value: string | Date | null | undefined): string {
  if (!value) return "未設定";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "未設定";
  return d.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
  return labelMap[timeRange] || timeRange || "未設定時間";
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all / paid / pending / failed
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 權限檢查
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id !== userId) {
      router.push("/login");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, userId, router]);

  // 取得訂單
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const response = await fetch(`/api/Orders/Get_Orders_by_User/${userId}`);
        if (!response.ok) throw new Error(`請求失敗: ${response.status}`);
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("無法獲取購買記錄");
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchOrders();
  }, [userId]);

  // 篩選
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "paid" && isPaidStatus(order.status)) ||
      (statusFilter === "pending" && order.status.toUpperCase() === "PENDING") ||
      (statusFilter === "failed" && order.status.toUpperCase() === "FAILED");

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.items.some(
        (item) =>
          item.product.title.toLowerCase().includes(q) ||
          item.product.Course?.title.toLowerCase().includes(q) ||
          item.product.specialCourse?.title.toLowerCase().includes(q)
      );

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (status === "loading" || loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
          </svg>
          載入中...
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "USER") return null;

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">購買記錄</h1>
          <Link
            href={`/user/${userId}/CourseLists`}
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 transition"
          >
            返回我的課程
          </Link>
        </div>

        {error && <div className="mb-4 text-red-500">{error}</div>}

        {/* 篩選 */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="搜尋訂單編號或課程名稱..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">全部狀態</option>
            <option value="paid">已付款</option>
            <option value="pending">待付款</option>
            <option value="failed">失敗</option>
          </select>
        </div>

        {/* 訂單列表 */}
        <div className="space-y-3">
          {paginatedOrders.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              {filteredOrders.length === 0 ? "您尚未有任何購買記錄" : "無符合篩選條件的訂單"}
            </p>
          ) : (
            paginatedOrders.map((order) => {
              const statusMeta = getOrderStatusMeta(order.status);
              const firstTwoTitles = order.items.slice(0, 2).map((i) => i.product.title);
              const extraCount = order.items.length - firstTwoTitles.length;

              return (
                <Disclosure key={order.id}>
                  {({ open }) => (
                    <div className="bg-gray-800 shadow-lg rounded-lg">
                      <Disclosure.Button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition rounded-lg text-left">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
                          <div>
                            <p className="text-sm text-gray-400">購買日期</p>
                            <p className="text-sm font-medium">
                              {new Date(order.createdAt).toLocaleDateString("zh-HK")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">訂單編號</p>
                            <p className="text-sm font-medium" title={order.id}>
                              #{order.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-400">課程</p>
                            <p className="text-sm truncate">
                              {firstTwoTitles.join("、")}
                              {extraCount > 0 ? ` +${extraCount}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                          <span className="font-semibold whitespace-nowrap">
                            HK${order.total.toFixed(2)}
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </div>
                      </Disclosure.Button>

                      <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        <Disclosure.Panel className="px-4 pb-4 border-t border-gray-700">
                          <div className="space-y-4 pt-4">
                            {order.items.map((item) => {
                              const course = item.product.Course;
                              const special = item.product.specialCourse;
                              const isRegular = !!course;
                              const isSpecial = !!special;
                              const courseCode = course?.courseCode ?? special?.courseCode ?? "N/A";
                              const schoolName = course?.schoolName ?? special?.schoolName ?? "N/A";
                              const classroom = course?.classroom ?? special?.classroom ?? null;
                              const teacherNames =
                                (course ? course.teacher : special?.teacher ?? []).filter(Boolean);
                              const timeRanges = course
                                ? course.CourseTimeRanges
                                : special?.SpecialCourseTimeRanges ?? [];
                              const courseDates = course
                                ? course.Coursedates
                                : special?.Coursedates ?? [];

                              return (
                                <div key={item.id} className="bg-gray-700/50 rounded-md p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded-full ${
                                            isRegular
                                              ? "bg-blue-600"
                                              : isSpecial
                                              ? "bg-purple-600"
                                              : "bg-gray-600"
                                          }`}
                                        >
                                          {isRegular ? "普通課程" : isSpecial ? "特別課程" : "其他商品"}
                                        </span>
                                        <p className="font-semibold">{item.product.title}</p>
                                      </div>
                                      <p className="text-sm text-gray-400 mt-1">
                                        單價 HK${item.price.toFixed(2)} × {item.quantity} ={" "}
                                        <span className="text-white">
                                          HK${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                      {isRegular && course && (
                                        <Link
                                          href={`/user/${userId}/CourseLists/${course.id}`}
                                          className="text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap"
                                        >
                                          查看課程 →
                                        </Link>
                                      )}
                                      {isSpecial && special && (
                                        <Link
                                          href={`/user/${userId}/CourseLists/SCourse/${special.id}`}
                                          className="text-sm text-purple-400 hover:text-purple-300 whitespace-nowrap"
                                        >
                                          查看課程 →
                                        </Link>
                                      )}
                                    </div>
                                  </div>

                                  {(isRegular || isSpecial) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-gray-300">
                                      <p>課程代碼: {courseCode}</p>
                                      <p>老師: {teacherNames.length > 0 ? teacherNames.join(", ") : "未設定"}</p>
                                      <p>學校: {schoolName}</p>
                                      <p>課室: {classroom || "未設定"}</p>
                                      <p>
                                        日期:{" "}
                                        {courseDates.length > 0
                                          ? `${formatDisplayDate(courseDates[0])} 等 ${courseDates.length} 堂`
                                          : `${formatDisplayDate(course?.startDate ?? special?.startDate ?? null)} 至 ${formatDisplayDate(course?.endDate ?? special?.endDate ?? null)}`}
                                      </p>
                                      <p>星期: {(course?.weekday ?? special?.weekday) || "未設定"}</p>
                                      <p className="md:col-span-2">
                                        上課時間:{" "}
                                        {timeRanges.length > 0
                                          ? timeRanges
                                              .map((tr) => getTimeRangeText(tr.timeRange, tr.starttime, tr.endtime))
                                              .join("、")
                                          : "未設定"}
                                      </p>
                                    </div>
                                  )}

                                  {!isRegular && !isSpecial && (
                                    <p className="text-sm text-gray-400 mt-2">此商品未連結任何課程</p>
                                  )}

                                  <div className="mt-2">
                                    <Link
                                      href={`/user/${userId}/orders/${order.id}`}
                                      className="text-sm text-gray-400 hover:text-white underline underline-offset-2"
                                    >
                                      查看完整訂單
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </div>
                  )}
                </Disclosure>
              );
            })
          )}
        </div>

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 hover:bg-gray-600 transition"
            >
              上一頁
            </button>
            <span className="text-gray-400">
              第 {currentPage} / {totalPages} 頁
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
