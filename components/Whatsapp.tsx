import React from 'react';
import { MessageCircleMore } from 'lucide-react';
import Link from "next/link";


export default function WhatsAppButton() {

  return (
    <>
      <div className='fixed bottom-4 right-4 z-50'>
        <Link
        href="https://wa.me/51001888"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center space-x-2"
        id="WhatsAppClick"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircleMore className="text-2xl" />
        <span className="font-medium">WhatsApp查詢</span>
      </Link>
      </div>
    </>
  );
}
