// app/posts/[id]/page.tsx
import { getPostAdminById } from "@/app/actions/Admin_Post/post-admin";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ id: string }>;
}

// 動態生成元數據（最重要部分）
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  const result = await getPostAdminById(id);

  if (!result.success || !result.data) {
    return {
      title: '文章不存在 | ite.edu.hk',
      description: '抱歉，找不到您要查看的文章。',
    };
  }

  const post = result.data;

  const siteName = 'ite.edu.hk'; // 可從 env 或 config 統一取
  const pageUrl = `https://ite.edu.hk/posts/${id}`;

  // 優先使用 SupTitle 作為描述，若無則截取 content 前 150 字
  const description =
    post.SupTitle ||
    (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 157) + '...' : '詳細內容請點擊查看');

  // 第一張圖作為 OG 圖片（若無則用預設）
  const ogImage = post.img_url?.[0] ? post.img_url[0] : '/og-images/default-post.jpg';

  return {
    title: `${post.Title || '無標題'} | ${siteName}`,
    description,
    openGraph: {
      title: post.Title || '無標題',
      description,
      url: pageUrl,
      siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.Title || '文章預覽圖',
        },
      ],
      locale: 'zh_HK', // 香港地區
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.Title || '無標題',
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl, // 避免重複內容問題
    },
  };
}
export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    notFound();
  }

  let result;
  try {
    result = await getPostAdminById(id);
  } catch (error) {
    console.error("載入文章失敗:", error);
    notFound();
  }

  if (!result.success || !result.data) {
    notFound();
  }

  const post = result.data;

  return (
    <article className="container mx-auto py-10 px-4 prose max-w-4xl prose-slate">
      <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-3 tracking-tight">{post.Title || "無標題"}</h1>

      {/* 返回按鈕 - 新聞風格弱化處理 */}
      <div className="mb-6">
        <Link href="/Posts" className="text-gray-600 hover:text-gray-800 hover:underline text-sm transition-colors">
          ← 返回新聞列表
        </Link>
      </div>
        
      {/* 新聞副標/引題 */}
      {post.SupTitle && (
        <h2 className="text-xl md:text-2xl text-gray-700 mb-8 font-light italic border-b border-gray-200 pb-3">
          {post.SupTitle}
        </h2>
      )}

      {/* ===== 新聞元數據======== */}
  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-4 border-b border-gray-200">
    {post.author && (
      <p className="font-medium">作者：{post.author}</p>
    )}
    <p>最後更新：{new Date(post.updatedAt).toLocaleString("zh-TW")}</p>
  </div>

  {/* 新聞正文內容 */}
  <div className="mt-0 text-gray-800">
    <div
      className="whitespace-pre-wrap prose-p:my-6 prose-ul:my-6 prose-ol:my-6 prose-li:ml-6 prose-h3:text-xl prose-h4:text-lg leading-relaxed text-base md:text-lg"
      dangerouslySetInnerHTML={{ __html: post.content || "" }}
    />
    {!post.content && (
      <p className="text-gray-500 italic text-center py-8">本文尚未填寫內容</p>
    )}
  </div>

  {/* 相關課程區塊 - 新聞側欄風格 */}
  <div className="mt-12 bg-gray-50 border-l-4 border-slate-600 rounded-r-lg p-6 shadow-sm">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">相關課程</h3>
    {post.relatedCourses?.trim() ? (
      <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
        {post.relatedCourses.split('\n').map((line, index) => (
          <p key={index} className="mb-2">
            {line.trim().startsWith('http') ? (
              <a
                href={line.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800 underline"
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
      <p className="text-gray-500 italic">
        尚未提供相關課程資訊
      </p>
    )}
  </div>

  {/* 新聞影片區 */}
  {post.video_url && post.video_url.length > 0 && (
    <div className="space-y-8 my-12">
      {post.video_url.map((url, index) => (
        <div key={index} className="aspect-video">
          {url.includes("youtube.com") || url.includes("youtu.be") ? (
            <iframe
              src={url
                .replace("watch?v=", "embed/")
                .replace("youtu.be/", "www.youtube.com/embed/")}
              title={`影片 ${index + 1}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-lg shadow-md"
            />
          ) : (
            <video controls className="w-full h-full rounded-lg shadow-md">
              <source src={url} />
              您的瀏覽器不支援影片播放。
            </video>
          )}
          <p className="text-xs text-gray-600 mt-2">
            影片 {index + 1}：{post.Title || "新聞影片"}
          </p>
        </div>
      ))}
    </div>
  )}
  
  {/* 新聞圖片區 - 新聞排版風格 */}
  {post.img_url && post.img_url.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-12">
      {post.img_url.map((url, index) => (
        <figure key={index} className="group">
          <Image
            src={url}
            alt={`${post.Title} - 圖片 ${index + 1}`}
            className="rounded-lg shadow-md object-cover w-full h-auto group-hover:shadow-lg transition-shadow"
            width={800}
            height={600}
          />
        </figure>
      ))}
    </div>
  )}

</article>
  );
}