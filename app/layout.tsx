// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { Toaster } from "sonner";
import { GoogleTagManager } from "@next/third-parties/google";
import GTMPageView from "@/components/GTMPageView";
import { Suspense } from "react";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '關於我們 | 宏業教育中心 InnoTrendEDU - 專業IT與AI科技培訓',
  description: '了解宏業教育中心 (InnoTrendEDU) 的創新教育理念。我們擁有15年以上經驗的資深導師團隊，提供AI、Python、Web全棧開發等實戰課程。作為NITTP認可培訓機構，我們致力於孕育未來IT領袖，助企業與個人提升競爭力。',
  keywords: ['宏業教育中心', 'InnoTrendEDU', 'IT培訓', 'AI課程', 'Python教學', 'Web全棧開發', 'NITTP資助課程', '企業IT培訓', '香港IT課程']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const adsConversionId = process.env.NEXT_PUBLIC_ADS_CONVERSION_ID // 您的 Google Ads Conversion ID

  return (
    <html lang="zh-HK">
      <head>

        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=1" />

        {/* GTM: 由第三方套件注入 */}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}

        {/* Google Ads: gtag.js 主程式庫 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${adsConversionId}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${adsConversionId}', { 
              send_page_view: false  // 避免與 GTM/GA 重複計算頁面瀏覽
            });
          `}
        </Script>
        

{/* Meta Pixel Code */}
<Script id="fb-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1302329258473984');
    fbq('track', 'PageView');
  `}
</Script>

{/* Noscript 部分 */}
<noscript>
  <img
    height="1"
    width="1"
    style={{ display: 'none' }}
    src="https://www.facebook.com/tr?id=1302329258473984&ev=PageView&noscript=1"
  />
</noscript>
{/* End of Meta Pixel Code */}
        
        
        {/* Google tag (gtag.js) */}
<Script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-VLPS5H3QS4"
/>
<Script id="google-tag">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-VLPS5H3QS4');
  `}
</Script>
        




      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* GTM noscript */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}

        <SessionProvider>
          {/* GTM 頁面瀏覽追蹤 */}
          {gtmId && (
            <Suspense fallback={null}>
              <GTMPageView />
            </Suspense>
          )}

          <Navbar />
          <main>{children}</main>
          <Toaster position="top-center" />
        </SessionProvider>

        {/* Google Analytics (GA4) */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}


// // app/layout.tsx
// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { SessionProvider } from "next-auth/react";
// import Navbar from "@/components/Navbar";
// import GoogleAnalytics from "@/components/GoogleAnalytics";
// import { Toaster } from "sonner";
// import { GoogleTagManager } from "@next/third-parties/google";
// import GTMPageView from "@/components/GTMPageView";
// import { Suspense } from "react";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "ITE",
//   description: "探索 ITE 的優質課程和服務",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
//   const gaId = process.env.NEXT_PUBLIC_GA_ID;

//   return (
//     <html lang="zh-HK">
//       <head>
//         <link rel="icon" type="image/x-icon" href="/favicon.ico?v=1" />
//         <link rel="apple-touch-icon" href="/favicon.ico?v=1" />
//         {/* GTM: script 部分（由 @next/third-parties 自動注入） */}
//         {gtmId && <GoogleTagManager gtmId={gtmId} />}
//       </head>

//       <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
//         {/* GTM: noscript 備用（無 JS 時觸發） */}
//         {gtmId && (
//           <noscript>
//             <iframe
//               src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
//               height="0"
//               width="0"
//               style={{ display: "none", visibility: "hidden" }}
//               title="Google Tag Manager"
//             />
//           </noscript>
//         )}

//         <SessionProvider>
//           {/* GTM 頁面瀏覽追蹤（Client Component） */}
//           {gtmId && (
//             <Suspense fallback={null}>
//               <GTMPageView />
//             </Suspense>
//           )}

//           <Navbar />
//           <main>{children}</main>
//           <Toaster position="top-center" />
//         </SessionProvider>

//         {/* Google Analytics */}
//         {gaId && <GoogleAnalytics gaId={gaId} />}
//       </body>
//     </html>
//   );
// }