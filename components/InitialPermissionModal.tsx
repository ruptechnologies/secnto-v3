import React from 'react';
import { Language } from '../types';

interface InitialPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  permissionType: 'microphone'; // Can be expanded later
  titleText: string;
  messageText: string;
  buttonText: string;
}

const InitialPermissionModal: React.FC<InitialPermissionModalProps> = ({
  isOpen,
  onClose,
  language,
  permissionType, // Not used in rendering yet, but good for structure
  titleText,
  messageText,
  buttonText,
}) => {
  if (!isOpen) return null;

  // Generic S strings for the modal structure itself
  const S_Modal = {
    closeButtonSrText: language === Language.Urdu ? "بند کریں" : "Close",
  };
  
  return (
    <div 
        className="permission-info-modal-overlay" 
        onClick={onClose} 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="initial-permission-modal-title"
    >
      <div className="permission-info-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Optional: Header can be added if needed, like SettingsModal */}
        {/* <header className="permission-info-modal-header">
          <h2 id="initial-permission-modal-title" className={`text-lg sm:text-xl font-semibold ${language === Language.Urdu ? 'urdu-text' : ''}`}>
            {titleText}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-600 focus:ring-secnto-blue"
            aria-label={S_Modal.closeButtonSrText}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header> */}

        <div className={`py-3 sm:py-4 ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
          <h2 id="initial-permission-modal-title" className={`text-md sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
            {titleText}
          </h2>
          <p className={`text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed ${language === Language.Urdu ? 'urdu-text' : ''}`}>
            {messageText}
          </p>
          <button
            onClick={onClose}
            className={`w-full px-3 py-2 text-sm font-medium rounded-md 
                        bg-secnto-blue text-white hover:bg-opacity-80 
                        dark:bg-secnto-green dark:hover:opacity-90
                        focus:outline-none focus:ring-2 focus:ring-offset-2 
                        dark:focus:ring-offset-gray-700 focus:ring-secnto-blue dark:focus:ring-secnto-green
                        ${language === Language.Urdu ? 'urdu-text' : ''}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialPermissionModal;