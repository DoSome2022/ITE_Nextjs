
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
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.049458219851!2d114.1696434!3d22.3139692!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404014e58a723f7%3A0x7b8fb7f46cb8b106!2zSW5ub1RyZW5kRWR1LeWuj-alreaVmeiCsuS4reW_gw!5e0!3m2!1szh-TW!2shk!4v1773215175531!5m2!1szh-TW!2shk" 
              width="600" height="450" loading="lazy" ></iframe>
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