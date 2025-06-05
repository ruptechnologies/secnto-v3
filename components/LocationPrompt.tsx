
import React from 'react';
import { Language, LocationPermission, UserLocation } from '../types';

interface LocationPromptProps {
  language: Language;
  permissionStatus: LocationPermission;
  userLocation: UserLocation;
  locationError: string | null;
  onRequestLocation: () => void;
}

const LocationPrompt: React.FC<LocationPromptProps> = ({
  language,
  permissionStatus,
  userLocation,
  locationError,
  onRequestLocation,
}) => {
  const S = {
    shareLocationMsg: language === Language.Urdu ? 'بہتر مقامی نتائج کے لیے اپنا مقام شیئر کریں۔' : 'Share your location for better local results.',
    shareLocationBtn: language === Language.Urdu ? 'میرا مقام شیئر کریں' : 'Share My Location',
    accessDeniedMsg: language === Language.Urdu ? 'مقام تک رسائی مسترد کر دی گئی۔ اس خصوصیت کو استعمال کرنے کے لیے، براہ کرم اس سائٹ کے لیے اپنے براؤزر کی ترتیبات میں مقام کی خدمات کو فعال کریں۔' : 'Location access denied. To use this feature, please enable location services in your browser settings for this site.',
    usingLocationMsg: language === Language.Urdu ? 'مقامی نتائج کے لیے آپ کا موجودہ مقام استعمال کیا جا رہا ہے۔' : 'Using your current location for local results.',
    errorFetchingGeneric: language === Language.Urdu ? 'مقام حاصل کرنے میں ناکامی۔ براہ مہربانی دوبارہ کوشش کریں.' : 'Failed to fetch location. Please try again.',
    fetchingLocationMsg: language === Language.Urdu ? 'مقام حاصل کیا جا رہا ہے...' : 'Fetching location...',
    retryBtn: language === Language.Urdu ? "دوبارہ کوشش کریں" : "Try Again",
  };

  if (permissionStatus === 'granted' && userLocation) {
    return (
      <div className={`text-center py-2 px-3 sm:px-4 my-2 text-xs sm:text-sm rounded-md
        text-green-700 dark:text-green-300
        ${language === Language.Urdu ? 'urdu-text' : ''}`}
        role="status"
      >
        {S.usingLocationMsg}
      </div>
    );
  }

  if (permissionStatus === 'granted' && !userLocation && !locationError) {
    return (
      <div className={`text-center py-2 px-3 sm:px-4 my-2 text-xs sm:text-sm rounded-md
        bg-gray-100/15 dark:bg-gray-800/10 border border-gray-300/20 dark:border-gray-600/15
        text-gray-700 dark:text-gray-300
        ${language === Language.Urdu ? 'urdu-text' : ''}`}
      >
        {S.fetchingLocationMsg}
      </div>
    );
  }

  if (permissionStatus === 'prompt' && !locationError) {
    return (
      <div className={`text-center py-2.5 sm:py-3 px-3 sm:px-4 my-3 rounded-lg border
        bg-blue-100/15 dark:bg-blue-900/10
        border-blue-300/20 dark:border-blue-700/15
        text-blue-800 dark:text-blue-200
        ${language === Language.Urdu ? 'urdu-text' : ''}`}
        role="status"
        aria-live="polite"
      >
        <p className="mb-1.5 sm:mb-2 text-sm sm:text-base">{S.shareLocationMsg}</p>
        <button
          onClick={onRequestLocation}
          className="px-3 sm:px-4 py-1 sm:py-1.5 bg-secnto-blue text-white text-xs sm:text-sm rounded-md hover:bg-opacity-80 transition-colors"
        >
          {S.shareLocationBtn}
        </button>
      </div>
    );
  }

  let displayMessage = '';
  if (locationError) {
    displayMessage = locationError;
  } else if (permissionStatus === 'denied') {
    displayMessage = S.accessDeniedMsg;
  } else if (permissionStatus === 'error_fetching') {
    displayMessage = S.errorFetchingGeneric;
  }
  if (!displayMessage && (permissionStatus === 'denied' || permissionStatus === 'error_fetching')) {
     displayMessage = S.errorFetchingGeneric;
  }


  if (displayMessage) {
    return (
      <div className={`text-center py-2.5 sm:py-3 px-3 sm:px-4 my-3 rounded-lg border
        bg-red-100/15 dark:bg-red-900/10
        border-red-300/20 dark:border-red-700/15
        text-red-800 dark:text-red-200
        ${language === Language.Urdu ? 'urdu-text' : ''}`}
        role="status"
        aria-live="polite"
      >
        <p className="mb-1.5 sm:mb-2 text-sm sm:text-base">{displayMessage}</p>
        <button
          onClick={onRequestLocation}
          className="px-3 sm:px-4 py-1 sm:py-1.5 bg-secnto-blue text-white text-xs sm:text-sm rounded-md hover:bg-opacity-80 transition-colors mt-1"
        >
          {S.retryBtn}
        </button>
      </div>
    );
  }

  return null;
};

export default LocationPrompt;
