import { Metadata } from "next";
import { ChevronRight } from 'lucide-react';

import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';
import banner from '@/public/banner.jpg'
import b1 from '@/public/b1.png'
import b2 from '@/public/b2.png'
import b3 from '@/public/b3.png'
import core from '@/public/core.png'
import Mr_Aaron from '@/public/Teacher_WaiLung.webp'
import Mr_Honcy from '@/public/Teacher_HoncyLee.webp'
import Mr_Eric from '@/public/Teacher_Eric.png'


// 教師團隊數據（已加入中文職稱）
const teamMembers = [
  {
    id: 1,
    name: "Mr. Aaron Wai",
    avatar: Mr_Aaron,
    title: "跨領域科技與管理講師", // 新增中文職稱
    bio: "With a multidisciplinary background that bridges tech, finance, sales, and leadership, he brings hands-on corporate experience from building systems, managing teams, and scaling businesses in Asia, all while focusing on practical teaching approaches that emphasize job-ready skills in web development, automation, and data analysis."
  },
  {
    id: 2,
    name: "Mr. Honcy Lee",
    avatar: Mr_Honcy,
    title: "金融科技與數據分析創辦人", // 新增中文職稱
    bio: "The Founder and Director of an IT and financial data analytics company, a former Managing Director at a private tech company, and over 10 years of experience in multinational financial institutions. 10+ Years in Finance & Tech, Now Training the Next Generation of Analysts."
  },
  {
    id: 3,
    name: "Mr. Eric",
    avatar: Mr_Eric,
    title: "ERP轉型與中小企成長導師", // 新增中文職稱
    bio: "ERP Transformation Mentor with over 15 years of experience in defining industry pain points and driving strategic solutions. As a SME Growth Turbocharger, Eric excels at identifying and capitalizing on opportunities for small and medium enterprises, helping them scale and thrive in a competitive landscape."
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '關於我們 | 宏業教育中心 InnoTrendEDU - 專業IT與AI科技培訓',
    description: '了解宏業教育中心 (InnoTrendEDU) 的創新教育理念。我們擁有15年以上經驗的資深導師團隊，提供AI、Python、Web全棧開發等實戰課程。作為NITTP認可培訓機構，我們致力於孕育未來IT領袖，助企業與個人提升競爭力。',
    keywords: ['宏業教育中心', 'InnoTrendEDU', 'IT培訓', 'AI課程', 'Python教學', 'Web全棧開發', 'NITTP資助課程', '企業IT培訓', '香港IT課程'],
    openGraph: {
    title: '關於我們 | 宏業教育中心 InnoTrendEDU',
    description: '15年+資深師資，提供AI、Python及Web開發實戰課程，獲NITTP政府資助認可，助您與企業掌握前沿科技。',
    url: 'https://ite.edu.hk/about',
    siteName: '宏業教育中心 InnoTrendEDU',
    locale: 'zh_HK',
    type: 'website',
    },
  };
}

