
import React from 'react';
import { ImageSearchResult, Language } from '../types';

interface ImageDetailModalProps {
  isOpen: boolean;
  image: ImageSearchResult | null;
  onClose: () => void;
  language: Language;
}

const BrokenImagePlaceholderModal: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    className={className || "w-24 h-24 text-gray-400 dark:text-gray-500"} 
    fill="currentColor" 
    viewBox="0 0 24 24" 
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.506 3.342A5.25 5.25 0 0115.75 6H18a3 3 0 013 3v1.5a.75.75 0 001.5 0V9A4.5 4.5 0 0018 4.5h-2.25a5.25 5.25 0 01-5.244-2.658K6.75 18A4.5 4.5 0 0011.25 22.5a.75.75 0 000-1.5A3 3 0 0111.25 18H9a.75.75 0 000 1.5H6.75zM12 6.75A.75.75 0 0011.25 6H9a4.5 4.5 0 000 9h2.25A.75.75 0 0012 14.25v-7.5z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.375 9A4.5 4.5 0 017.875 4.5h1.875M3.375 15A4.5 4.5 0 007.875 19.5h1.875m7.5-15h1.875A4.5 4.5 0 0120.625 9M19.125 19.5A4.5 4.5 0 0114.625 15h-1.875"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.954a.75.75 0 010 1.06L12.28 22.02a.75.75 0 01-1.06 0L2.25 13.06a.75.75 0 010-1.06z"></path>
  </svg>
);


const ImageDetailModal: React.FC<ImageDetailModalProps> = ({ isOpen, image, onClose, language }) => {
  const [isImageBroken, setIsImageBroken] = React.useState(false);

  React.useEffect(() => {
    if (image) {
      setIsImageBroken(false); // Reset on new image
    }
  }, [image]);

  if (!isOpen || !image) return null;

  const S = {
    closeButtonLabel: language === Language.Urdu ? "بند کریں" : "Close",
    visitPageButton: language === Language.Urdu ? "صفحہ دیکھیں" : "Visit Page",
    imageAltText: language === Language.Urdu ? image.caption || "تفصیلی تصویر" : image.caption || "Detailed image",
    pageTitleLabel: language === Language.Urdu ? "صفحہ کا عنوان:" : "Page Title:",
    sourceUrlLabel: language === Language.Urdu ? "ماخذ:" : "Source:",
    captionLabel: language === Language.Urdu ? "کیپشن:" : "Caption:",
  };
  
  const handleImageError = () => {
    setIsImageBroken(true);
  };

  return (
    <div 
      className="image-detail-modal-overlay" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="image-detail-modal-title"
    >
      <div 
        className="image-detail-modal-content relative flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 rounded-full text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-black/70 hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-700 focus:ring-secnto-blue"
          aria-label={S.closeButtonLabel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-grow overflow-y-auto p-2 sm:p-4">
          <div className="w-full h-auto max-h-[60vh] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md mb-3 sm:mb-4 overflow-hidden">
            {isImageBroken ? (
              <BrokenImagePlaceholderModal className="w-32 h-32 sm:w-40 sm:h-40 text-gray-400 dark:text-gray-500" />
            ) : (
              <img
                src={image.imageUrl}
                alt={S.imageAltText}
                className="max-w-full max-h-full object-contain rounded-md"
                onError={handleImageError}
              />
            )}
          </div>

          <div className={`space-y-2 text-sm ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
            {image.caption && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{S.captionLabel}</p>
                <p id="image-detail-modal-title" className="font-semibold text-gray-800 dark:text-gray-100">{image.caption}</p>
              </div>
            )}
            {image.pageTitle && image.pageTitle !== image.caption && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{S.pageTitleLabel}</p>
                <p className="text-gray-700 dark:text-gray-200">{image.pageTitle}</p>
              </div>
            )}
            {image.sourceUrl && image.sourceUrl !== '#' && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{S.sourceUrlLabel}</p>
                <a
                  href={image.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secnto-blue dark:text-secnto-green hover:underline break-all"
                >
                  {image.sourceUrl}
                </a>
              </div>
            )}
          </div>
        </div>
        
        {image.sourceUrl && image.sourceUrl !== '#' && (
            <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600 px-2 sm:px-4 pb-1 sm:pb-2">
              <a
                href={image.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full block text-center px-4 py-2 sm:py-2.5 text-sm font-medium rounded-md
                            bg-secnto-blue text-white
                            hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            dark:focus:ring-offset-gray-800 focus:ring-secnto-blue
                            ${language === Language.Urdu ? 'urdu-text' : ''}`}
              >
                {S.visitPageButton}
              </a>
            </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetailModal;
