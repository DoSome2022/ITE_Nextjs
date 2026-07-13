import type { Metadata } from "next";
import Footer from '@/components/Footer';

// 定義課程數據數組
const coreCourses = [
  {
    id: 1,
    title: 'CyberSecurity（網絡安全）',
    content: '現今社會嘅困境係：駭客無處不在，而且中招唔一定因為你公司大——好多時反而因為「意識唔夠」同「習慣唔好」。點樣保護自己？最有效嘅第一步係由安全意識入手：帳號、密碼、權限、釣魚、社工、裝置與雲端使用習慣。我哋會用生活化＋企業真實案例去教：你會知道咩係高風險行為、點樣預防、點樣判斷可疑情況、以及點樣將安全習慣融入日常工作流程，減少「唔小心」造成嘅災難。'
  },
  {
    id: 2,
    title: 'AI（人工智能應用）',
    content: 'AI 已經唔係「IT人先用」，而係各行各業都用得著：可以 Gen 圖、Gen 片、Gen 信件、Gen 文案、做會議摘要、做資料整理，甚至幫你 Debug、幫你寫程式。學得好，唔係慳少少時間，而係工作效率可以「以倍計」提升。我哋由入門到應用，唔只教你撳工具，而係教你點樣用AI去解決工作問題：點樣問得啱（Prompt）、點樣驗證、點樣避免「睇落好啱但其實錯」、點樣把AI融入你每日工作流程，實際做到平均節省接近 1/3 時間，並逐步擴大到更高價值嘅工作。'
  },
  {
    id: 3,
    title: 'Data Analytics（數據分析）',
    content: '你可能覺得數據分析同自己無關，但其實同你「息息相關」：因為商業決策、成本控制、資源分配、轉方向、提升產能（量產）——全部都要靠數據支持。無論你做Sales、採購、營運、客服、Marketing、管理層，只要你要交KPI，就一定會遇到「要用數字講嘢」。我哋嘅數據分析課程會由實務問題出發：點樣提取數據、整理、清洗、做分析、做報表同講故事（數據呈現），再連到決策層面——幫你用數據減成本、提效率、搵到更清晰嘅方向。'
  },
  {
    id: 4,
    title: '客製化企業培訓課程（Customized Corporate Training）｜上門培訓｜團報方案',
    content: [
      '服務概覽',
      '客製化課程設計：按行業、部門、崗位、現有系統與痛點，度身訂造學習路線與案例上門／到校／到公司授課：可配合企業時間（平日/週末/晚間），支援實體＋線上混合團體報讀（政府機構、上市公司、以及非牟利機構 ）：同公司／同部門／跨部門組班，統一目標與交付物，學完即落地'
    ]
  },
  {
    id: 5,
    title: 'Web Development（網頁開發）',
    content: '網頁開發係香港職業導向嘅主流技能之一——無論你做工業、商業、行政、Marketing、IT，甚至準備寫CV／轉工，Web都係「基本盤」。你手上嘅智能電話App、電腦上嘅網站（Web）、公司日常用嘅內部系統（ERP/CRM/Portal），以至你用緊嘅好多AI工具，其實背後都離唔開 Web 技術同「前後端＋系統」思維。我哋嘅網頁開發課程唔止教你「寫到出嚟」，而係教你做得到、交付到、用得到：由開發入門、到商業應用、到企業內訓需求都涵蓋。學完你會明白一個系統點樣由需求變成產品，由功能變成可維護、可擴展嘅方案。'
  },
  {
    id: 6,
    title: 'Python（程式開發）',
    content: 'Python 係免費、普及、用途極廣嘅開發語言，亦係香港好多職位最實用嘅「萬用工具」：你可以用佢做資料處理、寫自動化、整小工具、同系統對接，甚至支援AI同數據分析。我哋會用「一步一腳印」方式，由零開始到可以實戰落地：唔止教語法，而係教你點樣拆解問題、點樣除錯、點樣寫出可重用嘅程式。學完你會多咗一種能力——將重複性工作「程式化」，提升效率同競爭力。'
  },
  {
    id: 7,
    title: 'Workflow Automation（工作流程自動化）',
    content: '回覆訊息、重複性文書、厭惡性工作、跨部門追進度、搬運資料——呢啲其實最消耗人力，但亦最適合做自動化。你可以將流程 Set 入「部腦」：自動回覆、資料自動同步、表格自動生成、到期自動提醒、報表自動整理。喺人手不足、工作量又唔會減嘅環境，自動化就係你脫穎而出嘅方法：同一樣時間做多幾倍產出，減少人為錯誤，亦令你由「做雜務」轉去做更有價值嘅工作。'
  },
  {
    id: 8,
    title: 'System Architecture（系統架構）',
    content: '香港中小企多，每間公司做嘢方式都唔同。「罐頭系統」可能解決到短期問題，但長遠發展，你必須有基本架構知識，先至可以同供應商落柯打——知道自己要咩、點樣評估、點樣避免越做越亂、越改越貴。市面上系統／技術好多，聽落千編一律，但其實適合唔適合你，係有方法判斷嘅。上完堂，你會打通「需求→流程→資料→系統→維運」成個思維：無論你係管理層、PM、IT、或負責揀系統嘅同事，都會清楚點樣做長遠而唔係頭痛醫頭。'
  },
  {
    id: 9,
    title: 'VR-Gaming（VR／遊戲開發）',
    content: '由互動設計到沉浸式體驗，VR／遊戲已經唔止係娛樂：亦可用於培訓、展覽、銷售展示、教育同模擬演練。課程會由入門概念開始，帶你理解互動邏輯、場景搭建同體驗設計，逐步做到可展示嘅作品，特別適合對創作、互動體驗、或想擴展技能邊界嘅學員。'
  },
];

