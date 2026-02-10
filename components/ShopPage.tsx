

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

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

interface HeaderType {
  id: string;
  HeaderTypeName: string;
}

interface ShopPageProps {
  headerTypes?: HeaderType[];
}

const formatDate = (date: string | null | undefined): string => {
  if (date == null) return "未設置";
  try {
    return new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium" }).format(new Date(date));
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

const ShopPage: React.FC<ShopPageProps> = ({ headerTypes = [] }) => {
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [productLists, setProductLists] = useState<CourseProduct[]>([]);
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
      setProductLists(data);
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
    fetchProductLists();
    fetchCourseProductStatuses();
    fetchCourseProductTypes();
  }, []);


const filteredProducts = useMemo(() => {
  if (!productLists.length) return [];

  let filtered = productLists.filter((product) => {
    // 必須公開
    if (product.IsPublic !== true) return false;

    // 有 specialCourse 或 specialCourseId 就隱藏
    if (product.specialCourse || product.specialCourseId) return false;

    return true;
  });

  // === 類型篩選 ===
  if (selectedTypes.length > 0) {
    filtered = filtered.filter((product) => {
      if (!Array.isArray(product.CourseProductTypeArray)) return false;
      return selectedTypes.some((selectedId) => {
        const type = courseProductTypes.find(t => t.id === selectedId);
        if (!type) return false;
        return (
          product.CourseProductTypeArray.includes(selectedId) ||
          product.CourseProductTypeArray.includes(type.typename)
        );
      });
    });
  }

  // === 狀態篩選 ===
  if (selectedStatuses.length > 0) {
    filtered = filtered.filter((product) => {
      if (!Array.isArray(product.CourseProductStatusArray)) return false;
      return selectedStatuses.some((selectedId) => {
        const status = courseProductStatuses.find(s => s.id === selectedId);
        if (!status) return false;
        return (
          product.CourseProductStatusArray.includes(selectedId) ||
          product.CourseProductStatusArray.includes(status.statuename)
        );
      });
    });
  }

  // === 搜尋 ===
  if (searchQuery) {
    filtered = filtered.filter(
      (product) =>
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return filtered;
}, [productLists, selectedTypes, selectedStatuses, searchQuery, courseProductTypes, courseProductStatuses]);





const handleTypeChange = (typeId: string) => {
  setSelectedTypes((prev) =>
    prev.includes(typeId)
      ? prev.filter((t) => t !== typeId)
      : [...prev, typeId]
  );
};

const handleStatusChange = (statusId: string) => {
  setSelectedStatuses((prev) =>
    prev.includes(statusId)
      ? prev.filter((s) => s !== statusId)
      : [...prev, statusId]
  );
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (status === "loading") {
    return <div className="text-center py-10">載入中...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center py-10 bg-red-100 rounded-md">
          錯誤: {error}
        </div>
        <button
          onClick={() => {
            fetchProductLists();
            fetchCourseProductStatuses();
            fetchCourseProductTypes();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
        >
          重試
        </button>
      </div>
    );
  }

  // console.log("headerTypesDate : ", headerTypes, " -- End -- ");
  //   console.log("courseProductTypes : ", courseProductTypes, " -- End -- ");
  //     console.log("selectedTypes : ", selectedTypes, " -- End -- ");
  console.log("productLists : ", productLists , "-- End --")

  return (
    <>
    {/* 1. Hero Section: 學院氣場，非促銷廣告 */}
      <section className="relative bg-slate-900 text-white py-5 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('/pattern-grid.png')]"></div> {/* 背景紋理 */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="mx-auto px-4 max-w-7xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-sm font-medium mb-6">
              {/* <Award className="w-4 h-4" /> */}
              <span>NITTP政府資助課程 認可培訓機構</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
              引領企業 <span className="text-blue-400">科技轉型</span><br />
              培育未來 <span className="text-blue-400">數位人才</span>
            </h1>
            <p className="text-sm md:text-md text-slate-300 mb-5 leading-relaxed max-w-2xl">
              ITE 專注於將前沿科技轉化為可落地的商業技能。從 AI 應用到數據科學，我們提供的不僅是課程，而是企業升級的解決方案。
            </p>
            {/* More Button */}
            <Link href='/Posts'>
              <button className="px-5 py-1 border-white border-2 text-white rounded-3xl flex items-center gap-2 hover:border-yellow-200 hover:bg-slate-600 transition-colors">
                <span>前往我們的最新消息 了解更多</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Course List */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 標題區域 (保持邏輯不變) */}
        <div className="hidden">
          {headerTypes.length > 0 ? (
            headerTypes.map((headertype) => (
              <div key={headertype.id}>
                <h1 className="text-4xl font-bold hidden md:flex lg:text-5xl text-slate-900 mb-8">{headertype.HeaderTypeName}</h1>
              </div>
            ))
          ) : (
            <div className="hidden">
              <h1 className="text-4xl font-bold hidden md:flex lg:text-5xl text-slate-900 mb-8">無關鍵字</h1>
            </div>
          )}
        </div>

        {/* 主要佈局容器：左側欄 + 右側列表 */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* 左側邊欄：搜尋與篩選 */}
          <div className="w-full lg:w-1/4 shrink-0 space-y-6 lg:sticky lg:top-4">
            
            {/* 搜尋框卡片 */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
              <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">搜索課程</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="輸入關鍵字..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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

          {/* 右側：課程列表 (橫向卡片) */}
          <div className="flex-1 w-full">
            <div className="flex flex-col gap-5">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                  <Link href={`/shop/${product.id}`} className="flex flex-col md:flex-row h-full">
                    
                    {/* 圖片區域 (左側) - 設定固定寬度並保持比例 */}
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
                      {/* 狀態標籤 (可選，這裡若有狀態數據可以加個 overlay) */}
                    </div>

                    {/* 內容區域 (右側) */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-2">
                          <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                            {product.title}
                          </h2>
                          
                          {/* 價格顯示優化 */}
                          <div className="flex items-center gap-2 md:flex-col md:items-end md:gap-0 shrink-0">
                            {product.price !== 0 && (
                              <span className="text-xs text-slate-400 line-through">HK${product.price.toFixed(2)}</span>
                            )}
                            <span className="text-lg font-bold text-blue-600">HK${product.real_price.toFixed(2)}</span>
                          </div>
                        </div>

                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                          {product.description}
                        </p>
                      </div>

                      {/* 底部 Meta 資訊 */}
                      <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap gap-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                          <span className="text-slate-400 font-medium">📅</span> 
                          {formatDate(product.Course?.startDate)}
                        </div>
                        
                        {product.Course && Array.isArray(product.Course.CourseTimeRanges) && product.Course.CourseTimeRanges.length > 0 ? (
                          product.Course.CourseTimeRanges.map((timeRange) => (
                            <div key={timeRange.id} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                              <span className="text-slate-400 font-medium">⏰</span>
                              {formatTime(timeRange.starttime)} - {formatTime(timeRange.endtime)}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                            <span className="text-slate-400 font-medium">⏰</span> 待定
                          </div>
                        )}
                      </div>
                    </div>

                  </Link>
                </div>
              ))}

              {/* 無結果提示 */}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center">
                  <p className="text-slate-500 font-medium">未找到符合條件的課程</p>
                  <p className="text-sm text-slate-400 mt-1">請嘗試調整篩選條件</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </>
  );
};

export default ShopPage;