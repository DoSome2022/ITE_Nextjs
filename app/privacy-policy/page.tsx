import ITEFooter from '@/components/Footer';

import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Privacy Policy | Innovation Trend Education Centre',
  description: 'Learn how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyPage() {
  // 設置日期格式為美式英語 (例如: October 24, 2025)
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </p>
        </header>

        {/* Content - Using Tailwind v4 space-y utilities */}
        <div className="space-y-8 text-base leading-7 text-gray-700">
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>Innovation Trend Education Centre</strong> ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
              <li>
                <strong className="text-gray-900">Account Information:</strong> We collect personal details such as your name, email address, and password when you register.
              </li>
              <li>
                <strong className="text-gray-900">Usage Data:</strong> We automatically collect information about your device, including IP address, browser type, and operating system when you visit our site.
              </li>
              <li>
                <strong className="text-gray-900">Cookies:</strong> We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p>We use the collected data for various purposes, including to:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2 marker:text-gray-400">
              <li>Provide, operate, and maintain our service.</li>
              <li>Process your transactions and send related information.</li>
              <li>Respond to your comments, questions, and provide customer support.</li>
              <li>Monitor and analyze usage trends and activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. 
              We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.
              We may disclose your information where required to do so by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
            <p>
              We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. 
              But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
            </p>
            <a 
                href="mailto:info@ite.edu.hk" 
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                info@ite.edu.hk
              </a>
          </section>

        </div>

        {/* Footer Link */}
        <footer className="mt-12 pt-8 border-t border-gray-100 text-center">
          <a href="/" className="text-sm font-semibold text-gray-600 hover:text-gray-900">
            &larr; Back to Home
          </a>
        </footer>
      </div>
    </main>
    <ITEFooter/>
    </>
  );
}
