
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { SearchResultItem, SearchType, Language, ImageSearchResult, LocalSearchResult, UserLocation } from '../types';
import { WidgetOrAnswerData } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ResultItemCard from './ResultItemCard'; 
import DirectAnswerCard from './DirectAnswerCard';
import CurrencyConverterWidget from './CurrencyConverterWidget';
import SportsWidget from './SportsWidget'; 
import WeatherWidget from './WeatherWidget'; 
import LocalResultsMap from './LocalResultsMap'; // Added

interface ResultsAreaProps {
  results: SearchResultItem[];
  isLoading: boolean;
  searchType: SearchType;
  language: Language;
  loadMoreResults: () => void;
  hasMoreResults: boolean;
  isLoadingMore: boolean;
  initialQuery?: string; 
  widgetData?: WidgetOrAnswerData | null; 
  onImageClick: (image: ImageSearchResult) => void;
  userLocation: UserLocation | null; // Added for map
  mapsApiKey: string | null; // Added for map
  isMapsApiReady: boolean; // Added for map
  sApp: { // Pass S strings from App.tsx
    noImageGenerated: string;
    noResultsFound: string;
    imageGenerationError: string; // And other error messages if needed for specific display here
  };
}

const BrokenImagePlaceholder: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className || "w-10 h-10 text-gray-400 dark:text-gray-500"} 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.506 3.342A5.25 5.25 0 0115.75 6H18a3 3 0 013 3v1.5a.75.75 0 001.5 0V9A4.5 4.5 0 0018 4.5h-2.25a5.25 5.25 0 01-5.244-2.658K6.75 18A4.5 4.5 0 0011.25 22.5a.75.75 0 000-1.5A3 3 0 0111.25 18H9a.75.75 0 000 1.5H6.75zM12 6.75A.75.75 0 0011.25 6H9a4.5 4.5 0 000 9h2.25A.75.75 0 0012 14.25v-7.5z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.375 9A4.5 4.5 0 017.875 4.5h1.875M3.375 15A4.5 4.5 0 007.875 19.5h1.875m7.5-15h1.875A4.5 4.5 0 0120.625 9M19.125 19.5A4.5 4.5 0 0114.625 15h-1.875"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.954a.75.75 0 010 1.06L12.28 22.02a.75.75 0 01-1.06 0L2.25 13.06a.75.75 0 010-1.06z"></path> {/* X mark */}
  </svg>
);


