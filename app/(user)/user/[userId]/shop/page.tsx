

// app/components/ShopPage.tsx
"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // 使用 next/image 優化圖片加載
import { Award } from 'lucide-react';

interface CourseTimeRange {
  id: string;
  starttime: string | null;
  endtime: string | null;
}

interface Course {
  startDate: string | null;
  CourseTimeRanges: CourseTimeRange[];
}

interface ProductImg {
  id: string;
  img_url: string;
}

interface CourseProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  real_price: number;
  CourseProductTypeArray: string[];
  CourseProductStatusArray: string[];
  IsPublic: boolean;
  courseId: string | null;
  Course?: Course;
  Product_Img: ProductImg[];
  specialCourse?: boolean; // 新增字段
  specialCourseId?: string; // 新增字段
  isTrash?: boolean; // ← 新增此行（可選）
}

interface CourseProductType {
  id: string;
  typename: string;
  author: string;
}

interface CourseProductStatus {
  id: string;
  statuename: string;
}

const formatDate = (date: string | null | undefined): string => {
  if (date == null) return "未設置";
  try {
    return new Intl.DateTimeFormat("zh-HK", {
      dateStyle: "medium",
    }).format(new Date(date));
  } catch {
    return "無效日期";
  }
};

const formatTime = (time: string | null | undefined): string => {
  if (time == null) return "未設置";
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) return "無效時間";
  return time;
};

const ShopPagebyUser = () => {
  const { data: session } = useSession();
  const params = useParams();
  const userId = params.userId as string;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalProductLists, setOriginalProductLists] = useState<CourseProduct[]>([]);
  const [filteredProductLists, setFilteredProductLists] = useState<CourseProduct[]>([]);
  const [courseProductTypes, setCourseProductTypes] = useState<CourseProductType[]>([]);
  const [courseProductStatuses, setCourseProductStatuses] = useState<CourseProductStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchProductLists = async () => {
    try {
      const response = await fetch("/api/product/Get_Product_Lists");
      if (!response.ok) {
        throw new Error(`無法獲取商品數據: ${response.status}`);
      }
      const data = await response.json();
      console.log("API 返回的商品數據:", data);
      setOriginalProductLists(data);
      setFilteredProductLists(data);
      setError(null);
    } catch (error: unknown) {
      console.error("獲取商品數據失敗:", error);
      setError(error instanceof Error ? error.message : "無法獲取商品數據");
    }
  };

  const fetchCourseProductStatuses = async () => {
    try {
      const response = await fetch("/api/Status/Get_Status_Lists");
      if (!response.ok) {
        throw new Error(`無法獲取狀態數據: ${response.status}`);
      }
      const data = await response.json();
      setCourseProductStatuses(data);
      setError(null);
    } catch (error: unknown) {
      console.error("獲取狀態數據失敗:", error);
      setError(error instanceof Error ? error.message : "無法獲取狀態數據");
    }
  };

  const fetchCourseProductTypes = async () => {
    try {
      const response = await fetch("/api/Type/Get_Type_Lists");
      if (!response.ok) {
        throw new Error(`無法獲取類型數據: ${response.status}`);
      }
      const data = await response.json();
      setCourseProductTypes(data);
      setError(null);
    } catch (error: unknown) {
      console.error("獲取類型數據失敗:", error);
      setError(error instanceof Error ? error.message : "無法獲取類型數據");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchProductLists(),
        fetchCourseProductStatuses(),
        fetchCourseProductTypes(),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, []);





useEffect(() => {
  const filterProducts = () => {
    if (!originalProductLists.length) {
      setFilteredProductLists([]);
      return;
    }

    let filtered = originalProductLists;

    // === 1. 必須條件：公開 + 非 specialCourse + 非垃圾桶 ===
    filtered = filtered.filter((product) => {
      const isPublic = product.IsPublic === true;
      const isNotSpecial = !product.specialCourse && !product.specialCourseId;
      const isNotTrash = !product.isTrash;
      return isPublic && isNotSpecial && isNotTrash;
    });

    // === 2. 類型篩選：比對 ID 而非 typename ===
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((product) =>
        Array.isArray(product.CourseProductTypeArray) &&
        product.CourseProductTypeArray.some((typeId) =>
          selectedTypes.includes(typeId)
        )
      );
    }

    // === 3. 狀態篩選：比對 ID 而非 statuename ===
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((product) =>
        Array.isArray(product.CourseProductStatusArray) &&
        product.CourseProductStatusArray.some((statusId) =>
          selectedStatuses.includes(statusId)
        )
      );
    }

    // === 4. 搜尋：標題 + 描述 ===
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    setFilteredProductLists(filtered);
  };

  filterProducts();
}, [
  originalProductLists,
  selectedTypes,
  selectedStatuses,
  searchQuery,
]);


  const handleTypeChange = (typeId: string) => {
  setSelectedTypes((prev) =>
    prev.includes(typeId)
      ? prev.filter((id) => id !== typeId)
      : [...prev, typeId]
  );
};

