import type { Metadata } from "next";
import Footer from '@/components/Footer';
import Image from "next/image"; 
import Teacher from '@/components/Teacher';

export const metadata: Metadata = {
  // Title: 品牌名稱 + 團隊亮點 + 專業領域 (建議 60 字元內)
  title: '專業導師團隊 | 15年+ 實戰經驗 IT 與 AI 企業培訓專家 | ITE 宏業教育中心',
  
  // Description: 強調導師的「資歷」、「政府認可背景」與「涵蓋技術」，建立權威感 (建議 160 字元內)
  description: '認識 ITE 宏業教育中心的專業教育團隊。我們的 IT 與 AI 講師平均擁有超過 15 年行業實戰與創業經驗，具備各大政府認可院校任教背景。導師精通 Python 數據科學、React 全棧開發及系統架構，為學員與企業提供最貼近市場趨勢的專業技術培訓。',
  
  // Keywords: 涵蓋師資背景與具體技術領域
  keywords: [
    'InnoTrendEDU', '宏業教育中心師資', '專業IT導師', 
    '企業培訓講師', 'IT課程導師香港', '15年IT經驗', 
    '全棧開發導師', 'Python數據科學專家', 'AI培訓導師', 
    'Web Development Instructor'
  ],

  // 設定 Canonical URL
  alternates: {
    canonical: 'https://ite.edu.hk/ourteam',
  },

  // Open Graph: 針對社群分享優化，適合放在 LinkedIn 或公司簡報中展示
  openGraph: {
    title: 'InnoTrendEDU 專業導師團隊 | 頂尖 IT 與企業培訓專家',
    description: '由平均 15 年以上實戰經驗的業界精英組成。具備政府認可院校教學經驗，專精數據科學、AI 及全棧開發，助你掌握最新科技。',
    url: 'https://ite.edu.hk/ourteam',
    siteName: '宏業教育中心 InnoTrendEDU',
    locale: 'zh_HK',
    type: 'website',
    // images: [
    //   {
    //     url: 'https://ite.edu.hk/og-team-cover.jpg', // 建議放一張高質感的導師大合照或專業授課情境照
    //     width: 1200,
    //     height: 630,
    //     alt: 'ITE 專業教育團隊',
    //   },
    // ],
  },

  // Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'InnoTrendEDU 專業導師團隊 | 頂尖 IT 與企業培訓專家',
    description: '我們的 IT 與 AI 講師平均擁有超過 15 年行業實戰與創業經驗，提供最專業的技術培訓。',
  },
};

export default function TeamPage() {

  return (
    <>
    <div className="min-h-screen bg-white">
      {/* 為什麼選擇ITE區塊 */}
      <section className="relative h-100 overflow-hidden">
        <Image 
          src="https://picsum.photos/id/180/1920/800" 
          alt="課堂場景" 
          width={1080} // 根據實際圖片尺寸調整
          height={1080} // 根據實際圖片尺寸調整
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-white/90 to-white/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h2 className="text-3xl font-light text-gray-500 mb-2 bg-white/70 w-70">why, ITE?</h2>
          <p className="text-gray-700 max-w-2xl">
            教師隊伍平均擁有超過15年的職業經驗，成員均為現職於各大政府認可院校的專業人士。此外，我們的講師也包括科技擁有公司的創業服務案例，他們不僅具備深厚的學術背景，還擁有豐富的企業服務案例，並熱衷行業的最新技術發展趨勢。教師們將分享一手的創業行業與市場洞察，讓學員在學習過程中獲得寶貴的行業洞見。
          </p>
        </div>
      </section>

      {/* 專業教育團隊區塊 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light text-gray-500 mb-2">Our Professional Team</h2>
        <h3 className="text-xl font-semibold text-gray-800">我們專業的教育團隊</h3>
      </div>

      {/* 核心：grid + Phone Roll */}
      <Teacher/>
    </section>
    </div>
    <Footer/>
    </>
  );
}