const ResultsArea: React.FC<ResultsAreaProps> = ({ 
  results, 
  isLoading, 
  searchType, 
  language,
  loadMoreResults,
  hasMoreResults,
  isLoadingMore,
  initialQuery,
  widgetData,
  onImageClick,
  userLocation,
  mapsApiKey,
  isMapsApiReady,
  sApp,
}) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<string>>(new Set());

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore || isLoading || searchType === SearchType.Generate) return; 
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreResults) {
        loadMoreResults();
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoadingMore, isLoading, hasMoreResults, loadMoreResults, searchType]);

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setBrokenImageIds(new Set());
  }, [initialQuery, searchType]);

  if (isLoading && results.length === 0 && !widgetData) { 
    return (
        <div className="bg-white dark:bg-gray-600 rounded-lg shadow-md p-4 sm:p-6">
            <LoadingSpinner language={language} />
        </div>
    );
  }

  const currentTabResults = results.filter(r => 
      (searchType === SearchType.All) ||
      (searchType === SearchType.News && (r.type === SearchType.News || r.type === SearchType.All)) ||
      (r.type === searchType) || // This will cover Images, Videos, Local
      (searchType === SearchType.Generate && r.type === SearchType.Generate) // Specifically for generated images
  );

  const localResultsForMap = results.filter(r => r.type === SearchType.Local) as LocalSearchResult[];
  
  const noResultsMessage = () => {
    if (!initialQuery || initialQuery.trim() === '') { 
        return null;
    }
    if (!isLoading && currentTabResults.length === 0 && !hasMoreResults && !widgetData) { 
      let message = "";
      const forQueryText = language === Language.Urdu ? `برائے سوال '${initialQuery}'` : `for query '${initialQuery}'`;
      
      if (searchType === SearchType.Generate) {
        message = sApp.noImageGenerated;
      } else if (results.length === 0) { 
          message = sApp.noResultsFound; // language === Language.Urdu ? `کوئی نتیجہ نہیں ملا ${forQueryText}۔ براہ کرم ایک مختلف سوال آزمائیں۔` : `No results found ${forQueryText}. Please try a different query.`;
      } else { 
          if (searchType === SearchType.Images) message = language === Language.Urdu ? `کوئی تصاویر نہیں ملیں ${forQueryText}۔` : `No images found ${forQueryText}.`;
          else if (searchType === SearchType.News) message = language === Language.Urdu ? `کوئی خبریں نہیں ملیں ${forQueryText}۔` : `No news found ${forQueryText}.`;
          else if (searchType === SearchType.Videos) message = language === Language.Urdu ? `کوئی ویڈیوز نہیں ملیں ${forQueryText}۔` : `No videos found ${forQueryText}.`;
          else if (searchType === SearchType.Local) message = language === Language.Urdu ? `کوئی مقامی نتائج نہیں ملے ${forQueryText}۔` : `No local results found ${forQueryText}.`;
           else message = language === Language.Urdu ? `اس ٹیب کے لیے کوئی نتیجہ نہیں (${searchType}) ${forQueryText}` : `No results for this tab (${searchType}) ${forQueryText}`;
      }
      return <div className={`text-center text-gray-500 dark:text-gray-400 py-8 sm:py-10 text-base sm:text-lg ${language === Language.Urdu ? 'urdu-text' : ''}`}>{message}</div>;
    }
    return null;
  };
  
  if (!initialQuery && !isLoading && currentTabResults.length === 0 && results.length === 0 && !widgetData) {
    return null;
  }

  const renderWidget = () => {
    if (!widgetData) {
      return null;
    }
    
    console.log("ResultsArea: Attempting to render widget. widgetData:", JSON.stringify(widgetData, null, 2));

    const widgetPayload = widgetData.data; 

    if (!widgetPayload || typeof widgetPayload !== 'object') {
        console.warn(`Widget payload is missing or not an object for widgetType: ${widgetData.widgetType}. Payload:`, widgetPayload);
        return null;
    }

    switch (widgetData.widgetType) {
      case 'DirectAnswer':
        if (typeof widgetPayload.summaryText !== 'string') {
            console.warn("Malformed DirectAnswer data. Missing summaryText. Payload:", widgetPayload);
            return null;
        }
        return <DirectAnswerCard summaryText={widgetPayload.summaryText} source={widgetPayload.source} language={language} />;
      
      case 'CurrencyConverter':
        if (typeof widgetPayload.fromCurrency !== 'string' || 
            typeof widgetPayload.toCurrency !== 'string' || 
            typeof widgetPayload.rateText !== 'string') {
            console.warn("Malformed or incomplete CurrencyConverter data. Payload:", widgetPayload);
            return null;
        }
        return <CurrencyConverterWidget data={widgetPayload} language={language} />;
      
      case 'SportsScores':
         if (typeof widgetPayload.matchTitle !== 'string' && typeof widgetPayload.league !== 'string' && (!widgetPayload.matches || widgetPayload.matches.length === 0)) { 
            console.warn("Malformed SportsScores data. Missing matchTitle, league, or matches. Payload:", widgetPayload);
            return null;
        }
        return <SportsWidget data={widgetPayload} language={language} />;
      
      case 'WeatherInfo':
        if (typeof widgetPayload.location !== 'string' || typeof widgetPayload.temperature !== 'string') {
            console.warn("Malformed WeatherInfo data. Missing location or temperature. Payload:", widgetPayload);
            return null;
        }
        return <WeatherWidget data={widgetPayload} language={language} />;
      
      default:
        if (widgetData.widgetType !== 'EntityInfoPanel') {
          console.warn("Unknown widgetType in ResultsArea renderWidget:", widgetData.widgetType);
        }
        return null;
    }
  };

  const isImageGridType = searchType === SearchType.Images || searchType === SearchType.Generate;

  return (
    <div className={`
      bg-white dark:bg-gray-600 rounded-lg shadow-md p-3 sm:p-4 md:p-6
      ${isImageGridType ? 'w-full' : ''} 
    `}>
      
      <div className="w-full"> 
        <div className="mb-4 sm:mb-6">{renderWidget()}</div>

        {searchType === SearchType.Local && isMapsApiReady && mapsApiKey && localResultsForMap.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <LocalResultsMap 
              results={localResultsForMap} 
              userLocation={userLocation} 
              mapsApiKey={mapsApiKey} 
              language={language} 
            />
          </div>
        )}
        {searchType === SearchType.Local && !mapsApiKey && (
             <div className={`text-center text-yellow-600 dark:text-yellow-400 py-3 text-xs sm:text-sm mb-4 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                {language === Language.Urdu ? "نقشہ دیکھنے کے لیے گوگل میپس API کلید درکار ہے۔" : "Google Maps API Key is required to view the map."}
            </div>
        )}


        {noResultsMessage()}
        
        {currentTabResults.length > 0 && isImageGridType ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-1 sm:gap-2">
            {currentTabResults.map((item) => {
              if (item.type !== SearchType.Images && item.type !== SearchType.Generate) return null; 
              const imageItem = item as ImageSearchResult; 
              const isUrduCaptionImg = language === Language.Urdu && imageItem.caption.match(/[\u0600-\u06FF]/);
              const ariaLabelText = imageItem.type === SearchType.Generate 
                ? (language === Language.Urdu ? `AI سے تیار کردہ تصویر: ${imageItem.caption}` : `AI Generated Image: ${imageItem.caption}`)
                : (imageItem.caption || (language === Language.Urdu ? 'نتیجہ تصویر' : 'Search result image'));

              return (
                <button 
                  key={imageItem.id} 
                  onClick={() => onImageClick(imageItem)}
                  className="group relative aspect-square bg-gray-100 dark:bg-gray-500 rounded-md sm:rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-secnto-blue dark:focus:ring-secnto-green"
                  aria-label={ariaLabelText}
                >
                  {brokenImageIds.has(imageItem.id) ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <BrokenImagePlaceholder />
                    </div>
                  ) : (
                    <img
                      src={imageItem.imageUrl}
                      alt={ariaLabelText}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => {
                        setBrokenImageIds(prev => new Set(prev).add(imageItem.id));
                      }}
                    />
                  )}
                  {imageItem.caption && !brokenImageIds.has(imageItem.id) && (
                    <div 
                      className={`
                        absolute bottom-0 left-0 right-0 p-1 sm:p-1.5 
                        bg-black bg-opacity-60 text-white text-[10px] sm:text-xs 
                        opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 
                        ${isUrduCaptionImg ? 'urdu-text text-right' : 'text-left'}
                      `}
                    >
                      <p className="truncate">{imageItem.caption}</p>
                      {imageItem.type === SearchType.Generate && (
                        <p className="text-[8px] opacity-70">{language === Language.Urdu ? 'AI سے تیار کردہ' : 'AI Generated'}</p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            
            {searchType !== SearchType.Generate && hasMoreResults && !isLoadingMore && (
              <div ref={sentinelRef} className="col-span-full" style={{ height: '1px', marginTop: '20px' }} aria-hidden="true"></div>
            )}
            {searchType !== SearchType.Generate && isLoadingMore && (
              <div className="col-span-full py-4 sm:py-6"> <LoadingSpinner language={language} /> </div>
            )}
            {searchType !== SearchType.Generate && !hasMoreResults && !isLoading && !isLoadingMore && currentTabResults.length > 0 && (
              <div className={`col-span-full text-center text-gray-500 dark:text-gray-400 py-8 sm:py-10 text-xs sm:text-sm ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                {language === Language.Urdu ? "مزید تصاویر نہیں ہیں۔" : "No more images."}
              </div>
            )}
          </div>
        ) : currentTabResults.length > 0 && (
          <div>
            {currentTabResults.map((item) => (
              <ResultItemCard key={item.id} item={item} language={language} />
            ))}
            
            {hasMoreResults && !isLoadingMore && (
              <div ref={sentinelRef} style={{ height: '1px', marginTop: '20px' }} aria-hidden="true"></div>
            )}
            {isLoadingMore && (
              <div className="py-4 sm:py-6"> <LoadingSpinner language={language} /> </div>
            )}
            {!hasMoreResults && !isLoading && !isLoadingMore && currentTabResults.length > 0 && (
              <div className={`text-center text-gray-500 dark:text-gray-400 py-8 sm:py-10 text-xs sm:text-sm ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                {language === Language.Urdu ? "مزید نتائج نہیں ہیں۔" : "No more results."}
              </div>
            )}
          </div>
        )}
         {isLoading && currentTabResults.length > 0 && !isLoadingMore && searchType !== SearchType.Generate && ( 
             <div className="py-4 sm:py-6"> <LoadingSpinner language={language} /> </div>
         )}
      </div>
    </div>
  );
};

export default ResultsArea;
