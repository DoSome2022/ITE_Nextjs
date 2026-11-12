# ITE_Nextjs 路由（URL）完整說明文件

> 香港培訓機構「宏業教育中心 InnoTrendEDU（ITE）」官方網站的路由總覽。
> 最後整理日期：2026-11-12
>
> - 頁面（page.tsx）共 **105** 個，API 路由（route.ts）共 **65** 條。
> - Next.js App Router 的 route group 括號（`(admin)`、`(user)`、`(teacher)`、`(hide)`）**不會**出現在 URL 中。
> - 動態路徑參數說明：`[userId]` = 學員 ID、`[Teacherid]` = 教師 ID、`[id]`/`[courseId]`/`[ProductId]` 等 = 各實體資料庫 ID。
> - ⚠️ 標記表示該路由沒有做 session / 角色（role）檢查，任何人都可直接呼叫。

---

## 一、公開頁面（訪客可瀏覽）

| URL | 用途說明 |
|---|---|
| `/` | 首頁即課程商城，伺服器預載課程分類與最新 9 件商品後交由 ShopPage 元件展示，讓訪客瀏覽、搜尋並加入購物車。 |
| `/about` | 關於我們頁，介紹 InnoTrendEDU 理念、ITE 核心價值、NITTP 50% 資助優勢、核心課程體系與導師團隊，並附 Google 地圖與頁尾。 |
| `/core` | 核心課程體系總覽頁，以靜態資料詳列網絡安全、AI、數據分析、Python、Web、VR 等 20 門企業課程及 NITTP 資助申請步驟，供企業與個人了解培訓方案。 |
| `/ourteam` | 專業導師團隊頁，說明「why ITE」理念並透過 Teacher 元件（含手機輪播）展示各導師的資歷與專業背景。 |
| `/Contactus` | 聯絡我們頁，提供姓名、電話、電郵、感興趣產品、聯絡類型與詳情表單，提交至 `/api/contact` 後顯示成功並返回首頁。 |
| `/complaintFrom` | 投訴表格頁，收集稱謂、個人資料、地址及投訴性質（網頁、客服、收費、國安法等），POST 到 `/api/send-complaint-email` 寄送投訴電郵。 |
| `/HeaderTypesShop` | 課程商店頁，從資料庫讀取課程分類後渲染 ShopPage（未預載商品，由前端自行載入），並以分類名稱產生 SEO metadata。 |
| `/Posts` | 最新文章列表頁，透過 getPostAdmins server action 取得最近 20 篇文章，以卡片網格顯示圖片、標題、副標、作者與日期並連結至詳情頁。 |
| `/Posts/[id]` | 文章詳情頁，以 getPostAdminById 載入文章並動態產生 SEO/OG metadata，顯示標題、作者、更新時間、HTML 內文、相關課程、YouTube 影片與圖片，找不到文章時回 404。 |
| `/shop/[shopId]` | 課程商品詳情頁，呼叫 `/api/product/Get_Product_Lists_by_ID` 顯示價格、上課日期時間、適合人士、課程目標、實戰場景、參考文章與課程影片，登入後可報名加入購物車（未登入導向 /login）。 |
| `/specialCourse/[specialCourseId]` | 優惠課程詳情頁，呼叫 `/api/SpecialCourse/Get_SpecialCourse_by_ID` 顯示課程代碼、學校、天數、教師、課室與時間，並透過 addSpcialCourseToCart server action 加入購物車。 |
| `/login` | 學生登入頁，提供帳號密碼（serverLogin server action）及 Google 登入，登入後依 session 角色（USER/TEACHER/ADMIN）或 callbackUrl 導向對應頁面，並含忘記密碼與註冊連結。 |
| `/register` | 學生註冊頁，使用 CreateUserForm_client 填寫登入帳號、姓名、密碼與電話，呼叫 CreateUserAction 建立 USER 帳號後跳轉 /login。 |
| `/forgot-password` | 忘記密碼頁，輸入電郵後 POST `/api/auth/forgot-password` 請求發送重置密碼連結，並以 toast 顯示成功或錯誤訊息。 |
| `/reset-password` | 重置密碼頁，從網址讀取 token，輸入並確認新密碼後 POST `/api/auth/reset-password`，成功後自動導向 /login。 |
| `/privacy-policy` | 私隱政策頁，以英文靜態內容說明資料收集、使用、分享、安全及聯絡方式，並顯示最後更新日期與頁尾。 |
| `/hide/createadmin` | 隱藏的管理員建立頁，原本的 CreateAdminForm 已被註解停用，目前僅渲染空白容器（預留功能）。 |
| `/payme/success` | PayMe 付款成功回跳頁，以 Suspense 包裹客戶端元件，依 orderId 查詢訂單確認已付款後導向用戶訂單頁，否則回結帳頁。 |
| `/payme/failure` | PayMe 付款失敗頁，載入時彈出錯誤 toast 並自動重新導向結帳頁供用戶重試。 |
| `/api/payme/success` | 位於 api 目錄下的付款成功結果頁（page.tsx 而非 API route），以 server component 顯示「支付成功」及 orderId。 |
| `/api/payme/failure` | 位於 api 目錄下的付款失敗結果頁，顯示「支付失敗」訊息、訂單編號與返回重試按鈕。 |
| `/api/payme/test` | PayMe 支付測試工具頁，提供 0.81 成功、0.80 過期、0.44/0.45 伺服器錯誤、0.77 失敗等金額情境或自訂金額，呼叫 `/api/payme/create` 並另開視窗前往 paymentUrl，同時顯示 API 回應。 |

