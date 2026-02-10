'use client';
import { useState } from 'react';
import {  Menu, X,  LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


export default function ITEnav() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    
    return(
        <nav className="sticky top-0 bg-white/90 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
              <Image src="/Logo.png" width={50} height={50} alt="ITE Logo" className='mr-5'></Image>
              </Link>
              <div className="hidden md:flex space-x-8">
              <Link href="/course">
              <div className="text-left text-sm font-medium text-gray-700 hover:text-blue-700 ">
                <span className="block">COURSE</span>
                <span className="block">課程總覽</span>
              </div>
              </Link>
              <Link href="/news">
              <div className="text-left text-sm font-medium text-gray-700 hover:text-blue-700 ">
                <span className="block">NEWS</span>
                <span className="block">最新消息</span>
              </div>
              </Link>
              <Link href="/ourteam">
              <div className="text-left text-sm font-medium text-gray-700 hover:text-blue-700 ">
                <span className="block">OUR TEAM</span>
                <span className="block">教育團隊</span>
              </div>
              </Link>
              <Link href="/">
              <div className="text-left text-sm font-medium text-gray-700 hover:text-blue-700 ">
                <span className="block">About Us</span>
                <span className="block">關於我們</span>
              </div>
              </Link>
            </div>
            </div>

            {/* 桌面端導航 */}
            

            {/* 右上角功能按鈕 */}
            <div className="hidden md:flex items-center space-x-4">
                {/* 登入按鈕 */}
                <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-700 transition-colors">
                    <LogIn size={16} />
                    <span>登入</span>
                </button>

                {/* 註冊按鈕 */}
                <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-700 transition-colors">
                    <UserPlus size={16} />
                    <span>註冊</span>
                </button>

                {/* 購物車按鈕（含數量標記） */}
                {/* <button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-700 transition-colors relative">
                    <ShoppingCart size={16} />
                    <span>購物車</span>
                </button> */}
                </div>

            {/* 手機端選單按鈕 */}
            <button 
              className="md:hidden text-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 手機端導航選單 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-4 text-md">
              <Link href="/course">
              <div className="text-center py-2  text-gray-500 hover:text-blue-700">
                <span className="block font-medium">COURSE</span>
                <span className="block">課程總覽</span>
              </div>
              </Link>
              <Link href="/news">
              <div className="text-center py-2  text-gray-500 hover:text-blue-700">
                <span className="block font-medium">NEWS</span>
                <span className="block text-gray-500">最新消息</span>
              </div>
              </Link>
              <Link href="/ourteam">
              <div className="text-center py-2  text-gray-500 hover:text-blue-700">
                <span className="block font-medium">OUR TEAM</span>
                <span className="block text-gray-500">教育團隊</span>
              </div>
              </Link>
              <Link href="/">
              <div className="text-center py-2  text-gray-500 hover:text-blue-700">
                <span className="block font-medium">About Us</span>
                <span className="block text-gray-500">關於我們</span>
              </div>
              </Link>
              
              <div className="flex justify-center space-x-4 py-2">
                <Link href="/"><button className="text-sm text-gray-600 hover:text-blue-700">登入</button></Link>
                <Link href="/"><button className="text-sm text-gray-600 hover:text-blue-700">註冊</button></Link>
                <Link href="/"><button className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-700 transition-colors relative">
                    {/* <ShoppingCart size={16} />
                    <span>購物車</span> */}
                </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
}