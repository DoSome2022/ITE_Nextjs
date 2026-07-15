"use client";

import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { getCart } from '@/app/actions/cart/shop-cart';

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
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
}

interface CartWithItems {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// ⭐ 支付方式選項
interface PaymentMethodOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'card',
    name: '信用卡 / 扣帳卡',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
  },
  {
    id: 'alipay',
    name: '支付寶',
    icon: '💙',
    description: 'Alipay - 中國內地常用支付方式',
  },
  {
    id: 'wechat_pay',
    name: '微信支付',
    icon: '💚',
    description: 'WeChat Pay - 中國內地常用支付方式',
  },
  {
    id: 'unionpay',
    name: '銀聯',
    icon: '🔵',
    description: 'UnionPay - 銀聯卡支付',
  },
  {
    id: 'all',
    name: '全部支付方式',
    icon: '🌐',
    description: '顯示所有可用的支付方式供您選擇',
  },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [error, setError] = useState<string | null>(null);
  // ⭐ 修改：支援多種支付方式
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const params = useParams();
  const userId = params.userId as string;
  const { data: session, status } = useSession();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchCart() {
      try {
        const cartData = await getCart();
        if (!cartData || !cartData.items) throw new Error('購物車數據無效');
        setCart(cartData);
      } catch {
        setError('載入購物車失敗');
        toast.error('載入購物車失敗');
      }
    }
    fetchCart();
  }, []);

  const handleSubmit = async () => {
    if (!cart || status !== 'authenticated') {
      setError('請先登入');
      toast.error('請先登入');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      setError('無效的用戶 ID 格式');
      toast.error('無效的用戶 ID 格式');
      return;
    }

    const items = cart.items
      .map((item) => ({
        name: item.product.title,
        real_price: item.product.real_price,
        quantity: item.quantity,
        productId: item.productId,
      }))
      .filter((item) => {
        if (!item.name || typeof item.name !== 'string') {
          toast.error(`無效的商品名稱: ${item.name || '未定義'}`);
          return false;
        }
        if (typeof item.real_price !== 'number' || item.real_price <= 0) {
          toast.error(`無效的商品價格: ${item.real_price}`);
          return false;
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          toast.error(`無效的商品數量: ${item.quantity}`);
          return false;
        }
        if (!item.productId) {
          toast.error(`無效的商品 ID`);
          return false;
        }
        return true;
      });

    if (items.length === 0) {
      setError('購物車中沒有有效的商品');
      toast.error('購物車中沒有有效的商品');
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        // ⭐ 傳送選擇的支付方式到 API
        const response = await axios.post('/api/checkout', {
          items,
          userId,
          paymentMethod, // ← 傳送支付方式
        });

        const sessionId = response.data.id;
        const stripe = await stripePromise;
        if (!stripe) throw new Error('無法初始化 Stripe');

        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw error;
      } catch (error: unknown) {
        console.error('結帳錯誤:', error);
        let errorMessage = '結帳處理失敗';
        if (error instanceof AxiosError && error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
  };

  if (status === 'loading' || !cart) return <div>{error ?? '載入中...'}</div>;
  if (status === 'unauthenticated') return <div>請先登入</div>;

  const total = cart.items.reduce((sum, item) => sum + item.quantity * item.product.real_price, 0);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">結帳</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 商品列表 */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">訂單摘要</h2>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between mb-2 pb-2 border-b last:border-b-0">
            <div>
              <span className="font-medium">{item.product.title}</span>
              <span className="text-gray-500 ml-2">x {item.quantity}</span>
            </div>
            <span className="font-medium">
              HK${(item.quantity * item.product.real_price).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex justify-between mt-3 pt-2 border-t font-bold text-lg">
          <span>總計</span>
          <span>HK${total.toFixed(2)}</span>
        </div>
      </div>

      {/* ⭐ 支付方式選擇 */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">選擇支付方式</h2>
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`
                flex items-center p-3 border rounded-lg cursor-pointer transition
                ${
                  paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <input
                type="radio"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="text-xl mr-2">{method.icon}</span>
                  <span className="font-medium">{method.name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 提交按鈕 */}
      <button
        onClick={handleSubmit}
        disabled={isPending || cart.items.length === 0}
        className={`w-full py-3 text-white font-medium rounded-lg text-lg transition ${
          isPending || cart.items.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isPending ? '處理中...' : `使用 ${paymentMethods.find(m => m.id === paymentMethod)?.name || '信用卡'} 付款`}
      </button>
    </div>
  );
}