---

## 二、學員專區（`/user/[userId]/...`，需登入）

| URL | 用途說明 |
|---|---|
| `/user/[userId]` | 學員個人主頁，顯示學生基本資料（ID、帳號、姓名、電郵、電話、角色）及帳目記錄表格，支援日期區間篩選與清除，並提供前往日曆與課程列表的捷徑；以 useSession 檢查本人身分，資料來自 `/api/user/Get_User_Lists_by_Id` 與 `/api/Accounts/Get_Accounts_Lists_by_User`。 |
| `/user/[userId]/shop` | 課程商店頁，以 Hero 宣傳區加上課程商品列表，支援關鍵字搜尋（標題/描述）及類型、狀態核取方塊篩選，只顯示公開、非 specialCourse、非垃圾桶的商品；未登入點擊商品會提示並導向登入頁。 |
| `/user/[userId]/shop/[productsId]` | 課程商品詳情頁，顯示課程標題、描述、價格、開課/結束/上課日期與時間、適合人士、課程目標、實戰場景、參考文章及 YouTube 課程影片，按「報名及付款」呼叫 addToCart server action 後跳轉購物車；主圖區塊目前被註解停用。 |
| `/user/[userId]/cart` | 心儀課程（購物車）頁，透過 getCart server action 載入項目並顯示課程與價格，支援以 removeFromCart 移除項目及「前往結帳」跳轉結帳頁。 |
| `/user/[userId]/checkout` | 結帳頁，顯示訂單摘要與總計，提供信用卡、支付寶、微信支付、銀聯等支付方式選擇，提交至 `/api/CheckoutSessions` 取得 Stripe sessionId 後以 stripe.redirectToCheckout 導向付款流程。 |
| `/user/[userId]/success` | 支付成功頁，以 session_id 呼叫 `/api/handle-payment-success` 驗證付款並建立訂單，顯示訂單編號與付款金額，再以 addStudentToAllCourses server action 將學員加入已購課程，並提供查看課程／訂單詳情的連結；檔內保留大量舊版註解程式碼。 |
| `/user/[userId]/cancel` | 付款取消頁，內容僅有一個返回首頁的連結，沒有其他取消處理或提示邏輯，屬半成品佔位頁。 |
| `/user/[userId]/CourseLists` | 我的課程列表頁，合併普通課程（`/api/user/Get_User_Courses`）與特殊課程（`/api/user/Get_User_Lists_by_Id`）顯示，支援依名稱、代碼、學校搜尋及每頁 10 筆分頁，並連結至各課程詳情頁。 |
| `/user/[userId]/CourseLists/[courseId]` | 普通課程詳情頁，以 `/api/Course/Get_Course_Lists_by_Id` 讀取並唯讀顯示課程代碼、學校、描述、教師、類型、上課日期、開始/結束日期、天數、時數、時間範圍與教室；檔案前半段有整段被註解掉的舊版實作。 |
| `/user/[userId]/CourseLists/SCourse/[specialcourseId]` | 特殊課程（specialCourse）詳情頁，以 `/api/SpecialCourse/Get_SpecialCourse_by_ID` 顯示與普通課程詳情相近的唯讀資訊（時間範圍改用 SpecialCourseTimeRanges），版面與普通課程詳情頁幾乎相同。 |
| `/user/[userId]/Calendar` | 我的日曆頁，以 FullCalendar 月曆呈現學員已報讀課程的上課日期與時間，將 Coursedates 與 CourseTimeRanges 轉成事件（缺時間時預設 09:00-17:00 或晚上 18:00-21:00），可返回課程列表；事件導覽 URL 被註解，點擊事件不會跳轉。 |
| `/user/[userId]/Accounts` | 帳目頁，僅 fetch `/api/Accounts/Get_Accounts_Lists` 並印出 console.log，畫面只顯示「AccountsListsPage」文字，屬明顯未完成的佔位頁。 |
| `/user/[userId]/CertificateList` | 我的證書頁，含登入與本人身分檢查，fetch `/api/user/${userId}/certificates` 後以卡片列表顯示證書名稱與發證日期，無其他互動功能。 |
| `/user/[userId]/order-confirmation/[orderId]` | 訂單確認頁，目前只渲染「OrderConfirmationPage」文字，屬佔位頁；以 db.order.findUnique 查詢訂單及顯示明細的完整邏輯整段被註解，尚未實作。 |
| `/user/[userId]/orders` | 學員購買記錄頁（2026-11 新增）：訂單式列表，顯示購買日期、訂單編號、總額、付款狀態，可展開睇每堂課嘅課程明細（老師/地點/日期/時間）並連結課程詳情；支援搜尋、狀態篩選、分頁。資料來自 `/api/Orders/Get_Orders_by_User/[id]`。 |
| `/user/[userId]/orders/[orderId]` | 訂單詳情頁（2026-11 新增）：顯示訂單編號、購買日期、交易參考、狀態、總額及各項商品嘅購買價與課程資料（學校/課室/老師/上課日期/時間段）；此路由令付款成功頁原本失效嘅「查看訂單詳情」連結復活。 |

