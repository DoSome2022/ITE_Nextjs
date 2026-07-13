// app/api/Type/Get_Type_ById/[id]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const type = await db.courseProductType.findUnique({
      where: { id },
    });

    if (!type) {
      return NextResponse.json({ error: '類型不存在' }, { status: 404 });
    }

    return NextResponse.json(type);
  } catch (error) {
    console.error('獲取類型失敗:', error);
    return NextResponse.json({ error: '無法獲取類型' }, { status: 500 });
  }
}
