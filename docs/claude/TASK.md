# TASK.md — 任務清單與優先級

> 本文件是 ITE_Nextjs 專案的任務追蹤來源。Claude 每次開發前必須先讀本文件，
> 確認當前任務屬於哪一類、優先級如何，並在完成後更新狀態。

## 任務狀態標記

- `[ ]` 未開始
- `[~]` 進行中
- `[x]` 已完成
- `[!]` 被阻塞（需用戶確認）
- `[-]` 已取消

## 優先級定義

| 級別 | 含義 | 處理原則 |
|---|---|---|
| P0 | 安全漏洞、資料損壞風險 | 立即處理，不得跳過 |
| P1 | 功能錯誤、明顯 bug | 本迭代必須完成 |
| P2 | 半成品頁面、重複程式碼清理 | 排入迭代 |
| P3 | 優化、雜項 | 有空才做 |

---

## P0 — 安全（最優先）

- [ ] **API 授權補齊**：為所有 `/api/*` route 加上 session／role 檢查
  - 重點路由：
    - `GET /api/user/Get_User_Lists`（現回傳所有用戶含密碼欄位）
    - `GET /api/user/Export_Users`（任何人可下載全部用戶 CSV）
    - `POST /api/user/Import_Users`（預設密碼 `default123`）
    - `DELETE /api/product/delete/[id]`
  - 做法：建立統一 `requireAuth(role)` / `requireRole([...])` helper，於 route handler 入口呼叫
  - 禁止：直接改 DB schema、刪除現有資料
- [ ] **密碼雜湊修正**：`PUT /api/user/Edit_Users/[id]` 密碼未經 bcrypt 即寫入
  - 修改時必須兼容舊有已存密碼（不可要求重設全部用戶）
- [ ] **敏感欄位過濾**：所有回傳 User 的 API 一律 exclude `password`

## P1 — Bug 與功能錯誤

- [ ] 修正動態參數資料夾大小寫不一致：
  - `/admin/InvoiceLists/[invoicebyId]`
  - `/admin/ReceiptLists/[Receiptbyid]`
  - `/admin/SpecialCourseLists/[SpecialCourseId]`
  - 做法：統一資料夾名與程式 `params` 讀取名稱，並確認現有連結不受影響
- [ ] 移除 `next.config.ts` 無效 key `turbo: false`
- [ ] 確認 Stripe Webhook 與 `handle-payment-success` 不重複建立訂單（防重複入帳）

## P2 — 清理與補完

- [ ] 合併重複路由：`Edit_User` vs `Edit_Users`、`Delete_User` vs `delete`（保留一個，另一個 301／redirect，不可直接刪除以免外部連結斷）
- [ ] 統一 PrismaClient：保留 `lib/prisma.ts` 或 `lib/db.ts` 其中一個，另一個改為 re-export（**不可改 schema、不可重灌 DB**）
- [ ] 清理大量被註解舊版實作（逐檔確認後再刪，不可批次誤刪）
- [ ] 補完半成品頁面（見下方清單），或明確標記為「暫停開發」
  - `/user/[userId]/Accounts`
  - `/user/[userId]/CertificateList`（對應 API 不存在，需先確認是否要建 API）
  - `/user/[userId]/order-confirmation/[orderId]`
  - `/user/[userId]/cancel`
  - `/admin/Calendar`
  - `/admin/DataLists` 三個列表頁
  - `/teacher/[Teacherid]/TypesLists/[TypesId]`
  - `/hide/createadmin`

## P3 — 優化

- [ ] Admin Dashboard 帳目區塊硬編碼 3 筆假 Stripe 資料 → 改為真實查詢（需用戶確認資料來源）
- [ ] 重寫 `README.md` 為正式說明文件（現為粵語開發日誌，保留原文另存 `DEVLOG.md`）
- [ ] PayMe 殘留程式碼：確認是否保留備用，若保留則加註說明

---

## 任務登記格式（Claude 新增任務時使用）
□ [P?] 標題
背景：

影響檔案：

驗收標準：

風險（是否涉及 DB／付款／認證）：
