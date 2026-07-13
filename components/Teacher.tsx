'use client';
import { useState } from 'react';

// 導入圖片資源
import Image from "next/image"; // 導入 Next.js 的 Image 組件
import Teacher_WaiLung from "@/public/Teacher_WaiLung.webp";
import Teacher_HoncyLee from "@/public/Teacher_HoncyLee.webp";
import Teacher_Eric from "@/public/Teacher_Eric.png";
import Teacher_JTsang from "@/public/Teacher_JTsang.png";
import Teacher_Antoninus from "@/public/Teacher_Antoninus.jpeg";
import TA_Myra from "@/public/TA_Myra.jpeg";
import Teacher_CSFung from "@/public/Teacher_CSFung.png";
import Teacher_Oscar from "@/public/Teacher_Oscar.jpeg";
// import Teacher_WaiLung from "@/public/";

// 教師數據
const teamMembers = [
  {
    id: 1,
    name: "Mr. Aaron Wai",
    position: "Teacher",
    avatar: Teacher_WaiLung,
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
    avatar: Teacher_HoncyLee,
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
    avatar: Teacher_Eric,
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
    avatar: Teacher_JTsang,
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
  name: "Mr. Antoninus Yeung",
  position: "Teacher",
  avatar: Teacher_Antoninus,
  intro: "Accomplished and versatile professional with a robust background in accounting, business management, and system re-engineering. Antoninus holds multiple graduate degrees in business disciplines, complemented by professional certifications as an accountant in Australia, the UK, and Hong Kong. With over 30 years of experience in commercial environments, he brings a unique blend of analytical skills and strategic insight to drive business innovation and optimize operational efficiency.",
  technicalBg: [
    "Solid technical expertise in database management, including relational databases (RDBMS) and NoSQL systems, with hands-on experience in Oracle, MSSQL, MySQL, and MongoDB.",
    "Proficient in Microsoft Office Suite and VBA, enhancing productivity and automating workflows.",
    "Familiar with business intelligence tools, including SharePoint, Power BI, and Power Automate, to facilitate data-driven decision-making."
  ],
  educationalContrib: [
    "In-House Coaching: Experienced in mentoring individuals and teams, fostering a collaborative environment that encourages professional growth and skill enhancement.",
    "Business System Re-engineering: Demonstrated ability to innovate business processes, enhancing operational efficiency and driving organizational success.",
    "Commercial Acumen: Proven track record in executing marketing strategies and managing complex business functions, ensuring alignment with organizational goals."
  ],
  expertise: [
    "Accounting & Financial Management: Professional Accountant with proficiency in financial analysis, budgeting, and risk management.",
    "Database Management: Expert in Oracle, MSSQL, MySQL, and MongoDB.",
    "Automation & Productivity: Advanced skills in Microsoft Office, VBA, and integrated business solutions.",
    "Business Development: Experienced in system re-engineering and innovation, focusing on creating efficient business models.",
    "Cyber Security: Knowledgeable in cybersecurity principles with a Certified Information Security Professional (CISP) credential."
    
  ],
  bio: "Antoninus excels at leveraging his extensive professional experience to act as a consultant for business system innovations. His background enables him to foster collaboration across departments and implement effective strategies that enhance organizational performance."
  },
  {
  id: 6,
  name: "Ms. CS Fung",
  position: "Teacher",
  avatar: Teacher_CSFung,
  intro: "An adaptable and highly experienced educator who began her teaching journey at age 16, building over a decade of extensive experience in language instruction. Backed by an academic foundation in English Studies and complemented by studies in Japanese and Business, Ms. CS Fung has been continuously entrusted to lead engaging English Enhancement Courses across various primary and secondary schools. Uniquely positioning herself at the intersection of modern technology and education, she combines teaching pragmatism with current digital tech literacies.",
  technicalBg: [
    "Competent Technical Command: Equipped with a solid understanding of Artificial Intelligence (AI) applications and how modern educational tooling converges with everyday workflows.",
    "Foundation in Programming: Formally trained in Full-stack web development basics, enabling logic-oriented systematic approaches to lesson plannings and complex problem-solving."
  ],
  educationalContrib: [
    "Core Language Instruction: Over 10 years of consistent, successful delivery in designing and teaching English language enhancement components geared toward young educators and multi-level students in registered primary and secondary schools.",
    "Pedagogical Translation: Highly regarded for her unique attribute of stripping down and simplifying immensely complex linguistic and technical concepts into digestible learning milestones for absolute beginners to intermediate learners.",
    "Versatility in Delivery: Has developed a refined pedagogical toolkit to distinctively dynamically adapt teaching styles to address the widely ranging needs spanning different age groups."
  ],
  expertise: [
    "Educational Subjects: English Studies / Japanese Language Basics / Business Frameworks",
    "Instruction Design: English Enhancement Course Delivery / Cross-Age Cohort Pedagogical Design",
    "Modern Tools: AI-assisted Learning Integration / Foundations in Full-Stack Web Methodologies"
  ],
  bio: "Equipped with a diverse fusion of linguistic and forward-looking capabilities, Ms. CS Fung excels at simplifying complex subjects for students. Her outstanding adaptive capacities guarantee that all curriculum learning outcomes are smoothly achieved and material perfectly understood natively across diverse age spectrums limitlessly."
},
{
  id: 7,
  name: "Mr. Oscar Lo",
  position: "Analyst Programmer & Senior Educator",
  avatar: Teacher_Oscar,
  intro: "Oscar Lo is a distinguished Analyst Programmer and Senior Educator with an extensive track record in enterprise-level software development and technical training. With professional experience at IBM, he has spearheaded the development of high-profile enterprise platforms, specializing in microservices, API architecture, and high-performance commercial systems. As a high-volume educator, Oscar has taught over 4,500+ hours of professional programming courses over the past three years.",
  technicalBg: [
    "Enterprise Software Development: Led the development of high-profile enterprise platforms at IBM with expertise in microservices, API architecture, and high-performance commercial systems.",
    "Backend Engineering Specialization: Expert in breaking down complex backend concepts including Java, Spring Boot, and SQL into digestible, actionable knowledge for students.",
    "Practical System Development: Hands-on experience building automated recruitment plugins and market data extractors with technical insights beyond standard textbooks."
  ],
  educationalContrib: [
    "Professional Programming Instructor: Taught over 4,500+ hours of professional programming courses in the past three years to students of various levels.",
    "Industry Skill Empowerment: Bridges multinational corporate development experience with classroom teaching to equip tech talents with exact industry-demanded skill sets.",
    "Technical Knowledge Translation: Specializes in simplifying complex engineering concepts for effective learning and practical application."
  ],
  expertise: [
    "Backend Engineering: Java / Spring Boot / Spring Data JPA / RESTful API Design",
    "Database Management: SQL / PostgreSQL / MySQL / Database Schema Design",
    "Data Analysis Tools: Python / Pandas / Numpy / Polars / Numba / SciPy",
    "Data Integration & Automation: Web Scraping / BeautifulSoup / Selenium / Scrapy / Session Management",
    "Web Development: Django / HTML / CSS / JavaScript / Flowbite",
    "Version Control & Collaboration: Git / GitHub / GitLab / Git Flow",
    "Enterprise Experience: Microservices Architecture / Performance Testing / Enterprise Platform Development (IBM)",
    "Project Management: Automated Productivity Tools / GUI-based Scrapers (PyQt5) / Market Data Analytics"
  ],
  bio: "His deep technical expertise combined with extensive enterprise development experience enables him to deliver industry-relevant education. By bridging the gap between corporate development at a multinational level and passionate classroom teaching, Oscar excels at empowering the next generation of tech talent with the exact skill sets demanded by today’s industry."
},
  {
  id: 8,
  name: "Ms. Myra Ku",
  position: "Teaching Assistant",
  avatar: TA_Myra,
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

export default function Teacher() {
  const [activeMember, setActiveMember] = useState(teamMembers[0]);

  return (
    <>
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
                    <Image 
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
              <Image 
                src={activeMember.avatar} 
                alt={activeMember.name} 
                width={1080} // 根據實際圖片尺寸調整
                height={1080} // 根據實際圖片尺寸調整
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
    </>
  );
}