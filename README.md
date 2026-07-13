

14-7-2025

今天完成了teacher 的create CourseModul client side 及 server side的 bug
今天完成了teacher 的create Course client side 及 server side的 bug
今天完成了teacher login 後 的跳頁，及navber 的顯示
明天可能做user login 後頁面，及shop page加入用戶資訊的欄表


15-18-7-2025

是在進行排堂功能的 構思 ,client side及server side 的建立

19-7-2025
完成了整個課堂排堂功能（client side及server side），但是要再進一 步測試 ，

接下來在client side 進行些顯示問題想看看可以進行修改

之後接下來要做payment stripe 要測試 ，及admin page 的各頁面的修改

20－23 －7 －2025

23 -在制作老師, admin 的FullCalendar 顯示問題 并接下來應該繼續進行修改client side 頁面

22 - 老師的假期要轉入model User 中 使用 才是合理使用情況，之後修改了create teacherhoilday 的client side schema serser side function and edit teacherholiday client side schema serser side function

21 - 使用model teacherholiday 來做create teacherhoilday 的client side schema serser side function and edit teacherholiday client side schema serser side function 并在FullCalendar 顯示 以及payment function 成功 但未進行比錢功能測試及修復大部分client side頁面

24－7－2025
在typelists  statuelists 及 headertypeLists 加入了刪除鍵
之後要確定course的分類是誰決定 (admin / teacher?) 決定 (NITTP/自家/ERB)


26-7-2025

建立了帳目用的Accounts server side function ,但是要有比錢後才可以看到效果 (過多數天吧)


30-7-2025

修改了 admin 中 的老師ID , product的 CSS ,首面shop 的商品出現了 ,明天要加入product的修改頁面, 以及看看shop 的bug

12-08-2025

早上做了deploy 下午出現了以下

12-Aug 2025 ITE BUG

#Admin 使用者列表的使用者按Detail 出 404
#User 比吾到錢
#User 商城Filter 左合適條件後 Del左啲字 產品出吾翻來
#User 加左購物錢會吾知Show起邊 Del左佢？
#User 付款紀錄
#Teacher 我的資料顯示404



15-08-2025

修改了client 的register form 
加入阿里云OSS 在老師上傳檔案
把收費的USD 轉回 HKD
在prisma DB 中 老師教材DB中 加了一個fieldoriginalFileName
修改了有關老師教材的schema
server side server action function 
加入了upload api (是oss 的)
是用戶 -> api -> api中再用server side function (存DB data)
upload 檔案大小為20MB


26－08－2025

商城: 價錢顯示有出入(建立商品打的價錢是$1888， 但商品頁面上顯示出$18.88，而沙盒顯示價錢就沒有錯誤) － 做了

商品沒有類型清單：在建立商品時沒有選擇類型的選項，在編輯商品也沒有顯示。 － 做了

商品沒有狀態篩選：在建立商品時沒有選擇類型的選項，在編輯商品也沒有顯示。 － 做了

帳目中的加入商品button: 顯示框出界  － 做了

加入條款 － 做了

要在admin 中，在老師例表中加入老師教材下載功能 － 做完  （要在OSS 開只讀櫂）
在老師加入教材細看及可更新 － 做完
已過run build － 做完



27-08-2025

決定拿走 重新上傳文檔的功能（因為就算在next.config.js 設定了檔案上限大小，也會被next.js 忽略，都是只限1MB大小）
加入了直接DEL 教材的功能
加入修改課程的功能
修改時每次都要選多次時間範圍
現在把網放上domain ITE 網站
之後再把沙盒（比錢）改為正式版
DB會明天全刪(看看用甚麼方法)
當deploy後去試試OSS的理論


28-08-2025

加了resend
Cart# 家人們砍手價 改 刴手價
Cart# 原價吾打Post吾到
Cart# 打折後刪除
Cart# 兩價出現，原價多條刪除線 
投訴表格#加多頁

加了N8n
改了老師相


03-09-2025

加入了返回Path

可以放上github ,進行deploy



05-09-2025

修改了建立課程的時間可以小數點  做完

改老師字眼為 每堂時數 做完

