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