// 'use server';

// import { auth } from '@/auth';
// import { db } from '@/lib/db';
// import type { Cart, CartItem} from '@prisma/client';

// type CartWithItems = Cart & {
//   items: (CartItem & { product: { id: string; title: string; price: number } })[];
// };

// // type OrderWithItems = Order & {
// //   items: { productId: string; quantity: number; price: number }[];
// // };

// export async function addToCart(productId: string, quantity: number): Promise<{ success: true }> {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error('未授權');

//   // 驗證產品是否存在
//   const productExists = await db.product.findUnique({
//     where: { id: productId },
//     select: { id: true },
//   });

//   if (!productExists) throw new Error('產品不存在');

//   let cart: CartWithItems | null = await db.cart.findFirst({
//     where: { userId: session.user.id },
//     include: { items: { include: { product: true } } },
//   });

//   if (!cart) {
//     cart = await db.cart.create({
//       data: { userId: session.user.id },
//       include: { items: { include: { product: true } } },
//     });
//   }

//   const existingItem = await db.cartItem.findFirst({
//     where: { cartId: cart.id, productId },
//   });

//   try {
//     if (existingItem) {
//       await db.cartItem.update({
//         where: { id: existingItem.id },
//         data: { quantity: existingItem.quantity + quantity },
//       });
//     } else {
//       await db.cartItem.create({
//         data: {
//           cartId: cart.id,
//           productId,
//           quantity,
//         },
//       });
//     }
//     return { success: true };
//   } catch (error) {
//     console.error('添加至購物車失敗:', error);
//     throw new Error('無法添加至購物車');
//   }
// }

// export async function removeFromCart(cartItemId: string): Promise<{ success: true }> {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error('未授權');

//   try {
//     await db.cartItem.delete({
//       where: { id: cartItemId },
//     });
//     return { success: true };
//   } catch (error) {
//     console.error('從購物車移除失敗:', error);
//     throw new Error('無法從購物車移除');
//   }
// }

// export async function createOrder(): Promise<{ orderId: string; total: number }> {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error('未授權');

//   const cart = await db.cart.findFirst({
//     where: { userId: session.user.id },
//     include: { items: { include: { product: true } } },
//   });

//   if (!cart || cart.items.length === 0) throw new Error('購物車為空');

//   const total = cart.items.reduce(
//     (sum, item) => {
//       if (!item.product) throw new Error(`產品 ${item.productId} 不存在`);
//       return sum + item.quantity * item.product.price;
//     },
//     0
//   );

//   try {
//     const order = await db.order.create({
//       data: {
//         userId: session.user.id,
//         total,
//         items: {
//           create: cart.items.map((item) => ({
//             productId: item.productId,
//             quantity: item.quantity,
//             price: item.product.price,
//           })),
//         },
//       },
//     });

//     await db.cartItem.deleteMany({ where: { cartId: cart.id } });

//     return { orderId: order.id, total };
//   } catch (error) {
//     console.error('創建訂單失敗:', error);
//     throw new Error('無法創建訂單');
//   }
// }

// export async function getCart(): Promise<CartWithItems | null> {
//   const session = await auth();
//   if (!session?.user?.id) return null;

//   try {
//     return await db.cart.findFirst({
//       where: { userId: session.user.id },
//       include: { items: { include: { product: true } } },
//     });
//   } catch (error) {
//     console.error('獲取購物車失敗:', error);
//     throw new Error('無法獲取購物車');
//   }
// }


// app/actions/cart/shop-cart.ts
'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';

// 定義與 Prisma Product 模型匹配的類型
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  real_price: number;
  CourseProductTypeArray: string[];
  CourseProductStatusArray: string[];
  createdAt: Date;
  updatedAt: Date;
  IsPublic: boolean;
  courseId: string | null;
}

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number | null;
  createdAt: Date;
  updatedAt: Date;
  product: Product ;
}

export interface CartWithItems {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

export async function addToCart(productId: string, 
  // quantity: number
): Promise<{ success: true }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授權');

  // 驗證產品是否存在
  const productExists = await db.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!productExists) throw new Error('產品不存在');

  let cart = await db.cart.findFirst({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              real_price: true,
              CourseProductTypeArray: true,
              CourseProductStatusArray: true,
              createdAt: true,
              updatedAt: true,
              IsPublic: true,
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                real_price: true,
                CourseProductTypeArray: true,
                CourseProductStatusArray: true,
                createdAt: true,
                updatedAt: true,
                IsPublic: true,
                courseId: true,
              },
            },
          },
        },
      },
    });
  }

  const existingItem = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  try {
    if (existingItem) {
      await db.cartItem.update({
        where: { id: existingItem.id },
data: { quantity: (existingItem.quantity ?? 0) + 1 },

      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity :1,
        },
      });
    }
    return { success: true };
  } catch (error) {
    console.error('添加至購物車失敗:', error);
    throw new Error('無法添加至購物車');
  }
}

export async function removeFromCart(cartItemId: string): Promise<{ success: true }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授權');

  try {
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      select: { cartId: true },
    });

    if (!cartItem) throw new Error('未找到指定的購物車項目');

    // 檢查用戶是否有權刪除該項目
    const cart = await db.cart.findUnique({
      where: { id: cartItem.cartId },
      select: { userId: true },
    });

    if (!cart || cart.userId !== session.user.id) {
      throw new Error('無權刪除此購物車項目');
    }

    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    return { success: true };
  } catch (error) {
    console.error('從購物車移除失敗:', error);
    throw new Error('無法從購物車移除');
  }
}

export async function createOrder(): Promise<{ orderId: string; total: number }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('未授權');

  const cart = await db.cart.findFirst({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              description: true,
              price: true,
              real_price: true,
              CourseProductTypeArray: true,
              CourseProductStatusArray: true,
              createdAt: true,
              updatedAt: true,
              IsPublic: true,
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) throw new Error('購物車為空');

  // 計算總金額 (修復 quantity 可能為 null 的問題)
  const total = cart.items.reduce(
    (sum, item) => {
      if (!item.product) throw new Error(`產品 ${item.productId} 不存在`);
      const qty = item.quantity ?? 1; // 預設數量為 1
      return sum + qty * item.product.price;
    },
    0
  );

  try {
    const order = await db.order.create({
      data: {
        userId: session.user.id,
        total,
        items: {
          create: cart.items.map((item) => ({
            // 修復 1: 確保 quantity 有值
            quantity: item.quantity ?? 1,
            
            // 修復 2: 使用 connect 語法正確關聯 Product
            product: {
              connect: { id: item.productId }
            },
            
            price: item.product.price,
          })),
        },
      },
    });

    await db.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { orderId: order.id, total };
  } catch (error) {
    console.error('創建訂單失敗:', error);
    throw new Error('無法創建訂單');
  }
}


// app/actions/cart/shop-cart.ts
export async function getCart(): Promise<CartWithItems | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const cart = await db.cart.findFirst({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                real_price: true,
                CourseProductTypeArray: true,
                CourseProductStatusArray: true,
                createdAt: true,
                updatedAt: true,
                IsPublic: true,
                courseId: true,
                specialCourseId: true,  // ← 現在安全
                // specialCourse: true, // ← 暫時移除，避免載入過多資料
              },
            },
          },
        },
      },
    });
    return cart;
  } catch (error) {
    console.error('獲取購物車失敗:', error);
    throw new Error('無法獲取購物車');
  }
}