---

## 三、教師專區（`/teacher/[Teacherid]/...`，角色 TEACHER）

| URL | 用途說明 |
|---|---|
| `/teacher/[Teacherid]` | 教師後台首頁，顯示「歡迎，教師 {TeacherId}」與五個功能卡片連結（帳戶管理、日曆、課程列表、教學材料、課程類型），純導覽儀表板、無資料載入，且為 client component 無 metadata。 |
| `/teacher/[Teacherid]/Accounts` | 名稱雖為「帳戶管理」，實際是「教師課程總時數」報表：依年/月查詢 `/api/Course/Get_Courses_By_Teacher`，展開課程日期列出時間並加總時數，頁面名稱與功能不符。 |
| `/teacher/[Teacherid]/calendar` | 教師月曆（FullCalendar，zh-tw）：紅=假期、藍=未出席、綠=已出席，點課程事件可切換出席打卡（POST attendance API），另含假期列表刪除（DeleteHolidayAction）與加入假期入口。 |
| `/teacher/[Teacherid]/calendar/AddHolidays` | 新增教師假期頁，渲染 CreateTeacherHolidayForm 表單並提供返回日曆連結。 |
| `/teacher/[Teacherid]/calendar/[teacherholidaysid]/EditHolidays` | 編輯教師假期頁，渲染 EditTeacherHolidayForm；頁面本身未使用 teacherholidaysid 參數（交由表單自行取得），含返回連結。 |
| `/teacher/[Teacherid]/CourseLists` | 教師課程列表：呼叫 `/api/user/teacher/[id]/CourseLists` 並依 teacherId 過濾，卡片顯示課程代碼、開始日期、描述與「已上架」(Producted) 標記，可連結詳情與建立課程。 |
| `/teacher/[Teacherid]/CourseLists/CreateCourse` | 建立課程頁，僅渲染 CreateCourseTeacherForm 表單與返回連結。 |
| `/teacher/[Teacherid]/CourseLists/[CourseId]` | 課程詳情頁：呼叫 `/api/Course/Get_Course_Lists_by_Id/[CourseId]`，唯讀顯示基本資訊、課程細節、教師資訊與其他欄位，並連到修改課程頁。 |
| `/teacher/[Teacherid]/CourseLists/[CourseId]/edit` | 編輯課程頁，渲染 EditCourseTeacherForm 表單，含返回課程詳情連結。 |
| `/teacher/[Teacherid]/TeachingMaterialsLists` | 教學材料（CourseModul）列表：呼叫 `/api/Course/Get_CourseModul_Lists` 並依 TeacherId 過濾，以卡片顯示標題/描述，可進入詳情或建立教材。 |
| `/teacher/[Teacherid]/TeachingMaterialsLists/CreateTeachingMaterials` | 建立教學材料頁，僅渲染 Create_CourseModul_Form，無標題與返回導覽，屬極簡包裝頁。 |
| `/teacher/[Teacherid]/TeachingMaterialsLists/[MaterialId]` | 教材詳情頁：取得 CourseModul 資料並以 OSS 簽名 URL 提供檔案下載，可經 `/api/delete/delete-teaching-material` 刪除教材後導回列表（原本的上傳/更新檔案功能已被註解停用）。 |
| `/teacher/[Teacherid]/TypesLists` | 科目/類型列表：呼叫 `/api/Type/Get_Type_Lists` 列出所有 typename（未依教師過濾），提供「建立科目」按鈕，但編輯連結已被註解、功能偏簡化。 |
| `/teacher/[Teacherid]/TypesLists/CreateTypes` | 建立科目頁，渲染 CreateTypeForm 表單並提供返回列表連結。 |
| `/teacher/[Teacherid]/TypesLists/[TypesId]` | 佔位頁（半成品）：僅渲染「Types Lists」標題，未使用 TypesId、無任何資料載入或功能。 |

---

## 四、管理後台（`/admin/...`，角色 ADMIN）

### 儀表板與帳務

| URL | 用途說明 |
|---|---|
| `/admin` | 管理儀表板：以 server action getDashboardStats 顯示總用戶/教師/管理員統計，並依年份/月份篩選訂單數與收入、列出帳目記錄（帳目為寫死的模擬 Stripe 付款資料，部分佔位）。 |
| `/admin/Accounts` | 帳目與教師課程薪資管理：左側顯示帳目記錄並支援 TXT/Excel/PDF 匯出，右側依教師/月份/年份篩選課程、以時薪計算薪資小計，並有新增帳目連結。 |
| `/admin/Accounts/createBill` | 新增帳目頁，掛載 CreateBillForm 建立帳單表單。 |
| `/admin/InvoiceLists` | 單據（發票）列表：取得 `/api/Invoice_Lists` 以卡片顯示標題、服務類型、學生姓名與付款狀態，連往建立與詳情頁。 |
| `/admin/InvoiceLists/createInvoice` | 建立發票頁，掛載 Invoice_Create_Form。 |
| `/admin/InvoiceLists/[invoicebyId]` | 發票詳情：顯示學生/服務/價格/付款狀態、內容與付款方式，可用 server action IsPay_Change_Action 標記已付款（程式讀取的參數名 InvoicebyID 與資料夾大小寫不符，疑似 bug）。 |
| `/admin/ReceiptLists` | 收據列表：取得收據（含付款狀態）與補單（Void）兩份資料，收據卡片可點入詳情，補單僅列出標題與價錢。 |
| `/admin/ReceiptLists/[Receiptbyid]` | 收據詳情：依 ID 取得收據並顯示標題、服務類型、收據編號、學生、價錢與付款方法（參數名 ReceiptbyID 與資料夾大小寫不符）。 |
| `/admin/AdminLog` | 「Admin Log」總覽頁：取得用戶、課程、發票資料以表格呈現（用戶與教師分開），支援搜尋及 XLSX 匯出；實質為列表匯總而非操作稽核日誌。 |

