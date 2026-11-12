# CLAUDE.md — 專案指引（入口）

> ⚠️ **任何程式碼改動前，必須先完整閱讀 `docs/claude/` 內的工作流程文檔。**
> 完整指引見 `docs/claude/CLAUDE.md`；最高優先級文檔係 `docs/claude/READ_BEFORE_START.md`。

## 鐵律（速覽，詳見 docs/claude/）

1. **不動資料庫**：禁止 `prisma migrate reset`、清空/重灌 DB；改 Prisma schema 必須先獲用戶書面批准，且只做向後兼容改動
2. **觸及 DB / 付款（Stripe/PayMe）/ 認證 三大高風險區 → 先問用戶**
3. API 回傳 User 一律 exclude `password`；密碼一律 bcrypt 雜湊
4. 完工後更新 `docs/claude/TASK.md`、`LOG.md`，發現新問題寫入 `ISSUES.md`

## 專案速覽

- ITE（宏業教育中心）課程電商 + 營運系統：Next.js 16 App Router + PostgreSQL/Prisma + Stripe；三角色 USER / TEACHER / ADMIN
- 開發：`npm run dev`（port 3001）；生產：`npm run build && npm start`（port 3099）
- 專案總結：`docs/claude/PROJECT_SUMMARY.md`；全站 170 個路由說明：`docs/claude/URL_DOCUMENTATION.md`
- 注意：根目錄 `README.md` 是粵語開發日誌，不是說明文件
