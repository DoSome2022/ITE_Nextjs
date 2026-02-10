// app/Posts/page.tsx (Server Component)

export const dynamic = "force-dynamic";

import Link from "next/link";
import { getPostAdmins } from "../actions/Admin_Post/post-admin";
import Image from "next/image";

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
      <h1 className="text-3xl font-bold mb-8">最新文章</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/Posts/${post.id}`}
            className="block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow hover:ring-2 hover:ring-blue-500"
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

            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2 line-clamp-2">
                {post.Title || "無標題"}
              </h2>
              {post.SupTitle && (
                <p className="text-lg text-gray-400 mb-4 line-clamp-2">
                  {post.SupTitle}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
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