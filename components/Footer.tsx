
import React from 'react';
import { Language } from '../types';

interface FooterProps {
  language: Language;
  onToggleDashboard?: () => void; 
  onToggleSettings?: () => void;
  onTogglePrivacy?: () => void;
  onToggleTerms?: () => void; 
  onToggleNotebook?: () => void; // Added for Notebook
  secntoDescription: string;
}

const Footer: React.FC<FooterProps> = ({ 
    language, 
    onToggleDashboard, 
    onToggleSettings, 
    onTogglePrivacy, 
    onToggleTerms, 
    onToggleNotebook, // Added
    secntoDescription 
}) => {
  const year = new Date().getFullYear();
  const S = {
    allRightsReserved: language === Language.Urdu ? "جملہ حقوق محفوظ ہیں" : "All rights reserved",
    privacy: language === Language.Urdu ? "رازداری" : "Privacy",
    terms: language === Language.Urdu ? "شرائط" : "Terms",
    settings: language === Language.Urdu ? "ترتیبات" : "Settings", 
    cmsDashboardText: language === Language.Urdu ? "CMS ڈیش بورڈ" : "CMS Dashboard",
    aiNotebook: language === Language.Urdu ? "اے آئی نوٹ بک" : "AI Notebook", // Added
  };
  

  return (
    <footer className={`bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 
                       px-4 sm:px-6 py-3 sm:py-4 
                       ${language === Language.Urdu ? 'urdu-text' : ''}`}>
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-xs sm:text-sm">
          <p className="mb-2 sm:mb-0">
            &copy; {year} Secnto. {S.allRightsReserved}.
          </p>
          <div className={`flex flex-wrap justify-center sm:justify-end space-x-3 sm:space-x-4 ${language === Language.Urdu ? 'sm:space-x-reverse' : ''}`}>
            {onTogglePrivacy && (
                <button onClick={onTogglePrivacy} className="hover:underline">
                    {S.privacy}
                </button>
            )}
            {onToggleTerms && (
                <button onClick={onToggleTerms} className="hover:underline">
                    {S.terms}
                </button>
            )}
            {onToggleSettings && (
              <button onClick={onToggleSettings} className="hover:underline">
                {S.settings}
              </button>
            )}
            {onToggleNotebook && ( // Added Notebook button
              <button onClick={onToggleNotebook} className="hover:underline flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 ${language === Language.Urdu ? 'ml-1' : 'mr-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m0 0a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm1.516-3.042a2.083 2.083 0 01-2.365.729A2.083 2.083 0 019.11 13.395M14.89 10.605a2.083 2.083 0 012.365-.729 2.083 2.083 0 012.041 2.588" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.25A7.25 7.25 0 0013.75 6 7.25 7.25 0 006.5 13.25" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253V3.5A1.75 1.75 0 0113.75 1.75h2.5A1.75 1.75 0 0118 3.5v2.375m-10.5-.026V3.5A1.75 1.75 0 019.25 1.75h-2.5A1.75 1.75 0 005 3.5v2.348" />
                </svg>
                {S.aiNotebook}
              </button>
            )}
            {onToggleDashboard && (
                <button onClick={onToggleDashboard} className="hover:underline">
                    {S.cmsDashboardText}
                </button>
            )}
          </div>
        </div>
        <p className={`mt-3 sm:mt-4 text-center text-xs text-gray-500 dark:text-gray-300 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
          {secntoDescription}
        </p>
        {onToggleDashboard && (
          <p className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-600">
              {language === Language.Urdu ? "نوٹ: CMS ڈیش بورڈ صرف ترقیاتی مقاصد کے لیے ہے۔" : "Note: CMS Dashboard is for development purposes."}
          </p>
        )}
      </div>
    </footer>
  );
};

export default Footer;
