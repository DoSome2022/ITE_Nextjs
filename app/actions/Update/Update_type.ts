'use server';

import { db } from "@/lib/db";

interface UpdateTypeInput {
  id: string;
  typename: string;
  author: string;
}

export async function updateType({ id, typename, author }: UpdateTypeInput) {
  try {
    const updated = await db.courseProductType.update({
      where: { id },
      data: {
        typename,
        author,
      },
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error('更新類型失敗:', error);
    throw new Error('無法更新類型');
  }
}
