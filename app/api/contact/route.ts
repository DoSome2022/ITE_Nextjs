import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, productTypes, contactType, otherType, details } = body;

    // 驗證必填欄位
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "請輸入姓名" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "請輸入電話" }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "請輸入電郵" }, { status: 400 });
    }
    if (!contactType) {
      return NextResponse.json({ error: "請選擇類型" }, { status: 400 });
    }
    if (!details || !details.trim()) {
      return NextResponse.json({ error: "請輸入詳細內容" }, { status: 400 });
    }
    if (contactType === "其他" && !otherType?.trim()) {
      return NextResponse.json({ error: "請輸入其他類型的說明" }, { status: 400 });
    }

    // 建立聯絡表單
    const message = await db.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        productTypes: productTypes || [],
        contactType,
        otherType: contactType === "其他" ? otherType?.trim() : null,
        details: details.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "感謝您的聯絡，我們將盡快回覆您！",
      id: message.id,
    });
  } catch (error) {
    console.error("建立聯絡表單失敗：", error);
    return NextResponse.json({ error: "提交失敗，請稍後再試" }, { status: 500 });
  }
}
