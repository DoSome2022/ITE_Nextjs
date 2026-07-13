//app/actions/email/send-order-confirmation.ts
'use server';

import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderConfirmationInput {
  orderId: string;
  userId: string;
}

export async function sendOrderConfirmationEmail({ 
  orderId, 
  userId 
}: OrderConfirmationInput) {
  try {
    // 1. 查詢訂單 + 使用者資訊
    const [order, user] = await Promise.all([
      prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      }),
    ]);

    if (!order) throw new Error('訂單不存在');
    if (!user?.email) throw new Error('用戶沒有電子郵件');

    // 2. 建立郵件 HTML 內容
    const itemsHtml = order.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">HK$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `
      )
      .join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1>✅ 訂單確認</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
          <p>親愛的 <strong>${user.name || '用戶'}</strong>，您好：</p>
          <p>感謝您的購買！您的訂單已成功建立。</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>訂單編號：</strong>${order.id}</p>
            <p><strong>訂單日期：</strong>${order.createdAt.toLocaleDateString('zh-HK')}</p>
            <p><strong>訂單狀態：</strong>已付款</p>
          </div>
          
          <h3>訂購項目</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #4CAF50; color: white;">
                <th style="padding: 10px; text-align: left;">商品名稱</th>
                <th style="padding: 10px; text-align: center;">數量</th>
                <th style="padding: 10px; text-align: right;">金額</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">總計：</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; color: #4CAF50;">
                  HK$${order.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            如有任何問題，請聯繫我們的客戶服務。<br>
            此郵件由系統自動發送，請勿直接回覆。
          </p>
        </div>
      </body>
      </html>
    `;

    // 3. 發送郵件
    const { data, error } = await resend.emails.send({
      from: '您的課程平台 <noreply@您的domain.com>',
      to: user.email,
      subject: `訂單確認 - #${order.id.slice(0, 8)}`,
      html: emailHtml,
    });

    if (error) throw error;

    console.log(`[Email] 訂單確認郵件已發送: ${order.id} → ${user.email}`);
    return { success: true, messageId: data?.id };

  } catch (error) {
    console.error('發送確認郵件失敗:', error);
    // 不拋出錯誤，避免影響主要流程
    return { success: false, error: '發送郵件失敗' };
  }
}
