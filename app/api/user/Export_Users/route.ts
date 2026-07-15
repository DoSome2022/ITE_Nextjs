import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 轉換為 CSV 格式
    const headers = ["ID", "用戶名", "姓名", "電子郵件", "電話", "角色", "地址", "創建時間", "更新時間"];
    const csvRows = [headers.join(",")];

    users.forEach((user) => {
      const row = [
        user.id,
        escapeCsv(user.username),
        escapeCsv(user.name || ""),
        escapeCsv(user.email || ""),
        escapeCsv(user.phone || ""),
        escapeCsv(user.role),
        escapeCsv(user.address || ""),
        user.createdAt.toISOString(),
        user.updatedAt.toISOString(),
      ];
      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("匯出用戶失敗：", error);
    return NextResponse.json(
      { error: "匯出失敗" },
      { status: 500 }
    );
  }
}

// 輔助函數：處理 CSV 中的特殊字元
function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