const coreCourses10 = [
  {
    id: 10,
    title: 'AI＋剪片（AI Video Editing）',
    content: '剪片已經由「純手工」進化到「AI輔助工作流」：構思、腳本、字幕、配音、素材整理、粗剪到精修，AI可以幫你大幅加速。無論你做Marketing、社媒、內容創作、公司內部宣傳，學識AI剪片就等於掌握一條高需求技能。我哋會以實務產出為目標：由零到一做出可上架／可投放嘅短片內容，並建立一套可複製嘅製作流程，令你越做越快、越做越穩。'
  },
  {
    id: 11,
    title: '中小企網絡安全（SME CyberSecurity）',
    content: '十間公司中招，未必係Hacker特別勁——更多時係因為內部有人「唔知／唔小心／亂開權限／亂用工具」，甚至出現「內鬼風險」。企業要做嘅唔係恐慌，而係建立清晰規矩同安全底線：咩唔做得？做之前要留意啲咩？資料點樣分級？權限點樣批？我哋用企業最常見情境去教，令團隊即刻提高安全意識同執行力；配合基本流程與習慣改造，顯著降低被入侵、資料外洩同勒索風險。（如你要保留「減少90%」呢句，我建議改成「大幅降低」會更合規、避免被質疑。）'
  },
  {
    id: 12,
    title: 'AI × 網絡安全（AI CyberSecurity）',
    content: [
      '有無留意有啲AI生成嘅內容（例如報價單、電郵、文件）會「熟口熟面」？因為你用緊嘅，可能其他人都用緊；更重要係——你公司資料一旦唔小心放咗出去，後果可以好大。我哋呢個模組重點係：點樣用AI提升效率之餘，仍然保護到公司資料唔外洩——包括使用守則、資料邊界、權限、審核流程同常見風險場景，令團隊「識用、敢用、用得安全」。'
    ]
  },
  {
    id: 13,
    title: '商業流程自動化（Business Workflow Automation）',
    content: 'Email、WhatsApp自動回覆、客戶資料整理、表格生成、報表更新、跨部門通知與追進度——呢啲全部都可以自動化。對中小企嚟講，自動化最大價值係「慳返個人」：唔係真係裁員，而係用同樣人手做多啲生意、縮短交付時間、減少錯漏、提升客戶體驗。我哋會先幫你梳理流程，再落地到可維運嘅自動化方案，確保唔係做一堆「一次性小工具」，而係真正在公司跑得順、交到成效嘅工作流。'
  }
];