改Admin　時數　　做完

1.公開產品閂左後仍在　做完
2.新Rule ： 課程做左產品之後狀態彈左去不可選，可揀不公開（編輯）　做完


學生列表可在此顯示？　做完



user
7:30-10:00 沒更新 因user 拿data 時沒有拿到時間


購買後，日歷沒更新


要解決session 沒有消失問題(logout 後session 還在)
重複login 問題



24-9-2025

在Change-IsPay中index中

    // 使用 student_id 查詢 Student 以取得 parentId
    const student_data = await db.student.findUnique({
      where: { id: invoice_data.student_id },
      select: { student_parent_data_id: true }, // 只選取需要的欄位以優化查詢
    });
中沒有student 要改user 以及更個的邏輯



<!--  -->

02-10-2025

在layout 中,head中要加入一個部件



24-10-2025

要在product 中　加入maxStudents及student[] 的顯示 - 做完

以及在 CREATE COURSE FORM 中加入maxStudents(特別課程都要)


28-10-2025

修改了product edit 頁面的　無法修改bug
加了google login 
修改了無法用username 及 pw login bug


30-10-2025

加了三行數版面在獨立商品頁面
修改了建立商品表格的顯示方式
修改了product data 關聯顯示方式


31-10-2025

修改了google login bug 
可刪商品 bug
自動生成codeCourse

改了特別商店圖片顯示方式

改了字眼

01112025

修改了create課程 的bug

現在specialCourse create 時間要修改

已完成修改　可deploy

02112025

比唔到錢(load死了比錢) -done

建立Course時，沒有了科目標記-done
Course
上限不見了 這個我看data是存在的


02112025
- [ ] 特別課程無圖
- [ ] Filter無功能
- [ ] 特別課程編輯Erro
- [ ] User睇日歷Erro
- [ ] User看到導師名
- [ ] User 的課程Code有老師名

全done 再加修改了add to cart(特別課程）)

把checkout中的addStudentToAllCourses功能，轉放success page 中，之後把heckout中的addStudentToAllCourses功能　delete

在老師位加了標記（是否商品）


改了比錢bug


11112025

加入Google Tag , Sitemap

改了特別課程中的影片上傳方式


18112025

V.1.5

5-12-2025
github 



12-12-2025

加入POST DB 以及 相關function


22-12-2025

已經加入
# Admin 
排堂日歷 內的課堂當用戶Click左框框之後加
該數據的開始時間與結束時間 （時段值）
建立課程/更改課程列表 加Search Bar （CourseID）

# Admin
後台商品例表 產品加＋Course ID Number

再加post server action function

為了改nextjs 12月份的bug 要把版本升級


31／12/2025

lib中的oss.ts 是給ADMIN 開post用 

26-1-2026

加了google login
next -v 16.0.10 版本

改了post 的image bug

29-1-2026

1)刪除：叫人去註冊button彈出黎果舊野
2)註冊後跳回上一個頁面
3)加入：已截止日期
4)Post & Course 關連，自己手動加落去，Post 下面加 Course (button or link)，Course下面加 Post (button or link)


30-1-2026

加了Post 及 Course 相關頁面 的 東西


4－2－2026

試修服login bug
以及run build bug

再改了login 方法 把auth.ts 以及./auth.config.ts middleware.ts 改了


6－2－2026

商品建立err


10-2-2026

修改了商品del
商品索引顯示
resend 更新中
ui更新



15/2/2026

修改了google login bug


10/7/2026

contactus
  -公司留言



比錢後的 order單 ，以及收據 ，以及發票全都要pdf

send email 確認 order

booking(比錢後) 成功後 有收據（客人 跟 admin）要給email  客人/ 公司

商品要有價錢排序
彈出相關服務（課程）
 老師 admin 加修修改 以及不顯示

 老師要加入打卡系統

Stripe 加入 支付寶  銀聯 微信


現金折扣活動
限時優惠活動

老師的薪資


預約/付款報表
課程報告
學員報告
教師報告
管理員報告

匯入/匯出 學生數據

edit 客人資料（加入）
現時客戶data + 教師data data 同步 連接




現在是 tailwind 3