### 商品、課程與特別課程

| URL | 用途說明 |
|---|---|
| `/admin/CourseStatus` | 全課程狀態頁（2026-11 新增）：表格列出普通 + 特別課程嘅時間、地點、老師、學生數（已付款/名單/上限）、價錢（多商品顯示範圍）、上課/下課時間、課程狀態（未開始/進行中/已完結）；7 日內付款嘅新學生有綠色標記，可展開睇學生名單（首次/最近付款）及商品價格明細；支援搜尋、類型/狀態篩選、只看有新生/已滿、分頁。資料來自 `/api/Admin/Get_Course_Status`（ADMIN only）。 |
| `/admin/ProductLists` | 產品管理：分「產品/特別產品/垃圾桶」三個 Tab，支援關鍵字搜尋、類型/狀態多選篩選、價格排序，卡片可移至垃圾桶、還原、永久刪除（課程有學生時禁止）並有確認對話框。 |
| `/admin/ProductLists/CreateProduct` | 建立產品頁，掛載 Create_Product_Form。 |
| `/admin/ProductLists/[ProductId]` | 產品詳情：顯示標題、描述、參考文章（網址自動連結化）、價格/實際價格、公開狀態、類別、時間與圖片，並連往編輯頁。 |
| `/admin/ProductLists/[ProductId]/edit` | 編輯產品頁，掛載 EditProductForm。 |
| `/admin/CourseLists` | 課程列表（排堂）：搜尋＋分頁＋手風琴分組顯示一般/特殊課程的日期、教師、教室、時間與學生，並以 FullCalendar 月曆呈現課程（藍）與教師休假（橙）事件。 |
| `/admin/CourseLists/edit` | 課程編輯頁，掛載 Edit_Course_Form_Calendar 以日曆方式編輯課程。 |
| `/admin/CourseLists/[courseId]/Edit` | 單一課程編輯頁，掛載 EditAdminCourseForm 表單。 |
| `/admin/CourseLists/ArrangeCourse` | 安排課程頁：選擇課程後設定起訖日、星期、教室、時間段與人數上限，透過互動月曆點選/拖放上課日期，PATCH 更新課程，並可據此建立商品。 |
| `/admin/SpecialCourseLists` | 特殊課程列表：卡片顯示課程代碼、學校、天數、學生數/上限（已滿標記）、日期、教師與課室等，支援編輯、查看細節及確認後永久刪除（server action deleteSpecialCourse）。 |
| `/admin/SpecialCourseLists/createSpecialCourse` | 建立特別課程頁，掛載 CreateSpecialCourseForm。 |
| `/admin/SpecialCourseLists/[SpecialCourseId]` | 特殊課程詳情：取得單一課程顯示完整資料與時間範圍，並有「加入圖片/照片」連結（元件讀取的參數名 specialCourseId 與資料夾 SpecialCourseId 不符，疑似 bug）。 |
| `/admin/SpecialCourseLists/[SpecialCourseId]/edit` | 編輯特殊課程媒體與價格：上傳圖片至 OSS（uploadImageToOSS）、設定影片網址與真實價格，zod 驗證後呼叫 updateSpecialCourse。 |

### 課程資料字典（ERB / NITTP / 自家課程）

| URL | 用途說明 |
|---|---|
| `/admin/DataLists` | 課程資料列表導覽頁，提供自家課程、NITTP、ERB 三個課程資料庫的入口連結。 |
| `/admin/DataLists/ERBLIsts` | ERB 課程列表頁：有抓取 `/api/ERB/Get_ERB_Lists` 但只顯示標題與「建立ERB課程」連結，資料未呈現（半成品；資料夾名 ERBLIsts 亦與連結 ERBLists 大小寫不符）。 |
| `/admin/DataLists/ERBLIsts/CreateERB` | 建立 ERB 課程頁，掛載 Create_ERB_Form。 |
| `/admin/DataLists/NITTPLists` | NITTP 課程列表頁：抓取資料但僅顯示「NITTPListsPage」文字與建立連結，列表未實作（佔位頁）。 |
| `/admin/DataLists/NITTPLists/CreateNITTP` | 建立 NITTP 課程頁，掛載 Create_NITTP_Form。 |
| `/admin/DataLists/SchoolCourseLists` | 自家課程列表頁：抓取 `/api/Homemade/Get_Homemade_Lists` 但只顯示文字與建立連結，且連結指向不存在的 CreateHomemadeCourse（半成品）。 |
| `/admin/DataLists/SchoolCourseLists/CreateSchoolCourse` | 建立自家課程頁，掛載 Create_Homemade_Form。 |

