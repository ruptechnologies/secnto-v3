
import React from 'react';
import { Language } from '../types';

interface AiAssistantIconProps {
  onClick: () => void;
  language: Language;
}

const AiAssistantIcon: React.FC<AiAssistantIconProps> = ({ onClick, language }) => {
  const S = {
    openAiAssistant: language === Language.Urdu ? "اے آئی اسسٹنٹ کھولیں" : "Open AI Assistant",
  };

  const positionClasses = language === Language.Urdu 
    ? 'left-4 sm:left-6 md:left-8' 
    : 'right-4 sm:right-6 md:right-8';

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-4 sm:bottom-6 md:bottom-8 ${positionClasses} z-40 p-3 sm:p-4 bg-secnto-blue dark:bg-secnto-green text-white rounded-full shadow-xl hover:bg-opacity-90 dark:hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-secnto-blue dark:focus:ring-secnto-green transition-all duration-200 ease-in-out hover:scale-110 active:scale-95`}
      aria-label={S.openAiAssistant}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
};

export default AiAssistantIcon;
