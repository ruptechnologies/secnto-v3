
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Language, SearchSuggestion, SuggestionType, SearchHistoryItem, SearchType } from '../types';
import { fetchSearchSuggestions } from '../services/geminiService';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => void;
}


interface SearchBarProps {
  onSearch: (query: string, isFromSuggestionOrHistory?: boolean) => void;
  currentQuery: string;
  language: Language;
  disabled?: boolean;
  isAppLoading?: boolean;
  onImageSearchClick: (query: string) => void;
  searchHistory: SearchHistoryItem[];
  trendingTopics: SearchSuggestion[];
  isLoadingTrendingTopics: boolean;
  onRemoveHistoryItem: (id: string) => void;
  onClearSearchHistory: () => void;
  areResultsDisplayed: boolean;
  currentSearchType: SearchType; 
}

type HandledSuggestion = SearchSuggestion;

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  currentQuery,
  language,
  disabled,
  isAppLoading,
  onImageSearchClick,
  searchHistory,
  trendingTopics,
  isLoadingTrendingTopics,
  onRemoveHistoryItem,
  onClearSearchHistory,
  areResultsDisplayed,
  currentSearchType, 
}) => {
  const [inputValue, setInputValue] = useState<string>(currentQuery);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [microphonePermission, setMicrophonePermission] = useState<'prompt' | 'granted' | 'denied' | 'error_acquiring' | 'unsupported'>('prompt');
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const [apiSuggestions, setApiSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState<boolean>(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(-1);
  const [isLoadingApiSuggestions, setIsLoadingApiSuggestions] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const formRef = useRef<HTMLFormElement>(null);


  useEffect(() => {
    setInputValue(currentQuery);
    if(currentQuery === '') {
        setApiSuggestions([]);
    }
  }, [currentQuery]);


  const S = useMemo(() => {
    let placeholder = language === Language.Urdu ? "یہاں تلاش کریں..." : "Search Secnto or type a URL...";
    if (currentSearchType === SearchType.Generate) {
      placeholder = language === Language.Urdu ? "تصویر بنانے کے لیے پرامپٹ درج کریں..." : "Enter a prompt to generate an image...";
    } else if (language === Language.Urdu) {
      placeholder = "سیکنٹو میں تلاش کریں یا کوئی ویب پتہ لکھیں...";
    }

    return {
      searchPlaceholder: placeholder,
      listeningPlaceholder: language === Language.Urdu ? "سن رہا ہے..." : "Listening...",
      imageSearchTitle: language === Language.Urdu ? "تصاویر تلاش کریں" : "Search for images",
      voiceSearchTitle: language === Language.Urdu ? "آواز سے تلاش کریں" : "Search by voice",
      stopListeningTitle: language === Language.Urdu ? "سننا بند کریں" : "Stop listening",
      grantMicPermissionTitle: language === Language.Urdu ? "مائیکروفون کی اجازت دیں" : "Grant microphone permission",
      micUnsupported: language === Language.Urdu ? "تقریر کی شناخت آپ کے براؤزر کی طرف سے تعاون یافتہ نہیں ہے۔" : "Speech recognition is not supported by your browser.",
      micAccessDeniedUser: language === Language.Urdu ? "مائیکروفون تک رسائی مسترد کر دی گئی۔ براہ کرم اسے اپنی براؤزر کی ترتیبات میں فعال کریں۔" : "Microphone access was denied. Please enable it in your browser settings.",
      micErrorNoSpeech: language === Language.Urdu ? "کوئی تقریر نہیں سنی گئی۔ براہ مہربانی دوبارہ کوشش کریں." : "No speech was detected. Please try again.",
      micErrorAudioCapture: language === Language.Urdu ? "آڈیو کیپچر ناکام۔ براہ کرم اپنا مائیکروفون چیک کریں۔" : "Audio capture failed. Please check your microphone.",
      micErrorNetwork: language === Language.Urdu ? "تقریر کی شناخت کے دوران نیٹ ورک میں خرابی واقع ہوئی۔" : "A network error occurred during speech recognition.",
      micErrorGeneric: language === Language.Urdu ? "صوتی تلاش شروع نہیں ہو سکی۔ براہ مہربانی دوبارہ کوشش کریں." : "Could not start voice search. Please try again.",
      tryAgainGrantPermission: language === Language.Urdu ? "دوبارہ کوشش / اجازت دیں" : "Try Again / Grant Permission",
      searchFormLabel: language === Language.Urdu ? "تلاش فارم" : "Search form",
      searchInputLabel: language === Language.Urdu ? "تلاش کا خانہ" : "Search input",
      loadingSuggestions: language === Language.Urdu ? "تجاویز لوڈ ہو رہی ہیں..." : "Loading suggestions...",
      recentSearches: language === Language.Urdu ? "حالیہ تلاشیں" : "Recent Searches",
      trendingSearches: language === Language.Urdu ? "رجحان ساز تلاشیں" : "Trending Searches",
      clearHistory: language === Language.Urdu ? "تاریخ صاف کریں" : "Clear History",
      removeItem: language === Language.Urdu ? "آئٹم کو ہٹائیں" : "Remove item",
    };
  }, [language, currentSearchType]);

  const debouncedFetchApiSuggestions = useCallback(
    debounce(async (query: string, lang: Language) => {
      if (!query.trim() || disabled || isListening || currentSearchType === SearchType.Generate) { 
        setApiSuggestions([]);
        setIsLoadingApiSuggestions(false);
        return;
      }
      setIsLoadingApiSuggestions(true);
      try {
        const fetchedSuggestions = await fetchSearchSuggestions(query, lang);
        setApiSuggestions(fetchedSuggestions);
      } catch (error) {
        console.error("Failed to fetch API suggestions:", error);
        setApiSuggestions([]);
      } finally {
        setIsLoadingApiSuggestions(false);
      }
    }, 300),
    [disabled, isListening, currentSearchType] 
  );

  const shouldRenderSuggestionsDropdownContent = useMemo(() => 
    showSuggestionsDropdown && currentSearchType !== SearchType.Generate &&
    (apiSuggestions.length > 0 || 
     (!inputValue.trim() && searchHistory.length > 0) || 
     (!inputValue.trim() && trendingTopics.length > 0) || 
     isLoadingApiSuggestions || 
     isLoadingTrendingTopics),
    [showSuggestionsDropdown, currentSearchType, apiSuggestions, inputValue, searchHistory, trendingTopics, isLoadingApiSuggestions, isLoadingTrendingTopics]
  );


  useEffect(() => {
    if (currentSearchType === SearchType.Generate) {
      setShowSuggestionsDropdown(false);
      return;
    }
  
    if (isFocused && !isListening && !disabled) {
      if (inputValue.trim()) {
        debouncedFetchApiSuggestions(inputValue, language);
        setShowSuggestionsDropdown(true);
      } else {
        setApiSuggestions([]); 
        setIsLoadingApiSuggestions(false);
        setShowSuggestionsDropdown(searchHistory.length > 0 || trendingTopics.length > 0 || isLoadingTrendingTopics);
      }
    } else {
      setShowSuggestionsDropdown(false);
    }
  }, [inputValue, language, debouncedFetchApiSuggestions, isListening, disabled, isFocused, currentSearchType, searchHistory.length, trendingTopics.length, isLoadingTrendingTopics]);


  useEffect(() => {
    if (!SpeechRecognition) {
      setMicrophonePermission('unsupported');
      return;
    }
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then(permissionStatus => {
        setMicrophonePermission(permissionStatus.state as 'prompt' | 'granted' | 'denied');
        permissionStatus.onchange = () => {
          setMicrophonePermission(permissionStatus.state as 'prompt' | 'granted' | 'denied');
          if (permissionStatus.state === 'denied') {
            setMicrophoneError(S.micAccessDeniedUser);
          } else {
            setMicrophoneError(null);
          }
        };
      }).catch(() => {
        setMicrophonePermission('prompt');
      });
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [S.micAccessDeniedUser]);

  const handleRequestMicrophonePermission = useCallback(async () => {
    if (!SpeechRecognition || microphonePermission === 'unsupported') {
      setMicrophonePermission('unsupported');
      setMicrophoneError(S.micUnsupported);
      setIsListening(false);
      return;
    }
    setMicrophoneError(null);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicrophonePermission('granted');
      startListening();
    } catch (err) {
      console.error("Microphone permission error:", err);
      setMicrophonePermission('denied');
      setMicrophoneError(S.micAccessDeniedUser);
      setIsListening(false);
    }
  }, [microphonePermission, S]);

  const stopListeningInternal = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition || microphonePermission === 'unsupported' ) {
      if (microphonePermission === 'unsupported') setMicrophoneError(S.micUnsupported);
      setIsListening(false);
      return;
    }
     if (isListening) return;

    if (microphonePermission !== 'granted') {
        handleRequestMicrophonePermission();
        return;
    }

    setMicrophoneError(null);
    setIsListening(true);
    setShowSuggestionsDropdown(false);

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language === Language.Urdu ? 'ur-PK' : 'en-US';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      onSearch(transcript, false);
      stopListeningInternal();
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      let errorMsg = S.micErrorGeneric;
      if (event.error === 'no-speech') errorMsg = S.micErrorNoSpeech;
      else if (event.error === 'audio-capture') errorMsg = S.micErrorAudioCapture;
      else if (event.error === 'not-allowed') { errorMsg = S.micAccessDeniedUser; setMicrophonePermission('denied'); }
      else if (event.error === 'network') errorMsg = S.micErrorNetwork;
      setMicrophoneError(errorMsg);
      stopListeningInternal();
    };

    recognitionRef.current.onend = () => {
      stopListeningInternal();
    };

    try {
        recognitionRef.current.start();
    } catch (e) {
        console.error("Error starting recognition:", e);
        setMicrophoneError(S.micErrorGeneric);
        stopListeningInternal();
    }

  }, [language, onSearch, microphonePermission, isListening, S, handleRequestMicrophonePermission, stopListeningInternal]);


  const handleVoiceSearchClick = () => {
    if (isListening) {
      stopListeningInternal();
    } else {
      startListening();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setActiveSuggestionIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSearch(inputValue.trim(), false);
      setShowSuggestionsDropdown(false);
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const handleSuggestionClick = (suggestion: HandledSuggestion) => {
    const termToSearch = suggestion.query || suggestion.text;
    setInputValue(termToSearch);
    onSearch(termToSearch, true);
    setShowSuggestionsDropdown(false);
  };

  const combinedSuggestions: HandledSuggestion[] = useMemo(() => {
    if (currentSearchType === SearchType.Generate) return []; 

    let combined: HandledSuggestion[] = [];
    const addedTexts = new Set<string>();

    if (inputValue.trim() && apiSuggestions.length > 0) {
        apiSuggestions.forEach(item => {
            if (!addedTexts.has(item.text.toLowerCase())) {
                combined.push({ ...item, suggestionType: SuggestionType.API });
                addedTexts.add(item.text.toLowerCase());
            }
        });
    }

    if (!inputValue.trim()) {
        if (trendingTopics.length > 0) {
            trendingTopics.forEach(item => {
                if (!addedTexts.has(item.text.toLowerCase())) {
                    combined.push({ ...item, suggestionType: SuggestionType.TRENDING });
                    addedTexts.add(item.text.toLowerCase());
                }
            });
        }
        if (searchHistory.length > 0) {
            searchHistory.forEach(item => {
                if (!addedTexts.has(item.query.toLowerCase())) {
                    combined.push({
                        id: item.id,
                        text: item.query,
                        query: item.query,
                        timestamp: item.timestamp,
                        suggestionType: SuggestionType.HISTORY
                    });
                    addedTexts.add(item.query.toLowerCase());
                }
            });
        }
    }
    return combined;
  }, [apiSuggestions, searchHistory, trendingTopics, inputValue, currentSearchType]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestionsDropdown || combinedSuggestions.length === 0 || currentSearchType === SearchType.Generate) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim() && !disabled) {
          onSearch(inputValue.trim(), false);
          setShowSuggestionsDropdown(false);
          if (inputRef.current) inputRef.current.blur();
        }
      }
      setActiveSuggestionIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => (prevIndex + 1) % combinedSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prevIndex => (prevIndex - 1 + combinedSuggestions.length) % combinedSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < combinedSuggestions.length) {
        handleSuggestionClick(combinedSuggestions[activeSuggestionIndex]);
      } else {
        if (inputValue.trim() && !disabled) {
          onSearch(inputValue.trim(), false);
          setShowSuggestionsDropdown(false);
          if (inputRef.current) inputRef.current.blur();
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestionsDropdown(false);
      setActiveSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    if (activeSuggestionIndex >= 0 && suggestionsRef.current) {
      const activeElement = suggestionsRef.current.children[activeSuggestionIndex] as HTMLLIElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeSuggestionIndex]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    setTimeout(() => {
      if (formRef.current && !formRef.current.contains(document.activeElement)) {
        setIsFocused(false);
        setShowSuggestionsDropdown(false);
        setActiveSuggestionIndex(-1);
      }
    }, 100); 
  };

  const shouldShowHistory = !inputValue.trim() && searchHistory.length > 0 && currentSearchType !== SearchType.Generate;
  const shouldShowTrending = !inputValue.trim() && trendingTopics.length > 0 && apiSuggestions.length === 0 && currentSearchType !== SearchType.Generate;
  
  const renderSuggestionIcon = (suggestion: HandledSuggestion) => {
    const iconClass = `h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400 ${language === Language.Urdu ? 'ml-3' : 'mr-3'}`;
    switch (suggestion.suggestionType) {
      case SuggestionType.API:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case SuggestionType.HISTORY:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case SuggestionType.TRENDING:
         return (
          <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          );
    }
  };

  const inputContainerBaseClasses = "flex items-center bg-white dark:bg-gray-700 transition-shadow duration-200";
  
  const shadowClass = isFocused ? 'shadow-md' : 'shadow-sm';
  const inputContainerLoadingClasses = isAppLoading ? 'searching-rgb-shadow' : '';
      
  const inputContainerRoundingClasses = shouldRenderSuggestionsDropdownContent
      ? (language === Language.Urdu ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-none rounded-br-none' : 'rounded-tl-2xl rounded-tr-2xl rounded-bl-none rounded-br-none')
      : 'rounded-full';
            
  const finalInputContainerClasses = `${inputContainerBaseClasses} ${shadowClass} border-0 ${inputContainerLoadingClasses} ${inputContainerRoundingClasses}`;


  const suggestionsListBorderClasses = useMemo(() => {
    if (isAppLoading) {
      return 'suggestions-list-loading-border'; 
    }
    return 'border-0';
  }, [isAppLoading]);

  const suggestionsListRoundingClasses = language === Language.Urdu 
    ? 'rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-none' 
    : 'rounded-bl-2xl rounded-br-2xl rounded-tl-none rounded-tr-none';


  const inputBaseClasses = `w-full px-5 sm:px-6 text-sm sm:text-base text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none`;
  const urduSpecificInputStyling = language === Language.Urdu ? 'py-3 sm:py-3.5 leading-relaxed' : 'py-2.5 sm:py-3';
  const inputClasses = `${inputBaseClasses} ${urduSpecificInputStyling}`;


  const imageButtonMarginClass = language === Language.Urdu ? 'ml-0.5 sm:ml-1' : 'mr-0.5 sm:mr-1';
  const voiceButtonMarginClass = language === Language.Urdu ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2';


  return (
    <form
        onSubmit={handleSubmit}
        className={`relative w-full ${language === Language.Urdu ? 'urdu-text' : ''}`}
        role="search"
        aria-label={S.searchFormLabel}
        ref={formRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
    >
      <div className={finalInputContainerClasses}>
        <input
          ref={inputRef}
          type="search" 
          value={isListening ? S.listeningPlaceholder : inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={S.searchPlaceholder}
          className={inputClasses}
          disabled={disabled || isListening || isAppLoading}
          aria-label={S.searchInputLabel}
          aria-autocomplete={currentSearchType === SearchType.Generate ? "none" : "list"}
          aria-controls={currentSearchType === SearchType.Generate ? undefined : "suggestions-listbox"}
          aria-expanded={currentSearchType === SearchType.Generate ? false : showSuggestionsDropdown && combinedSuggestions.length > 0}
          aria-activedescendant={currentSearchType !== SearchType.Generate && activeSuggestionIndex >= 0 ? `suggestion-item-${activeSuggestionIndex}` : undefined}
        />
        {currentSearchType !== SearchType.Generate && ( 
          <button
            type="button"
            onClick={() => onImageSearchClick(inputValue)}
            title={S.imageSearchTitle}
            className={`p-1.5 sm:p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-secnto-blue dark:hover:text-secnto-green hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-secnto-blue ${imageButtonMarginClass} ${disabled || isAppLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled || isAppLoading}
            aria-label={S.imageSearchTitle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        {(microphonePermission !== 'unsupported') && (
          <button
            type="button"
            onClick={handleVoiceSearchClick}
            title={isListening ? S.stopListeningTitle : S.voiceSearchTitle}
            className={`p-1.5 sm:p-2 rounded-full text-gray-500 dark:text-gray-300 hover:text-secnto-blue dark:hover:text-secnto-green hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-secnto-blue ${voiceButtonMarginClass} ${(disabled || isAppLoading) && !isListening ? 'opacity-50 cursor-not-allowed' : ''} ${isListening ? 'text-red-500 dark:text-red-400' : ''}`}
            disabled={(disabled || isAppLoading) && !isListening}
            aria-label={isListening ? S.stopListeningTitle : S.voiceSearchTitle}
            aria-pressed={isListening}
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 2a1 1 0 11-2 0V4a1 1 0 112 0v2zm-3 7a4 4 0 004-4H5a4 4 0 004 4z" clipRule="evenodd" />
                <path d="M3 9a1 1 0 011-1h.01a1 1 0 010 2H4a1 1 0 01-1-1zm13 0a1 1 0 011-1h.01a1 1 0 010 2H17a1 1 0 01-1-1z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {microphoneError && (
        <p className={`text-xs text-red-500 dark:text-red-400 mt-1 px-4 text-center ${language === Language.Urdu ? 'urdu-text' : ''}`} role="alert">
            {microphoneError}
            {(microphonePermission === 'denied' || microphonePermission === 'error_acquiring') && (
                <button
                    type="button"
                    onClick={handleRequestMicrophonePermission}
                    className="ml-2 underline hover:text-red-700 dark:hover:text-red-300"
                >
                    {S.tryAgainGrantPermission}
                </button>
            )}
        </p>
      )}

      {shouldRenderSuggestionsDropdownContent && (
        <ul
            id="suggestions-listbox"
            ref={suggestionsRef}
            className={`absolute left-0 right-0 w-full bg-white dark:bg-gray-700 shadow-lg z-30 overflow-y-auto max-h-72 sm:max-h-96
                        ${suggestionsListBorderClasses} ${suggestionsListRoundingClasses}
                        mt-0`} 
            role="listbox"
            aria-label={language === Language.Urdu ? "تلاش کی تجاویز" : "Search suggestions"}
        >
          {isLoadingApiSuggestions && inputValue.trim() && (
            <li className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-500 dark:text-gray-300 italic ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
              {S.loadingSuggestions}
            </li>
          )}

          {apiSuggestions.map((suggestion, index) => (
            <li
              key={`api-${suggestion.id}`}
              id={`suggestion-item-${index}`}
              role="option"
              aria-selected={activeSuggestionIndex === index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm
                          ${activeSuggestionIndex === index ? 'bg-gray-100 dark:bg-gray-600' : ''}
                          ${language === Language.Urdu && suggestion.text.match(/[\u0600-\u06FF]/) ? 'urdu-text text-right' : 'text-left'} flex items-center`}
            >
              {renderSuggestionIcon(suggestion)}
              <span>{suggestion.text}</span>
            </li>
          ))}

          {shouldShowTrending && (
            <>
              <li className={`px-3 sm:px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-300
                ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
                {isLoadingTrendingTopics ? S.loadingSuggestions : S.trendingSearches}
              </li>
              {isLoadingTrendingTopics && trendingTopics.length === 0 && (
                 <li className={`px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-500 dark:text-gray-300 italic ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'}`}>
                    {S.loadingSuggestions}
                </li>
              )}
              {trendingTopics.map((item, index) => (
                <li
                  key={`trend-${item.id}`}
                  id={`suggestion-item-${index + apiSuggestions.length}`}
                  role="option"
                  aria-selected={activeSuggestionIndex === (index + apiSuggestions.length)}
                  onClick={() => handleSuggestionClick(item)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm
                              ${activeSuggestionIndex === (index + apiSuggestions.length) ? 'bg-gray-100 dark:bg-gray-600' : ''}
                              ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'} flex items-center`}
                >
                  {renderSuggestionIcon(item)}
                  <span>{item.text}</span>
                </li>
              ))}
            </>
          )}

          {shouldShowHistory && (
            <>
              <li className={`px-3 sm:px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-300
                ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'} flex justify-between items-center`}>
                <span>{S.recentSearches}</span>
                {searchHistory.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); onClearSearchHistory(); }}
                            className={`text-xs text-secnto-blue hover:underline dark:text-secnto-green ${language === Language.Urdu ? 'urdu-text' : ''}`}
                            aria-label={S.clearHistory}>
                    {S.clearHistory}
                    </button>
                )}
              </li>
              {searchHistory.map((item, index) => (
                <li
                  key={`hist-${item.id}`}
                  id={`suggestion-item-${index + apiSuggestions.length + (shouldShowTrending ? trendingTopics.length : 0)}`}
                  role="option"
                  aria-selected={activeSuggestionIndex === (index + apiSuggestions.length + (shouldShowTrending ? trendingTopics.length : 0))}
                  onClick={() => handleSuggestionClick({ id: item.id, text: item.query, query: item.query, timestamp: item.timestamp, suggestionType: SuggestionType.HISTORY })}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm
                              ${activeSuggestionIndex === (index + apiSuggestions.length + (shouldShowTrending ? trendingTopics.length : 0)) ? 'bg-gray-100 dark:bg-gray-600' : ''}
                              ${language === Language.Urdu ? 'urdu-text text-right' : 'text-left'} group flex justify-between items-center`}
                >
                  <div className="flex items-center overflow-hidden">
                    {renderSuggestionIcon({ id: item.id, text: item.query, query: item.query, timestamp: item.timestamp, suggestionType: SuggestionType.HISTORY })}
                    <span className="truncate">{item.query}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveHistoryItem(item.id); }}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 shrink-0"
                    aria-label={`${S.removeItem}: ${item.query}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </form>
  );
};

export default SearchBar;
