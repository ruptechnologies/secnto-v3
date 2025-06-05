import React from 'react';
import { Language } from '../types';

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface EntityInfoPanelData {
  entityName: string;
  description?: string;
  wikipediaUrl?: string;
  officialWebsite?: string;
  socialMedia?: SocialMediaLink[];
  logoUrl?: string;
}

interface EntityInfoPanelWidgetProps {
  data: EntityInfoPanelData;
  language: Language;
}

const PlatformIcon: React.FC<{ platform: string, className?: string }> = ({ platform, className = "w-4 h-4 sm:w-5 sm:h-5" }) => {
  const lowerPlatform = platform.toLowerCase();
  if (lowerPlatform.includes('wikipedia')) {
    return ( // Wikipedia Icon
      <svg className={className} viewBox="0 0 512 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M403.568 318.475c-28.583 0-54.192 10.042-74.033 26.4L225.92 241.467c2.39-9.908 3.568-19.958 3.568-30.133s-1.178-20.225-3.568-30.133L329.535 77.8c19.841 16.358 45.45 26.4 74.033 26.4 49.208 0 89.323-39.633 89.323-88.725S452.775 0 403.568 0s-89.323 39.633-89.323 88.725c0 10.483 2.025 20.717 5.916 30.133L192.98 221.875h-73.492v-48.558h-50.666v48.558H19.353v63.25H68.82v48.558h50.667v-48.558h73.492l127.181 103.017c-3.891 9.416-5.916 19.65-5.916 30.133 0 49.092 40.115 88.725 89.323 88.725s89.323-39.633 89.323-88.725-40.115-88.725-89.323-88.725zM138.83 270.417H98.163V241.25h40.667v29.167zm0-44.792H98.163v-29.167h40.667v29.167z"/>
      </svg>
    );
  }
  if (lowerPlatform.includes('twitter') || lowerPlatform.includes('x.com')) {
    return ( // Twitter/X Icon
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }
  if (lowerPlatform.includes('facebook')) {
    return ( // Facebook Icon
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    );
  }
  if (lowerPlatform.includes('instagram')) {
    return ( // Instagram Icon
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.359 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }
  if (lowerPlatform.includes('linkedin')) {
    return ( // LinkedIn Icon
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    );
  }
  // Default Website Icon
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
    </svg>
  );
};


const EntityInfoPanelWidget: React.FC<EntityInfoPanelWidgetProps> = ({ data, language }) => {
  const S = {
    officialWebsite: language === Language.Urdu ? "آفیشل ویب سائٹ" : "Official Website",
    wikipedia: language === Language.Urdu ? "ویکیپیڈیا" : "Wikipedia",
  };

  const linkIconClassName = `w-3.5 h-3.5 sm:w-4 sm:h-4 ${language === Language.Urdu ? 'ml-1.5 sm:ml-2 mr-0' : 'mr-1.5 sm:mr-2'}`;
  const socialIconClassName = "w-4 h-4 sm:w-5 sm:h-5";


  return (
    <div className={`widget-card entity-info-panel p-3 sm:p-4 border rounded-lg shadow-md bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 mb-4 sm:mb-6 ${language === Language.Urdu ? 'urdu-text text-right' : ''}`}>
      <div className={`flex items-start ${language === Language.Urdu ? 'space-x-reverse space-x-3 sm:space-x-4' : 'space-x-3 sm:space-x-4'}`}>
        {data.logoUrl && (
          <img 
            src={data.logoUrl} 
            alt={`${data.entityName} ${language === Language.Urdu ? 'لوگو' : 'logo'}`}
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-contain border border-gray-200 dark:border-gray-600 shrink-0" 
          />
        )}
        <div className="flex-grow">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{data.entityName}</h3>
          {data.description && (
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">{data.description}</p>
          )}
        </div>
      </div>

      <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
        {data.officialWebsite && (
          <a
            href={data.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs sm:text-sm text-secnto-blue dark:text-secnto-green hover:underline"
          >
            <PlatformIcon platform="website" className={linkIconClassName} />
            {S.officialWebsite}
          </a>
        )}
        {data.wikipediaUrl && (
          <a
            href={data.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs sm:text-sm text-secnto-blue dark:text-secnto-green hover:underline"
          >
            <PlatformIcon platform="wikipedia" className={linkIconClassName} />
            {S.wikipedia}
          </a>
        )}
      </div>

      {data.socialMedia && data.socialMedia.length > 0 && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className={`flex flex-wrap ${language === Language.Urdu ? 'justify-end gap-x-3 sm:gap-x-4 gap-y-2' : 'gap-x-3 sm:gap-x-4 gap-y-2'}`}>
            {data.socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={social.platform}
                className="p-1.5 sm:p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label={`${social.platform} ${language === Language.Urdu ? 'صفحہ' : 'page'}`}
              >
                <PlatformIcon platform={social.platform} className={socialIconClassName} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityInfoPanelWidget;