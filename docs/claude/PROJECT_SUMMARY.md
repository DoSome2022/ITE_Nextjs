# ITE_Nextjs 專案總結

> 整理日期：2026-11-12
> 相關文件：[URL_DOCUMENTATION.md](./URL_DOCUMENTATION.md)（全站 164 個路由逐個說明）

---

## 一、專案簡介

呢個係香港補習／培訓機構 **宏業教育中心 InnoTrendEDU（ITE）** 嘅官方網站（域名 `ite.edu.hk`），係一個集 **內容網站 + 課程電商 + 內部營運系統** 於一身嘅全端 Next.js 應用。賣嘅係 IT 培訓課程，唔係實體商品。

**課程類型：**

| 類型 | 說明 |
|---|---|
| 公開課程（`Course`） | AI、Python、Web 全棧、網絡安全、Power BI、Unity VR 等 IT 課程 |
| 特別課程（`specialCourse`） | 獨立優惠課程，含 YouTube 影片、上課日期時段 |
| NITTP 政府資助課程 | 企業報讀可獲學費資助 |
| ERB 課程 | 再培訓課程 |
| 自家課程（Homemade） | 學校／企業包班 |

課程可以轉做「商品」（`Product`）放上商城，支援購物車 + 線上付款（HKD）。網站同時有內容行銷（文章 Posts）、聯絡／投訴表單、導師團隊頁、Google Map、WhatsApp 查詢。

---

## 二、技術棧

| 類別 | 技術 |
|---|---|
| 框架 | Next.js **16**（App Router）、React 19、TypeScript |
| UI | Tailwind CSS 3.4、shadcn/Radix 元件、lucide-react、FullCalendar 6（排堂／日曆）、react-hook-form + zod |
| 資料庫 | **PostgreSQL + Prisma 6**（schema 602 行） |
| 登入 | NextAuth v5 beta + Prisma Adapter，JWT session；username/password（bcryptjs）＋ Google OAuth |
| 金流 | **Stripe Checkout**（card / alipay / wechat_pay / unionpay）+ Stripe Webhook；另有 PayMe（HSBC）整合 |
| Email | Nodemailer + Gmail SMTP（訂單確認）；Resend（忘記密碼、投訴表單） |
| 檔案儲存 | 阿里雲 OSS（ali-oss）：課程教材、商品圖、文章圖片／影片 |
| 其他 | xlsx（CSV 匯入匯出）、jsPDF + html2canvas（PDF 單據）、GA4／GTM／Google Ads／Meta Pixel 追蹤、Google Maps、WhatsApp 浮動按鈕 |
| 部署 | 自架 VPS／cPanel（`next start -p 3099`、`.htaccess`、Let's Encrypt 憑證、next-sitemap） |

---

## 三、角色與功能分區

系統分 **三個角色**，由 `middleware.ts` 依 `session.user.role` 導向對應專區：

### 🌐 公開網站（訪客）
- `/` 首頁即課程商城（分類／搜尋／篩選／加入購物車）
- `/shop/[shopId]` 商品詳情、`/specialCourse/[specialCourseId]` 特別課程詳情
- `/Posts` 文章系統（SEO metadata + 相關課程推薦）
- `/about`、`/core`（核心課程體系）、`/ourteam`（導師團隊）
- `/Contactus`（聯絡表單）、`/complaintFrom`（投訴表單）
- `/login`、`/register`、`/forgot-password`、`/reset-password`

### 👤 學員專區 `/user/[userId]/...`
- Dashboard：個人資料 + 帳目紀錄（日期篩選）
- 商城、購物車（「心儀課程」）、Checkout → Stripe 付款 → 付款成功頁
- 我的課程列表（一般 + 特別課程）、FullCalendar 課程日曆
- 帳目（半成品）、證書列表（半成品）、訂單確認（佔位頁）

