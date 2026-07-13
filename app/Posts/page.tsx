// app/Posts/page.tsx (Server Component)

export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPostAdmins } from "../actions/Admin_Post/post-admin";
import Image from "next/image";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Title: 品牌名稱 + 核心內容分類 (建議 60 字元內)
  title: '最新文章與IT培訓資訊 | AI、數據分析與企業轉型 | 宏業教育中心 InnoTrendEDU',
  
  // Description: 精準對應頁面實際的 Blog 主題，強調「實戰」與「數位轉型」(建議 160 字元內)
  description: '探索 InnoTrendEDU 宏業教育中心最新文章與教學資訊。涵蓋 AI 應用工作坊、Python 數據分析、Power BI 自動化報表、網絡安全培訓及 Unity VR 開發等實戰內容，助企業與個人掌握最新科技，推動數位轉型。',
  
  // Keywords: 涵蓋文章中出現的熱門技術與業務關鍵字
  keywords: [
    'ITE最新文章', '宏業教育中心', 'IT培訓資訊', 
    'AI應用教學', 'Python數據分析', 'Power BI自動化', 
    '網絡安全培訓', 'Cybersecurity', 'Unity VR教學', 
    '企業數位轉型', '辦公室自動化'
  ],

  alternates: {
    canonical: 'https://ite.edu.hk/Posts',
  },

  // Open Graph: 針對社群分享優化 (Facebook, LinkedIn, LINE)
  openGraph: {
    title: 'InnoTrendEDU 最新文章 | 掌握 AI、數據分析與網絡安全前沿資訊',
    description: '瀏覽 InnoTrendEDU 宏業教育中心最新科技洞察。從 AI 應用、Power BI 到 Python 數據分析，提供最新企業培訓與個人進修實戰指南。',
    url: 'https://ite.edu.hk/Posts',
    siteName: '宏業教育中心 ITE',
    locale: 'zh_HK',
    type: 'website',
  },
};

export default async function PostsPage() {
  const result = await getPostAdmins({ limit: 20 });

  // 檢查 API 是否成功
  if (!result.success || !result.data) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">最新文章</h1>
        <p className="text-red-500">載入文章失敗，請稍後再試。</p>
      </div>
    );
  }

  // 正確提取 posts 陣列
  const { posts } = result.data;

  console.log("posts:", posts,"-- End --");

  // 若無文章，可顯示友好提示
  if (posts.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">最新文章</h1>
        <p className="text-gray-500">目前尚無文章。</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
  <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-8">最新文章</h1>
  <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
    {posts.map((post) => (
      <Link
        key={post.id}
        href={`/Posts/${post.id}`}
        className="block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:translate-y-[-2px]"
      >
        {/* 若有首張圖片，可顯示縮圖 */}
        {post.img_url && post.img_url.length > 0 && (
          <div className="aspect-video relative">
            <Image
              src={post.img_url[0]}
              alt={post.Title || "文章圖片"}
              width={640}           // representative width
              height={360}          // maintain ~16:9 ratio
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <div className="p-5 md:p-6">
          <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-2 line-clamp-2 leading-tight">
            {post.Title || "無標題"}
          </h2>
          {post.SupTitle && (
            <p className="text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
              {post.SupTitle}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 gap-2 pt-2 border-t border-gray-100">
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString("zh-HK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.author && <span>作者：{post.author}</span>}
          </div>
        </div>
      </Link>
    ))}
  </div>
</div>
  );
}