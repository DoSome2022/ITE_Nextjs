// app/api/handle-payment-success/route.ts
'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { createId } from '@paralleldrive/cuid2';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

interface PaymentSuccessInput {
  sessionId: string;
  userId: string;
  username: string;
}

export async function POST(req: NextRequest) {
  console.log('=== [POST] /api/handle-payment-success 開始 ===');

  try {
    // ── 0. 接收請求資料 ─────────────────────────────────────
    const body = await req.json();
    console.log('請求 body:', body);

    const { sessionId, userId, username } = body as PaymentSuccessInput;
    console.log('解析後:', { sessionId, userId, username });

    if (!sessionId || !userId || !username) {
      console.log('缺少必要參數');
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // ── 1. 驗證 session ─────────────────────────────────────
    const session = await auth();
    console.log('auth() session:', session?.user?.id ? '已登入' : '未登入');

    if (!session?.user?.id || session.user.id !== userId) {
      console.log('未授權：session.user.id ≠ userId');
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // ── 2. 驗證 Stripe 支付狀態 ─────────────────────────────
    console.log('正在查詢 Stripe session:', sessionId);
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    console.log('Stripe session payment_status:', checkoutSession.payment_status);

    if (checkoutSession.payment_status !== 'paid') {
      console.log('支付尚未完成');
      return NextResponse.json({ error: '支付尚未完成' }, { status: 400 });
    }

    // ── 3. 取得購物車 ─────────────────────────────────────
    console.log('查詢 userId 購物車:', userId);
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                courseId: true,
                specialCourseId: true,
              },
            },
          },
        },
      },
    });

    console.log('購物車資料:', cart ? `找到 ${cart.items.length} 項` : '無購物車');
    if (cart) {
      cart.items.forEach((item, i) => {
        console.log(`  [${i}] 商品:`, {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          courseId: item.product.courseId,
          specialCourseId: item.product.specialCourseId,
        });
      });
    }

    if (!cart || cart.items.length === 0) {
      console.log('購物車為空，直接回傳成功');
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const currentDate = new Date();
    console.log('當前時間:', currentDate.toISOString());

    // ── 4. 建立 Accounts ───────────────────────────────────
    const accountsData = cart.items.map((item) => ({
      client_name: username,
      title: item.product.title,
      description: item.product.description ?? '',
      price: item.product.price,
      total: item.product.price * (item.quantity ?? 0),
      date: currentDate.toISOString(),
      client_id: userId,
    }));
    console.log('準備寫入 Accounts:', accountsData.length, '筆');
    await prisma.accounts.createMany({
      data: accountsData,
      skipDuplicates: true,
    });
    console.log('Accounts 寫入完成');

    // ── 5. 建立 Invoice ───────────────────────────────────
const invoiceData = cart.items.map((item) => ({
  studentname: username,
  title: item.product.title,
  description: item.product.description ?? '',
  price: item.product.price,
  total: item.product.price * (item.quantity ?? 0),
  date: currentDate,
  student_id: userId,
  Invoice_id: createId(),
  servetype: '',
  DB: 0,
  adminFee: 0,
  content: [],
  PaymentMethods: [],
  userId: userId,  // 此欄位現在存在，可直接插入
}));
    console.log('準備寫入 Invoice:', invoiceData.length, '筆');
    await prisma.invoice.createMany({
      data: invoiceData,
      skipDuplicates: true,
    });
    console.log('Invoice 寫入完成');

    // ── 6. 分類 courseIds & specialCourseIds ───────────────
    const courseIds: string[] = [];
    const specialCourseIds: string[] = [];

    cart.items.forEach((item) => {
      if (item.product.courseId) {
        courseIds.push(item.product.courseId);
        console.log('加入普通課程:', item.product.courseId);
      }
      if (item.product.specialCourseId) {
        specialCourseIds.push(item.product.specialCourseId);
        console.log('加入特殊課程:', item.product.specialCourseId);
      }
    });

    console.log('分類結果:', { courseIds, specialCourseIds });

  // ── 7. 更新 Course.Students (字串陣列) ─────────────────
if (courseIds.length > 0) {
  console.log('開始更新普通課程 Students...');
  
  for (const courseId of courseIds) {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, Students: true }
      });

      const before = course?.Students || [];
      console.log(`[普通課程] 準備加入 userId: ${userId} 到課程: "${course?.title}" (ID: ${courseId})`);
      console.log(`  加入前 Students: [${before.join(", ")}]`);

      await prisma.course.update({
        where: { id: courseId },
        data: {
          Students: { push: userId },
        },
      });

      const after = [...before, userId];
      console.log(`  加入後 Students: [${after.join(", ")}]`);
      console.log(`[普通課程] 成功加入 userId: ${userId} 到 "${course?.title}"`);
    } catch (err) {
      console.error(`[普通課程] 加入失敗 courseId: ${courseId}`, err);
    }
  }
  console.log('普通課程 Students 更新完成');
}

