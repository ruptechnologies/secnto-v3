
import React from 'react';
import { Language } from '../types';

// Simplified weather icons - can be expanded or replaced with a library
const WeatherIcon: React.FC<{ iconName?: string, className?: string }> = ({ iconName, className = "w-8 h-8 sm:w-10 sm:h-10" }) => {
  switch (iconName?.toLowerCase()) {
    case 'sunny':
    case 'clear':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="orange"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    case 'partly_cloudy':
    case 'mostly_cloudy':
    case 'cloudy':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.25-9.975V9A4 4 0 0012 5H8a4 4 0 00-4 4v2zM12 15v4m-4-4v4m8-4v4" /></svg>; // Simple cloud
    case 'rain':
    case 'showers':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.64 16.36a9 9 0 1112.72 0M12 3v9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17l-4 4m8-4l-4 4m-4-4l4-4" /> </svg>; // Cloud with rain drops
    case 'thunderstorm':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a4 4 0 01-4-4 4.008 4.008 0 011.043-2.61M15 17a4 4 0 004-4 4.008 4.008 0 00-1.043-2.61M12 3v6m0 0l-2.121 2.121M12 9l2.121 2.121M12 17l2.121-2.121M12 17l-2.121-2.121" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h10l-2.5 5H9.5L7 12z" /></svg>; // Bolt
    case 'snow':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0v.01M12 5v.01M12 8v.01M12 11v.01M8 5l-1.414-1.414M16 5l1.414-1.414M5 8l-1.414-1.414M19 8l1.414-1.414M5 16l-1.414 1.414M19 16l1.414 1.414M8 19l-1.414 1.414M16 19l1.414 1.414" /></svg>; // Snowflake
    case 'fog':
    case 'mist':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18" /></svg>; // Fog lines
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; // Question mark for unknown
  }
};


interface WeatherForecastItem {
  day?: string;
  tempHigh?: string;
  tempLow?: string;
  condition?: string;
  icon?: string;
}

interface WeatherWidgetData {
  location?: string;
  temperature?: string;
  condition?: string;
  icon?: string;
  humidity?: string;
  wind?: string;
  feelsLike?: string;
  forecast?: WeatherForecastItem[];
  source?: string;
  lastUpdated?: string;
}

interface WeatherWidgetProps {
  data: WeatherWidgetData;
  language: Language;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, language }) => {
  const S = {
    feelsLike: language === Language.Urdu ? "محسوس ہوتا ہے:" : "Feels like:",
    humidity: language === Language.Urdu ? "نمی:" : "Humidity:",
    wind: language === Language.Urdu ? "ہوا:" : "Wind:",
    forecastTitle: language === Language.Urdu ? "پیش گوئی" : "Forecast",
    sourceLabel: language === Language.Urdu ? "ماخذ:" : "Source:",
    lastUpdatedLabel: language === Language.Urdu ? "آخری تازہ کاری:" : "Last updated:",
  };

  return (
    <div className={`widget-card weather-widget p-3 sm:p-4 border rounded-lg shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mb-4 sm:mb-6 ${language === Language.Urdu ? 'urdu-text text-right' : ''}`}>
      {data.location && (
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">{data.location}</h3>
      )}

      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center">
          <WeatherIcon iconName={data.icon} className="w-10 h-10 sm:w-12 sm:h-12 mr-2 text-secnto-blue dark:text-secnto-green" />
          {data.temperature && (
            <span className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{data.temperature}</span>
          )}
        </div>
        {data.condition && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{data.condition}</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
        {data.feelsLike && <div><span className="font-medium text-gray-700 dark:text-gray-200">{S.feelsLike}</span> {data.feelsLike}</div>}
        {data.humidity && <div><span className="font-medium text-gray-700 dark:text-gray-200">{S.humidity}</span> {data.humidity}</div>}
        {data.wind && <div><span className="font-medium text-gray-700 dark:text-gray-200">{S.wind}</span> {data.wind}</div>}
      </div>

      {data.forecast && data.forecast.length > 0 && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1 sm:mb-1.5">{S.forecastTitle}</h4>
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 text-xs">
            {data.forecast.slice(0,3).map((item, index) => ( // Show max 3 days forecast
              <div key={index} className={`flex-1 p-1 sm:p-1.5 rounded bg-gray-50 dark:bg-gray-600 text-center ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                <p className="font-medium text-gray-800 dark:text-gray-100">{item.day}</p>
                <WeatherIcon iconName={item.icon} className="w-5 h-5 mx-auto my-0.5 text-secnto-blue dark:text-secnto-green" />
                <p className="text-gray-600 dark:text-gray-300">{item.condition}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  {item.tempHigh && <span>{item.tempHigh}</span>}
                  {item.tempHigh && item.tempLow && <span> / </span>}
                  {item.tempLow && <span>{item.tempLow}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(data.source || data.lastUpdated) && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">
          {data.source && <span>{S.sourceLabel} {data.source}</span>}
          {data.source && data.lastUpdated && <span className="mx-1">|</span>}
          {data.lastUpdated && <span>{S.lastUpdatedLabel} {data.lastUpdated}</span>}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