### 🧑‍🏫 老師專區 `/teacher/[Teacherid]/...`
- 日曆（FullCalendar）+ **出席打卡**（出席／缺席／遲到／請假）
- 建立／編輯自己嘅課程、上傳教材到 OSS（20MB 上限）
- 課程總時數報表（依年／月）、假期管理

### 🛠️ 管理後台 `/admin/...`
- **Dashboard**：用戶／課程／商品統計、訂單收入（帳目部分硬編碼假資料）
- **商品管理**：垃圾桶／還原／永久刪除（有學生時禁止）
- **課程管理**：FullCalendar 排堂（`ArrangeCourse`：起訖日、星期、教室、時間段、人數上限）
- **特別課程** CRUD（圖片上傳 OSS、影片、真實價格）
- **導師管理**：CRUD + 教材下載
- **用戶管理**：CRUD + CSV 匯入／匯出
- **帳務**：帳目（含老師時薪計算、TXT/Excel/PDF 匯出）、發票（Invoice）、收據（Receipt）
- **字典管理**：科目類型、商品狀態、SEO 關鍵字（HeaderType）
- **課程資料**：ERB／NITTP／Homemade 資料庫
- **文章管理**：CRUD + 圖片／影片上傳 OSS
- **聯絡表單管理**：狀態流（待處理／已回覆／已關閉）+ 回覆

---

## 四、核心業務流程：付款

```
學員購物車 → /user/[userId]/checkout（選支付方式）
  → POST /api/CheckoutSessions（建立 Stripe Checkout，unit_amount = real_price × 100）
  → Stripe 付款 → 跳回 /user/[userId]/success?session_id=...
  → POST /api/handle-payment-success
      1. 向 Stripe 驗證 payment_status === 'paid'
      2. 建立 Accounts（帳目）+ Invoice（發票）+ Order（訂單）
      3. 將學員加入課程（addStudentToAllCourses）
      4. 清空購物車
      5. 用 Gmail 寄訂單確認信 + 公司通知信
  → Stripe Webhook（/api/webhooks/stripe，簽章驗證）
      建立 GroupMember、清除購物車項目
  → 後台可手動將 Invoice 標記已付（Change-IsPay）→ 自動生成 Receipt
```

另有 **PayMe（HSBC）** 備用整合：`/api/payme/create`（HMAC 簽名建立訂單）→ `/api/payme/callback`（狀態回調）。

---

## 五、資料模型重點（Prisma）

| 實體 | 說明 |
|---|---|
| `User` | 角色 USER／ADMIN／TEACHER；username/password/email/phone/address/hourlyRate、教師假期 |
| `Course` | 課程主檔：courseCode、schoolName、日期陣列 Coursedates、時數、teacherId、Students、classroom、weekday |
| `CourseTimeRange` | 課程時段（上午／下午／晚上／全日 + 起訖時間） |
| `CourseModul` | 教材（OSS URL） |
| `Attendance` | 出席記錄（PRESENT／ABSENT／LATE／EXCUSED） |
| `specialCourse` | 特別課程（價格、圖片／影片 URL JSON、日期、學生） |
| `Product` | 商城商品：price/real_price、分類／狀態、關聯 Course 或 specialCourse、isTrash 垃圾桶 |
| `Cart` / `CartItem` | 購物車 |
| `Order` / `OrderItem` | 訂單（PENDING／PAID，paymentId 存 Stripe session id） |
| `Accounts` / `Invoice` / `Receipt` | 帳目／發票／收據 |
| `PostAdmin` | 文章 |
| `ContactMessage` | 聯絡表單 |
| `ERB` / `NITTP` / `Homemade` | 課程資料字典 |
| `GroupUser` / `GroupMember` / `Certigificate` | 班組與證書 |

**關聯重點**：`Product.courseId → Course` 與 `Product.specialCourseId → specialCourse` 為可選關聯；購物車／訂單明細都指向 Product；付款成功會建立 GroupMember 將學生加入課程。

---

## 六、外部服務（環境變數）

