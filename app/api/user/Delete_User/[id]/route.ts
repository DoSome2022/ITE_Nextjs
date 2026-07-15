import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. 先檢查用戶是否存在
    const existingUser = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
    }

    // 2. 刪除關聯的課程模組
    await db.courseModul.deleteMany({ where: { TeacherId: id } });
    await db.specialCourse.deleteMany({ where: { teacherId: id } });
    await db.course.deleteMany({ where: { teacherId: id } });

    // 3. 刪除購物車（使用 findFirst 而非 findUnique）
    const cart = await db.cart.findFirst({ where: { userId: id } }); // ← 改這裡
    if (cart) {
      await db.cartItem.deleteMany({ where: { cartId: cart.id } });
      await db.cart.delete({ where: { id: cart.id } });
    }

    // 4. 刪除訂單
    const orders = await db.order.findMany({
      where: { userId: id },
      select: { id: true },
    });

    if (orders.length > 0) {
      const orderIds = orders.map((order) => order.id);
      await db.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await db.order.deleteMany({
        where: { id: { in: orderIds } },
      });
    }

    // 5. 最後刪除用戶本身
    await db.user.delete({ where: { id } });

    return NextResponse.json({
      message: "用戶已成功刪除",
      deletedUser: existingUser,
    });
  } catch (error) {
    console.error("刪除用戶失敗：", error);
    return NextResponse.json(
      { error: "內部服務器錯誤，刪除失敗" },
      { status: 500 }
    );
  }
}
