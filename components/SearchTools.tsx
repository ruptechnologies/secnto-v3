
import React, { useState, useEffect, useRef } from 'react';
import { Language, SearchType } from '../types';

interface SearchToolsProps {
  language: Language;
  currentSearchType: SearchType;
  timeFilter: string;
  customStartDate: string;
  customEndDate: string;
  imageSizeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  onCustomDateChange: (type: 'start' | 'end', value: string) => void;
  onApplyCustomDateFilter: () => void;
  onImageSizeChange: (size: string) => void;
  onResetFilters: () => void;
  isLoading: boolean;
}

const SearchTools: React.FC<SearchToolsProps> = ({
  language,
  currentSearchType,
  timeFilter,
  customStartDate,
  customEndDate,
  imageSizeFilter,
  onTimeFilterChange,
  onCustomDateChange,
  onApplyCustomDateFilter,
  onImageSizeChange,
  onResetFilters,
  isLoading,
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const S = {
    tools: language === Language.Urdu ? "اوزار" : "Tools",
    timePeriod: language === Language.Urdu ? "وقت کی مدت" : "Time period",
    anyTime: language === Language.Urdu ? "کوئی بھی وقت" : "Any time",
    pastHour: language === Language.Urdu ? "گزشتہ گھنٹہ" : "Past hour",
    past24Hours: language === Language.Urdu ? "گزشتہ 24 گھنٹے" : "Past 24 hours",
    pastWeek: language === Language.Urdu ? "گزشتہ ہفتہ" : "Past week",
    pastMonth: language === Language.Urdu ? "گزشتہ مہینہ" : "Past month",
    pastYear: language === Language.Urdu ? "گزشتہ سال" : "Past year",
    customRange: language === Language.Urdu ? "مخصوص مدت" : "Custom range",
    startDate: language === Language.Urdu ? "شروعاتی تاریخ" : "Start date",
    endDate: language === Language.Urdu ? "اختتامی تاریخ" : "End date",
    apply: language === Language.Urdu ? "لاگو کریں" : "Apply",
    imageSize: language === Language.Urdu ? "تصویر کا سائز" : "Image size",
    anySize: language === Language.Urdu ? "کوئی بھی سائز" : "Any size",
    small: language === Language.Urdu ? "چھوٹا" : "Small",
    medium: language === Language.Urdu ? "درمیانہ" : "Medium",
    large: language === Language.Urdu ? "بڑا" : "Large",
    clearFilters: language === Language.Urdu ? "فلٹرز صاف کریں" : "Clear Filters",
    closeTools: language === Language.Urdu ? "اوزار بند کریں" : "Close Tools",
  };

  const showTimeFilters =
    currentSearchType === SearchType.All ||
    currentSearchType === SearchType.News ||
    currentSearchType === SearchType.Videos ||
    currentSearchType === SearchType.Local;

  const showImageSizeFilters = currentSearchType === SearchType.Images;

  const timeFilterOptions = [
    { value: 'any', label: S.anyTime },
    { value: 'hour', label: S.pastHour },
    { value: 'day', label: S.past24Hours },
    { value: 'week', label: S.pastWeek },
    { value: 'month', label: S.pastMonth },
    { value: 'year', label: S.pastYear },
    { value: 'custom', label: S.customRange },
  ];

  const imageSizeOptions = [
    { value: 'any', label: S.anySize },
    { value: 'small', label: S.small },
    { value: 'medium', label: S.medium },
    { value: 'large', label: S.large },
  ];
  
  useEffect(() => {
    if (!showTimeFilters && timeFilter !== 'any') {}
    if (!showImageSizeFilters && imageSizeFilter !== 'any') {}
    if (!showTimeFilters && !showImageSizeFilters && isPanelOpen) {}
  }, [currentSearchType, isPanelOpen, timeFilter, imageSizeFilter, showTimeFilters, showImageSizeFilters]);

  useEffect(() => {
    if (!isPanelOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsPanelOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);


  const handleTimeButtonClick = (value: string) => {
    onTimeFilterChange(value);
  };

  const handleImageSizeButtonClick = (value: string) => {
    onImageSizeChange(value);
  };

  const isCustomDateValid = customStartDate && customEndDate && new Date(customStartDate) <= new Date(customEndDate);

  if (!showTimeFilters && !showImageSizeFilters) {
    if (isPanelOpen) setIsPanelOpen(false); 
    return null; 
  }

  const getButtonClasses = (isActive: boolean) => `
    px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-md border transition-colors duration-150 w-full text-center
    focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-750
    ${isActive
      ? 'bg-secnto-blue text-white border-secnto-blue dark:bg-secnto-green dark:border-secnto-green focus:ring-secnto-blue dark:focus:ring-secnto-green'
      : `bg-white dark:bg-gray-500 border-gray-300 dark:border-gray-500 
         text-gray-700 dark:text-gray-300 hover:border-secnto-blue dark:hover:border-secnto-green 
         hover:text-secnto-blue dark:hover:text-secnto-green focus:ring-gray-400 dark:focus:ring-gray-500`
    }
    ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
  `;

  return (
    <div className={`relative ${language === Language.Urdu ? 'text-right' : ''}`}>
      <button
        ref={buttonRef}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        disabled={isLoading && !isPanelOpen} 
        className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md flex items-center
                    hover:bg-gray-100 dark:hover:bg-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secnto-blue dark:focus:ring-secnto-green
                    text-gray-700 dark:text-gray-300
                    ${(isLoading && !isPanelOpen) ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-expanded={isPanelOpen}
        aria-controls="search-tools-panel"
      >
        {S.tools}
        <svg 
            className={`w-3 h-3 sm:w-4 sm:h-4 ml-1 transition-transform duration-200 ${isPanelOpen ? 'rotate-180' : ''} ${language === Language.Urdu ? 'mr-1 ml-0' : ''}`} 
            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isPanelOpen && (
        <div 
            ref={panelRef}
            id="search-tools-panel"
            className={`mt-2 p-3 sm:p-4 border rounded-lg bg-gray-50 dark:bg-gray-600 shadow-xl
                        border-gray-200 dark:border-gray-700 absolute z-20
                        w-[260px] sm:w-[300px] md:w-[340px]
                        ${language === Language.Urdu ? 'urdu-text left-0' : 'right-0'} 
                      `}
            role="dialog"
            aria-labelledby="search-tools-heading"
        >
          <h3 id="search-tools-heading" className="sr-only">{S.tools}</h3>
          
          {showTimeFilters && (
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">
                {S.timePeriod}
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {timeFilterOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleTimeButtonClick(opt.value)}
                    disabled={isLoading}
                    className={getButtonClasses(timeFilter === opt.value)}
                    aria-pressed={timeFilter === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {timeFilter === 'custom' && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-500 space-y-1.5 sm:space-y-2">
                  <div>
                    <label htmlFor="customStartDate" className="block text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5">{S.startDate}</label>
                    <input
                      type="date"
                      id="customStartDate"
                      value={customStartDate}
                      onChange={(e) => onCustomDateChange('start', e.target.value)}
                      disabled={isLoading}
                      className={`w-full p-1 sm:p-1.5 border border-gray-300 dark:border-gray-500 rounded-md 
                                  bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100 text-xs sm:text-sm
                                  focus:ring-secnto-blue focus:border-secnto-blue dark:focus:ring-secnto-green dark:focus:border-secnto-green
                                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      max={customEndDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="customEndDate" className="block text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-0.5">{S.endDate}</label>
                    <input
                      type="date"
                      id="customEndDate"
                      value={customEndDate}
                      onChange={(e) => onCustomDateChange('end', e.target.value)}
                      disabled={isLoading}
                      className={`w-full p-1 sm:p-1.5 border border-gray-300 dark:border-gray-500 rounded-md 
                                  bg-white dark:bg-gray-500 text-gray-900 dark:text-gray-100 text-xs sm:text-sm
                                  focus:ring-secnto-blue focus:border-secnto-blue dark:focus:ring-secnto-green dark:focus:border-secnto-green
                                  ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      min={customStartDate}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <button
                    onClick={onApplyCustomDateFilter}
                    disabled={isLoading || !isCustomDateValid}
                    className={`w-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md
                                bg-secnto-blue text-white
                                hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secnto-blue
                                ${(isLoading || !isCustomDateValid) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {S.apply}
                  </button>
                </div>
              )}
            </div>
          )}

          {showImageSizeFilters && (
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">
                {S.imageSize}
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {imageSizeOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleImageSizeButtonClick(opt.value)}
                    disabled={isLoading}
                    className={getButtonClasses(imageSizeFilter === opt.value)}
                    aria-pressed={imageSizeFilter === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-300 dark:border-gray-500 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => { onResetFilters(); }}
              disabled={isLoading}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md flex-1
                          border border-gray-400 dark:border-gray-500
                          text-gray-700 dark:text-gray-300 
                          hover:bg-gray-200 dark:hover:bg-gray-500 
                          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {S.clearFilters}
            </button>
            <button
              onClick={() => setIsPanelOpen(false)}
              disabled={isLoading && !isPanelOpen} 
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md flex-1
                          bg-gray-500 text-white
                          hover:bg-gray-600
                          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-600
                          ${(isLoading && !isPanelOpen) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {S.closeTools}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTools;