const coreCourses_point = [
  {
    id: 14,
    title: 'Data Analytics（數據分析｜管理層／營運／銷售適用）',
    content: [
      '‧ 由業務問題出發建立指標（KPI/OKR）與分析框架，避免「有數據但無答案」',
      '‧ 涵蓋：資料清理、報表自動化、趨勢/漏斗/分群分析、營運儀表板（Dashboard）與匯報邏輯',
      '‧ 目標：用數據支援決策、減成本、提效益，將分析變成可重複的管理工具',
    ],
  },
  {
    id: 15,
    title: 'Python for Business（Python 企業應用）',
    content: [
      '‧ 由業務問題出發建立指標（KPI/OKR）與分析框架，避免「有數據但無答案」',
      '‧ 涵蓋：資料清理、報表自動化、趨勢/漏斗/分群分析、營運儀表板（Dashboard）與匯報邏輯',
      '‧ 目標：用數據支援決策、減成本、提效益，將分析變成可重複的管理工具',
    ],
  },
  {
    id: 16,
    title: 'Web Development for Business（企業網頁／內部系統）',
    content: [
      '‧ 針對企業實務：客戶端頁面、內部Portal、簡易CRM/表單系統、流程頁面化與權限管理',
      '‧ 涵蓋：需求拆解、前後端概念、資料流與API、部署與版本管理基本功',
      '‧ 目標：提升企業「自建／識管／識驗收」能力，減少對外判的資訊不對稱',
    ],
  },
  {
    id: 17,
    title: 'VR Game / XR Training（VR／遊戲化／沉浸式培訓）',
    content: [
      '‧ 適用於：安全演練、前線情境訓練、產品展示、展覽互動、流程模擬',
      '‧ 涵蓋：互動設計、場景搭建、體驗流程、簡易原型到可展示Demo的製作路徑',
      '‧ 目標：用沉浸式體驗提升培訓效果與記憶點，建立可展示／可迭代的內容資產',
    ],
  },
  {
    id: 18,
    title: 'Video Editing with A.I.（AI 影片製作／剪輯｜市場部/內容團隊）',
    content: [
      '‧ 以「出片效率」為核心：腳本→分鏡→字幕→配音→剪輯→版本產出流程化',
      '‧ 涵蓋：AI輔助寫稿、批量產出短片、字幕與多語、品牌模板化、內容合規與素材管理',
      '‧ 目標：用更少人手更快出更多內容，支援投放、社媒與內部宣傳',
    ],
  },
  {
    id: 19,
    title: 'SQL Database（SQL／資料庫｜企業數據底盤）',
    content: [
      '‧ 建立團隊的資料查詢與管理能力，打通「系統資料→分析→決策」鏈路',
      '‧ 涵蓋：資料表設計概念、SQL查詢（JOIN/聚合/視圖）、資料品質與權限基本觀念',
      '‧ 目標：降低對單一技術人員依賴，提升取數效率與數據可信度',
    ],
  },
  {
    id: 20,
    title: 'Excel to Python（Excel 自動化升級到 Python）',
    content: [
      '‧ 針對 Excel 用到極限的企業：公式複雜、檔案大、多人協作亂、易出錯、難追蹤',
      '‧ 涵蓋：把Excel流程模組化、以Python重建報表流水線、排程自動更新、可追溯與版本控制',
      '‧ 目標：保留業務同事熟悉的邏輯，同時把流程升級成更穩定、可維運、可擴展的系統',
    ],
  }
];

