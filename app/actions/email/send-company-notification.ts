//app/actions/email/send-company-notification.ts

'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

interface CompanyNotificationInput {
  orderId: string;
  userId: string;
}

export async function sendCompanyNotification({
  orderId,
  userId,
}: CompanyNotificationInput) {
  try {
    // 1. 查詢訂單 + 商品明細 + 用戶資訊
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
        select: {
          name: true,
          email: true,
          phone: true,
          username: true,
        },
      }),
    ]);

    if (!order) throw new Error('訂單不存在');
    if (!user) throw new Error('用戶不存在');

    // 2. 取得公司通知信箱
    const companyEmail = process.env.COMPANY_NOTIFICATION_EMAIL;
    if (!companyEmail) {
      throw new Error('未設定 COMPANY_NOTIFICATION_EMAIL');
    }

    // 3. 建立商品清單 HTML
    const itemsHtml = order.items
      .map(
        (item) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.product.title}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">HK$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
        `
      )
      .join('');

    // 4. 建立 HTML 郵件內容
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔔 新訂單通知</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">您的課程平台收到一筆新訂單</p>
        </div>
        
        <!-- Body -->
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          
          <!-- 訂單概要 -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 15px; font-size: 18px; color: #374151;">📋 訂單概要</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; width: 100px;">訂單編號</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1f2937;">${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">訂單日期</td>
                <td style="padding: 6px 0; color: #1f2937;">${order.createdAt.toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">訂單狀態</td>
                <td style="padding: 6px 0;">
                  <span style="background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 4px; font-size: 14px;">已付款</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">付款編號</td>
                <td style="padding: 6px 0; color: #1f2937; font-family: monospace; font-size: 13px;">${order.paymentId || '無'}</td>
              </tr>
            </table>
          </div>
          
          <!-- 客戶資訊 -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 15px; font-size: 18px; color: #374151;">👤 客戶資訊</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; width: 100px;">姓名</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1f2937;">${user.name || '未填寫'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">用戶名</td>
                <td style="padding: 6px 0; color: #1f2937;">${user.username}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">電子郵件</td>
                <td style="padding: 6px 0; color: #2563eb;">
                  <a href="mailto:${user.email}" style="color: #2563eb;">${user.email || '未填寫'}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280;">電話</td>
                <td style="padding: 6px 0; color: #1f2937;">${user.phone || '未填寫'}</td>
              </tr>
            </table>
          </div>
          
          <!-- 商品明細 -->
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h2 style="margin: 0 0 15px; font-size: 18px; color: #374151;">🛒 購買商品</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #4f46e5; color: white;">
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
                  <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold; border-top: 2px solid #4f46e5;">總計</td>
                  <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 20px; color: #4f46e5; border-top: 2px solid #4f46e5;">
                    HK$${order.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <!-- 快速操作 -->
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.NEXT_BASE_URL}/admin/orders/${order.id}" 
               style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              查看訂單詳情 →
            </a>
          </div>
          
          <hr style="margin: 25px 0 15px; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            此郵件由系統自動發送，无需回覆。<br>
            如有問題請登入管理後台處理。
          </p>
        </div>
      </body>
      </html>
    `;

    // 5. 🔥 用 Gmail 發送郵件
    const result = await sendEmail({
      to: companyEmail,
      subject: `🔔 新訂單通知 - ${user.name || user.username} 購買了 ${order.items.length} 項商品`,
      html: emailHtml,
    });

    console.log(`[公司通知] 已發送新訂單通知: ${order.id} → ${companyEmail}`);
    return result;

  } catch (error) {
    console.error('發送公司通知失敗:', error);
    return { success: false, error: '發送公司通知失敗' };
  }
}
