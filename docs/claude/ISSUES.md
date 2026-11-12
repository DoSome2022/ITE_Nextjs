# ISSUES.md — 問題清單

> 已知問題的集中管理。來源：專案總結第八節 + 開發過程新發現。
> 修復後將狀態改為 `RESOLVED`，不要刪除記錄。

## 狀態

- `OPEN` 未處理
- `IN_PROGRESS` 處理中
- `RESOLVED` 已修復（註明日期與 commit）
- `WONTFIX` 不修（註明原因）
- `NEED_INFO` 待用戶確認

---

## 問題列表

### ISSUE-001 [OPEN][P0] API 授權不完整
- 描述：超過一半 `/api/*` 無 session／role 檢查
- 舉例：
  - `GET /api/user/Get_User_Lists` 回傳所有用戶含密碼
  - `GET /api/user/Export_Users` 任何人可下載全部用戶 CSV
  - `DELETE /api/product/delete/[id]` 無檢查
  - `POST /api/user/Import_Users` 預設密碼 `default123`
- 影響：資料外洩、越權操作
- 修復方向：統一 auth guard（見 TASK P0）

### ISSUE-002 [OPEN][P2] 重複路由
- `Edit_User` vs `Edit_Users`
- `Delete_User` vs `delete`
- 修復方向：保留一個，另一個 redirect，不可直接刪

### ISSUE-003 [OPEN][P2] 兩個 PrismaClient 實例
- `lib/db.ts` 與 `lib/prisma.ts`
- 修復方向：統一為一個，另一個 re-export（**不改 schema**）

### ISSUE-004 [OPEN][P2] 大量被註解舊版實作
- 例：`/user/[userId]/success` 頁
- 修復方向：逐檔確認後清理

### ISSUE-005 [OPEN][P0] 密碼未雜湊
- `PUT /api/user/Edit_Users/[id]` 密碼明文寫入
- 修復方向：bcrypt 雜湊，兼容舊資料

### ISSUE-006 [OPEN][P1] 動態參數大小寫不一致
- `/admin/InvoiceLists/[invoicebyId]`
- `/admin/ReceiptLists/[Receiptbyid]`
- `/admin/SpecialCourseLists/[SpecialCourseId]`
- 修復方向：統一命名並確認連結

### ISSUE-007 [OPEN][P2] 半成品／佔位頁面（約 10 個）
- `/user/[userId]/Accounts`
- `/user/[userId]/CertificateList`（API 不存在）
- `/user/[userId]/order-confirmation/[orderId]`
- `/user/[userId]/cancel`
- `/admin/Calendar`
- `/admin/DataLists` 三個列表頁
- `/teacher/[Teacherid]/TypesLists/[TypesId]`
- `/hide/createadmin`
- 修復方向：補完或明確標記暫停

### ISSUE-008 [OPEN][P3] Admin Dashboard 假資料
- 帳目區塊硬編碼 3 筆假 Stripe 資料
- 修復方向：改真實查詢（需用戶確認）

### ISSUE-009 [OPEN][P1] `next.config.ts` 無效 key
- `turbo: false`

### ISSUE-010 [OPEN][P3] README 非說明文件
- 現為粵語開發日誌
- 修復方向：保留為 `DEVLOG.md`，另寫 README

### ISSUE-011 [OPEN][P3] PayMe 殘留程式碼
- 部分已註解
- 修復方向：確認保留或清理，保留則加註

### ISSUE-012 [OPEN][P1] 付款冪等性未確認
- Webhook 與 success handler 可能重複建立訂單
- 修復方向：以 `paymentId` 做唯一性檢查

---

## 新問題登記格式
ISSUE-XXX [狀態][優先級] 標題
發現日期：

描述：

重現步驟：

影響範圍：

修復方向：

關聯 TASK：