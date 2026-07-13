
// /api/checkout/route.ts
'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// 確保環境變數存在
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

if (!process.env.NEXT_BASE_URL) {
  throw new Error('NEXT_BASE_URL is not defined');
}

if (!process.env.NEXT_BASE_URL.startsWith('http://') && !process.env.NEXT_BASE_URL.startsWith('https://')) {
  throw new Error('NEXT_BASE_URL must start with http:// or https://');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

interface CheckoutItem {
  name: string;
  real_price: number;
  quantity: number;
  productId: string;
}

interface RequestBody {
  items: CheckoutItem[];
  userId: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { items, userId }: RequestBody = await req.json();
    console.log('Received request:', { items, userId });

    // 驗證輸入
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '無效或空的項目列表', details: 'Items must be a non-empty array' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID', details: 'userId is required' },
        { status: 400 }
      );
    }

    // 驗證 userId 格式（UUID）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: '無效的用戶 ID 格式', details: 'userId must be a valid UUID' },
        { status: 400 }
      );
    }

    // 驗證項目資料
    for (const [index, item] of items.entries()) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json(
          { error: '項目資料無效', details: `Item at index ${index}: name must be a non-empty string` },
          { status: 400 }
        );
      }
      if (typeof item.real_price !== 'number' || item.real_price <= 0) {
        return NextResponse.json(
          { error: '項目資料無效', details: `Item at index ${index}: real_price must be a positive number` },
          { status: 400 }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { error: '項目資料無效', details: `Item at index ${index}: quantity must be a positive integer` },
          { status: 400 }
        );
      }
    }

    // 確保 URL 格式正確
    const normalizedBaseUrl = process.env.NEXT_BASE_URL!.endsWith('/')
      ? process.env.NEXT_BASE_URL!.slice(0, -1)
      : process.env.NEXT_BASE_URL!;
    const successUrl = `${normalizedBaseUrl}/user/${userId}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${normalizedBaseUrl}/user/${userId}/cancel`;

    // 驗證 URL 格式
    try {
      // 注意：這裡不能直接用 {CHECKOUT_SESSION_ID} 驗證，因為它是占位符
      // 我們只驗證基礎 URL 部分
      new URL(normalizedBaseUrl + `/user/${userId}/success`);
      new URL(cancelUrl);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown URL parsing error';
      console.error('Invalid URL format:', { successUrl, cancelUrl, error: errorMessage });
      return NextResponse.json(
        { error: '無效的 URL 格式', details: `Invalid success_url or cancel_url: ${errorMessage}` },
        { status: 400 }
      );
    }

    // 創建 Stripe 結帳會話
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item) => ({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'hkd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.real_price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { 
        userId,
            // 加入商品資訊，方便 webhook 或 success handler 使用
        items: JSON.stringify(items.map(i => ({ 
          productId: i.productId, 
          quantity: i.quantity 
        }))),
      },
    });

    return NextResponse.json({ id: session.id }, { status: 200 });
  } catch (error: unknown) {
    console.error('Checkout session error:', error);
    let errorMessage = '無法創建結帳會話';
    let errorCode: string | undefined;

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message || errorMessage;
      errorCode = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: '無法創建結帳會話',
        details: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    );
  }
}