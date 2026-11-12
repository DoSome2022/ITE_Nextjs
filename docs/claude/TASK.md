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

- [x] **API 授權補齊**（2026-11-12 完成）：30 條 API 已接入 `lib/auth-guard.ts` 統一授權
  - ADMIN only（20 條）：user CRUD/匯入匯出/Get_User_Lists/Get_Teachers_With_Course/teacherLists、product 刪除/垃圾桶/還原、contact-admin/contact/[id]、Accounts/Invoice/Receipt 全表、SpecialCourse 建立
  - TEACHER 本人或 ADMIN（6 條）：attendance×2、teacher CourseLists、Get_Courses_By_Teacher、upload（限自己 TeacherId）、Get_CourseModul_Lists/by_Id、Holiday lists
  - 本人或 ADMIN（4 條）：Get_User_Lists_by_Id、Accounts_by_User、Cart_Items、Holiday_by_Id
  - 保持公開：讀取類 GET、聯絡/投訴表單 POST（用戶確認）
  - 金流 API 按用戶決定「唔郁」：CheckoutSessions、payme、handle-payment-success、stripe webhook
- [ ] **密碼雜湊修正**：`PUT /api/user/Edit_Users/[id]` 密碼未經 bcrypt 即寫入
  - 修改時必須兼容舊有已存密碼（不可要求重設全部用戶）
- [x] **敏感欄位過濾**（2026-11-12 完成）：所有回傳 User 嘅 API 已 exclude `password`（Get_User_Lists、Get_User_Lists_by_Id、Holiday lists、Cart items；其餘用 select 嘅 API 本身冇密碼欄位）

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

## 已完成（2026-11-12）

- [x] **學員購買記錄頁 + Admin 全課程狀態頁**（用戶需求，2026-11-12 完成）
  - 學員：`/user/[userId]/orders`（訂單式列表，可展開課程明細）+ `/user/[userId]/orders/[orderId]`（訂單詳情，復活 success 頁失效連結）
  - Admin：`/admin/CourseStatus`（全課程狀態表格：時間/地點/老師/學生數/價錢/上下課時間/新學生標記）
  - 新 API 3 條：`/api/Orders/Get_Orders_by_User/[id]`、`/api/Orders/Get_Order_by_Id/[orderId]`、`/api/Admin/Get_Course_Status`（全部有授權檢查）
  - 「新學生」= 以 Order.createdAt 計 7 日內首次付款；**冇改 DB schema、冇跑 migration**
  - 驗證：`npm run build` 通過（Node 20）；發現嘅資料不一致問題寫入 ISSUES-013~016

---

## 任務登記格式（Claude 新增任務時使用）
□ [P?] 標題
背景：

影響檔案：

驗收標準：

風險（是否涉及 DB／付款／認證）：