| 服務 | 用途 |
|---|---|
| PostgreSQL（`DATABASE_URL`） | 主資料庫 |
| NextAuth（`AUTH_SECRET`、`GOOGLE_CLIENT_ID/SECRET`） | 認證 |
| Stripe（`STRIPE_SECRET_KEY`、`STRIPE_SECRET_WEBHOOK_KEY`、`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`） | 線上付款 |
| PayMe（`PAYME_API_URL`、`PAYME_CLIENT_ID`、`PAYME_SECRET_KEY`、`PAYME_SIGNING_KEY`） | 備用付款 |
| 阿里雲 OSS（`OSS_REGION`、`OSS_ACCESS_KEY_ID`、`OSS_ACCESS_KEY_SECRET`、`OSS_BUCKET`） | 檔案儲存 |
| Gmail SMTP（`GMAIL_USER`、`GMAIL_APP_PASSWORD`） | 訂單確認信 |
| Resend（`RESEND_API_KEY`） | 忘記密碼／投訴電郵 |
| GA4／GTM／Google Ads／Meta Pixel | 追蹤與廣告轉換 |

---

## 七、程式碼規模

- 約 **346** 個 TS/TSX 檔、**102** 個頁面、**62** 條 API route、**93** 個 server action 檔
- 路由結構：公開頁 22 + 學員 14 + 教師 15 + 管理後台 51 + API 62 = **164 個 URL**（詳見 URL_DOCUMENTATION.md）

---

## 八、已知問題 ⚠️

1. **API 授權不完整（最嚴重）**：超過一半嘅 `/api/*` 路由冇 session／role 檢查，例如 `GET /api/user/Get_User_Lists`（回傳所有用戶連密碼欄位）、`GET /api/user/Export_Users`（任何人可下載全部用戶 CSV）、`DELETE /api/product/delete/[id]`、`POST /api/user/Import_Users`（預設密碼 default123）。只有少數 route（如 `Update_Course`、`user/delete`）有檢查。
2. **重複／殘留程式碼**：
   - 重複路由：`Edit_User` vs `Edit_Users`、`Delete_User` vs `delete`
   - 兩個 PrismaClient 實例（`lib/db.ts` 與 `lib/prisma.ts`）
   - 大量被註解嘅舊版實作（如 `/user/[userId]/success` 頁）
   - PayMe 部分舊程式碼已註解，屬殘留／備用
3. **密碼安全隱患**：`PUT /api/user/Edit_Users/[id]` 嘅密碼未經 bcrypt 雜湊即寫入資料庫。
4. **半成品／佔位頁面**（約 10 個）：`/user/[userId]/Accounts`、`/user/[userId]/CertificateList`（對應 API 唔存在）、`/user/[userId]/order-confirmation/[orderId]`、`/user/[userId]/cancel`、`/admin/Calendar`、`/admin/DataLists` 三個列表頁、`/teacher/[Teacherid]/TypesLists/[TypesId]`、`/hide/createadmin`
5. **疑似 bug**：`/admin/InvoiceLists/[invoicebyId]`、`/admin/ReceiptLists/[Receiptbyid]`、`/admin/SpecialCourseLists/[SpecialCourseId]` 動態參數資料夾名與程式讀取名大小寫不一致。
6. **雜項**：admin Dashboard 帳目區塊硬編碼 3 筆假 Stripe 資料；`next.config.ts` 有無效 key（`turbo: false`）；`README.md` 其實係粵語開發日誌，唔係說明文件。

---

## 九、一句總結

**呢個係一個香港 IT 培訓機構嘅一站式網站：對外係課程商城 + 內容行銷網站（支援 Stripe／PayMe 付款），對內係學員／老師／管理員三種角色嘅完整營運系統（排堂、出席打卡、帳務、發票收據、文章與用戶管理）。**

主要待改善方向：**API 層授權**（安全）、清理重複路由與殘留程式碼、補完半成品頁面。
