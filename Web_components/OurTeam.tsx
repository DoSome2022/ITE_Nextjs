import React from 'react';
import TeacherEricIcon from "../public/image/TeacherEricIcon.jpg";
import WaiLung from "../public/image/WaiLung.jpeg";
import HoncyLee from "../public/image/HoncyLee.jpeg";


import Image from 'next/image';


export default function OurTeam() {
  return (
    <>
    <section className="w-full mt-20 p-10 ">
            <h1 className="text-3xl font-bold px-6 text-center">Our Professional Team</h1>
            <h1 className="text-xl font-bold mb-8 px-6 text-center">教育專業團隊</h1>
            <hr className="w-20 h-1 mx-auto my-4 bg-white border-0" />
            <div className="flex flex-wrap justify-center mt-5 text-center">
                {/* Content Box 1 */}
                <div className="mb-20 px-10 md:w-220 flex flex-col lg:flex-1/3 items-center">
                    <div className="flex justify-center">
                      <Image src={WaiLung} height="150" width="150"  alt="" />
                    </div>
                    <h3 className="pt-3 text-2xl font-extrabold text-cyan-700">Mr. Aaron Wai</h3>
                    <h5 className="text-[14px] text-gray-600">Master of Science of Electrical Engineering, Polytechnic University of New York</h5>
                    <h5 className="text-[14px] text-gray-600">Master of Art of Computer Science, Queens College, City University of New York</h5>
                    <h5 className="text-[14px] text-gray-600">Bachelor of Engineering of Electrical Engineering, City University of New York</h5>
                    <h6 className="text-[14px] text-gray-800 font-bold pt-2">With a multidisciplinary background that bridges tech, finance, sales, and leadership, he brings hands-on corporate experience from building systems, managing teams, and scaling businesses in Asia, all while focusing on practical teaching approaches that emphasize job-ready skills in web development, automation, and data analysis.</h6>
                    <p className="text-[22px] text-gray-400 font-light pt-8 caveat-400">"From Engineering to Entrepreneurship—Learn Full-Stack Web Dev & Data Science from a Pro"</p>
                    <p className="text-[22px] text-gray-400 font-light caveat-400">"Ex-Sales Leader & Tech Expert Now Teaching Python, Machine Learning & Web Development"</p>
                    <p className="text-[22px] text-gray-400 font-light caveat-400">"Real-World Business + Coding Skills: Master Web Dev & Data Analytics with an Industry Veteran"</p>
                    
                </div>
                {/* Content Box 2 */}
                <div className="mb-20 px-10 md:w-220 flex flex-col lg:flex-1/3 items-center">
                    <div className="flex justify-center">
                      <Image src={HoncyLee} height="150" width="150" alt="" />
                    </div>
                    <h3 className="pt-3 text-2xl font-extrabold text-cyan-700">Mr. Honcy Lee</h3>
                    <h5 className="text-[14px] text-gray-600">BA in Accounting & Finance </h5>
                    <h5 className="text-[14px] text-gray-600">PgD in Financial Analytics & Algo Trading (with merits & distinction)</h5>
                    <h6 className="text-[14px] text-gray-800 font-bold pt-2">I am the Founder and Director of an IT and financial data analytics company, a former Managing Director at a private tech company, and I possess over 10 years of experience in multinational financial institutions.</h6>
                    <p className="text-[22px] text-gray-400 font-light pt-8 caveat-400">"Learn from a Finance & Data Analytics Expert with Real Industry Leadership" </p>
                    <p className="text-[22px] text-gray-400 font-light caveat-400 ">"From Corporate Finance to AI-Driven Trading—Master Python & Data Skills with a Pro"</p>
                    <p className="text-[22px] text-gray-400 font-light caveat-400 ">"10+ Years in Finance & Tech, Now Training the Next Generation of Analysts"</p>
                </div>
                {/* Content Box 3 */}
                <div className="mb-20 px-10 md:w-220 flex flex-col lg:flex-1/3 items-center">
                    <div className="flex justify-center">
                      <Image src={TeacherEricIcon} height="150" width="150" alt="" />
                    </div>
                    <h3 className="pt-3 text-2xl font-extrabold text-cyan-700">Mr. Eric</h3>
                    <h6 className="text-[14px] text-gray-800 font-bold pt-2">Meet Mr. Eric, an accomplished ERP Transformation Mentor with over 15 years of experience in defining industry pain points and driving strategic solutions. As a SME Growth Turbocharger, Eric excels at identifying and capitalizing on opportunities for small and medium enterprises, helping them scale and thrive in a competitive landscape. He is passionate about skills transfer that creates real-world impact, ensuring that knowledge is not just theoretical but practically applicable. Furthermore, Eric holds multiple certifications, showcasing his commitment to continuous learning and staying at the forefront of industry advancements.</h6>
                    <p className="text-[22px] text-gray-400 font-light pt-8 caveat-400">"ERP Consultant Reveals: 3 Settings That Are Costing You Millions"</p>
                    <p className="text-[22px] text-gray-400 font-light caveat-400 ">"Stop Wasting ERP Licenses!Activation Method Works"</p>
                </div>
                
            </div>
        </section>
    </>
  );
};