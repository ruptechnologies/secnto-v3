
import React from 'react';
import { Language } from '../types';

interface DirectAnswerCardProps {
  summaryText: string;
  source?: string;
  language: Language;
}

const DirectAnswerCard: React.FC<DirectAnswerCardProps> = ({ summaryText, source, language }) => {
  const S = {
    sourceLabel: language === Language.Urdu ? "ماخذ:" : "Source:",
  };

  return (
    <div className={`widget-card direct-answer-card p-3 sm:p-4 border rounded-lg shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mb-4 sm:mb-6 ${language === Language.Urdu ? 'urdu-text text-right' : ''}`}>
      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 leading-relaxed">
        {summaryText}
      </p>
      {source && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-500 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold">{S.sourceLabel}</span> {source}
        </div>
      )}
    </div>
  );
};

export default DirectAnswerCard;
