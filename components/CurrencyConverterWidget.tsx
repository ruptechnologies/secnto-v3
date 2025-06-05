
import React from 'react';
import { Language } from '../types';

interface CurrencyConverterData {
  fromCurrency?: string;
  toCurrency?: string;
  rateText?: string;
  rateValue?: number;
  source?: string;
  lastUpdated?: string;
}

interface CurrencyConverterWidgetProps {
  data: CurrencyConverterData;
  language: Language;
}

const CurrencyConverterWidget: React.FC<CurrencyConverterWidgetProps> = ({ data, language }) => {
  const S = {
    title: language === Language.Urdu ? "کرنسی کنورٹر" : "Currency Converter",
    sourceLabel: language === Language.Urdu ? "ماخذ:" : "Source:",
    lastUpdatedLabel: language === Language.Urdu ? "آخری تازہ کاری:" : "Last updated:",
  };

  return (
    <div className={`widget-card currency-converter-widget p-3 sm:p-4 border rounded-lg shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mb-4 sm:mb-6 ${language === Language.Urdu ? 'urdu-text text-right' : ''}`}>
      <h3 className="text-sm sm:text-base font-semibold text-secnto-blue dark:text-secnto-green mb-2">
        {S.title}: {data.fromCurrency} {language === Language.Urdu ? 'سے' : 'to'} {data.toCurrency}
      </h3>
      
      {data.rateText && (
        <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {data.rateText}
        </p>
      )}
      
      {/* Placeholder for future interactive input fields
      <div className="my-3 space-y-2">
        <div>
          <label htmlFor="fromAmount" className="text-xs text-gray-600 dark:text-gray-400">{data.fromCurrency}</label>
          <input type="number" id="fromAmount" className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500" placeholder="1.00" />
        </div>
        <div>
          <label htmlFor="toAmount" className="text-xs text-gray-600 dark:text-gray-400">{data.toCurrency}</label>
          <input type="number" id="toAmount" className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500" disabled />
        </div>
      </div>
      */}

      {(data.source || data.lastUpdated) && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-500 text-xs text-gray-400 dark:text-gray-500">
          {data.source && <span>{S.sourceLabel} {data.source}</span>}
          {data.source && data.lastUpdated && <span className="mx-1">|</span>}
          {data.lastUpdated && <span>{S.lastUpdatedLabel} {data.lastUpdated}</span>}
        </div>
      )}
    </div>
  );
};

export default CurrencyConverterWidget;