### 字典管理（類型 / 狀態 / 關鍵字）

| URL | 用途說明 |
|---|---|
| `/admin/TypeLists` | 類型列表：支援以類型名稱或作者搜尋、分頁、編輯連結與刪除（server action deleteType）。 |
| `/admin/TypeLists/CreateType` | 建立類型頁，掛載 CreateTypeForm_admin。 |
| `/admin/TypeLists/EditType/[id]` | 編輯類型：載入單一類型後修改名稱與作者，呼叫 updateType 後返回列表。 |
| `/admin/StatueLists` | 狀態列表：支援搜尋、分頁與刪除（server action deleteStatue）。 |
| `/admin/StatueLists/CreateStatue` | 建立狀態頁，掛載 CreateStatueForm。 |
| `/admin/HeaderTypeLists` | 關鍵字（HeaderType）列表：支援搜尋、分頁與刪除（server action deleteHeaderType）。 |
| `/admin/HeaderTypeLists/CreateHeaderType` | 建立關鍵字頁，掛載 CreateHeaderTypeForm。 |

### 用戶、教師與聯絡表單

| URL | 用途說明 |
|---|---|
| `/admin/UserLists` | 用戶列表：搜尋與分頁外支援 CSV 匯入（Import_Users）與匯出（Export_Users），可建立、編輯、刪除用戶（含確認對話框）。 |
| `/admin/UserLists/createUser` | 建立用戶頁，掛載 CreateUserForm。 |
| `/admin/UserLists/[userId]` | 用戶詳情：顯示用戶 ID、用戶名、姓名、角色與建立/更新時間，提供返回與編輯連結（Email/電話等欄位被註解隱藏）。 |
| `/admin/UserLists/[userId]/edit` | 編輯用戶資料：可改用戶名/姓名/Email/電話/角色/密碼（留空不改）/地址，PUT `/api/user/Edit_Users/[id]` 後返回詳情。 |
| `/admin/TeacherLists` | 教師列表（篩選 role=TEACHER）：顯示姓名/電郵，提供詳情、編輯與刪除（DELETE `/api/user/Delete_User`）含確認對話框。 |
| `/admin/TeacherLists/CreateTeacher` | 建立教師頁，掛載 Create_Teacher_Form。 |
| `/admin/TeacherLists/[TeacherId]` | 教師資料詳情：顯示帳號/電話/角色/假期/教材下載/地址/時薪，提供編輯與刪除（含確認對話框與錯誤提示）。 |
| `/admin/TeacherLists/[TeacherId]/edit` | 編輯教師資料：可改用戶名/姓名/Email/電話/地址/時薪，以 PUT `/api/user/Edit_User/[id]` 儲存後返回詳情。 |
| `/admin/ContactMessages` | 聯絡表單管理列表：統計卡片、狀態篩選（待處理/已回覆/已關閉）、搜尋與分頁，可查看詳情及刪除（含確認對話框）。 |
| `/admin/ContactMessages/[messageId]` | 聯絡表單詳情：顯示聯絡人資料、產品類型與詳細內容，可切換狀態並儲存管理員回覆（PUT `/api/contact/[id]`）。 |
| `/admin/ContactMessages/[messageId]/edit` | 編輯聯絡表單：可修改稱名/電話/電郵/類型/狀態/內容/回覆，送出後返回詳情頁。 |

### 文章與其他

| URL | 用途說明 |
|---|---|
| `/admin/PostLists` | 文章管理（Server Component）：以 getPostAdmins 分頁/搜尋取得文章，交由 PostListClient 呈現。 |
| `/admin/PostLists/new` | 建立新文章頁：先以 auth() 驗證 ADMIN 角色（否則 redirect），再掛載 PostFormClient。 |
| `/admin/PostLists/[id]` | 文章詳細資料頁：以 getPostAdminById 取得文章（含圖片/影片/作者/相關課程），不存在則 notFound，交給 PostDetailClient。 |
| `/admin/PostLists/[id]/edit` | 編輯文章頁：取得文章後以 PostEditClient 編輯。 |
| `/admin/Calendar` | 佔位頁：雖有抓取課程與教師資料，但畫面僅顯示「CalendarPage」文字，FullCalendar 已被註解，未完成。 |

---

## 五、API 路由

### 認證（Auth）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET, POST | `/api/auth/[...nextauth]` | NextAuth 核心 handler，處理登入、登出、session 與 OAuth callback 等認證流程。 | 有（框架本身處理） |
| POST | `/api/auth/forgot-password` | 接收 email，查詢用戶後建立 1 小時有效的 verificationToken 並透過 Resend 寄送重設密碼連結，回傳成功訊息。 | 無（公開端點） |
| POST | `/api/auth/reset-password` | 接收 token 與 password，驗證 token 未過期後以 bcrypt 雜湊更新密碼並刪除 token，回傳結果訊息。 | 無（僅以 token 有效性驗證） |