// ── 8. 更新 specialCourse.Students (關聯陣列) ───────────────
if (specialCourseIds.length > 0) {
  console.log('開始更新特殊課程 Students...');

  // 先取得用戶的 username
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true }
  });
  const username = user?.username || "未知用戶";

  for (const scId of specialCourseIds) {
    try {
      const specialCourse = await prisma.specialCourse.findUnique({
        where: { id: scId },
        select: { 
          title: true, 
          Students: { 
            select: { id: true, username: true } 
          } 
        }
      });

      const beforeNames = specialCourse?.Students.map(s => s.username) || [];
      console.log(`[特殊課程] 準備加入用戶: "${username}" (ID: ${userId}) 到課程: "${specialCourse?.title}" (ID: ${scId})`);
      console.log(`  加入前學生名單: [${beforeNames.join(", ")}]`);

      await prisma.specialCourse.update({
        where: { id: scId },
        data: {
          Students: { connect: { id: userId } },
        },
      });

      const afterNames = [...beforeNames, username];
      console.log(`  加入後學生名單: [${afterNames.join(", ")}]`);
      console.log(`[特殊課程] 成功加入 "${username}" 到 "${specialCourse?.title}"`);
    } catch (err) {
      console.error(`[特殊課程] 加入失敗 specialCourseId: ${scId}`, err);
    }
  }
  console.log('特殊課程 Students 更新完成');
}

// ── 9. 更新 User.specialCourse (關聯) ─────────────────
if (specialCourseIds.length > 0) {
  console.log('開始 connect User.specialCourse...');
  for (const scId of specialCourseIds) {
    const sc = await prisma.specialCourse.findUnique({
      where: { id: scId },
      select: { title: true }
    });
    console.log(`[User → specialCourse] 連接用戶到課程: "${sc?.title}" (ID: ${scId})`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      specialCourse: {
        connect: specialCourseIds.map((id) => ({ id })),
      },
    },
  });
  console.log(`[User → specialCourse] 成功連接 ${specialCourseIds.length} 門特殊課程`);
}

// ── 10. 更新 User.Course (關聯) ───────────────────────
if (courseIds.length > 0) {
  console.log('開始 connect User.Course...');
  for (const courseId of courseIds) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true }
    });
    console.log(`[User → Course] 連接用戶到課程: "${course?.title}" (ID: ${courseId})`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      Course: {
        connect: courseIds.map((id) => ({ id })),
      },
    },
  });
  console.log(`[User → Course] 成功連接 ${courseIds.length} 門普通課程`);
}

    // ── 10. 清空購物車 ───────────────────────────────────
    console.log('開始清空購物車...');
    await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
    await prisma.cart.deleteMany({ where: { userId } });
    console.log('購物車已清空');

    // ── 11. 建立 GTM purchase 事件 ───────────────────────
    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * (item.quantity ?? 0), 0);
    console.log('總金額:', totalAmount);

    const gtmItems = cart.items.map((item) => ({
      item_id: item.product.id,
      item_name: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
    }));
    console.log('GTM items:', gtmItems);

    const gtmEvent = {
      event: 'purchase',
      ecommerce: {
        transaction_id: checkoutSession.id,
        value: totalAmount,
        currency: 'TWD',
        items: gtmItems,
      },
    };
    // ── 新增：Google Ads 轉換所需欄位 ─────────────────────
    const adsConversionData = {
      transaction_id: checkoutSession.id,     // 唯一交易 ID
      value: totalAmount,                     // 總金額（數字）
      currency: 'TWD',                        // 貨幣代碼
      // 可選：加入送貨地址、稅額等（若有）
      // send_to: 'AW-17538190885/Tql-COKsoL8bEKWc7qpB', // 不需在此送出
    };
    console.log('Google Ads 轉換資料:', adsConversionData);

    // ── 12. 回傳結果 ─────────────────────────────────────
    const response = {
      success: true,
      gtmEvent,
      enrolledCourses: courseIds,
      enrolledSpecialCourses: specialCourseIds,
      adsConversion: adsConversionData,  // 關鍵新增
    };
    console.log('回傳資料:', response);
    console.log('=== [POST] 成功結束 ===');

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('=== [POST] 處理支付失敗 ===', error);
    return NextResponse.json(
      {
        error: '無法處理支付成功',
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
