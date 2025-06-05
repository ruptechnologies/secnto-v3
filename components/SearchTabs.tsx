
import React from 'react';
import { SearchType, Language } from '../types';

interface SearchTabsProps {
  currentType: SearchType;
  onTypeChange: (type: SearchType) => void;
  language: Language;
  disabled?: boolean;
}

const SearchTabs: React.FC<SearchTabsProps> = ({ currentType, onTypeChange, language, disabled }) => {
  const tabs = [
    { type: SearchType.All, labelEn: 'All', labelUr: 'سب' },
    { type: SearchType.News, labelEn: 'News', labelUr: 'خبریں' },
    { type: SearchType.Images, labelEn: 'Images', labelUr: 'تصاویر' },
    { type: SearchType.Videos, labelEn: 'Videos', labelUr: 'ویڈیوز' },
    { type: SearchType.Local, labelEn: 'Local', labelUr: 'مقامی' },
    { type: SearchType.Generate, labelEn: 'Generate', labelUr: 'بنائیں' }, // Added Generate tab
  ];

  return (
    <div className={`flex space-x-4 sm:space-x-6 md:space-x-8 ${disabled ? 'opacity-60' : ''} overflow-x-auto pb-1`}>
      {tabs.map((tab) => (
        <button
          key={tab.type}
          onClick={() => !disabled && onTypeChange(tab.type)}
          disabled={disabled}
          className={`px-1 sm:px-2 py-2 text-sm sm:text-base font-medium whitespace-nowrap
            focus:outline-none transition-colors duration-150
            ${ currentType === tab.type 
              ? 'border-b-2 border-secnto-blue dark:border-secnto-green text-secnto-blue dark:text-secnto-green font-semibold' 
              : 'text-gray-500 dark:text-gray-400 hover:text-secnto-blue dark:hover:text-secnto-green border-b-2 border-transparent'
            } ${language === Language.Urdu ? 'urdu-text' : ''} ${disabled ? 'cursor-not-allowed' : ''}`}
          aria-current={currentType === tab.type ? "page" : undefined}
        >
          {language === Language.Urdu ? tab.labelUr : tab.labelEn}
        </button>
      ))}
    </div>
  );
};

export default SearchTabs;