export const metadata: Metadata = {
  // Title: 針對企業痛點 + 核心服務 + 價格誘因 (資助)
  title: '核心課程體系 | 企業IT培訓與數碼轉型 | NITTP資助最高50% - 宏業教育中心 InnoTrendEDU',
  
  // Description: 強調 ROI (投入產出比)，將熱門課程 (AI, Cyber, Python) 與政府資助結合
  description: 'InnoTrendEDU 核心課程助企業以 50% 成本換取 100% 數碼轉型成果。提供 AI 人工智能、網絡安全 (CyberSecurity)、Python 數據分析、Web 開發及 VR 培訓。獲 NITTP 政府資助認可，支援企業包班、上門培訓及客製化方案，解決重複性工作與資安隱患。',
  
  // Keywords: 混合技術名詞與商業應用場景
  keywords: [
    // 核心服務
    '企業IT培訓', '數碼轉型', 'NITTP資助', '客製化培訓', '上門電腦課程',
    // 熱門技術領域
    'AI人工智能應用', 'Generative AI', 'CyberSecurity', '網絡安全意識', 
    'Python數據分析', 'Excel自動化', 'Power BI', 'Web Development', 
    'VR遊戲開發', '系統架構', '工作流程自動化'
  ],

  // Canonical URL
  alternates: {
    canonical: 'https://ite.edu.hk/core',
  },

  // Open Graph: 適合分享給老闆或 HR 看的內容
  openGraph: {
    title: 'InnoTrendEDU 企業核心課程 | AI、資安與數據分析實戰培訓 (獲政府資助)',
    description: '別讓重複工作與資安隱患拖慢發展。ITE 提供客製化企業培訓，涵蓋 AI、Python 自動化、網絡安全等。符合 NITTP 資格，企業可獲 50% 學費資助。',
    url: 'https://ite.edu.hk/core',
    siteName: '宏業教育中心 ITE',
    locale: 'zh_HK',
    type: 'website',
  },


  twitter: {
    card: 'summary_large_image',
    title: 'InnoTrendEDU 企業核心課程 | 50% 政府資助數碼轉型培訓',
    description: '專為企業打造的實戰課程：AI 應用、網絡安全、Python 數據分析。立即申請 NITTP 資助。',
  },
};