### 金流（付款）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| POST | `/api/CheckoutSessions` | 接收 items、userId、paymentMethod，驗證格式後依付款方式建立 Stripe Checkout Session，回傳 session id。 | 無 |
| POST | `/api/handle-payment-success` | 接收 sessionId、userId、username，確認 Stripe session 已付款後寫入 Accounts/Invoice/Order、加課、清空購物車並寄通知信，回傳 orderId、GTM 與轉換資料。 | 有（session.user.id 必須等於傳入 userId，無 role 檢查） |
| POST | `/api/webhooks/stripe` | 以 Stripe webhook secret 驗證簽名，於 checkout.session.completed 時依產品對應課程建立 groupMember 並清除購物車項目，回傳 received。 | 有（Stripe 簽名驗證） |
| POST | `/api/payme/create` | 接收 userId、amount、description、items，建立訂單與訂單項目、呼叫 PayMe API（含 HMAC 簽名與重試）並更新 paymentId，回傳 paymentUrl、orderId、paymentId。 | 無 |
| POST | `/api/payme/callback` | 接收 paymentId、status，依 paymentId 找到訂單並更新為 paid/failed，回傳 acknowledged。 | 無（未驗證簽名或來源） |
| GET | `/api/paymentMethods` | 取得全部付款方式價格（PaymentMethods_price）並回傳。 | 無 |
| GET | `/api/cart_success` | 以 auth() 取得登入 session 後呼叫 getCart()，回傳目前購物車的 id（未登入回 401、無購物車回 404）。 | 有（需登入 session） |
| GET | `/api/Cart/Get_Cart_Items_by_UserId/[id]` | 依路徑 id 查詢 user 並 include Cart（exclude password），回傳該用戶與其購物車資料（找不到回 404）。 | 有（本人或 ADMIN） |
| GET | `/api/Orders/Get_Orders_by_User/[id]` | 2026-11 新增：依路徑 id 回傳該用戶全部訂單（含 OrderItem、Product、關聯 Course/specialCourse 摘要：時間/地點/老師），依購買日期倒序。 | 有（本人或 ADMIN；UUID 驗證） |
| GET | `/api/Orders/Get_Order_by_Id/[orderId]` | 2026-11 新增：回傳單一訂單完整詳情（含課程 description、交易參考 paymentId）。 | 有（訂單本人或 ADMIN；404/403 分開） |

### 商品（Product）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET | `/api/product/Get_Product_Lists` | 取得全部產品（含課程、圖片、影片、特殊課程），並將類型/狀態 ID 陣列轉成名稱陣列後回傳。 | 無 |
| GET | `/api/product/Get_Product_Lists_by_ID/[id]` | 依路徑 id 查詢單一產品並 include Course（含時間段）、圖片、影片，回傳商品資料（找不到回 404）。 | 無 |
| GET | `/api/product/openinganswer` | 以 db.product.findMany() 直接取得全部產品（無任何篩選）並回傳。 | 無 |
| DELETE | `/api/product/delete/[id]` | 依路徑 id 以交易硬刪除產品及其購物車項目、訂單項目、時間段、課程日期、圖片、影片，回傳刪除結果。 | 有（ADMIN only） |
| PATCH | `/api/product/move-to-trash/[id]` | 依路徑 id 將產品設為 isTrash=true、IsPublic=false（移到垃圾桶），回傳更新後產品。 | 有（ADMIN only） |
| PATCH | `/api/product/restore-from-trash/[id]` | 檢查產品在垃圾桶後設回 isTrash=false、IsPublic=false，回傳還原後產品。 | 有（ADMIN only） |

### 課程（Course / SpecialCourse / 教材）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET | `/api/Course/Get_Course_Lists` | 接收 typeId、page、pageSize 查詢參數取得課程列表（含時間段、依 createdAt 降冪），設定長效快取標頭後回傳。 | 無 |
| GET | `/api/Course/Get_Course_Lists_by_Id/[id]` | 依路徑 id 查詢單一課程並 include CourseTimeRanges，回傳課程資料（找不到回 404）。 | 無 |
| GET | `/api/Course/Get_CourseModul_Lists` | 取得全部課程模組（含 Courses、Teacher）並回傳。 | 有（TEACHER/ADMIN） |
| GET | `/api/Course/Get_CourseModul_lists_by_Id/[id]` | 依路徑 id 查詢單一課程模組並 include Courses，回傳模組資料（找不到回 404）。 | 有（TEACHER/ADMIN） |
| GET | `/api/Course/Get_Courses_By_Teacher` | 接收 teacherId、year、month 查詢參數，回傳該教師在指定年份月份的課程（含過濾後的 Coursedates 與時間段）。 | 有（TEACHER 本人或 ADMIN） |
| PATCH | `/api/Course/Update_Course/[id]` | 接收經 Zod 驗證的課程更新欄位（日期、時間段、課室、人數上限等），以交易更新課程並重建時間段，回傳更新後課程。 | 有（需為該課教師或 ADMIN） |
| PATCH | `/api/Course/Update_SpecialCourse/[id]` | 接收經 Zod 驗證的特殊課程更新欄位，以交易更新 specialCourse 並重建時間段，回傳更新後課程。 | 有（需為該課教師或 ADMIN） |
| GET | `/api/SpecialCourse/SpecialCourse_Lists` | 取得全部特殊課程（含學生清單與時間段）並回傳。 | 無 |
| GET | `/api/SpecialCourse/Get_SpecialCourse_by_ID/[id]` | 依路徑 id 查詢單一特殊課程（含時間段），加上 no-store 標頭停用快取後回傳。 | 無 |
| POST | `/api/SpecialCourse/Create_SpecialCourse` | 接收 multipart 表單（課程欄位、時間段 JSON、images 等），上傳圖片至 OSS 並以交易建立 specialCourse 與時間段，回傳新課程資料。 | 有（ADMIN only） |
| POST | `/api/delete/delete-teaching-material` | 接收 materialId，刪除對應 OSS 教材檔案與 courseModul 記錄，回傳成功訊息。 | 有（TEACHER/ADMIN，且為教材擁有者或 ADMIN） |
| GET | `/api/Admin/Get_Course_Status` | 2026-11 新增：全課程狀態聚合。一次過查 Course + specialCourse + 已付款 OrderItem，JS 聚合出每課程嘅學生（首/最近付款時間、7 日內新學生標記）、價錢（多商品範圍）、課程狀態、已滿旗標；回傳 meta 統計。 | 有（ADMIN only） |

