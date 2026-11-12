# CLAUDE.md — 專案指引

ITE（宏業教育中心 InnoTrendEDU）課程電商 + 營運系統。Next.js 16 App Router + PostgreSQL/Prisma + Stripe。三角色：USER / TEACHER / ADMIN。

## 開工前必讀（最高優先）

任何程式碼改動前，必須先閱讀 `docs/claude/` 內的工作流程文檔：

- `docs/claude/READ_BEFORE_START.md` — 最高優先級，開工前必讀
- `docs/claude/TECH_REQUIREMENTS.md` — 硬性技術約束
- `docs/claude/TASK.md` / `ISSUES.md` — 任務與問題清單（P0-P3）
- `docs/claude/WORKFLOW.md` / `DEVELOPMENT_FLOW.md` — 工作流程
- `docs/claude/LOG.md` / `DEBUG.md` — 日誌與除錯
- `docs/claude/PROJECT_SUMMARY.md` / `URL_DOCUMENTATION.md` — 專案總結與全站 164 個路由說明

## 鐵律（不可違反）

1. **不動資料庫**：禁止 `prisma migrate reset`、清空/重灌 DB；改 Prisma schema 必須先獲用戶書面批准，且只做向後兼容改動
2. **觸及 DB / 付款（Stripe/PayMe）/ 認證 三大高風險區 → 先問用戶**
3. API 回傳 User 一律 exclude `password`；密碼一律 bcrypt 雜湊
4. 完工後更新 `TASK.md`、`LOG.md`，發現新問題寫入 `ISSUES.md`

## 快速上手

- 開發：`npm run dev`（port 3001）；生產：`npm run build && npm start`（port 3099）
- 付款：Stripe Checkout 為主（`unit_amount = real_price × 100`），PayMe 備用；Webhook 必須驗簽章
- 檔案儲存：阿里雲 OSS（教材/商品圖/文章媒體，上限 20MB）
- 注意：根目錄 `README.md` 是粵語開發日誌，不是說明文件；正式說明見 `docs/claude/PROJECT_SUMMARY.md`
