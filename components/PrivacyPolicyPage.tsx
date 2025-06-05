
import React from 'react';
import { Language } from '../types';

interface PrivacyPolicyPageProps {
  currentLanguage: Language;
  onExit: () => void;
  s: { // Pass the S object from App.tsx for shared strings
    privacyPolicyTitle: string;
    goBackToSearch: string;
  };
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ currentLanguage, onExit, s }) => {
  const pageContentDirection = currentLanguage === Language.Urdu ? 'rtl' : 'ltr';
  const textAlign = currentLanguage === Language.Urdu ? 'text-right' : 'text-left';

  // Localized section titles (content will be placeholder English for now)
  const S_Page = {
    lastUpdated: currentLanguage === Language.Urdu ? "آخری تازہ کاری:" : "Last Updated:",
    introductionTitle: currentLanguage === Language.Urdu ? "تعارف" : "Introduction",
    infoCollectTitle: currentLanguage === Language.Urdu ? "ہماری جمع کردہ معلومات" : "Information We Collect",
    personalInfoSubtitle: currentLanguage === Language.Urdu ? "ذاتی معلومات" : "Personal Information",
    nonPersonalInfoSubtitle: currentLanguage === Language.Urdu ? "غیر ذاتی معلومات" : "Non-Personal Information",
    locationInfoSubtitle: currentLanguage === Language.Urdu ? "مقام کی معلومات" : "Location Information",
    mediaInfoSubtitle: currentLanguage === Language.Urdu ? "مائیکروفون اور کیمرہ ڈیٹا" : "Microphone and Camera Data",
    howWeUseTitle: currentLanguage === Language.Urdu ? "ہم آپ کی معلومات کیسے استعمال کرتے ہیں" : "How We Use Your Information",
    howWeShareTitle: currentLanguage === Language.Urdu ? "ہم آپ کی معلومات کیسے شیئر کرتے ہیں" : "How We Share Your Information",
    dataSecurityTitle: currentLanguage === Language.Urdu ? "ڈیٹا سیکیورٹی" : "Data Security",
    yourChoicesTitle: currentLanguage === Language.Urdu ? "آپ کے انتخاب اور حقوق" : "Your Choices and Rights",
    childrenPrivacyTitle: currentLanguage === Language.Urdu ? "بچوں کی رازداری" : "Children's Privacy",
    changesPolicyTitle: currentLanguage === Language.Urdu ? "اس پالیسی میں تبدیلیاں" : "Changes to This Policy",
    contactUsTitle: currentLanguage === Language.Urdu ? "ہم سے رابطہ کریں" : "Contact Us",
  };

  const lastUpdatedDate = "August 2, 2024";

  return (
    <div className={`privacy-policy-page-container bg-secnto-gray dark:bg-gray-800 text-secnto-gray-text dark:text-secnto-gray-text-dark py-6 sm:py-8 ${currentLanguage === Language.Urdu ? 'urdu-text' : ''}`}>
      <div className={`max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-lg shadow-xl ${textAlign}`} dir={pageContentDirection}>
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secnto-blue dark:text-secnto-green">{s.privacyPolicyTitle}</h1>
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-secnto-gray-text dark:text-secnto-gray-text-dark transition-colors"
          >
            {s.goBackToSearch}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{S_Page.lastUpdated} {lastUpdatedDate}</p>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.introductionTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Welcome to Secnto! We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our search engine and related services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.infoCollectTitle}</h2>
          
          <h3 className="text-lg font-medium mt-3 mb-1 text-gray-700 dark:text-gray-300">{S_Page.personalInfoSubtitle}</h3>
          <p className="text-sm sm:text-base leading-relaxed">
            We may collect personal information such as your name, email address, and search history if you create an account or interact with certain features. This information is used to personalize your experience and provide our services.
          </p>

          <h3 className="text-lg font-medium mt-3 mb-1 text-gray-700 dark:text-gray-300">{S_Page.nonPersonalInfoSubtitle}</h3>
          <p className="text-sm sm:text-base leading-relaxed">
            We automatically collect non-personal information, such as your browser type, device information, IP address (anonymized where possible), and usage patterns. This data helps us improve our services and understand user trends.
          </p>

           <h3 className="text-lg font-medium mt-3 mb-1 text-gray-700 dark:text-gray-300">{S_Page.locationInfoSubtitle}</h3>
          <p className="text-sm sm:text-base leading-relaxed">
            With your explicit permission, we may collect your geolocation data to provide location-based search results and features. You can control location sharing through your browser or device settings.
          </p>

          <h3 className="text-lg font-medium mt-3 mb-1 text-gray-700 dark:text-gray-300">{S_Page.mediaInfoSubtitle}</h3>
          <p className="text-sm sm:text-base leading-relaxed">
            If you grant permission and use features like voice search or image-based search (in the AI assistant), we may process microphone audio or image data temporarily to fulfill your request. This data is not stored long-term unless explicitly stated for a specific feature.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.howWeUseTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Your information is used to: provide and maintain our services; personalize your experience; improve our platform; communicate with you; process transactions; and comply with legal obligations. We aim to enhance your search experience and develop new features.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.howWeShareTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            We do not sell your personal information. We may share information with trusted third-party service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.dataSecurityTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            We implement a variety of security measures to maintain the safety of your personal information. However, no electronic storage or transmission over the internet is entirely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.yourChoicesTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            You have choices regarding your information. You can typically access or modify your personal information through your account settings. You can also control cookie settings through your browser and manage location, microphone, and camera permissions.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.childrenPrivacyTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Our services are not directed to individuals under the age of 13 (or a higher age threshold depending on the jurisdiction). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.changesPolicyTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.contactUsTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            If you have any questions about this Privacy Policy, please contact us at privacy@secnto.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
