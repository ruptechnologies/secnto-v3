
import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onLanguageChange }) => {
  const toggleLanguage = () => {
    onLanguageChange(currentLanguage === Language.English ? Language.Urdu : Language.English);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none text-sm font-medium text-gray-700 dark:text-gray-300 border-0"
      aria-label={currentLanguage === Language.English ? 'Switch to Urdu' : 'Switch to English'}
    >
      {currentLanguage === Language.English ? 'اردو' : 'EN'}
    </button>
  );
};

export default LanguageToggle;
