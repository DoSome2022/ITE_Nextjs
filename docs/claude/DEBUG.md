# DEBUG.md — 除錯指南與已知陷阱

> 記錄本專案的除錯方法、常見錯誤、以及「踩過的坑」。Claude 遇到問題先查本文件。

## 一、除錯環境

| 項目 | 值 |
|---|---|
| 啟動 | `next start -p 3099`（自架 VPS／cPanel） |
| 本機開發 | `npm run dev`（若可用） |
| DB | PostgreSQL + Prisma 6 |
| ORM 除錯 | `DEBUG="prisma:*"` |
| NextAuth 除錯 | `DEBUG="next-auth:*"` |
| Stripe 除錯 | Stripe Dashboard → Developers → Events / Logs |

## 二、高風險區除錯順序

### 付款流程（Stripe）
1. 檢查 `POST /api/CheckoutSessions` 是否成功建立 session（`unit_amount = real_price × 100`）
2. 檢查 Stripe Dashboard 是否有對應 payment intent
3. 檢查 `/api/handle-payment-success`：
   - 是否 `payment_status === 'paid'`
   - 是否重複建立 Accounts / Invoice / Order（**冪等性**）
4. 檢查 `/api/webhooks/stripe` 簽章驗證是否通過
5. 常見：Webhook 與 success handler 同時建立訂單 → 需以 `paymentId`（Stripe session id）做唯一性檢查

### 認證（NextAuth v5 beta）
- Session 為 JWT，middleware 依 `session.user.role` 導向
- 若角色導向錯誤 → 檢查 `middleware.ts` 的 matcher 與 role 對照
- Google OAuth 失敗 → 檢查 `GOOGLE_CLIENT_ID/SECRET` 與回調 URL

### Prisma
- **兩個 PrismaClient 實例**（`lib/db.ts` 與 `lib/prisma.ts`）→ 可能導致連線數過多或行為不一致
- 除錯時先確認當前檔案 import 的是哪一個
- 禁止用 `prisma migrate reset` 解問題

## 三、已知錯誤模式

| 症狀 | 可能原因 | 排查 |
|---|---|---|
| 動態頁讀不到 params | 資料夾名與 `params` 大小寫不一致 | 對照 `ISSUES.md` 第 5 項 |
| 用戶列表 API 回傳密碼 | 未 select／exclude 敏感欄位 | 檢查 Prisma query |
| 修改用戶後無法登入 | 密碼被明文寫入（未 bcrypt） | 檢查 `Edit_Users` route |
| 404 於 admin 列表頁 | 重複路由或大小寫 | 檢查 `app/admin/**` 目錄結構 |
| 圖片／教材上傳失敗 | OSS 設定或 20MB 上限 | 檢查 `OSS_*` 環境變數與檔案大小 |
| 訂單確認信沒寄出 | Gmail App Password 失效 | 檢查 `GMAIL_USER` / `GMAIL_APP_PASSWORD` |

## 四、除錯記錄格式（每次 debug 後追加）

```text
YYYY-MM-DD — <問題標題>
症狀：

重現步驟：

根因：

排查過程：

解法：

預防（是否已寫入 ISSUES.md / 測試）：
```

## 五、除錯鐵律

1. **先重現，再修**：不能重現的問題不亂改
2. **先看 log，再猜**：NextAuth / Prisma / Stripe 都有 log
3. **改一個變數，測一次**：不要一次改多處
4. **高風險區改動前先備份 DB**（匯出 dump，不是重灌）
5. **不確定就問用戶**
