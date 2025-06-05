
import React from 'react';
import { Language } from '../types';

interface TermsAndConditionsPageProps {
  currentLanguage: Language;
  onExit: () => void;
  s: { // Pass the S object from App.tsx for shared strings
    termsAndConditionsTitle: string;
    goBackToSearch: string;
  };
}

const TermsAndConditionsPage: React.FC<TermsAndConditionsPageProps> = ({ currentLanguage, onExit, s }) => {
  const pageContentDirection = currentLanguage === Language.Urdu ? 'rtl' : 'ltr';
  const textAlign = currentLanguage === Language.Urdu ? 'text-right' : 'text-left';

  // Localized section titles (content will be placeholder English for now)
  const S_Page = {
    lastUpdated: currentLanguage === Language.Urdu ? "آخری تازہ کاری:" : "Last Updated:",
    acceptanceTitle: currentLanguage === Language.Urdu ? "شرائط کی قبولیت" : "Acceptance of Terms",
    useOfServiceTitle: currentLanguage === Language.Urdu ? "سروس کا استعمال" : "Use of Our Service",
    userConductTitle: currentLanguage === Language.Urdu ? "صارف کا طرز عمل" : "User Conduct",
    intellectualPropertyTitle: currentLanguage === Language.Urdu ? "دانشورانہ املاک کے حقوق" : "Intellectual Property Rights",
    disclaimersTitle: currentLanguage === Language.Urdu ? "دستبرداری" : "Disclaimers",
    limitationLiabilityTitle: currentLanguage === Language.Urdu ? "ذمہ داری کی حد" : "Limitation of Liability",
    indemnificationTitle: currentLanguage === Language.Urdu ? "تلافی" : "Indemnification",
    changesTermsTitle: currentLanguage === Language.Urdu ? "شرائط میں تبدیلیاں" : "Changes to Terms",
    governingLawTitle: currentLanguage === Language.Urdu ? "حکومتی قانون" : "Governing Law",
    contactUsTitle: currentLanguage === Language.Urdu ? "ہم سے رابطہ کریں" : "Contact Us",
  };

  const lastUpdatedDate = "August 2, 2024"; 

  return (
    <div className={`terms-conditions-page-container bg-secnto-gray dark:bg-gray-800 text-secnto-gray-text dark:text-secnto-gray-text-dark py-6 sm:py-8 ${currentLanguage === Language.Urdu ? 'urdu-text' : ''}`}>
      <div className={`max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-700 rounded-lg shadow-xl ${textAlign}`} dir={pageContentDirection}>
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-secnto-blue dark:text-secnto-green">{s.termsAndConditionsTitle}</h1>
          <button
            onClick={onExit}
            className="px-3 py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md text-secnto-gray-text dark:text-secnto-gray-text-dark transition-colors"
          >
            {s.goBackToSearch}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{S_Page.lastUpdated} {lastUpdatedDate}</p>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.acceptanceTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            By accessing or using Secnto ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, then you may not access the Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.useOfServiceTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service. Prohibited behavior includes harassing or causing distress or inconvenience to any other user, transmitting obscene or offensive content, or disrupting the normal flow of dialogue within the Service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.userConductTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            You are responsible for all your activity in connection with the Service. Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your right to access or use the Service. You may not post or transmit, or cause to be posted or transmitted, any communication or solicitation designed or intended to obtain password, account, or private information from any Secnto user.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.intellectualPropertyTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of Secnto and its licensors. The Service is protected by copyright, trademark, and other laws of both Pakistan and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Secnto.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.disclaimersTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance. Secnto does not warrant that a) the Service will function uninterrupted, secure, or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.limitationLiabilityTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            In no event shall Secnto, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
          </p>
        </section>
        
        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.indemnificationTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
             You agree to defend, indemnify and hold harmless Secnto and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, or b) a breach of these Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.changesTermsTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.governingLawTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{S_Page.contactUsTitle}</h2>
          <p className="text-sm sm:text-base leading-relaxed">
            If you have any questions about these Terms, please contact us at terms@secnto.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
