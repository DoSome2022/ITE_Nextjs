'use client';

import { Smartphone, Phone, MapPinCheck, Mail } from 'lucide-react';



export default function ITEGoogleMap() {

    
    return(
      <>
        {/* 聯絡我們區 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="h-120 overflow-hidden rounded-lg">
              {/* GoogleMap */}
              <div className="flex justify-center">
              <iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3691.0494508253887!2d114.16704927529307!3d22.313969479676796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sFlat%2FRM.B7%20SUN%20SHINE%20CENTRE%2C%2061-63%20PORTLAND%20STREET%2C%20YAU%20MA%20TEI%2C%20KLN!5e0!3m2!1sen!2shk!4v1749026807577!5m2!1sen!2shk" 
              width="1000" height="1000" loading="lazy"></iframe>
              </div>
            </div>
            <div className="my-auto">
              <h4 className="text-5xl font-light text-gray-500 mb-2">Contacts</h4>
              <h3 className="text-xl font-semibold text-gray-700 mb-6">聯絡我們</h3>
              <ul className="space-y-2 text-gray-600">
                <li className='flex'><Mail size={24} /><span className='ml-2'>info@ite.edu.hk</span></li>
                <li className='flex'><Smartphone size={24} /><span className='ml-2'>5100 1888</span></li>
                <li className='flex'><Phone size={24} /><span className='ml-2'>3163 9569</span></li>
                <li className='flex'><MapPinCheck size={24} /><span className='ml-2'>Flat B, 7/F, Sun Shine Centre, 61-63 Portland Street, Yau Ma Tei, Kln.</span></li>
              </ul>
            </div>
          </div>
        </section>
      </>
    );
}