'use client';
import ITEFooter from '@/components/Footer';
import ITEnav from '@/components/Nav';
import { useState } from 'react';


// 教師數據
const teamMembers = [
  {
    id: 1,
    name: "Mr. Aaron Lung",
    position: "Teacher",
    avatar: "/Teacher_WaiLung.webp",
    intro: "Accomplished and versatile professional with enterprise experience in sales management, business forecasting, and planning, supported by a strong academic background. Wai holds graduate and postgraduate degrees in engineering and computer sciences, bringing a unique blend of technical expertise and entrepreneurial drive to the table. He has successfully navigated both the commercial and technical landscapes, with a proven track record in expanding distribution networks in the South China market and implementing automated systems.",
    technicalBg: [
      "Solid technical expertise in engineering and computer sciences, with hands-on experience in digital imaging, software, and hardware products, as well as network fault recovery strategies.",
      "Proficient in Full-Stack Development: Extensive command of HTML, CSS, JavaScript, React.JS, Node.js, Express, Python, and R.",
      "Advanced skills in Python Frameworks: Specializes in Django development including Model-View-Template (MVT) Architecture, Object-Relational Mapping (ORM), built-in Admin Interfaces, scalability, third-party integrations, and flexible deployment."
    ],
    educationalContrib: [
      "Educational Leadership: Successfully led City University HK (ERB) programs, teaching certifications in Frontend Web Developer (ReactJS) and Backend Web Developer (Node.js, Express, API, MVC).",
      "Specialized Instruction: Experienced in teaching complex topics such as data mining, machine learning in financial markets using Python and R, and web scraping with Selenium.",
      "Strategic Business Development: demonstrated ability to orchestrate interdepartmental teamwork to strengthen web capabilities, manage marketing functions (product management, localization), and conduct technology transfer initiatives.",
      "Strong believer that we should take from the society and give back to the society."
    ],
    expertise: [
      "Web Development: HTML/CSS/JavaScript/React.JS/Node.js/Express",
      "Data Science: Python/R/Selenium/Data Mining/Machine Learning in Financial Markets",
      "Framework Architecture: Django/MVT/ORM/API/MVC",
      "Business Management: Sales Forecasting/Budgeting/Personnel Management/Inventory Control",
      "Financial & Risk Management: Accounting Systems/Interest & FX Risk/Account Payment Risk",
      "Marketing & Sales: Product Localization/Exhibitions/South China Market Development",
      "Consulting: Web and System Development Initiatives"
    ],
    bio: "He excels at employing a broad spectrum of professional experiences to act as a consultant for web and system development initiatives. His experience allows him to foster innovation through interdepartmental teamwork and deliver targeted technology transfers across diverse organizations."
  },
  {
    id: 2,
    name: "Mr. Honcy Lee",
    position: "Teacher",
    avatar: "/Teacher_HoncyLee.webp",
    intro: "Accomplished and versatile professional with a high level of expertise in finance and accounting, supported by a strong educational foundation and extensive industry experience. Mr. Lee holds a BA in Accounting & Finance and a Postgraduate Diploma in Financial Analytics and Algo Trading (with distinction), bringing a unique entrepreneurial drive to the table. He combines over a decade of experience in multinational financial institutions with a leadership role as a founder and director of an IT and financial data analytics company.",
    technicalBg: [
      "Solid technical expertise in Data Science and Financial Technology, bridging traditional accounting principles with advanced algorithmic trading and analysis strategies.",
      "Proficient in Data Analysis and Machine Learning: Deep command of the Python ecosystem including Pandas, NumPy, Polars, and Numba, alongside ML frameworks like Scikit-Learn, XGBoost, TensorFlow, and Keras.",
      "Advanced skills in Data Integration and Automation: Specialized in complex Web Scraping (BeautifulSoup, Selenium, Scrapy, Session management), Cross-platform Automation (Mac/Linux/Windows), and Cloud Computing (AWS, Google Colab). Strong capability in Version Control (Git) and Web Development (Django, APIs)."
    ],
    educationalContrib: [
      "Experienced Educator: Successfully taught over 600 hours of Python Data Analytics at several institutes in Hong Kong, translating complex data concepts into actionable skills for students.",
      "Leadership and Enterprise Experience: Serves as Founder and Director for a financial data analytics firm and has held the position of Managing Director in a private tech company.",
      "Institutional Expertise: Possesses over 10 years of robust work experience within various multinational financial institutions, ensuring a deep understanding of corporate financial and accounting report analysis."
    ],
    expertise: [
      "Data Analysis Tools: Python/SQL/Pandas/NumPy/Polars/Numba/ScPy",
      "Machine Learning: Sklearn/XGBoost/TensorFlow/Keras",
      "Data Visualization: Tableau/PowerBI/Matplotlib/Seaborn/crazySession",
      "Cloud Services: Google Colab/Kens",
      "Version Control: Git/GitHub",
      "Web Development: Django/HTML/CSS/Javascript/APIs",
      "Automation: Scheduled Task in all Mac/Linux/Windows",
      "Finance & Business: Corporate Financial Report/Accounting Report analysis/Startup kickstart project"
    ],
    bio: "He excels at communicating complex concepts and empowering students with the analytical skills needed to thrive in data-driven environments. His expertise in both the theoretical and practical aspects of finance, accounting, and data analysis makes him a valuable asset in any educational or professional setting."
  },
    {
    id: 3,
    name: "Mr. Eric",
    position: "Teacher",
    avatar: "/Teacher_Eric.png",
    intro: "Accomplished and versatile professional with extensive experience in full-stack development, enterprise system analysis, and emerging AI technologies. With a strong foundation as an Analyst Programmer spanning nearly a decade in ERP and management systems, Eric has successfully pivoted into the forefront of Artificial Intelligence and education. He holds a diverse range of recent professional certifications from Google in Cybersecurity, Data Analytics, UX Design, and AI, demonstrating a relentless commitment to upskilling and adapting to modern tech trends.",
    technicalBg: [
      "Solid technical expertise in full-stack web and mobile application development, proficient in Next.js, React, Node.js, Ionic, Python, and Django, supported by strong database management skills in PostgreSQL, MySQL, and MongoDB.",
      "Advanced skills in GenAI and Automation: Deeply experienced in LLM Inference, RAG deployment, Prompt Engineering, AIGC, and Agentic Automation using n8n and Python.",
      "Enterprise System Legacy: Over 9 years of robust experience designing and maintaining complex systems including ERPs (Electronics, F&B), Insurance Policy Management, and Logistics Waybill systems for MNCs and local corporations."
    ],
    educationalContrib: [
      "GenAI Educator: Currently serves as a teacher at Innovation Trend Education Centre, delivering regular and on-site practical training in cutting-edge topics such as Large Language Models (LLM), Agentic Automation, and Model Context Protocol (MCP).",
      "Digital Transformation Projects: As a freelance developer, successfully delivered high-profile projects including the EMSD Annual Report 2023, Web3 prototypes for TVP, and interactive React-based applications.",
      "Commitment to Mentorship: Recognized for character traits such as being analytical, logical, and responsible, with a specific focus on mentoring others in technical disciplines."
    ],
    expertise: [
      "Generative AI: LLM Inference/RAG Deployment/Prompt Engineering/n8n/Agentic Automation",
      "Web Frameworks: Next.js/React/Node.js/Django/Ionic",
      "Cloud & Infrastructure: AWS/GCP/Google IT Automation",
      "Databases: PostgreSQL/MySQL/MongoDB",
      "Enterprise Solutions: ERP Systems/Insurance Brokerage Systems/Logistics Management",
      "Specialized Certifications: Google Cybersecurity/Google Data Analytics/Google UX Design",
      "Development Tools: Git/Mobile App Development"
    ],
    bio: "He excels at bridging the gap between established enterprise architectures and innovative AI solutions, utilizing his analytical and problem-solving skills to mentor students and deploy practical, high-impact digital products."
  },
  {
    id: 4,
    name: "Mr. J Tsang",
    position: "Teacher",
    avatar: "/Teacher_JTsang.png",
    intro: "Accomplished and versatile Senior 3D Artist and Modeller with over two decades of industry experience in top-tier film production, animation, and video game development. TSANG brings a rich blend of traditional fine arts foundation and modern digital craftsmanship, contributing to international blockbuster films and major gaming titles. A dedicated professional with a proven track record of evolving from an Animator to a Senior Modeller, now expanding into modern web frameworks to bridge artistic vision with technical execution.",
    technicalBg: [
      "Solid technical expertise in 3D computer animation, digital sculpting, and real-time rendering, with profound experience in cinematic production pipelines for both film and games.",
      "Proficient in high-end 3D software and engines: Capable of executing complex modeling tasks using Maya, ZBrush, Blender, Softimage, and integrating assets into Unity3D and Unreal Engine.",
      "Advanced skills in Visual Production: Extensive experience in creating assets for high-profile projects such as TMNT, Astro Boy, Mulan (Disney), and Journey to the West: Conquering the Demons. Skilled in post-production using After Effects and Photoshop."
    ],
    educationalContrib: [
      "Senior Industry Contributor: Served as a core artistic talent for renowned studios including Imagi Animation Studios, Different Digital Design, and Lzybug Studio for over 20 years.",
      "Cross-Media Versatility: Successfully transitioned skills across mediums, from feature animations and live-action VFX to Game Cinematics (Xbox’s Monster Hunter Frontier) and specialized Pachinko animations.",
      "Recently updated skills with a 2024 Certificate in Python Web Framework Development (ERB), demonstrating adaptability to new technical workflows."
    ],
    expertise: [
      "3D Modeling & Sculpting: ZBrush / Maya / Blender / Softimage",
      "Game Engines: Unreal Engine / Unity3D",
      "Compositing & Imaging: After Effects / Photoshop",
      "Programming & Office: Python (Web Framework) / MS Office (Word, Excel, PowerPoint)",
      "Key Projects: TMNT / Astro Boy / Mulan / Journey to the West / Monster Hunter Frontier (CG)",
      "Languages: English / Chinese Typing",
    ],
    bio: "He excels at delivering high-quality visual assets that meet the rigorous demands of large-scale production environments, combining artistic flair with technical precision to bring characters and worlds to life."
  },
  {
    id: 5,
    name: "Ms. Myra Ku",
    position: "Teaching Assistant",
    avatar: "/TA_Myra.jpeg",
    intro: "Aspiring and versatile professional with a burgeoning career in web development, underpinned by a solid foundation in business management and creative design. Myra holds a Bachelor of Business Administration (Hons) and a specialized Certificate in Front-End Website Development, bringing a unique blend of aesthetic sensibility and marketing acumen to technical projects. She combines practical experience in clean coding and responsive design with a history of driving sales and operational efficiency in corporate settings.",
    technicalBg: [
      "Solid technical expertise in modern front-end technologies, with hands-on proficiency in writing clean, efficient code using HTML, CSS, JavaScript, and React.",
      "Design-Driven Development: Leverages a strong background in design and tools like Adobe Creative Cloud and Figma to ensure user-friendly, responsive, and visually engaging web applications.",
      "Data & Operations awareness: Equipped with data analysis skills using Power BI, SQL, and Python, complementing her ability to handle operations, SEO marketing, and digital platform management."
    ],
    educationalContrib: [
      "Web Developer Trainee: Actively contributes to development teams by applying best practices in UX and responsive design, participating in brainstorming sessions, and delivering efficient code based on strict project requirements.",
      "Marketing & Business Growth: Proven track record as a Sales and Marketing Executive, where she planned website content, executed SEO strategies, and designed advertisement artwork that increased brand exposure by 10-20%.",
      "Operational Excellence: Demonstrated reliability in fast-paced environments as an Operations and Office Support Specialist, adept at coordinating delivery teams, handling emergency services, and communicating effectively with clients."
    ],
    expertise: [
      "Front-End Development: HTML/CSS/Tailwind CSS/JavaScript/React",
      "Data & Logic: Python/SQL/Power BI",
      "Design & UI/UX: Figma/Adobe Illustrator/Adobe Photoshop/Responsive Design",
      "Business Tools: Microsoft Excel/Word",
      "Marketing & Strategy: SEO Marketing/Website Content Planning/Online Sales Monitoring/Brand Image Development"
    ],
    bio: "She excels at leveraging her dual skills in coding and design to create engaging web applications that enhance user experience while aligning with core marketing principles. Her eagerness to implement innovative solutions makes her a adaptable contributor capable of bridging the gap between technical execution and business goals."
  }
];

