# LOG.md — 開發日誌

> 所有開發行為的流水記錄。Claude 每次開工與收工都必須更新。
> 最新記錄放最上面。

## 記錄格式

```text
[YYYY-MM-DD HH:mm] <狀態：開始 / 完成 / 阻塞 / 回滾>
任務：TASK-<id> <標題>

操作者：Claude

改動檔案：

path/to/file.ts（說明）

指令執行：

npm run build（結果）

驗證：

☑ 正常路徑
☑ 未登入被擋
遺留 / 後續：

關聯 Issue：
```

---

## 記錄

### [2026-11-12] 完成
- 任務：TASK P0-01 API 授權補齊 + P0-03 敏感欄位過濾
- 操作者：Claude
- 改動檔案：
  - `lib/auth-guard.ts`（新增：requireLogin / requireRoles / requireSelfOrAdmin / isValidUuid / userSafeSelect 統一 helper）
  - 30 條 API route 接入授權（ADMIN only ×20、TEACHER 本人或 ADMIN ×6、本人或 ADMIN ×4，詳見 TASK.md）
  - `docs/claude/URL_DOCUMENTATION.md`（權限檢查欄全數更新）、`TASK.md`（P0-01/P0-03 標 [x]）、`ISSUES.md`（ISSUE-001 → RESOLVED）、`LOG.md`
- 指令執行：`npx prisma generate`（修復 darwin-arm64 Query Engine）+ `npm run build`（✅ 通過，0 錯誤）
- 驗證：
  - [x] build 通過（含 TS type check）
  - [x] grep 確認冇 API 喺 response 洩漏 password
  - [ ] 越權 401/403 實測（需真實 DB/登入環境，建議部署前用三角色各走一次）
- 遺留：金流 API（CheckoutSessions/payme/handle-payment-success/stripe webhook）按用戶決定「唔郁」；Edit_Users 密碼明文寫入係 P0-02 任務，需用戶確認兼容方式後處理
- 關聯 Issue：ISSUE-001（已 RESOLVED）

### [2026-11-12] 開始
- 任務：TASK P0-01 API 授權補齊（範圍已同用戶確認：讀取類公開、金流唔郁、教師專屬 TEACHER/ADMIN、管理操作 ADMIN）
- 操作者：Claude
- 計劃：建 `lib/auth-guard.ts` 統一 helper，分三批接入：① 用戶管理/管理操作類（ADMIN）② 教師專屬類（TEACHER/ADMIN）③ 個人資料類（本人或 ADMIN + exclude password）

### [2026-11-12] 完成
- 任務：學員購買記錄頁 + Admin 全課程狀態頁（用戶需求新功能）
- 操作者：Claude
- 改動檔案：
  - `lib/order-status.ts`（新增：訂單狀態正規化 helper）
  - `app/api/Orders/Get_Orders_by_User/[id]/route.ts`、`app/api/Orders/Get_Order_by_Id/[orderId]/route.ts`（新增：學員訂單 API，本人或 ADMIN）
  - `app/api/Admin/Get_Course_Status/route.ts`（新增：全課程狀態聚合，ADMIN only，3 查詢並行 + JS 聚合）
  - `app/(user)/user/[userId]/orders/page.tsx`、`app/(user)/user/[userId]/orders/[orderId]/page.tsx`（新增頁面）
  - `app/(admin)/admin/CourseStatus/page.tsx`（新增：狀態表格 + 篩選 + 展開名單）
  - `components/Navbar.tsx`（userNavItems 加「購買記錄」、adminNavItems 加「課程狀態」）
  - `app/(user)/user/[userId]/page.tsx`（Dashboard 加「查看購買記錄」連結）
  - `docs/claude/URL_DOCUMENTATION.md`、`TASK.md`、`LOG.md`、`ISSUES.md`（更新）
- 指令執行：`npm run build`（✅ 通過；本機需 Node ≥ 20 + 補裝 `@next/swc-darwin-arm64`）
- 驗證：
  - [x] build 通過（含 TS type check），新 6 條路由確認喺 build output
  - [x] 冇改 prisma/schema.prisma、冇 migration、冇動 DB
- 遺留：新 API 越權/未登入測試需上線前用真實帳號走一次（本機未有 DB 連線驗證）
- 關聯 Issue：ISSUE-013 ~ ISSUE-016

### [2026-11-12] 完成
- 任務：文檔整理（用戶要求，非 TASK 編號任務）
- 操作者：Claude
- 改動檔案：
  - `docs/claude/READ_BEFORE_START.md`（新增：由 TECH_REQUIREMENTS.md 抽出成獨立檔案）
  - `docs/claude/TECH_REQUIREMENTS.md`（修 markdown 格式、補標題、移除內嵌第八節）
  - `docs/claude/DEBUG.md`、`DEVELOPMENT_FLOW.md`、`LOG.md`、`WORKFLOW.md`（修 code fence 及殘留「text」字）
  - `CLAUDE.md`（新增：指向 docs/claude/ 工作流程）
- 驗證：已核對各 md 檔案格式
- 遺留：無
- 關聯 Issue：無

---

## 範例

### [2026-11-12 10:00] 開始
- 任務：TASK-P0-01 API 授權補齊
- 操作者：Claude
- 改動檔案：（待定）
- 計劃：先建立 `lib/auth-guard.ts`，再逐 route 接入
- 風險：涉及認證，需確認不影響公開頁

### [2026-11-12 11:30] 完成
- 任務：TASK-P0-01 API 授權補齊（第一階段：user 相關 route）
- 改動檔案：
  - `lib/auth-guard.ts`（新增 requireRole helper）
  - `app/api/user/Get_User_Lists/route.ts`（加 ADMIN 檢查 + exclude password）
  - `app/api/user/Export_Users/route.ts`（加 ADMIN 檢查）
- 驗證：
  - [x] ADMIN 可訪問
  - [x] USER / 未登入回 401/403
  - [x] 回傳不含 password
- 遺留：product 相關 route 待下一階段
- 關聯 Issue：無

---

## 當前狀態

- 進行中任務：
- 最近完成：
- 待用戶確認：