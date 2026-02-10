'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { addToCart } from '@/app/actions/cart/shop-cart';
import { format } from 'date-fns';
import { zhHK } from 'date-fns/locale';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Play } from 'lucide-react';

// === 型別定義 ===
interface CourseTimeRange {
  id: string;
  starttime: string | null;
  endtime: string | null;
}

interface ProductImg {
  id: string;
  img_url: string;
}

interface ProductVideo {
  id: string;
  video_url: string;
}

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  real_price: number;
  createdAt?: string;
  updatedAt?: string;
  Target_Audience?: string | null;
  Course_Objective?: string | null;
  Applicable_Scenarios?: string | null;
  referencedPosts?: string | null;  // ← 新增此欄位
  Course?: {
    startDate?: string | null;
    endDate?: string | null;
    Coursedates: string[];
    timeHours: number;
    CourseTimeRanges?: CourseTimeRange[];
  };
  Product_Img: ProductImg[];
  Product_video: ProductVideo[];
}

// === 工具函數 ===
const getYouTubeId = (url: string): string | null => {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return '未設置';
  try {
    return format(new Date(dateStr), 'yyyy-MM-dd');
  } catch {
    return '無效日期';
  }
};

const formatDateWithDay = (dateStr?: string | null) => {
  if (!dateStr) return '未設置';
  try {
    const date = new Date(dateStr);
    return `${format(date, 'yyyy-MM-dd', { locale: zhHK })} (${format(date, 'EEEE', { locale: zhHK })})`;
  } catch {
    return '無效日期';
  }
};

const formatTime = (time: string | null | undefined): string => {
  if (time == null) return '未設置';
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time) ? time : '無效時間';
};

// === 主組件 ===
export default function ProductPage() {
  const { productsId: productId, userId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const [getProduct, setGetProduct] = useState<ProductDetail | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDataLists = async (id: string) => {
      try {
        const response = await fetch(`/api/product/Get_Product_Lists_by_ID/${id}`);
        if (!response.ok) throw new Error('無法獲取商品數據');
        const data = await response.json();
        setGetProduct(data);
      } catch (err) {
        console.error('獲取商品數據失敗:', err);
        setError('無法載入商品詳情');
      }
    };

    if (productId) fetchProductDataLists(productId as string);
  }, [productId]);

  const handleAddToCart = () => {
    startTransition(async () => {
      try {
        await addToCart(productId as string, quantity);
        router.push(`/user/${userId}/cart`);
      } catch (err) {
        setError(err instanceof Error ? `加入購物車失敗：${err.message}` : '無法加入購物車');
      }
    });
  };

  const opts = {
    height: '315',
    width: '100%',
    playerVars: { autoplay: 0, rel: 0, modestbranding: 1 },
  };

  const videos = getProduct?.Product_video || [];
  const firstVideo = videos[0];
  const firstVideoId = firstVideo ? getYouTubeId(firstVideo.video_url) : null;

  if (!getProduct) {
    return (
      <div className="container mx-auto p-8 text-center">
        {error ?? '載入中...'}
      </div>
    );
  }

  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">商品詳情</h1>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：圖片 + 三欄資訊 */}
        <div className="space-y-6">
          {/* 主圖 */}
          <div>
            {getProduct.Product_Img.length > 0 ? (
              <Image
                src={getProduct.Product_Img[0].img_url}
                alt={getProduct.title}
                width={600}
                height={450}
                className="w-full h-auto rounded-lg shadow-md object-cover"
                priority
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 flex items-center justify-center">
                <span className="text-gray-500">無圖片</span>
              </div>
            )}
          </div>
        </div>

        {/* 右側：詳情 + 課程 + 參考文章 + 影片 + 加入購物車 */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{getProduct.title}</h2>
            <p className="text-gray-600 mb-4 whitespace-pre-wrap">{getProduct.description}</p>
            <p className="text-2xl font-bold text-blue-600">HK${getProduct.real_price.toFixed(2)}</p>
          </div>

          {/* 課程資訊 */}
          {getProduct.Course && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p><span className="font-semibold">開始日期：</span> {formatDate(getProduct.Course.startDate)}</p>
              <p><span className="font-semibold">結束日期：</span> {formatDate(getProduct.Course.endDate)}</p>
              <p><span className="font-semibold">上課日期：</span>
                {getProduct.Course.Coursedates.length > 0
                  ? getProduct.Course.Coursedates.map(formatDateWithDay).join(', ')
                  : '無具體日期'}
              </p>
              <p><span className="font-semibold">總時數：</span>
                {getProduct.Course.Coursedates.length && getProduct.Course.timeHours
                  ? `${(getProduct.Course.Coursedates.length * getProduct.Course.timeHours).toFixed(1)} 小時`
                  : '未設置'}
              </p>
              {(getProduct.Course?.CourseTimeRanges ?? []).length > 0 ? (
                getProduct.Course.CourseTimeRanges!.map((t) => (
                  <p key={t.id}>
                    <span className="font-semibold">時間：</span>
                    {formatTime(t.starttime)} - {formatTime(t.endtime)}
                  </p>
                ))
              ) : (
                <p><span className="font-semibold">時間：</span>未設置</p>
              )}
            </div>
          )}

          {/* 新增：參考文章區塊 */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">參考文章</h3>
            {getProduct.referencedPosts?.trim() ? (
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                {getProduct.referencedPosts.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">
                    {line.trim().startsWith('http') || line.trim().startsWith('https') ? (
                      <a
                        href={line.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {line.trim()}
                      </a>
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">尚未提供參考文章</p>
            )}
          </div>

          {/* YouTube 影片播放器（僅顯示第一部）*/}
          {videos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Play className="w-5 h-5" /> 課程影片
              </h3>

              <div className="relative bg-black rounded-lg overflow-hidden">
                {firstVideoId ? (
                  <YouTube
                    videoId={firstVideoId}
                    opts={opts}
                    className="aspect-video"
                    iframeClassName="w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-800 text-white flex items-center justify-center h-80 rounded">
                    無法載入影片
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 加入購物車 */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              min="1"
              className="border rounded p-2 w-20 text-center"
              disabled={isPending}
            />
            <button
              onClick={handleAddToCart}
              disabled={isPending}
              className={`flex-1 py-3 rounded font-medium transition ${
                isPending
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPending ? '加入中...' : '加入購物車'}
            </button>
          </div>

          {/* 三欄資訊 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-1">目標觀眾</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {getProduct.Target_Audience || '未提供'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-1">課程目標</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {getProduct.Course_Objective || '未提供'}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-1">適用場景</h4>
              <p className="text-gray-700 whitespace-pre-line">
                {getProduct.Applicable_Scenarios || '未提供'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}