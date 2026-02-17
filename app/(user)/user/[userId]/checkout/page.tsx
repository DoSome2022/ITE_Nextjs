// app/(user)/user/[userId]/checkout/page.tsx
"use client";

import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { CartWithItems, getCart } from '@/app/actions/cart/shop-cart';

// interface Product {
//   id: string;
//   title: string;
//   description: string;
//   price: number;
//   real_price: number;
//   CourseProductTypeArray: string[];
//   CourseProductStatusArray: string[];
//   createdAt: Date;
//   updatedAt: Date;
//   IsPublic: boolean;
//   courseId: string | null;
// }

// interface CartItem {
//   id: string;
//   cartId: string;
//   productId: string;
//   quantity: number;
//   createdAt: Date;
//   updatedAt: Date;
//   product: Product;
// }

// interface CartWithItems {
//   id: string;
//   userId: string;
//   createdAt: Date;
//   updatedAt: Date;
//   items: CartItem[];
// }

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'payme'>('stripe');
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
        // ← 完全忽略錯誤變數
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

    if (userId !== session?.user?.id) {
      setError('無權操作：用戶 ID 不匹配');
      toast.error('無權操作：用戶 ID 不匹配');
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
        quantity: item.quantity ?? 0,
        productId: item.productId,
      }))
      .filter((item, _) => {
        if (!item.name || typeof item.name !== 'string') {
          setError(`無效的商品名稱: ${item.name || '未定義'}`);
          toast.error(`無效的商品名稱: ${item.name || '未定義'}`);
          return false;
        }
        if (typeof item.real_price !== 'number' || item.real_price <= 0) {
          setError(`無效的商品價格: ${item.real_price}`);
          toast.error(`無效的商品價格: ${item.real_price}`);
          return false;
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          setError(`無效的商品數量: ${item.quantity}`);
          toast.error(`無效的商品數量: ${item.quantity}`);
          return false;
        }
        if (!item.productId) {
          setError(`無效的商品 ID`);
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


        if (paymentMethod === 'stripe') {
          const response = await axios.post('/api/CheckoutSessions', { items, userId });
          const sessionId = response.data.id;

          const stripe = await stripePromise;
          if (!stripe) throw new Error('無法初始化 Stripe');

          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) throw error;
        }
        // PayMe 邏輯保留...
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

  // ← 保留 UI 用的 total
  const total = cart.items.reduce(
  (sum, item) => sum + (item.quantity ?? 0) * item.product.real_price,
  0
);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">結帳</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4">
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>{item.product.title} (x{item.quantity})</span>
            <span>${((item.quantity ?? 0) * item.product.real_price).toFixed(2)}</span>
          </div>
        ))}
        <div className="font-bold mt-2">總計: ${total.toFixed(2)}</div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">選擇支付方式</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'payme')}
              className="mr-2"
            />
            Stripe (信用卡支付)
          </label>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isPending || cart.items.length === 0}
        className={`bg-green-500 text-white px-4 py-2 rounded ${
          isPending || cart.items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? '處理中...' : '提交訂單'}
      </button>
    </div>
  );
}