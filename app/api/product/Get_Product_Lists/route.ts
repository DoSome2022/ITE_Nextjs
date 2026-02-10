


// import { db } from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   if (req.method === 'GET') {
//     try {


//             const res = await db.product.findMany({
//               include: {
//                 CourseProductType: true,
//                 CourseProductStatus: true,
//                 Course: {
//                   include: {
//                     CourseTimeRanges: true,
//                   },
//                 },
//                 Product_Img: true,
//                 Product_video: true,
//                 specialCourse:true,
//               },
//             });



//       return NextResponse.json(res);
//     } catch (error) {
//       console.error('獲取商品數據失敗:', error);
//       return NextResponse.json(
//         { error: '無法獲取商品數據' },
//         { status: 500 }
//       );
//     }
//   }
//   return NextResponse.json({ error: '方法不允許' }, { status: 405 });
// }


import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (req.method === 'GET') {
    try {
      // 1. 先獲取所有商品資料
      const products = await db.product.findMany({
        include: {
          CourseProductType: true, // 這是正規關聯 (如果有的話)
          CourseProductStatus: true, // 這是正規關聯 (如果有的話)
          Course: {
            include: {
              CourseTimeRanges: true,
            },
          },
          Product_Img: true,
          Product_video: true,
          specialCourse: true,
        },
      });

      // 2. 獲取所有的 Type 和 Status 對照表 (為了效能，一次查出來)
      const allTypes = await db.courseProductType.findMany();
      const allStatuses = await db.courseProductStatus.findMany();

      // 建立 ID 到 名稱 的查找表 (Map)，加速後續配對
      const typeMap = new Map(allTypes.map(t => [t.id, t.typename]));
      const statusMap = new Map(allStatuses.map(s => [s.id, s.statuename]));

      // 3. 處理資料：將 ID 陣列轉換為名稱陣列
      const enrichedProducts = products.map((product) => {
        // 處理 Type 名稱
        const typeNames = (product.CourseProductTypeArray || []).map(id => ({
            id: id,
            name: typeMap.get(id) || "未知的類型"
        }));

        // 處理 Status 名稱
        const statusNames = (product.CourseProductStatusArray || []).map(id => ({
            id: id,
            name: statusMap.get(id) || "未知的狀態"
        }));

        return {
          ...product,
          // 新增這兩個欄位給前端使用
          CourseProductTypeDetails: typeNames,
          CourseProductStatusDetails: statusNames,
          // 或者如果你只想覆蓋原本的欄位 (根據你的需求選擇)
          // CourseProductTypeArray: typeNames.map(t => t.name), 
        };
      });

      return NextResponse.json(enrichedProducts);
    } catch (error) {
      console.error('獲取商品數據失敗:', error);
      return NextResponse.json(
        { error: '無法獲取商品數據' },
        { status: 500 }
      );
    }
  }
  return NextResponse.json({ error: '方法不允許' }, { status: 405 });
}
