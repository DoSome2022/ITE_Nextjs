# WORKFLOW.md — 工作流程

> 定義 Claude 在本專案中「由接任務到交付」的標準流程。任何開發行為都必須依此執行。

## 0. 前置（每次開工必做）

1. 讀 `TASK.md`、`DEBUG.md`、`ISSUES.md`、`TECH_REQUIREMENTS.md`
2. 讀 `DEVELOPMENT_FLOW.md` 確認本次屬於哪個階段
3. 確認本次任務是否觸及 **資料庫 / 付款 / 認證** 三大高風險區
4. **有疑問先問用戶，不要自行假設**（見 `READ_BEFORE_START.md`）

## 1. 任務領取

- 從 `TASK.md` 揀選任務，將狀態改為 `[~]`
- 在 `LOG.md` 新增一筆「開始」記錄（見 `LOG.md` 格式）
- 若任務描述不足 → 標 `[!]` 並向用戶提問

## 2. 分析與影響評估

輸出以下內容給用戶確認（簡單任務可口頭帶過）：

```text
【影響評估】

涉及路由：

涉及 API：

涉及 Prisma model：

是否改 schema：是／否（預設必須為「否」）

是否影響付款流程：是／否

是否影響認證：是／否

回滾方式：
```

## 3. 實作原則

- **最小改動**：只改必要檔案，不做順手重構
- **不改 DB schema**（除非用戶書面批准，見 `TECH_REQUIREMENTS.md`）
- **不刪資料、不重灌 DB、不跑 `prisma migrate reset`**
- 新程式碼跟隨現有風格（App Router、server action、zod 驗證）
- 每個 API 改動必須同時檢查授權

## 4. 自測

- TypeScript 編譯通過（`tsc --noEmit` 或 `next build` 的 type check）
- Lint 通過
- 手動驗證清單：
  - [ ] 正常路徑
  - [ ] 未登入訪問（應被擋）
  - [ ] 錯誤角色訪問（應被擋）
  - [ ] 空資料 / 錯誤輸入
  - [ ] 若涉付款：用 Stripe test mode 走一次

## 5. 交付

- 更新 `TASK.md` 狀態為 `[x]`
- 在 `LOG.md` 記錄「完成」：改了什麼、驗證了什麼、遺留什麼
- 若發現新問題 → 寫入 `ISSUES.md`
- 若有學到的 debug 經驗 → 寫入 `DEBUG.md`

## 6. 分支與提交（建議）

- 分支命名：`fix/<task-id>-<short-desc>`、`feat/<task-id>-<short-desc>`
- Commit message：

```text
<type>(<scope>): <subject>

refs: TASK-<id>
risk: db|payment|auth|none
```
- 高風險改動（db / payment / auth）必須獨立 commit，方便回滾

## 7. 禁止事項

- ❌ 未讀文件就開工
- ❌ 未經確認改 Prisma schema
- ❌ 執行任何會清空資料的指令
- ❌ 批次刪除被註解程式碼而不逐檔確認
- ❌ 在未測試情況下改付款流程
