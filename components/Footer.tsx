'use client';

import { Smartphone, Phone,  Mail, Facebook, Instagram, Linkedin, Youtube, ShoppingCart, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ITELOGO from "@/public/Logo_White.png";

export default function ITEFooter() {


    const currentYear = new Date().getFullYear();
    
    return(
      <>
    {/* 頁腳 */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-center justify-start">
                <Image src={ITELOGO} width={80} height={80} alt="ITE Logo" className='mr-5'></Image>
            </div>
            <div>
              <h4 className="font-medium mb-4">Information</h4>
              <div className="">
                <Link href="/">
                <div className="text-left mb-2">
                    <span className="block text-sm font-medium text-gray-400">COURSE</span>
                    <span className="block text-xs text-gray-100">課程總覽</span>
                </div>
                </Link>
                <Link href="/news">
                <div className="text-left mb-2">
                    <span className="block text-sm font-medium text-gray-400">NEWS</span>
                    <span className="block text-xs text-gray-100">最新消息</span>
                </div>
                </Link>
                <Link href="/ourteam">
                <div className="text-left mb-2">
                    <span className="block text-sm font-medium text-gray-400">OUR TEAM</span>
                    <span className="block text-xs text-gray-100">教育團隊</span>
                </div>
                </Link>
                <Link href="/">
                <div className="text-left mb-2">
                    <span className="block text-sm font-medium text-gray-400">About Us</span>
                    <span className="block text-xs text-gray-100">關於我們</span>
                </div>
                </Link>
                <Link href="/privacy-policy">
                <div className="text-left mb-2">
                    <span className="block text-sm font-medium text-gray-400">Privacy Policy</span>
                    <span className="block text-xs text-gray-100">隱私政策</span>
                </div>
                </Link>
                <Link href="/complaintFrom">
                <div className="text-left mb-2">
                    <span className="block text-sm font-medium text-gray-400">Complaint form</span>
                    <span className="block text-xs text-gray-100">投訴表格</span>
                </div>
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contacts</h4>
              <ul className="space-y-2 text-gray-400">
                <li className='flex'><Mail size={16} /><span className='ml-2'>info@ite.edu.hk</span></li>
                <li className='flex'><Smartphone size={16} /><span className='ml-2'>5100 1888</span></li>
                <li className='flex'><Phone size={16} /><span className='ml-2'>3163 9569</span></li>
                <li className='flex'>Flat B, 7/F, Sun Shine Centre, 61-63 Portland Street, Yau Ma Tei, Kln.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Social Media</h4>
              <div className="flex space-x-4">
                <Link href="https://www.facebook.com/InnoTechEDU/?locale=zh_HK">
                <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Facebook size={16} />
                </button>
                </Link>
                <Link href="https://www.instagram.com/innotechedu/">
                <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Instagram size={16} />
                </button>
                </Link>
                <Link href="https://www.linkedin.com/company/innovation-trend-education-centre/">
                <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Linkedin size={16} />
                </button>
                </Link>
                <Link href="https://www.youtube.com/@InnovationTrendEducation">
                <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <Youtube size={16} />
                </button>
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            © {currentYear} All Rights Reserved
          </div>
        </div>
      </footer>
      </>
    );
}