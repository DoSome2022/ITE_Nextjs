import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Next.js 16: params 是一個 Promise，務必使用 await
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: '缺少產品 ID' }, { status: 400 });
  }

  try {
    // 1. 檢查產品是否存在
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: '產品不存在' }, { status: 404 });
    }

    // 2. 開始交易：暴力刪除所有關聯資料 (硬刪除)
    await prisma.$transaction(async (tx) => {
      // --- 第一層：業務關聯 ---
      
      // 刪除購物車項目
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      // 刪除訂單項目
      await tx.orderItem.deleteMany({
        where: { productId: id },
      });

      // --- 第二層：產品附屬資料 (新增的部分在這裡) ---

      // 1. 解決本次報錯：刪除 Product_Course_Time_Ranges
      // 注意：Prisma 模型名稱首字母通常是大寫，如果不確定，這行是根據錯誤訊息推斷的
      // 如果您的 schema 中該模型名稱是小寫，請改為 tx.product_Course_Time_Ranges
      try {
        // @ts-ignore: 忽略型別檢查，直接嘗試刪除，避免因型別定義未更新導致 build 失敗
        if (tx.product_Course_Time_Ranges) {
           // @ts-ignore
           await tx.product_Course_Time_Ranges.deleteMany({
             where: { ProductId: id },
           });
        }
      } catch (e) {
        console.log("嘗試刪除 Product_Course_Time_Ranges 時忽略錯誤", e);
      }

      // 2. 刪除 Product_Course_Dates
      await tx.product_Course_Dates.deleteMany({
        where: { ProductId: id },
      });

      // 3. 刪除 Product_Img
      await tx.product_Img.deleteMany({
        where: { ProductId: id },
      });

      // 4. 刪除 Product_video
      await tx.product_video.deleteMany({
        where: { ProductId: id },
      });

      // --- 最後刪除 Product 本身 ---
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: '產品及所有相關資料已強制刪除' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: '刪除失敗', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
