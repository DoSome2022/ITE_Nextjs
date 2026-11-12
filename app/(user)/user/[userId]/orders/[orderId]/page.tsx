"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrderStatusMeta } from "@/lib/order-status";

interface CourseTimeRange {
  timeRange: string;
  starttime: string | null;
  endtime: string | null;
}

interface CourseSummary {
  id: string;
  title: string;
  description: string;
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
  description: string;
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
    description: string;
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
  userId: string;
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

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 權限檢查
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id !== userId) {
      router.push("/login");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, userId, router]);

  // 取得訂單詳情
  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        const response = await fetch(`/api/Orders/Get_Order_by_Id/${orderId}`);
        if (response.status === 404) {
          setError("訂單不存在");
          return;
        }
        if (response.status === 403) {
          setError("無權查看此訂單");
          return;
        }
        if (!response.ok) throw new Error(`請求失敗: ${response.status}`);
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("無法獲取訂單詳情");
      } finally {
        setLoading(false);
      }
    }
    if (orderId) fetchOrder();
  }, [orderId]);

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

  if (error || !order) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || "找不到訂單"}</p>
        <Link
          href={`/user/${userId}/orders`}
          className="px-4 py-2 bg-gray-700 rounded-md text-sm hover:bg-gray-600 transition"
        >
          返回購買記錄
        </Link>
      </div>
    );
  }

  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">訂單詳情</h1>
          <Link
            href={`/user/${userId}/orders`}
            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm hover:bg-gray-600 transition"
          >
            返回購買記錄
          </Link>
        </div>

        {/* 訂單資訊卡 */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">訂單編號</p>
              <p className="font-mono text-sm break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">購買日期</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleString("zh-HK")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">狀態</p>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${statusMeta.className}`}>
                {statusMeta.label}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400">交易參考（Payment ID）</p>
              <p className="font-mono text-xs break-all text-gray-300">
                {order.paymentId || "無"}
              </p>
            </div>
          </div>
        </div>

        {/* 訂單項目 */}
        <div className="space-y-4">
          {order.items.map((item) => {
            const course = item.product.Course;
            const special = item.product.specialCourse;
            const isRegular = !!course;
            const isSpecial = !!special;
            const courseCode = course?.courseCode ?? special?.courseCode ?? "N/A";
            const schoolName = course?.schoolName ?? special?.schoolName ?? "N/A";
            const classroom = course?.classroom ?? special?.classroom ?? null;
            const teacherNames = (course ? course.teacher : special?.teacher ?? []).filter(Boolean);
            const timeRanges = course
              ? course.CourseTimeRanges
              : special?.SpecialCourseTimeRanges ?? [];
            const courseDates = course ? course.Coursedates : special?.Coursedates ?? [];
            const weekday = course?.weekday ?? special?.weekday ?? null;
            const startDate = course?.startDate ?? special?.startDate ?? null;
            const endDate = course?.endDate ?? special?.endDate ?? null;

            return (
              <div key={item.id} className="bg-gray-800 shadow-lg rounded-lg p-5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isRegular ? "bg-blue-600" : isSpecial ? "bg-purple-600" : "bg-gray-600"
                        }`}
                      >
                        {isRegular ? "普通課程" : isSpecial ? "特別課程" : "其他商品"}
                      </span>
                      <h2 className="text-lg font-semibold">{item.product.title}</h2>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      購買價 HK${item.price.toFixed(2)} × {item.quantity} ={" "}
                      <span className="text-white font-medium">
                        HK${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </p>
                    {item.price !== item.product.real_price && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        現時售價 HK${item.product.real_price.toFixed(2)}（原價 HK$
                        {item.product.price.toFixed(2)}）
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isRegular && course && (
                      <Link
                        href={`/user/${userId}/CourseLists/${course.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        查看課程詳情
                      </Link>
                    )}
                    {isSpecial && special && (
                      <Link
                        href={`/user/${userId}/CourseLists/SCourse/${special.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition whitespace-nowrap"
                      >
                        查看課程詳情
                      </Link>
                    )}
                  </div>
                </div>

                {(isRegular || isSpecial) && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-gray-700 pt-4">
                    <p><span className="text-gray-400">課程名稱: </span>{course?.title ?? special?.title ?? "N/A"}</p>
                    <p><span className="text-gray-400">課程代碼: </span>{courseCode}</p>
                    <p><span className="text-gray-400">學校: </span>{schoolName}</p>
                    <p><span className="text-gray-400">課室: </span>{classroom || "未設定"}</p>
                    <p><span className="text-gray-400">老師: </span>{teacherNames.length > 0 ? teacherNames.join(", ") : "未設定"}</p>
                    <p><span className="text-gray-400">星期: </span>{weekday || "未設定"}</p>
                    <p><span className="text-gray-400">開始日期: </span>{formatDisplayDate(startDate)}</p>
                    <p><span className="text-gray-400">結束日期: </span>{formatDisplayDate(endDate)}</p>
                    {courseDates.length > 0 && (
                      <p className="md:col-span-2">
                        <span className="text-gray-400">上課日期（{courseDates.length} 堂）: </span>
                        {courseDates.map((d) => formatDisplayDate(d)).join("、")}
                      </p>
                    )}
                    <p className="md:col-span-2">
                      <span className="text-gray-400">上課時間: </span>
                      {timeRanges.length > 0
                        ? timeRanges
                            .map((tr) => getTimeRangeText(tr.timeRange, tr.starttime, tr.endtime))
                            .join("、")
                        : "未設定"}
                    </p>
                  </div>
                )}

                {!isRegular && !isSpecial && (
                  <p className="text-sm text-gray-400 mt-3">此商品未連結任何課程</p>
                )}

                {isRegular && isSpecial && (
                  <p className="text-xs text-yellow-500 mt-3">
                    ⚠️ 資料提示：此商品同時連結了普通課程及特別課程。
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 總計 */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-5 mt-6 flex items-center justify-between">
          <p className="text-gray-400">訂單總額</p>
          <p className="text-xl font-bold">HK${order.total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
