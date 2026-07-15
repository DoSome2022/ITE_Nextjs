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
  paymentMethod: string; // ← 新增：支付方式
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { items, userId, paymentMethod }: RequestBody = await req.json();
    console.log('Received request:', { items, userId, paymentMethod });

    // 驗證輸入
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '無效或空的項目列表' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用戶 ID' },
        { status: 400 }
      );
    }

    // 驗證 userId 格式（UUID）
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: '無效的用戶 ID 格式' },
        { status: 400 }
      );
    }

    // 驗證項目資料
    for (const [index, item] of items.entries()) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json(
          { error: '項目資料無效', details: `Item at index ${index}: invalid name` },
          { status: 400 }
        );
      }
      if (typeof item.real_price !== 'number' || item.real_price <= 0) {
        return NextResponse.json(
          { error: '項目資料無效', details: `Item at index ${index}: invalid price` },
          { status: 400 }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { error: '項目資料無效', details: `Item at index ${index}: invalid quantity` },
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

    // ⭐ 根據選擇的支付方式設定 payment_method_types
let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [];

switch (paymentMethod) {
  case 'alipay':
    paymentMethodTypes = ['alipay' as Stripe.Checkout.SessionCreateParams.PaymentMethodType];
    break;
  case 'wechat_pay':
    paymentMethodTypes = ['wechat_pay' as Stripe.Checkout.SessionCreateParams.PaymentMethodType];
    break;
  case 'unionpay':
    paymentMethodTypes = ['card' as Stripe.Checkout.SessionCreateParams.PaymentMethodType];
    break;
  case 'card':
    paymentMethodTypes = ['card' as Stripe.Checkout.SessionCreateParams.PaymentMethodType];
    break;
  case 'all':
    paymentMethodTypes = [
      'card' as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
      'alipay' as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
      'wechat_pay' as Stripe.Checkout.SessionCreateParams.PaymentMethodType,
    ];
    break;
  default:
    paymentMethodTypes = ['card' as Stripe.Checkout.SessionCreateParams.PaymentMethodType];
}
    // 創建 Stripe 結帳會話
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
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
        paymentMethod, // ← 記錄使用的支付方式
        items: JSON.stringify(items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        }))),
      },
      // ⭐ 支付意圖設定（對支付寶、微信支付有用）
      payment_intent_data: {
        capture_method: 'automatic',
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
