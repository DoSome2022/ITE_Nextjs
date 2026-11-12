//app/api/CheckoutSessions/route.ts
'use server';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
  paymentMethod: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { items, userId, paymentMethod }: RequestBody = await req.json();
    console.log('Received request:', { items, userId, paymentMethod });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '無效或空的項目列表' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: '缺少用戶 ID' }, { status: 400 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json({ error: '無效的用戶 ID 格式' }, { status: 400 });
    }

    for (const [index, item] of items.entries()) {
      if (!item.name || typeof item.name !== 'string') {
        return NextResponse.json({ error: '項目資料無效', details: `Item at index ${index}: invalid name` }, { status: 400 });
      }
      if (typeof item.real_price !== 'number' || item.real_price <= 0) {
        return NextResponse.json({ error: '項目資料無效', details: `Item at index ${index}: invalid price` }, { status: 400 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: '項目資料無效', details: `Item at index ${index}: invalid quantity` }, { status: 400 });
      }
    }

    const normalizedBaseUrl = process.env.NEXT_BASE_URL!.endsWith('/')
      ? process.env.NEXT_BASE_URL!.slice(0, -1)
      : process.env.NEXT_BASE_URL!;
    const successUrl = `${normalizedBaseUrl}/user/${userId}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${normalizedBaseUrl}/user/${userId}/cancel`;

    // 設定 payment_method_types
    let paymentMethodTypes: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [];
    switch (paymentMethod) {
      case 'alipay':
        paymentMethodTypes = ['alipay'];
        break;
      case 'wechat_pay':
        paymentMethodTypes = ['wechat_pay'];
        break;
      case 'unionpay':
        paymentMethodTypes = ['card'];
        break;
      case 'card':
        paymentMethodTypes = ['card'];
        break;
      case 'all':
        paymentMethodTypes = ['card', 'alipay'];
        break;
      default:
        paymentMethodTypes = ['card'];
    }

    // 建立基本 session 參數
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethodTypes,
      line_items: items.map((item) => ({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'hkd',
          product_data: { name: item.name },
          unit_amount: Math.round(item.real_price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        paymentMethod,
        items: JSON.stringify(items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        }))),
      },
    };

    // card / unionpay 加 payment_intent_data
    if (paymentMethod === 'card' || paymentMethod === 'unionpay') {
      sessionParams.payment_intent_data = {
        capture_method: 'automatic',
      };
    }

    // 🔥 微信支付需要額外設定
    if (paymentMethod === 'wechat_pay') {
      sessionParams.payment_method_options = {
        wechat_pay: {
          client: 'web',
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ id: session.id }, { status: 200 });
  } catch (error: unknown) {
    console.error('Checkout session error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe 完整錯誤:', {
        type: error.type,
        code: error.code,
        message: error.message,
        param: error.param,
      });
    }
    
    let errorMessage = '無法創建結帳會話';
    let errorCode: string | undefined;

    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = error.message || errorMessage;
      errorCode = error.code;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: '無法創建結帳會話', details: errorMessage, code: errorCode },
      { status: 500 }
    );
  }
}
