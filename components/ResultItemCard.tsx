
import React, { useState, useEffect } from 'react';
import { SearchResultItem, SearchType, Language, TextSearchResult, VideoSearchResult, LocalSearchResult } from '../types';

interface ResultItemCardProps {
  item: SearchResultItem;
  language: Language;
}

const BrokenVideoThumbnailPlaceholder: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md ${className || 'w-36 sm:w-40 h-20 sm:h-24'}`}>
    <svg 
      className="w-8 h-8 text-gray-400 dark:text-gray-500" 
      fill="currentColor" 
      viewBox="0 0 20 20" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path clipRule="evenodd" fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"></path>
      <path d="M12.586 11.414a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0z" fill="#DC2626"></path>
      <path d="M11.172 12.828a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z" fill="#DC2626"></path>
    </svg>
  </div>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className || "w-8 h-8 sm:w-10 sm:h-10 text-white"} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path fillRule="evenodd" clipRule="evenodd" d="M7.50004 5.39198C7.50004 4.33475 8.64075 3.65925 9.53992 4.21751L17.6693 8.82553C18.5262 9.35828 18.5262 10.6418 17.6693 11.1745L9.53992 15.7825C8.64075 16.3408 7.50004 15.6653 7.50004 14.6081V5.39198Z" />
  </svg>
);

// Date formatting utility
function formatDateAgo(dateStringOrTimestamp: string | number, language: Language): string {
  const date = new Date(dateStringOrTimestamp);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

  const S_date = {
    yearsAgo: language === Language.Urdu ? "سال پہلے" : "years ago",
    yearAgo: language === Language.Urdu ? "سال پہلے" : "year ago",
    monthsAgo: language === Language.Urdu ? "مہینے پہلے" : "months ago",
    monthAgo: language === Language.Urdu ? "مہینہ پہلے" : "month ago",
    daysAgo: language === Language.Urdu ? "دن پہلے" : "days ago",
    dayAgo: language === Language.Urdu ? "دن پہلے" : "day ago",
    hoursAgo: language === Language.Urdu ? "گھنٹے پہلے" : "hours ago",
    hourAgo: language === Language.Urdu ? "گھنٹہ پہلے" : "hour ago",
    minutesAgo: language === Language.Urdu ? "منٹ پہلے" : "minutes ago",
    minuteAgo: language === Language.Urdu ? "منٹ پہلے" : "minute ago",
    justNow: language === Language.Urdu ? "ابھی ابھی" : "just now",
  };

  if (isNaN(date.getTime())) {
    return ""; // Invalid date
  }
  
  if (seconds < 60) {
    return S_date.justNow;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return language === Language.Urdu 
      ? `${minutes} ${minutes === 1 ? S_date.minuteAgo.replace('منٹ','ایک منٹ') : S_date.minutesAgo}` 
      : `${minutes} ${minutes === 1 ? 'minute ago' : 'minutes ago'}`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
     return language === Language.Urdu 
      ? `${hours} ${hours === 1 ? S_date.hourAgo.replace('گھنٹہ','ایک گھنٹہ') : S_date.hoursAgo}` 
      : `${hours} ${hours === 1 ? 'hour ago' : 'hours ago'}`;
  }
  const days = Math.round(hours / 24);
  if (days < 30) { // Use 'days ago' for up to 29 days
    return language === Language.Urdu 
      ? `${days} ${days === 1 ? S_date.dayAgo.replace('دن','ایک دن') : S_date.daysAgo}` 
      : `${days} ${days === 1 ? 'day ago' : 'days ago'}`;
  }
  const months = Math.round(days / 30); // Approximate months
  if (months < 12) {
    return language === Language.Urdu 
      ? `${months} ${months === 1 ? S_date.monthAgo.replace('مہینہ','ایک مہینہ') : S_date.monthsAgo}` 
      : `${months} ${months === 1 ? 'month ago' : 'months ago'}`;
  }
  const years = Math.round(months / 12); // Approximate years
  return language === Language.Urdu 
    ? `${years} ${years === 1 ? S_date.yearAgo.replace('سال','ایک سال') : S_date.yearsAgo}` 
    : `${years} ${years === 1 ? 'year ago' : 'years ago'}`;
}

const InfoIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 mr-2 inline-block text-gray-500 dark:text-gray-400 shrink-0" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


const ResultItemCard: React.FC<ResultItemCardProps> = ({ item, language }) => {
  const commonItemClasses = "mb-7 sm:mb-8"; // Increased bottom margin for separation
  const [isThumbnailBroken, setIsThumbnailBroken] = useState(false);

  useEffect(() => {
    setIsThumbnailBroken(false); // Reset for new item
  }, [item.id, (item as VideoSearchResult).thumbnailUrl]); // Listen to thumbnailUrl change as well

  switch (item.type) {
    case SearchType.All:
    case SearchType.News:
      const textItem = item as TextSearchResult;
      const isUrduTitle = language === Language.Urdu && textItem.title.match(/[\u0600-\u06FF]/);
      const isUrduSnippet = language === Language.Urdu && textItem.snippet.match(/[\u0600-\u06FF]/);
      
      let displayUrl = ""; // Will not be used directly for URL-less items
      let clickableUrl: string | null = null;

      if (textItem.url) { 
          try {
              const parsedUrl = new URL(textItem.url); 
              displayUrl = parsedUrl.hostname + (parsedUrl.pathname && parsedUrl.pathname !== '/' ? parsedUrl.pathname.substring(0,30)+(parsedUrl.pathname.length > 30 ? '...' : '') : '');
              clickableUrl = textItem.url; // Valid URL for clicking
          } catch (e) {
            // Invalid URL, clickableUrl remains null
          }
      }
      
      const formattedDate = textItem.publishedDate ? formatDateAgo(textItem.publishedDate, language) : null;

      if (clickableUrl) {
        // Standard rendering for items with a valid URL
        return (
            <div className={commonItemClasses}>
            <a
              href={clickableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h3
                className={`text-lg sm:text-xl font-medium text-blue-600 dark:text-blue-400 group-hover:underline mb-1 ${isUrduTitle ? 'urdu-text' : ''}`}
              >
                {textItem.title}
              </h3>
            </a>
            <p className={`text-xs text-gray-700 dark:text-gray-400 ${language === Language.Urdu && displayUrl.match(/[\u0600-\u06FF]/) ? 'urdu-text text-right' : 'text-left'}`}>
              {displayUrl}
            </p>
            {formattedDate && (
              <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 mb-1.5 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                {formattedDate}
              </p>
            )}
            <p className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed ${isUrduSnippet ? 'urdu-text' : ''} ${!formattedDate ? 'mt-1' : ''}`}>
              {textItem.snippet}
            </p>
          </div>
        );
      } else {
        // New "widget-like" rendering for items without a valid URL
        return (
          <div className={`${commonItemClasses} p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-750 shadow-sm`}>
            <div className={`flex items-start ${language === Language.Urdu ? 'flex-row-reverse' : ''}`}>
              {language === Language.Urdu ? null : <InfoIcon />}
              <h3
                className={`text-md sm:text-lg font-semibold text-secnto-blue dark:text-secnto-green mb-1 ${isUrduTitle ? 'urdu-text' : ''} ${language === Language.Urdu ? 'flex-grow text-right' : 'flex-grow'}`}
              >
                {textItem.title}
              </h3>
              {language === Language.Urdu ? <InfoIcon className={`h-5 w-5 ${language === Language.Urdu ? 'ml-2' : 'mr-2'} inline-block text-gray-500 dark:text-gray-400 shrink-0`} /> : null}
            </div>
            {formattedDate && (
              <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 mb-1.5 ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
                {formattedDate}
              </p>
            )}
            <p className={`text-sm text-gray-700 dark:text-gray-400 leading-relaxed ${isUrduSnippet ? 'urdu-text text-right' : 'text-left'} ${!formattedDate ? 'mt-2' : 'mt-1'}`}>
              {textItem.snippet}
            </p>
          </div>
        );
      }

    // Image SearchResult is now handled directly in ResultsArea for grid display
    case SearchType.Videos:
      const videoItem = item as VideoSearchResult;
      const isUrduTitleVideo = language === Language.Urdu && videoItem.title.match(/[\u0600-\u06FF]/);
      const isUrduChannelVideo = language === Language.Urdu && videoItem.channel.match(/[\u0600-\u06FF]/);
      const videoThumbnailContainerClass = `relative block shrink-0 group ${language === Language.Urdu ? 'sm:ml-4' : 'sm:mr-4'} mb-2 sm:mb-0`;
      const videoThumbnailImageClass = "w-36 sm:w-40 h-20 sm:h-24 object-cover rounded-md shadow-sm";

      return (
        <div className={`${commonItemClasses} flex flex-col sm:flex-row items-start`}>
          <a href={videoItem.videoUrl} target="_blank" rel="noopener noreferrer" className={videoThumbnailContainerClass}>
            {isThumbnailBroken || !videoItem.thumbnailUrl ? (
              <BrokenVideoThumbnailPlaceholder className={videoThumbnailImageClass} />
            ) : (
              <img 
                src={videoItem.thumbnailUrl} 
                alt={videoItem.title || (language === Language.Urdu ? "ویڈیو تھمب نیل" : "Video thumbnail")} 
                className={videoThumbnailImageClass}
                loading="lazy"
                onError={() => setIsThumbnailBroken(true)}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-200 rounded-md">
              <PlayIcon className="w-7 h-7 sm:w-9 sm:h-9 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
            </div>
          </a>
          <div className="flex-1">
            <h3 className={`text-md sm:text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline mb-0.5 ${isUrduTitleVideo ? 'urdu-text' : ''}`}>
              <a href={videoItem.videoUrl} target="_blank" rel="noopener noreferrer">{videoItem.title}</a>
            </h3>
            <p className={`text-xs text-gray-600 dark:text-gray-400 ${isUrduChannelVideo ? 'urdu-text' : ''}`}>{videoItem.channel}</p>
          </div>
        </div>
      );
    case SearchType.Local:
      const localItem = item as LocalSearchResult;
      const isUrduNameLocal = language === Language.Urdu && localItem.name.match(/[\u0600-\u06FF]/);
      const isUrduCategoryLocal = language === Language.Urdu && localItem.category.match(/[\u0600-\u06FF]/);
      const isUrduAddressLocal = language === Language.Urdu && localItem.address.match(/[\u0600-\u06FF]/);
      return (
        <div className={commonItemClasses}>
          <h3 className={`text-lg sm:text-xl font-medium text-blue-600 dark:text-blue-400 hover:underline ${isUrduNameLocal ? 'urdu-text' : ''}`}>
            {localItem.name}
          </h3>
          <p className={`text-sm text-gray-700 dark:text-gray-400 mt-1 ${isUrduCategoryLocal ? 'urdu-text' : ''}`}>{localItem.category}</p>
          <p className={`mt-1 text-xs text-gray-500 dark:text-gray-500 ${isUrduAddressLocal ? 'urdu-text' : ''}`}>{localItem.address}</p>
        </div>
      );
    default:
      // This case will now also implicitly handle SearchType.Images, rendering nothing,
      // which is fine as ResultsArea won't pass image items to this component.
      return null;
  }
};

export default ResultItemCard;