const handleStatusChange = (statusId: string) => {
  setSelectedStatuses((prev) =>
    prev.includes(statusId)
      ? prev.filter((id) => id !== statusId)
      : [...prev, statusId]
  );
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session) {
      e.preventDefault();
      alert("請先登入以查看商品詳情！");
      router.push("/auth/signin");
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => {
              fetchProductLists();
              fetchCourseProductStatuses();
              fetchCourseProductTypes();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  console.log("courseProductStatuses:", courseProductStatuses, "-- End --");
  console.log("courseProductTypes:", courseProductTypes, "-- End --");
  console.log("filteredProductLists:", filteredProductLists, "-- End --");
console.log("originalProductLists: ", originalProductLists , "-- End --")

  return (
    <>
    {/* 1. Hero Section: 學院氣場，非促銷廣告 */}
      <section className="relative bg-slate-900 text-white py-5 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/pattern-grid.png')]"></div> {/* 背景紋理 */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto px-4 max-w-7xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              <span>NITTP 政府資助認可培訓機構</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
              引領企業 <span className="text-blue-400">科技轉型</span><br />
              培育未來 <span className="text-blue-400">數位人才</span>
            </h1>
            <p className="text-sm md:text-md text-slate-300 mb-5 leading-relaxed max-w-2xl">
              ITE 專注於將前沿科技轉化為可落地的商業技能。從 AI 應用到數據科學，我們提供的不僅是課程，而是企業升級的解決方案。
            </p>
          </div>
        </div>
      </section>

    {/* 2. Course */}
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* 左側：篩選和搜尋 (Sidebar) */}
        <div className="w-full lg:w-1/4 shrink-0 space-y-6 lg:sticky lg:top-4">
          
          {/* 搜尋區塊 */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">搜尋課程</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="輸入關鍵字..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* 類型篩選 */}
          <div className="hidden lg:block bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">類型篩選</label>
            <div className="flex flex-col gap-3">
              {courseProductTypes.map((type) => (
                <label key={type.id} className="inline-flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => handleTypeChange(type.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-slate-600 group-hover:text-blue-600 transition">{type.typename}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 狀態篩選 */}
          <div className="hidden lg:block bg-white border border-slate-200 shadow-sm rounded-xl p-6">
            <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">狀態篩選</label>
            <div className="flex flex-col gap-3">
              {courseProductStatuses.map((status) => (
                <label key={status.id} className="inline-flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status.id)}
                    onChange={() => handleStatusChange(status.id)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-slate-600 group-hover:text-blue-600 transition">{status.statuename}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 右側：商品列表 (橫向長方形) */}
        <div className="flex-1 w-full">
          <div className="flex flex-col gap-5">
            {filteredProductLists.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300"
              >
                <Link href={`/user/${userId}/shop/${product.id}`} onClick={handleProductClick} className="flex flex-col md:flex-row h-full">
                  {/* 圖片顯示 (左側固定寬度) */}
                  <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0 overflow-hidden bg-slate-100">
                    {product.Product_Img && product.Product_Img.length > 0 ? (
                      <Image
                        src={product.Product_Img[0].img_url}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={false}
                        placeholder="blur"
                        blurDataURL="/placeholder-image.jpg"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    ) : (
                      <Image
                        src="/placeholder-image.jpg"
                        alt="無圖片"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={false}
                        placeholder="blur"
                        blurDataURL="/placeholder-image.jpg"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    )}
                  </div>

                  {/* 內容區域 (右側) */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">{product.title}</h2>
                      </div>
                      
                      <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                      
                      <div className="flex flex-wrap gap-4 items-center">
                        <p className="text-blue-600 font-bold text-2xl">
                          HK${product.real_price.toFixed(2)}
                        </p>
                        {product.price !== 0 && (
                          <p className="text-slate-400 text-sm line-through decoration-slate-400">
                            HK${product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 底部 Meta 資訊 */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">📅 開課:</span>
                        {formatDate(product.Course?.startDate)}
                      </div>
                      {product.Course && Array.isArray(product.Course.CourseTimeRanges) && product.Course.CourseTimeRanges.length > 0 ? (
                        product.Course.CourseTimeRanges.map((timeRange) => (
                          <div key={timeRange.id} className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">⏰ 時間:</span>
                            {formatTime(timeRange.starttime)} - {formatTime(timeRange.endtime)}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">⏰ 時間:</span> 未設置
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            
            {filteredProductLists.length === 0 && (
              <div className="col-span-full py-20 bg-white border border-dashed border-slate-300 rounded-xl text-center">
                <p className="text-slate-500 font-medium">未找到符合條件的課程</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
</div>
    </>

  );
};

export default ShopPagebyUser;