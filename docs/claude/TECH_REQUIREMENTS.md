# TECH_REQUIREMENTS.md — 技術要求

> 本文件是本專案的硬性技術約束。**任何改動都必須遵守，違反即視為不合格交付。**
> 最高原則：**不要重灌 DB**。
> 開工前必讀：[READ_BEFORE_START.md](./READ_BEFORE_START.md)

## 一、最高原則：不動資料庫

### 1.1 絕對禁止

- ❌ `prisma migrate reset`
- ❌ `prisma db push --force-reset`
- ❌ 刪除資料庫 / 重建資料庫
- ❌ 清空任何 table
- ❌ 修改現有欄位型別或刪除欄位
- ❌ 在生產環境執行任何 destructive migration

### 1.2 改 schema 的唯一途徑

若業務真的需要改 schema：

1. 先向用戶書面說明：改什麼、為什麼、影響、回滾方案
2. 取得用戶明確批准
3. 只做 **向後兼容** 的改動：
   - 新增 nullable 欄位
   - 新增 table
   - 新增 index
4. 禁止在同一 migration 中刪欄位或改型別
5. 必須提供資料備份步驟（`pg_dump`）與回滾腳本
6. 若無法做到向後兼容 → **停手，再問用戶**

### 1.3 資料操作原則

- 所有寫入操作必須可逆或有備份
- 批次更新前先 `SELECT` 確認範圍
- 刪除操作優先軟刪除（如 `isTrash`）
- 密碼欄位任何情況下不得明文儲存

## 二、技術棧約束（不得擅自更換）

| 類別 | 技術 | 約束 |
|---|---|---|
| 框架 | Next.js 16 App Router | 不得降版或改用 Pages Router |
| React | 19 | — |
| 語言 | TypeScript | 不得用 `any` 繞過型別（必要時加 `// @ts-expect-error` 並註明原因） |
| UI | Tailwind 3.4 + shadcn/Radix | 沿用現有元件 |
| DB | PostgreSQL + Prisma 6 | 見第一節 |
| 認證 | NextAuth v5 beta + Prisma Adapter，JWT session | 不得改為其他方案 |
| 金流 | Stripe Checkout + Webhook；PayMe 備用 | 不得新增其他支付 |
| Email | Nodemailer + Gmail SMTP；Resend | — |
| 儲存 | 阿里雲 OSS（ali-oss） | 上傳上限 20MB |
| 表單 | react-hook-form + zod | 新表單沿用 |

## 三、程式碼規範

### 3.1 結構

- 頁面放 `app/`，API 放 `app/api/`
- Prisma client **只能有一個實例**（統一後）
- Server action 與 API route 分工明確
- 敏感邏輯（授權、付款）不得放 client component

### 3.2 授權（強制）

每個 `/api/*` route 必須在入口做：

```ts
// 範例
const session = await auth();
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

公開 API 需明確標註 `// PUBLIC_API` 並說明原因。

回傳 User 資料一律 exclude `password`。

### 3.3 密碼

- 一律 bcrypt 雜湊
- 不得在 log、response、CSV 匯出中包含密碼

### 3.4 付款

- `unit_amount = real_price × 100`
- 建立訂單必須冪等（以 Stripe session id / paymentId 去重）
- Webhook 必須驗簽章
- 不得在 client 端計算最終金額

### 3.5 錯誤處理

- API 回傳統一 JSON 格式：`{ error: string }`
- 不得把 stack trace 回傳給 client
- 敏感錯誤寫入 server log

## 四、相容性要求

- 改動不得破壞現有 164 個路由（見 `URL_DOCUMENTATION.md`）
- 改動不得破壞現有資料（DB 內既有記錄必須可正常讀取）
- 改動不得要求用戶重設密碼（除安全必要且經批准）
- 改動不得使既有外部連結 404（重複路由用 redirect 處理）

## 五、環境變數（不得硬編碼）

```text
DATABASE_URL
AUTH_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY / STRIPE_SECRET_WEBHOOK_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
PAYME_API_URL / PAYME_CLIENT_ID / PAYME_SECRET_KEY / PAYME_SIGNING_KEY
OSS_REGION / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET
GMAIL_USER / GMAIL_APP_PASSWORD
RESEND_API_KEY
```

新增環境變數必須同步更新本文件與部署說明。

## 六、部署約束

- 自架 VPS／cPanel，`next start -p 3099`
- `.htaccess` 與 Let's Encrypt 憑證不得破壞
- next-sitemap 產出不得中斷
- 部署前必須 `pg_dump` 備份

## 七、交付檢查清單（每次交付前自查）

- [ ] 未改 DB schema（或已獲批准且向後兼容）
- [ ] 未執行任何 destructive 指令
- [ ] 所有改動的 API 有授權檢查
- [ ] 回傳不含密碼
- [ ] Type check / Lint 通過
- [ ] 手動驗證完成
- [ ] LOG.md / ISSUES.md 已更新
- [ ] 高風險改動獨立 commit 且可回滾

---

## 八、開工前必讀

開工前必須完整閱讀 [READ_BEFORE_START.md](./READ_BEFORE_START.md) 並遵守。