export default function TeamPage() {
  const [activeMember, setActiveMember] = useState(teamMembers[0]);

  return (
    <>
    {/* 導航欄 */}
    <ITEnav/>
    <div className="min-h-screen bg-white">
      {/* 為什麼選擇ITE區塊 */}
      <section className="relative h-100 overflow-hidden">
        <img 
          src="https://picsum.photos/id/180/1920/800" 
          alt="課堂場景" 
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

      {/* 核心：grid适配 + 手机端横向滚动列表 | 保留md/lg 5列网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* 教師列表（左側）：lg端垂直列表 | sm及以下横向滚动栏（收窄宽度+文字排密） */}
        <div className="lg:col-span-1 mb-6 lg:mb-0">
          {/* 手机端滚动容器 + 样式 | lg端自动失效 */}
          <div className="overflow-x-auto pb-4 lg:overflow-x-visible lg:pb-0 scrollbar-hide">
            <div className="flex lg:block gap-1 lg:gap-0 lg:space-y-8 w-max lg:w-full">
              {teamMembers.map((member) => (
                <div 
                  key={member.id}
                  onClick={() => setActiveMember(member)}
                  className={`p-2 lg:p-4 rounded-lg cursor-pointer transition-all min-w-30 lg:min-w-0 ${
                    activeMember.id === member.id 
                      ? "bg-gray-100 shadow-md border border-gray-200" 
                      : "hover:bg-gray-50 border-transparent"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 mx-auto lg:mx-0"> 
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-xs lg:text-xl font-medium text-gray-800 text-center lg:text-left mt-1">
                    {member.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 教師詳情（右側）：lg端col-span-4 | 手机端全屏col-span-1 */}
        <div className="lg:col-span-4 bg-gray-50 p-6 sm:p-8 rounded-lg shadow-sm">
          {/* 头像+姓名+职称 行内布局优化（手机端更紧凑） */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <img 
                src={activeMember.avatar} 
                alt={activeMember.name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* 姓名+职称容器（垂直排列，手机端不挤） */}
            <div>
              <h4 className="text-xl sm:text-2xl font-medium text-gray-800 mb-2">{activeMember.name}</h4>
              <p className="text-md sm:text-lg font-medium text-gray-400">{activeMember.position}</p>
            </div>
          </div>
          
          {/* 教师简介（手机端行高优化） */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {activeMember.intro}
          </p>

          {/* 技術背景/專長區塊 - 手机端内边距/间距优化 */}
          {activeMember.technicalBg && (
            <div className="mb-5 sm:mb-6">
              <h5 className="font-medium text-gray-800 mb-2 text-base sm:text-lg">Technical Background:</h5>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
                {activeMember.technicalBg.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {activeMember.educationalContrib && (
            <div className="mb-5 sm:mb-6">
              <h5 className="font-medium text-gray-800 mb-2 text-base sm:text-lg">Professional & Educational Contributions</h5>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
                {activeMember.educationalContrib.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {activeMember.expertise && (
            <div className="mb-5 sm:mb-6">
              <h5 className="font-medium text-gray-800 mb-2 text-base sm:text-lg">Expertise:</h5>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 sm:space-y-2 text-sm sm:text-base">
                {activeMember.expertise.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {activeMember.bio && (
            <div className="text-sm sm:text-base leading-relaxed">
              <p className="text-gray-600">
                {activeMember.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
    </div>
    <ITEFooter/>
    </>
  );
}