export default function ITEEducationCenter() {
  const email = "info@ite.edu.hk";

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* 導航欄 */}
      {/* <Nav/> */}

      {/* 首頁 Banner 區 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-light text-gray-400 mb-2">INNOVATION TREND EDUCATION</h2>
            <h3 className="text-2xl font-semibold text-cyan-700 mb-4">InnoTrendEDU 企業科技轉型的起點</h3>
            <p className="text-gray-600 mb-6 font-bold">
              專注於把科技能力「真正落地」到企業日常營運之中。我們多年來應對過不同行業的培訓與轉型需要，熟悉各類團隊常見痛點：流程靠人手、資料分散、報表慢又唔準、跨部門協作斷層、資訊安全靠「小心啲」但無方法論。
            </p>
            <p className="text-gray-600 mb-6 font-light">
              教師隊伍平均擁有超過15年的實戰經驗，成員均為現職於各大政府認可院校的專業人士。此外，我們的講師也包括科技創業公司的創始人，他們不僅具備深厚的學術背景，還擁有豐富的企業服務案例，並熟悉行業的最新技術發展趨勢。教師們將分享一手的創業經驗與市場洞察，讓學員在學習過程中獲得寶貴的行業洞見。
            </p>
            <p className="text-gray-600 mb-6 font-light">
              因此，我們的角色不止是授課——而是以行業理解＋可執行方案，協助企業建立可複製的工作方式，甚至支援跨企業/跨部門的指導與能力對齊，從效率、風險控制到人才成長，全面提升競爭力。
            </p>
          </div>
          <div className="relative h-80 overflow-hidden rounded-lg">
            <Image 
              src={banner}
              alt="ITE科技城市" 
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
            {/* <div className="absolute inset-0 bg-linear-to-t from-white/90 to-transparent"></div> */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-blue-600/30"></div>
          </div>
        </div>
      </section>

      {/* ITE核心: 創新與改變 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-5xl font-light text-gray-500 mb-8">ITE核心: 創新與改變</h2>
        <div className="flex justify-between gap-2 md:gap-5">
          <div className="md:ml-20">
            <div className="overflow-hidden">
              <Image 
                src={b1}
                alt="科技圖示" 
                width={200}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <Image 
                src={b2}
                alt="科技建築" 
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="overflow-hidden">
              <Image 
                src={b3}
                alt="科技建築" 
                width={200}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          <div className="flex items-center ml-5">
            <p className="text-gray-600 font-light">
              在科技驅動未來的時代，IT人才是社會發展的核心引擎。ITE教育中心自2019年成立以來，便肩負著一個清晰的使命：建立一個連接「教育」、「產業」與「科技」的堅實橋樑。我們不僅是傳授技能的培訓機構，更是孕育下一代科技領袖的創新搖籃。
            </p>
            
          </div>
        </div>
      </section>

      {/* ITE優勢（why US？） */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">ITE優勢（why US？）</h3>
        <p className="text-gray-600 mt-6 font-bold">
          我們最重視「技術轉移」：循序漸進、由淺入深，一步一腳印做到出成果。
        </p>
        <p className="text-gray-600 mt-1 font-light">
          每個主題都以 <span className="text-cyan-600 font-bold">Demo 演繹</span>帶路：講師先示範「點做」，再帶學員跟住做「做到出嚟」，最後轉化成學員可帶回公司即用的流程、模板或小工具，確保學完唔係得個知字，而係真係<span className="text-cyan-600 font-bold">做到、用到、交到</span>。
        </p>
        <p className="text-gray-600 mt-6 font-bold">
          資助課程
        </p>
        <p className="text-gray-600 mt-1 font-light">
          我們是「新型工業化及科技培訓計劃」 （NITTP）資格的培訓機構。該計劃可獲得企業就讀的課程費用<span className="text-cyan-600 font-bold">50%的資助額</span>。為保持課程的質量，每個課程必須經過嚴格的审核，迎合本地環境的需要，確保課程切實地達到最高標準。

        </p>
        <p className="text-gray-600 mt-1 font-light">
          課程涵蓋：自動控制；銀行；生物醫學及醫護；數據通訊；數碼媒體；電子工程；環保；旅遊及飲食業；資訊科技；保險業相關科技；物流業相關科技；職業健康及安全；製造；印刷及出版；品質改善；可持續發展；紡織及製衣；批發/零售及出入口貿易；食品與健康科學等等。
        </p>
        
        <div className="mt-12 flex gap-5">
          {/* 查看所有課程 Button */}
          <Link href='/'>
          <button className="px-5 py-2 border-cyan-700  border-2 text-gray-800 rounded-3xl flex items-center gap-2 hover:bg-cyan-800 hover:text-white transition-colors">
            <span>查看所有課程</span>
            <ChevronRight size={16} />
          </button>
          </Link>

          {/* 個人客製化化 Button - WhatsApp */}
          <Link href='https://wa.me/51001888'>
          <button className="px-5 py-2 border-cyan-700  border-2 text-gray-800 rounded-3xl flex items-center gap-2 hover:bg-cyan-800 hover:text-white transition-colors">
            <span>個人客製化方案 / 報價</span>
            <ChevronRight size={16} />
          </button>
          </Link>

          {/* 企業客製化 Button - Email */}
          <Link href={`mailto:${email}`}>
          <button className="px-5 py-2 border-cyan-700  border-2 text-gray-800 rounded-3xl flex items-center gap-2 hover:bg-cyan-800 hover:text-white transition-colors">
            <span>企業客製化方案 / 報價</span>
            <ChevronRight size={16} />
          </button>
          </Link>
        </div>
      </section>

      {/* 核心課程體系區 */}
      <section className="max-w-7xl mx-auto px-20 py-12 bg-white rounded-xl my-8">
        <h2 className="text-5xl font-light text-gray-400 mb-2 text-center">Core Curriculum System</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-8 text-center">核心課程體系</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative">
          <div className="absolute -left-4 top-0 text-6xl font-bold text-gray-200">1</div>
          <h4 className="text-xl font-medium text-gray-800 mb-4 ml-7">
            CyberSecurity（網絡安全）
          </h4>
          <ul className="pl-5 text-gray-600 space-y-3 ml-2">
            <li>
              <span className="font-semibold text-gray-800">痛點：</span>
              駭客無處不在，中招未必因公司規模大，多因「意識唔夠」同「習慣唔好」。
            </li>
            <li>
              <span className="font-semibold text-gray-800">教學：</span>
              從安全意識入手，涵蓋帳號、密碼、權限、釣魚、社工、裝置與雲端使用習慣，搭配生活化＋企業真實案例。
            </li>
            <li>
              <span className="font-semibold text-gray-800">成果：</span>
              認知高風險行為、學會預防與判斷可疑情況，將安全習慣融入工作流程，減少「唔小心」造成的災難。
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -left-4 top-0 text-6xl font-bold text-gray-200">2</div>
          <h4 className="text-xl font-medium text-gray-800 mb-4 ml-7">
            AI（人工智能應用）
          </h4>
          <ul className="pl-5 text-gray-600 space-y-3 ml-2">
            <li>
              <span className="font-semibold text-gray-800">痛點：</span>
              不懂AI實際應用方法，僅會操作工具，無法將AI融入日常工作創造價值。
            </li>
            <li>
              <span className="font-semibold text-gray-800">教學：</span>
              由入門到應用，教會AI各場景實用技巧，涵蓋Prompt提問、結果驗證、避坑方法，搭配工作實例教學。
            </li>
            <li>
              <span className="font-semibold text-gray-800">成果：</span>
              倍數提升工作效率，平均節省接近1/3時間，將能力擴大到更高價值的工作中。
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -left-4 top-0 text-6xl font-bold text-gray-200">3</div>
          <h4 className="text-xl font-medium text-gray-800 mb-4 ml-7">
            Data Analytics（數據分析）
          </h4>
          <ul className="pl-5 text-gray-600 space-y-3 ml-2">
            <li>
              <span className="font-semibold text-gray-800">痛點：</span>
              認為數據分析與自身無關，工作中需交KPI卻不懂「用數字講嘢」，決策缺乏數據支持。
            </li>
            <li>
              <span className="font-semibold text-gray-800">教學：</span>
              由實務問題出發，涵蓋數據提取、整理、清洗、分析、報表製作與數據呈現，連接至實際決策層面。
            </li>
            <li>
              <span className="font-semibold text-gray-800">成果：</span>
              學會用數據協助企業減成本、提效率，為發展找到更清晰的方向，各崗位都能活用數據。
            </li>
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -left-4 top-0 text-6xl font-bold text-gray-200">4</div>
          <h4 className="text-xl font-medium text-gray-800 mb-4 ml-7">
            客製化企業培訓課程｜上門培訓｜團報方案
          </h4>
          <ul className="pl-5 text-gray-600 space-y-3 ml-2">
            <li>
              <span className="font-semibold text-gray-800">課程設計：</span>
              按行業、部門、崗位、現有系統與痛點，度身訂造學習路線與案例。
            </li>
            <li>
              <span className="font-semibold text-gray-800">授課形式：</span>
              上門／到校／到公司授課，配合企業時間（平日/週末/晚間），支援實體＋線上混合模式。
            </li>
            <li>
              <span className="font-semibold text-gray-800">團報優勢：</span>
              適用政府機構、上市公司、非牟利機構，支持同公司／同部門／跨部門組班，統一目標與交付物，學完即落地。
            </li>
          </ul>
        </div>
        </div>
        <div className="mt-12 h-80 overflow-hidden rounded-xl">
          <Image 
            src={core}
            alt="科技課程" 
            width={1920}
            height={1080}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        {/* More Button */}
        <div className="flex justify-center mt-12">
          <Link href='/core'>
          <button className="px-5 py-2 border-cyan-900  border-2 text-gray-800 rounded-3xl flex items-center gap-2 hover:bg-cyan-800 hover:text-white transition-colors">
            <span>了解更多 MORE</span>
            <ChevronRight size={16} />
          </button>
          </Link>
        </div>
      </section>

      {/* 合作機構區 */}
      {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-5xl font-light text-gray-400 mb-2 text-center">Previous Partner Organization</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-8 text-center">過往曾經合作機構</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {partners.map((partner) => (
            <div key={partner.id} className="w-24 h-12 overflow-hidden flex items-center justify-center">
              <Image 
                src={partner.logo} 
                alt={partner.name} 
                width={100}
                height={100}
                className="w-full h-full object-contain opacity-20 hover:opacity-100 transition-opacity"
              />
            </div>
          ))}
        </div>
      </section> */}

      {/* 教育團隊區（已加入中文職稱） */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-5xl font-light text-gray-400 mb-2 text-center">Our Professional Team</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-8 text-center">我們專業的教育團隊</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="text-center">
              {/* 头像容器（保留原样式） */}
              <div className="relative w-32 h-32 rounded-full border-2 border-gray-200 overflow-hidden mx-auto mb-4">
                <Image 
                  src={member.avatar} 
                  alt={member.name} 
                  fill
                  sizes="(max-width: 640px) 100px, 128px"
                  className="object-cover"
                />
              </div>
              {/* 姓名 + 中文職稱（新增） + 介绍 */}
              <h4 className="text-lg font-medium text-gray-800 mb-1">{member.name}</h4>
              <p className="text-cyan-700 text-sm font-medium mb-3">{member.title}</p> {/* 中文職稱，用主色突出 */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
        {/* More Button */}
        <div className="flex justify-center mt-12">
          <Link href='/ourteam'>
            <button className="px-5 py-2 border-cyan-900  border-2 text-gray-800 rounded-3xl flex items-center gap-2 hover:bg-cyan-800 hover:text-white transition-colors">
              <span>了解更多 MORE</span>
              <ChevronRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      <GoogleMap/>
      <Footer/>
    </div>
  );
}