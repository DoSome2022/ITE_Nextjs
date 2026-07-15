//lib/email.ts

'use server';

import nodemailer from 'nodemailer';

// 建立 Gmail Transporter
function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER 或 GMAIL_APP_PASSWORD 未設定');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailInput) {
  const transporter = createTransporter();

  const info = await transporter.sendMail({
    from: from || `"課程平台" <${process.env.GMAIL_USER}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  });

  console.log(`[Email] 郵件已發送: ${info.messageId} → ${to}`);
  return { success: true, messageId: info.messageId };
}
