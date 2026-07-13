import type { Metadata } from "next";
import ShopPage from "@/components/ShopPage";
import { db } from "@/lib/db";


export const dynamic = 'force-dynamic'; 

// 定義 HeaderType 介面
interface HeaderType {
  id: string;
  HeaderTypeName: string;
}

// 設定你的主要域名
const BASE_URL = 'https://ite.edu.hk';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headerTypes = await db.headerType.findMany({
      select: { id: true, HeaderTypeName: true },
    });
    console.log("Home generateMetadata: headerTypes:", headerTypes, "-- End --");
    const keywords = headerTypes.map((ht) => ht.HeaderTypeName).join(", ");
    return {
      title: '宏業教育中心 InnoTrendEDU | 專業AI與IT培訓課程 - 獲NITTP政府資助認可',
      description: '探索 InnoTrendEDU 宏業教育中心的專業課程，涵蓋 AI 人工智能 (Deepseek/GenAI)、Python 編程、Web 全棧開發及網絡安全意識培訓。作為政府認可 NITTP 培訓機構，企業可獲 50% 學費資助。提供公眾課程、企業包班及上門內部培訓服務，助您掌握 InnoHK 創新科技。',
      keywords,
      openGraph: {
        title: '宏業教育中心 InnoTrendEDU | 專業AI與IT培訓課程 - 獲NITTP政府資助認可',
        description: '探索 InnoTrendEDU 宏業教育中心的專業課程，涵蓋 AI 人工智能 (Deepseek/GenAI)、Python 編程、Web 全棧開發及網絡安全意識培訓。作為政府認可 NITTP 培訓機構，企業可獲 50% 學費資助。提供公眾課程、企業包班及上門內部培訓服務，助您掌握 InnoHK 創新科技。',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        type: "website",
      },
    };
  } catch (error) {
    console.error("獲取 HeaderType 數據失敗:", error);
    return {
      title: '宏業教育中心 InnoTrendEDU | 專業AI與IT培訓課程 - 獲NITTP政府資助認可',
      description: '探索 InnoTrendEDU 宏業教育中心的專業課程，涵蓋 AI 人工智能 (Deepseek/GenAI)、Python 編程、Web 全棧開發及網絡安全意識培訓。作為政府認可 NITTP 培訓機構，企業可獲 50% 學費資助。提供公眾課程、企業包班及上門內部培訓服務，助您掌握 InnoHK 創新科技。',
      keywords: [
        // 品牌與核心
        '宏業教育中心', 'ITE', '香港IT課程', 'InnoHK', 
        // 熱門技術
        'AI課程', 'Deepseek教學', 'Python學校', 'Web AI', 'GenAI',
        // 企業服務
        '企業培訓', '上門包班', '內部培訓', 'Corporate Security Awareness Training', '網絡安全培訓',
        // 資助與認證
        'NITTP資助', '政府認可培訓', '學費資助'
      ],
    };
  }
}

export default async function Home() {
  let headerTypes: HeaderType[] = [];
  let initialProducts: any[] = []; // 使用 any 避免型別衝突

  try {
    // 1. 獲取分類
    headerTypes = await db.headerType.findMany({
      select: { id: true, HeaderTypeName: true },
    });

    // 2. 預先獲取產品資料 (修正版)
    // 根據你的 schema.prisma：
    // - 移除了 isArchived (因為不存在)
    // - 改用 Image (大寫 I)
    // - 移除了 Color, Size (因為不存在)
    initialProducts = await db.product.findMany({
      // 如果你有 isFeatured 並且只想顯示精選，可以加 where: { isFeatured: true }
      // 目前先不加 where，顯示所有產品
      include: {
        Product_Img: true,       // 修正：根據你的 Schema，這裡是 Image (大寫)
        CourseProductType: true,  // 包含分類資訊
      },
      orderBy: {
        createdAt: 'desc', // 按最新排序
      },
      take: 9, // 預設抓取前 9 筆
    });

    // 手動轉換資料結構以符合前端預期 (如果前端預期叫 images)
    // 這樣前端代碼不用改，後端這裡幫忙轉一下
    initialProducts = initialProducts.map(p => ({
      ...p,
      images: p.Image, // 將 Image 欄位別名為 images，方便前端使用
    }));

    console.log(`Home: Server pre-fetched ${initialProducts.length} products.`);

  } catch (error) {
    console.error("獲取首頁數據失敗:", error);
  }

  // 3. 資料序列化
  const serializedProducts = JSON.parse(JSON.stringify(initialProducts));

  return (
    <ShopPage 
      headerTypes={headerTypes} 
      initialProducts={serializedProducts} 
    />
  );
}
