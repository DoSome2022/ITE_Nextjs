// app/(user)/user/[userId]/cart/page.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getCart, removeFromCart } from '@/app/actions/cart/shop-cart';

// 定義與 getCart 返回資料匹配的類型
interface Product {
  id: string;
  title: string;
  price: number;
  real_price: number;
}

interface CartItem {
  id: string;
  quantity: number;
  product: Product;
}

interface CartWithItems {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const router = useRouter();
  const { status } = useSession();
  const params = useParams();
  const userId = params.userId as string;
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchCart() {
      if (status === 'authenticated') {
        try {
          const cartData = await getCart();
          setCart(cartData);
        } catch (error) {
          console.error('載入心儀課程失敗:', error);
        }
      }
    }
    fetchCart();
  }, [status]);

  const handleRemove = async (cartItemId: string) => {
    startTransition(async () => {
      try {
        await removeFromCart(cartItemId);
        setCart((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== cartItemId),
          };
        });
      } catch (error) {
        console.error('移除心儀課程項目失敗:', error);
        alert(
          error instanceof Error
            ? `移除失敗：${error.message}`
            : '移除時發生錯誤，請稍後再試。'
        );
      }
    });
  };

  const handleCheckout = () => {
    router.push(`/user/${userId}/checkout`);
  };

  if (status === 'loading') return(
    console.log("loading  cart : ",cart ,"-- end --") ,
    <div>載入中...</div>
  );
    
  
  if (status === 'unauthenticated') return <div>請先登入</div>;
  if (!cart)  return(
    console.log("!cart : ",cart ,"-- end --") ,
    <div>心儀課程載入中...</div>
  );

  console.log("cart : ",cart ,"-- end --") ;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">心儀課程</h1>
      {cart.items.length === 0 ? (
        <p>您的心儀課程為空</p>
      ) : (
        <>
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2 p-2 border-b">
              <div>
                <h2>{item.product.title}</h2>
                <p>數量: {item.quantity}</p>
                <p>價格: ${(item.product.real_price).toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
                disabled={isPending}
              >
                {isPending ? '移除中...' : '移除'}
              </button>
            </div>
          ))}
          <button
            onClick={handleCheckout}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            前往結帳
          </button>
        </>
      )}
    </div>
  );
}