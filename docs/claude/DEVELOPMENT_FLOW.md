# DEVELOPMENT_FLOW.md — 開發流程

> 本文件描述本專案從需求到上線的整體流程，以及 Claude 在各階段的職責。
> 與 `WORKFLOW.md`（單次任務流程）互補：本文件是「大流程」，WORKFLOW 是「小流程」。

## 階段總覽

```text
需求確認 → 影響評估 → 開發 → 自測 → Code Review → 部署 → 監控
↑______________________________________________|
（發現問題回饋至 ISSUES.md）
```

## 階段 1：需求確認

- 來源：用戶提出 / `ISSUES.md` / `TASK.md`
- Claude 職責：
  - 確認需求邊界（做什麼、不做什麼）
  - 確認是否觸及 DB / 付款 / 認證
  - **有不明確處必須提問**（見 `READ_BEFORE_START.md`）
- 產出：`TASK.md` 新增任務條目

## 階段 2：影響評估

- 列出涉及路由、API、Prisma model
- 判斷是否需要改 schema（**預設：不需要**）
- 制定回滾方案
- 高風險改動需用戶書面確認

## 階段 3：開發

- 遵循 `WORKFLOW.md` 實作原則
- 遵循 `TECH_REQUIREMENTS.md` 技術約束
- 每個 API 改動同步檢查授權
- 逐步提交，高風險改動獨立 commit

## 階段 4：自測

- Type check + Lint
- 手動驗證清單（正常 / 未登入 / 錯誤角色 / 空資料）
- 付款相關：Stripe test mode 全流程
- 認證相關：三角色登入導向

## 階段 5：Code Review（用戶或 Claude 自查）

檢查項：
- [ ] 是否最小改動
- [ ] 是否改 schema（應為否）
- [ ] 是否有授權檢查
- [ ] 是否過濾敏感欄位
- [ ] 是否影響付款冪等性
- [ ] 是否有對應 LOG 記錄

## 階段 6：部署

- 環境：自架 VPS／cPanel，`next start -p 3099`
- 部署前：
  - 備份 DB（dump，不是重灌）
  - 確認環境變數齊全
- 部署後：
  - 煙霧測試：首頁、登入、購物車、付款（test）、admin 登入
  - 檢查 log

## 階段 7：監控與回饋

- 新問題 → `ISSUES.md`
- 除錯經驗 → `DEBUG.md`
- 完成記錄 → `LOG.md`

## 版本與分支策略

| 分支 | 用途 |
|---|---|
| `main` | 生產 |
| `develop` | 整合 |
| `fix/*` / `feat/*` | 任務分支 |

## 文件更新責任

| 文件 | 何時更新 |
|---|---|
| `TASK.md` | 任務開始／完成／阻塞 |
| `LOG.md` | 每次開工／收工 |
| `ISSUES.md` | 發現或修復問題 |
| `DEBUG.md` | 完成一次除錯後 |
| `WORKFLOW.md` / `DEVELOPMENT_FLOW.md` | 流程有變時 |
| `TECH_REQUIREMENTS.md` | 技術約束有變時（需用戶批准） |