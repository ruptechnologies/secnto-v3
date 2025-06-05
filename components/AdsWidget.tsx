import React from 'react';
import { Language } from '../types';

interface AdsWidgetProps {
  adContent: string;
  language: Language;
}

const AdsWidget: React.FC<AdsWidgetProps> = ({ adContent, language }) => {
  const S = {
    advertisementLabel: language === Language.Urdu ? "اشتہار" : "Advertisement",
  };

  const isImageUrl = (content: string): boolean => {
    // Basic check for common image extensions
    return /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(content);
  };

  const seemsLikeHtml = (content: string): boolean => {
    // Basic check for HTML tags
    return /<\/?[a-z][\s\S]*>/i.test(content);
  };

  let contentRender;
  if (isImageUrl(adContent)) {
    contentRender = (
      <img 
        src={adContent} 
        alt={S.advertisementLabel} 
        className="w-full h-auto object-contain rounded" 
        loading="lazy"
      />
    );
  } else if (seemsLikeHtml(adContent)) {
    // Ensure the container div itself doesn't inherit urdu-text if the content isn't urdu.
    // Individual elements within the HTML should handle their own direction if needed.
    contentRender = (
      <div dangerouslySetInnerHTML={{ __html: adContent }} />
    );
  } else {
    contentRender = <p className={`text-sm ${language === Language.Urdu && adContent.match(/[\u0600-\u06FF]/) ? 'urdu-text' : ''}`}>{adContent}</p>;
  }

  return (
    <div 
      className={`widget-card ads-widget p-3 sm:p-4 border rounded-lg shadow-md bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-600 ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}
      role="complementary"
      aria-label={S.advertisementLabel}
    >
      {contentRender}
    </div>
  );
};

export default AdsWidget;