export default function CorePage() {
  return (
    <>      
      {/* 核心課程體系區 */}
      <section className="max-w-7xl mx-auto px-20 py-12 bg-gray-50 rounded-xl my-8">
        <h1 className="text-4xl font-light text-gray-400 mb-2 text-center">Core Curriculum System</h1>
        <h3 className="text-2xl font-semibold text-gray-700 mb-8 text-center">核心課程體系</h3>

        {/* introduction - 界面优化版 */}
        <div className='mb-12 px-4 sm:px-0'>
          <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-6 text-center py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
            別讓重複工作與安全隱患拖慢公司發展——用 50% 成本，換取 100% 數碼轉型成果！
          </h4>

          <p className="text-base text-gray-800 mb-5 font-medium border-l-4 border-cyan-600 pl-3">
            為什麼選擇我們？
          </p>

          <ul className="flex flex-col space-y-3 text-gray-700 mb-6">
            <li className="text-sm sm:text-base py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-cyan-200 hover:bg-gray-50 transition-all">
              <span className="text-cyan-600 font-bold mr-2">✓</span>
              實戰導向：課程結束後，員工能直接交付自動化腳本、數據分析儀表板 (Dashboard)、網絡安全守則及AI 內容產出 SOP，立即應用於工作。
            </li>
            <li className="text-sm sm:text-base py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-cyan-200 hover:bg-gray-50 transition-all">
              <span className="text-cyan-600 font-bold mr-2">✓</span>
              模組化設計：可針對部門需求單選（如：為 Marketing 部門報讀 AI 影片製作；為 Admin 部門報讀 Python 自動化），或組合全套課程。
            </li>
            <li className="text-sm sm:text-base py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-cyan-200 hover:bg-gray-50 transition-all">
              <span className="text-cyan-600 font-bold mr-2">✓</span>
              全方位覆蓋：從網絡安全 (CyberSecurity)、數據分析 (Python/SQL)，到業務自動化與 AI 內容製作，打造一條龍的數碼人才梯隊。
            </li>
            <li className="text-sm sm:text-base py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-cyan-200 hover:bg-gray-50 transition-all">
              <span className="text-cyan-600 font-bold mr-2">✓</span>
              成果可視化：不同於一般培訓，我們確保學員產出實質成果（Deliverables），如自動化工作流、標準化數據報告模板及企業網絡安全規範。
            </li>
            <li className="text-sm sm:text-base py-3 px-4 bg-white rounded-lg border border-gray-200 hover:border-cyan-200 hover:bg-gray-50 transition-all">
              <span className="text-cyan-600 font-bold mr-2">✓</span>
              政府資助：課程符合新型工業化及科技培訓計劃 (NITTP*) 資格，貴公司可申請最高 50% 學費資助。
            </li>
          </ul>
          <div className="text-sm text-gray-700 my-4 py-4 px-5 bg-gray-50 rounded-lg border border-gray-200 leading-relaxed">
            <span className="font-semibold text-gray-800">NITTP 資助申請步驟 *：</span>
            <p className="mt-2">1. 到 NITTP 平台註冊企業帳號：<a href="https://nittp.vtc.edu.hk/rttp/organisation/registration" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline">https://nittp.vtc.edu.hk/rttp/organisation/registration</a></p>
            <p>2. 上載/輸入員工資料</p>
            <p>3. 選擇宏業教育中心 課程科目（公開課程或客製化）</p>
            <p>4. 批核後聯絡 宏業教育中心 3163 9569 繳交學費</p>
            <p>5. 完成培訓後遞交相關文件，等待資助撥款</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-12">
          {/* map coreCourses 1-9 */}
          {coreCourses.map((course) => (
            <div key={course.id} className="relative">
              {/* 課程序號 */}
              <div className="absolute -left-4 top-0 text-6xl font-bold text-gray-200">
                {course.id}
              </div>
              
              {/* 課程標題 */}
              <h4 className="text-xl font-medium text-gray-800 mb-2 ml-7">
                {course.title}
              </h4>
              
              {/* 課程內容 - 處理單文本和多段落兩種情況 */}
              <div className="list-disc pl-5 text-gray-600 space-y-1 ml-2">
                {Array.isArray(course.content) 
                  ? course.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  : <p>{course.content}</p>
                }
              </div>
            </div>
          ))}
          
          {/* map coreCourses 10-13 */}
          {coreCourses10.map((course) => (
            <div key={course.id} className="relative">
              {/* 課程序號 */}
              <div className="absolute -left-15 top-0 text-6xl font-bold text-gray-200">
                {course.id}
              </div>
              
              {/* 課程標題 */}
              <h4 className="text-xl font-medium text-gray-800 mb-2 ml-7">
                {course.title}
              </h4>
              
              {/* 課程內容 - 處理單文本和多段落兩種情況 */}
              <div className="list-disc pl-5 text-gray-600 space-y-1 ml-2">
                {Array.isArray(course.content) 
                  ? course.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  : <p>{course.content}</p>
                }
              </div>
            </div>
          ))}

          {/* map coreCourses 13-20 */}
          {coreCourses_point.map((course) => (
            <div key={course.id} className="relative">
              {/* 課程序號 */}
              <div className="absolute -left-15 top-0 text-6xl font-bold text-gray-200">
                {course.id}
              </div>
              
              {/* 課程標題 */}
              <h4 className="text-xl font-medium text-gray-800 mb-2 ml-7">
                {course.title}
              </h4>
              
              {/* 課程內容 - 處理單文本和多段落兩種情況 */}
              <div className="list-disc pl-5 text-gray-600 space-y-1 ml-2">
                {Array.isArray(course.content) 
                  ? course.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  : <p>{course.content}</p>
                }
              </div>
            </div>
          ))}
        </div>
      </section>
      
      <Footer />
    </>
  );
}