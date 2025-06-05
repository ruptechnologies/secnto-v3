import React from 'react';
import { Language } from '../types';

interface LoadingSpinnerProps {
  language: Language;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ language }) => {
  const loadingText = language === Language.Urdu ? "براہ کرم انتظار کریں..." : "Loading results...";

  return (
    <>
      {/* The <style> block for secnto-tick and .secnto-clock-hand has been removed. 
          All styles are now in index.html */}
      <div className="flex flex-col items-center justify-center py-10">
        <div className="relative h-16 w-16" aria-hidden="true"> {/* Clock face and hand container */}
          {/* Clock Face - uses new class for border color animation */}
          <div className="h-full w-full rounded-full clock-face-animated"></div>
          {/* Clock Hand - uses new class for combined tick and background color animation */}
          <div className="secnto-clock-hand-animated"></div>
        </div>
        <p
          className={`mt-4 text-lg text-gray-600 dark:text-gray-300 ${language === Language.Urdu ? 'urdu-text' : ''}`}
          role="status"
          aria-live="polite"
        >
          {loadingText}
        </p>
      </div>
    </>
  );
};

export default LoadingSpinner;