### 課程資料字典（ERB / NITTP / Homemade / Holiday）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET | `/api/ERB/Get_ERB_Lists` | 取得全部 ERB 記錄並回傳。 | 無 |
| GET | `/api/NITTP/Get_NITTP_Lists` | 取得全部 NITTP 記錄並回傳。 | 無 |
| GET | `/api/Homemade/Get_Homemade_Lists` | 取得全部自家製（Homemade）記錄並回傳。 | 無 |
| GET | `/api/Holiday/Get_TeacherHoliday_Lists` | 取得全部用戶記錄並回傳（作為教師假期列表資料來源；exclude password）。 | 有（TEACHER/ADMIN） |
| GET | `/api/Holiday/Get_TeacherHoliday_Lists_by_Id/[id]` | 依路徑 id 查詢單一 user 記錄並回傳（作為教師假期資料來源；exclude password）。 | 有（本人或 ADMIN） |

### 類型 / 狀態（Type / Status / HeaderType）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET | `/api/Type/Get_Type_Lists` | 取得全部課程科目分類（CourseProductType）並回傳。 | 無 |
| GET | `/api/Type/Get_Type_ById/[id]` | 依路徑 id 查詢單一課程產品類型並回傳（找不到回 404）。 | 無 |
| GET | `/api/Type/Get_HeaderType_Lists` | 取得全部 header 類型（SEO 分類）並回傳。 | 無 |
| GET | `/api/Status/Get_Status_Lists` | 取得全部產品狀態分類（CourseProductStatus）並回傳。 | 無 |

### 帳務（Accounts / Invoice / Receipt）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET | `/api/Accounts/Get_Accounts_Lists` | 取得全部帳戶記錄（Accounts）並回傳。 | 有（ADMIN only） |
| GET | `/api/Accounts/Get_Accounts_Lists_by_User/[id]` | 依路徑 id 以 client_id 查詢該用戶的所有帳戶記錄，回傳陣列（無資料回 404）。 | 有（本人或 ADMIN） |
| GET | `/api/Invoice_Lists` | 取得全部發票記錄（Invoice）並回傳。 | 有（ADMIN only） |
| GET | `/api/Reaceipt_Lists` | 取得全部收據記錄（Receipt）並回傳。 | 有（ADMIN only） |

### 用戶管理（User）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET | `/api/user/Get_User_Lists` | 取得全部用戶記錄（exclude password 敏感欄位）並回傳。 | 有（ADMIN only） |
| GET | `/api/user/Get_User_Lists_by_Id/[id]` | 依路徑 id 查詢單一用戶並 select CourseModul、specialCourse、Course（exclude password）。 | 有（本人或 ADMIN） |
| GET | `/api/user/Get_User_Courses/[id]` | 依路徑 id 取得該用戶作為教師與學生的所有課程（合併去重），回傳課程陣列。 | 有（需為本人或 ADMIN） |
| GET | `/api/user/Get_Teachers_With_Course` | 查詢角色為 TEACHER 的所有用戶（含其課程清單與 hourlyRate）並回傳。 | 有（ADMIN only） |
| GET | `/api/user/teacher/teacherLists` | 回傳所有用戶的 id、role、username（名為教師列表但未依 role 過濾）。 | 有（ADMIN only） |
| GET | `/api/user/teacher/[teacherId]/CourseLists` | 依 teacherId 確認教師存在後查詢其建立的所有課程（含 CourseModul、依建立時間降冪）並回傳。 | 有（TEACHER 本人或 ADMIN） |
| GET | `/api/user/Export_Users` | 取得全部用戶資料轉成 CSV，以附件 users_export_日期.csv 形式回傳下載。 | 有（ADMIN only） |
| POST | `/api/user/create` | 接收 username、password、phone、name、role，以 Zod 驗證、檢查帳號重複並以 bcrypt 雜湊密碼建立用戶，回傳新用戶資料（201）。 | 有（ADMIN only） |
| POST | `/api/user/Import_Users` | 接收 CSV 檔案，解析後以 username 為鍵更新或建立用戶（新用戶預設密碼 default123），回傳成功/失敗統計與錯誤清單。 | 有（ADMIN only） |
| PUT | `/api/user/Edit_User/[id]` | 接收 name、phone、address、hourlyRate、username、email 並更新指定用戶資料，回傳更新後用戶。 | 有（ADMIN only） |
| PUT | `/api/user/Edit_Users/[id]` | 接收 username、name、email、phone、role、password、address，檢查帳號/電郵重複後更新用戶，回傳更新後用戶（密碼未雜湊即寫入，見 ISSUE-005）。 | 有（ADMIN only） |
| DELETE | `/api/user/Delete_User/[id]` | 檢查用戶存在後刪除其課程模組、特殊課程、課程、購物車、訂單，最後刪除用戶本身並回傳結果。 | 有（ADMIN only） |
| DELETE | `/api/user/delete/[id]` | 以交易刪除指定用戶的所有關聯資料（發票、收據、訂單、課程、群組等）後刪除用戶，回傳成功訊息。 | 有（需 ADMIN，且不可刪除自己） |

