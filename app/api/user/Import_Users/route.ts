import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "請上傳檔案" }, { status: 400 });
    }

    // 讀取 CSV 內容
    const csvText = await file.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV 檔案沒有數據" }, { status: 400 });
    }

    // 解析標頭
    const headers = lines[0].split(",").map((h) => h.trim());
    
    // 確認必要的欄位
    const usernameIdx = headers.indexOf("用戶名");
    const nameIdx = headers.indexOf("姓名");
    const emailIdx = headers.indexOf("電子郵件");
    const phoneIdx = headers.indexOf("電話");
    const roleIdx = headers.indexOf("角色");
    const addressIdx = headers.indexOf("地址");

    if (usernameIdx === -1 || nameIdx === -1) {
      return NextResponse.json(
        { error: "CSV 格式不正確，需要至少「用戶名」和「姓名」欄位" },
        { status: 400 }
      );
    }

    // 解析每一行數據
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 1; i < lines.length; i++) {
      try {
        // 簡單 CSV 解析（處理引號）
        const values = parseCSVLine(lines[i]);
        
        const username = values[usernameIdx]?.trim();
        const name = values[nameIdx]?.trim();
        const email = values[emailIdx]?.trim();
        const phone = values[phoneIdx]?.trim();
        const role = values[roleIdx]?.trim() || "STUDENT";
        const address = values[addressIdx]?.trim();

        if (!username || !name) {
          results.failed++;
          results.errors.push(`第 ${i + 1} 行：缺少用戶名或姓名`);
          continue;
        }

        // 檢查用戶是否已存在
        const existingUser = await db.user.findUnique({ where: { username } });
        
        if (existingUser) {
          // 更新現有用戶
          await db.user.update({
            where: { username },
            data: {
              name,
              email: email || existingUser.email,
              phone: phone || existingUser.phone,
              role: (role || existingUser.role) as any,
              address: address || existingUser.address,
            },
          });
        } else {
          // 建立新用戶
          await db.user.create({
            data: {
              username,
              name,
              email: email || `${username}@temp.com`,
              phone: phone || "",
              password: "default123", // 預設密碼，建議後續修改
              role: role as any,  
              address: address || null,
            },
          });
        }
        
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`第 ${i + 1} 行：解析錯誤`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("匯入用戶失敗：", error);
    return NextResponse.json({ error: "匯入失敗" }, { status: 500 });
  }
}

// 輔助函數：解析 CSV 行（處理引號）
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
