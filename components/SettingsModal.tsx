
import React from 'react';
import { Language } from '../types';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
  currentLanguage,
  onLanguageChange,
}) => {
  if (!isOpen) return null;

  const S = {
    modalTitle: currentLanguage === Language.Urdu ? "ترتیبات" : "Settings",
    closeButtonLabel: currentLanguage === Language.Urdu ? "بند کریں" : "Close",
    themeLabel: currentLanguage === Language.Urdu ? "تھیم" : "Theme",
    languageLabel: currentLanguage === Language.Urdu ? "زبان" : "Language",
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="settings-modal-header">
          <h2 id="settings-modal-title" className={`text-lg sm:text-xl font-semibold ${currentLanguage === Language.Urdu ? 'urdu-text' : ''}`}>
            {S.modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-600 focus:ring-secnto-blue"
            aria-label={S.closeButtonLabel}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="py-4 space-y-6">
          <div className={`flex items-center justify-between ${currentLanguage === Language.Urdu ? 'flex-row-reverse' : ''}`}>
            <span className={`text-sm sm:text-base text-gray-700 dark:text-gray-300 ${currentLanguage === Language.Urdu ? 'urdu-text ml-4' : 'mr-4'}`}>
              {S.themeLabel}
            </span>
            <ThemeToggle theme={currentTheme} onThemeToggle={onThemeChange} />
          </div>

          <div className={`flex items-center justify-between ${currentLanguage === Language.Urdu ? 'flex-row-reverse' : ''}`}>
            <span className={`text-sm sm:text-base text-gray-700 dark:text-gray-300 ${currentLanguage === Language.Urdu ? 'urdu-text ml-4' : 'mr-4'}`}>
              {S.languageLabel}
            </span>
            <LanguageToggle currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;