### 出席（Attendance，教師用）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| GET, POST | `/api/user/teacher/[teacherId]/attendance` | GET 以 teacherId、courseId、date 查詢出席狀況；POST 接收 action=mark/unmark 以 upsert 或 delete 標記出席，回傳出席狀態與記錄。 | 有（TEACHER 本人或 ADMIN） |
| POST | `/api/user/teacher/[teacherId]/attendance/batch` | 接收 JSON body 的 teacherId 與 dates（courseId 加 date 陣列），批次查詢出席記錄並以 Map 物件回傳。 | 有（TEACHER 本人或 ADMIN） |

### 聯絡 / 投訴（Contact）

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| POST | `/api/contact` | 接收 name、phone、email、productTypes、contactType、otherType、details，驗證必填後建立狀態 PENDING 的聯絡表單，回傳訊息與 id。 | 無（公開表單） |
| GET | `/api/contact-admin` | 接收 status、search、page、limit 查詢參數分頁篩選 contactMessage，回傳 messages 與 pagination 資訊。 | 有（ADMIN only） |
| GET, PUT, DELETE | `/api/contact/[id]` | GET 取得單筆聯絡表單並自動標記已讀、PUT 更新 adminReply/status、DELETE 刪除該表單，皆回傳表單或結果訊息。 | 有（ADMIN only） |
| POST | `/api/send-complaint-email` | 接收 appellation、name、phone、email、address、complaintTypes、complaintOthers，驗證必填後以 Resend 寄送投訴郵件至 info@ite.edu.hk，回傳發送結果。 | 無（公開表單） |

### 檔案上傳 / OSS

| Method(s) | URL | 用途說明 | ⚠️ 權限檢查 |
|---|---|---|---|
| POST | `/api/upload` | 接收 multipart（title、description、TeacherId、originalFileName、file），上傳教材至 OSS 後透過 CreateCourseModulAction 建立課程模組，回傳成功狀態。 | 有（TEACHER/ADMIN；教師限用自己 TeacherId） |
| POST | `/api/oss/get-signed-url` | 接收 objectKey、fileName，產生 1 小時有效的阿里雲 OSS 簽名下載 URL 並回傳。 | 有（需 TEACHER 或 ADMIN） |

---

## 六、注意事項 ⚠️

1. **API 授權狀態（2026-11-12 已補齊大部分）**：除「讀取類公開 API」（商品/課程/分類/字典 GET、聯絡/投訴表單 POST）及用戶決定「金流唔郁」嘅 API（CheckoutSessions、payme、handle-payment-success、stripe webhook）外，其餘 API 已全部加上 session/role 檢查（統一 helper `lib/auth-guard.ts`）。「權限檢查」欄如實反映現況；金流 API 嘅授權強化留待用戶批准後處理。
2. **重複 / 殘留路由**：
   - `DELETE /api/user/Delete_User/[id]` 與 `DELETE /api/user/delete/[id]` 功能重疊（前者無權限檢查，後者有 ADMIN 檢查）。
   - `PUT /api/user/Edit_User/[id]` 與 `PUT /api/user/Edit_Users/[id]` 功能重疊（後者密碼未經 bcrypt 雜湊即寫入，屬安全隱患）。
   - `/api/payme/success`、`/api/payme/failure`、`/api/payme/test` 是頁面檔案放在 api 目錄下的特殊情況。
3. **半成品 / 佔位頁面**：`/user/[userId]/Accounts`、`/user/[userId]/CertificateList`（對應 API 不存在）、`/user/[userId]/order-confirmation/[orderId]`、`/user/[userId]/cancel`、`/admin/Calendar`、`/admin/DataLists/ERBLIsts`、`/admin/DataLists/NITTPLists`、`/admin/DataLists/SchoolCourseLists`、`/teacher/[Teacherid]/TypesLists/[TypesId]`、`/hide/createadmin` 均為未完成或預留頁面。
4. **疑似 bug（動態參數大小寫不符）**：`/admin/InvoiceLists/[invoicebyId]`、`/admin/ReceiptLists/[Receiptbyid]`、`/admin/SpecialCourseLists/[SpecialCourseId]` 的資料夾名與程式內讀取的 params 名稱大小寫不一致，可能導致取參數失敗。
5. **安全性問題**：`GET /api/user/Get_User_Lists` 回傳所有用戶資料（含密碼欄位）；`GET /api/user/Export_Users` 無權限即可下載全部用戶 CSV；`POST /api/user/Import_Users` 無權限即可批次建立用戶（預設密碼 default123）。
