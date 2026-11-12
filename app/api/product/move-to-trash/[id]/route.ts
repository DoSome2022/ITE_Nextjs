// app/api/product/move-to-trash/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireLogin, requireRoles } from '@/lib/auth-guard';
import { UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest) {
  const { session, response } = await requireLogin();
  if (response) return response;
  const forbidden = requireRoles(session!, [UserRole.ADMIN]);
  if (forbidden) return forbidden;

  const id = request.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json({ error: '缺少產品 ID' }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: '產品不存在' }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        IsPublic: false, // 設為不公開，代表「移到垃圾桶」
        // 若未來有 isTrash 欄位，可改為：isTrash: true
        isTrash: true
      },
    });

    return NextResponse.json(
      { message: '已移至垃圾桶', data: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Move to trash error:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}