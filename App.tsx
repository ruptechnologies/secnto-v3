
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SearchType, Language, SearchResultItem, GroundingSource, UserLocation, LocationPermission, SearchFilterOptions, SearchHistoryItem, SearchSuggestion, Advertisement, ImageSearchResult, LocalSearchResult, TextSearchResult, NotebookSource, NotebookChatMessage } from './types';
import SearchBar from './components/SearchBar';
import SearchTabs from './components/SearchTabs';
import SearchTools from './components/SearchTools';
import ResultsArea from './components/ResultsArea';
import Footer from './components/Footer';
import { fetchSearchResultsFromGeminiStream, fetchTrendingTopics, streamAssistantResponse, WidgetOrAnswerData, fetchSearchResultsFromVertexAI, streamNotebookResponse, generateImagesFromPrompt, fetchImagesFromGoogleCSE } from './services/geminiService';
import Dashboard from './components/Dashboard';
import LocationPrompt from './components/LocationPrompt';
import Logo from './components/Logo';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import AiAssistantIcon from './components/AiAssistantIcon';
import AiAssistantModal from './components/AiAssistantModal';
import SettingsModal from './components/SettingsModal';
import EntityInfoPanelWidget from './components/EntityInfoPanelWidget';
import AdsWidget from './components/AdsWidget';
import ImageDetailModal from './components/ImageDetailModal';
import InitialPermissionModal from './components/InitialPermissionModal';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsAndConditionsPage from './components/TermsAndConditionsPage'; // Added
import AiNotebookModal from './components/AiNotebookModal'; // Added for NotebookLM feature
import type { Chat } from '@google/genai';

const RESULTS_PER_LOAD = 10;
const MAX_HISTORY_ITEMS = 15;
const GLOBAL_SEARCH_HISTORY_KEY = 'secnto-search-history';
const TRENDING_TOPICS_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const INITIAL_MIC_DENIED_MODAL_SHOWN_KEY = 'secnto-initial-mic-denied-modal-shown';
const CSE_IMAGES_TO_FETCH = 30;


// --- Configuration Flag for Vertex AI Search ---
// Set this to true to attempt using Vertex AI Search for "All" and "News" search types.
// IMPORTANT: You MUST implement the details in `services/geminiService.ts` -> `fetchSearchResultsFromVertexAI`
// including your actual Vertex AI Search endpoint, authentication, and response parsing logic.
const USE_VERTEX_AI_FOR_GENERAL_SEARCH = false;
// --- End Configuration Flag ---

const placeholderAdsData: Advertisement[] = [
    { id: 'sidebar-ad-en-1', name: 'English Sidebar Ad Example', content: '<div class="p-4 bg-yellow-200 text-yellow-800 rounded-lg text-center text-sm"><b>English Sidebar Ad</b><br/>Your advertisement content here. Can include HTML.</div>', displayLocation: 'sidebar', isActive: true, language: Language.English },
    { id: 'sidebar-ad-ur-1', name: 'Urdu Sidebar Ad Example', content: '<div class="p-4 bg-green-200 text-green-800 rounded-lg text-center urdu-text text-sm"><b>اردو سائڈبار اشتہار</b><br/>آپ کے اشتہار کا مواد یہاں۔ ایچ ٹی ایم ایل شامل ہو سکتا ہے۔</div>', displayLocation: 'sidebar', isActive: true, language: Language.Urdu },
    { id: 'top-ad-en-1', name: 'English Top Ad', content: 'Top English Ad Content - This ad is for "search-top" and won\'t appear in the sidebar.', displayLocation: 'search-top', isActive: true, language: Language.English },
];

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: {
    base64Data: string;
    mimeType: string;
    fileName?: string;
  } | null;
}

// Error Identifiers (should match those in geminiService.ts)
const NETWORK_ERROR = "NETWORK_ERROR";
const API_KEY_INVALID = "API_KEY_INVALID";
const RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
// GENERIC_GEMINI_ERROR, GENERIC_STREAM_ERROR, GENERIC_ASSISTANT_ERROR will map to S.generalError or S.assistantError

declare global {
  // Define the google.maps namespace and its members that are used
  namespace google.maps {
    // --- LatLng & LatLngLiteral ---
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    // Assuming google.maps.LatLng is an object/class, declare minimally
    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      equals(other: LatLng | null): boolean;
      lat(): number;
      lng(): number;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): LatLngLiteral;
    }

    // --- Map ---
    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      zoomControl?: boolean;
      gestureHandling?: string | 'cooperative' | 'greedy' | 'none' | 'auto';
    }
    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
      getCenter(): LatLng;
      getZoom(): number;
    }

    // --- Marker ---
    interface MarkerOptions {
      position?: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      animation?: Animation;
    }
    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    // --- LatLngBounds ---
    class LatLngBounds {
      constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): void;
      getCenter(): LatLng;
    }

    // --- InfoWindow ---
    interface InfoWindowOptions {
      content?: string | Node;
      ariaLabel?: string;
    }
    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map | StreetViewPanorama, anchor?: MVCObject | Marker): void;
      setContent(content: string | Node): void;
    }

    // --- Animation Enum ---
    enum Animation {
      BOUNCE = 1,
      DROP = 2,
    }

    // --- Event Listener ---
    interface MapsEventListener {
      remove(): void;
    }
    const event: {
      addListener: (instance: any, eventName: string, handler: (...args: any[]) => void) => MapsEventListener;
    };

    // --- Other related types ---
    type Padding = any;
    type StreetViewPanorama = any;
    type MVCObject = any;
  }

  interface Window {
    initMap?: () => void;
    google?: {
      maps?: typeof google.maps;
    };
  }
}


const App: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [currentSearchType, setCurrentSearchType] = useState<SearchType>(SearchType.All);

  const [allFetchedResults, setAllFetchedResults] = useState<SearchResultItem[]>([]);
  const [resultsToDisplay, setResultsToDisplay] = useState<SearchResultItem[]>([]);
  const [generatedImages, setGeneratedImages] = useState<ImageSearchResult[]>([]); // For SearchType.Generate


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<Language>(Language.English);
  const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true); // Assume true initially, will be set by useEffect
  const [isCseKeysConfigured, setIsCseKeysConfigured] = useState<boolean>(true); // New state for CSE keys
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState<boolean>(false);
  const [showTermsAndConditions, setShowTermsAndConditions] = useState<boolean>(false); // Added

  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermission>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);

  const [activeTimeFilter, setActiveTimeFilter] = useState<string>('any');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [activeImageSizeFilter, setActiveImageSizeFilter] = useState<string>('any');

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<SearchSuggestion[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState<boolean>(false);

  const lastTrendingFetchTimestampRef = useRef<number>(0);
  const searchInitiatedRef = useRef<boolean>(false);

  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState<boolean>(false);
  const [assistantChatMessages, setAssistantChatMessages] = useState<AssistantChatMessage[]>([]);
  const [isAssistantLoading, setIsAssistantLoading] = useState<boolean>(false);
  const assistantChatInstanceRef = useRef<Chat | null>(null);
  const aiSoundRef = useRef<HTMLAudioElement | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsAnimationKey, setSettingsAnimationKey] = useState(0);
  const [widgetData, setWidgetData] = useState<WidgetOrAnswerData | null>(null);
  const [activeSidebarAd, setActiveSidebarAd] = useState<Advertisement | null>(null);
  const [searchCorrection, setSearchCorrection] = useState<{ originalQuery: string; correctedQuery: string } | null>(null);
  const [logoAnimationPlayed, setLogoAnimationPlayed] = useState(false);

  const [selectedImageForModal, setSelectedImageForModal] = useState<ImageSearchResult | null>(null);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState<boolean>(false);

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null);
  const [isMapsApiReady, setIsMapsApiReady] = useState<boolean>(false);
  const mapsApiLoadedRef = useRef(false);

  const [initialMicrophoneStatus, setInitialMicrophoneStatus] = useState<PermissionState | 'unsupported' | null>(null);
  const [showInitialMicDeniedModal, setShowInitialMicDeniedModal] = useState<boolean>(false);

  // AI Notebook State
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState<boolean>(false);
  const [notebookSources, setNotebookSources] = useState<NotebookSource[]>([]);
  const [notebookChatMessages, setNotebookChatMessages] = useState<NotebookChatMessage[]>([]);
  const [isNotebookLoading, setIsNotebookLoading] = useState<boolean>(false);
  const notebookChatInstanceRef = useRef<Chat | null>(null);


  const areResultsDisplayed = searchInitiatedRef.current && query.trim() !== '';

  const S = useMemo(() => ({
    secntoDescription: language === Language.Urdu
      ? "سیکنٹو: پاکستان کا پہلا انتہائی تیز اور رازداری پر مرکوز AI سے چلنے والا سرچ انجن اور ڈیجیٹل پلیٹ فارم کا تصور۔"
      : "Secnto: Pakistan’s first ultra-fast and privacy-focused AI-powered search engine and digital platform concept.",
    apiError: language === Language.Urdu ? "خرابی: API کلید درست نہیں ہے۔ براہ کرم اپنی کنفیگریشن چیک کریں۔" : "Error: API key is not valid. Please check your configuration.",
    generalError: language === Language.Urdu ? "نتائج حاصل کرنے میں ایک خرابی واقع ہوئی۔" : "An error occurred while fetching results.",
    imageGenerationError: language === Language.Urdu ? "تصویر بنانے میں ایک خرابی واقع ہوئی۔" : "An error occurred while generating the image.",
    networkErrorDefault: language === Language.Urdu ? "نیٹ ورک میں خرابی۔ براہ کرم اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔" : "A network error occurred. Please check your connection and try again.",
    noResultsFound: language === Language.Urdu ? "کوئی نتیجہ نہیں ملا۔" : "No results found.",
    noImageGenerated: language === Language.Urdu ? "کوئی تصویر نہیں بنائی گئی۔ براہ کرم مختلف پرامپٹ آزمائیں۔" : "No image generated. Please try a different prompt.",
    searchCorrectionText: language === Language.Urdu ? "اس کے بجائے تلاش کریں:" : "Search instead for:",
    showingResultsFor: language === Language.Urdu ? "نتائج برائے:" : "Showing results for:",
    searchOriginalQuery: language === Language.Urdu ? "اصل سوال کے لیے تلاش کریں:" : "Search for original query:",
    logoAriaLabel: language === Language.Urdu ? "سیکنٹو لوگو، ہوم پیج پر جائیں" : "Secnto Logo, go to homepage",
    welcomeToSecntoAssistant: language === Language.Urdu ? "سیکنٹو اے آئی اسسٹنٹ میں خوش آمدید!" : "Welcome to Secnto AI assistant!",
    locationAccessDenied: language === Language.Urdu ? "مقام تک رسائی مسترد کر دی گئی۔" : "Location access denied.",
    geolocationNotSupported: language === Language.Urdu ? "جغرافیائی مقام آپ کے براؤزر کی طرف سے تعاون یافتہ نہیں ہے۔" : "Geolocation is not supported by your browser.",
    errorFetchingLocation: language === Language.Urdu ? "مقام حاصل کرنے میں خرابی ہوئی۔" : "Error fetching location.",
    locationInfoUnavailable: language === Language.Urdu ? "مقام کی معلومات دستیاب نہیں ہے۔" : "Location information is unavailable.",
    locationRequestTimeout: language === Language.Urdu ? "مقام کی درخواست کا وقت ختم ہو گیا۔" : "Location request timed out.",
    geminiApiNotConfiguredError: language === Language.Urdu ? "سروس عارضی طور پر دستیاب نہیں ہے۔ براہ کرم کنفیگریشن چیک کریں۔ (Gemini API)" : "Service temporarily unavailable. Please check configuration. (Gemini API)",
    imageSearchUnavailableError: language === Language.Urdu ? "تصویری تلاش کے لیے گوگل کسٹم سرچ API کلید اور CX ID کی کنفیگریشن درکار ہے، جو فی الحال موجود نہیں ہیں۔ (CSE)" : "Image search requires Google Custom Search API Key and CX ID to be configured, which are currently missing. (CSE)",
    imageGenerationUnavailableError: language === Language.Urdu ? "تصویری جنریشن اس وقت دستیاب نہیں ہے۔ (Imagen API)" : "Image generation is currently unavailable. (Imagen API)",
    mapsSearchUnavailableError: language === Language.Urdu ? "مقامی نقشہ کا منظر دستیاب نہیں ہے (API کلید کی ضرورت ہے)۔" : "Local map view unavailable (API key required).",
    mapsApiLoadError: language === Language.Urdu ? "نقشہ لوڈ کرنے میں ناکامی۔ براہ کرم تھوڑی دیر بعد کوشش کریں." : "Failed to load map. Please try again later.",
    vertexAISearchError: language === Language.Urdu ? "ورٹیکس اے آئی سرچ سے نتائج حاصل کرنے میں خرابی ہوئی۔" : "Error fetching results from Vertex AI Search.",
    assistantUnavailable: language === Language.Urdu ? "معاون اس وقت دستیاب نہیں ہے۔ برائے مہربانی API کنفیگریشن چیک کریں۔" : "Assistant is currently unavailable. Please check API configuration.",
    assistantError: language === Language.Urdu ? "معاون سے جواب حاصل کرنے میں ایک خرابی واقع ہوئی۔" : "An error occurred while getting a response from the assistant.",
    initialMicDeniedTitle: language === Language.Urdu ? "مائیکروفون تک رسائی مسترد" : "Microphone Access Denied",
    initialMicDeniedMessage: language === Language.Urdu ? "مائیکروفون تک رسائی مسترد کر دی گئی ہے۔ صوتی تلاش اور دیگر صوتی خصوصیات استعمال کرنے کے لیے، براہ کرم اپنے براؤزر کی ترتیبات میں سیکنٹو کے لیے مائیکروفون تک رسائی کو فعال کریں۔" : "Microphone access has been denied. To use voice search and other voice features, please enable microphone access for Secnto in your browser settings.",
    initialMicDeniedButton: language === Language.Urdu ? "ٹھیک ہے، سمجھ گیا" : "Okay, Got It",
    privacyPolicyTitle: language === Language.Urdu ? "رازداری کی پالیسی" : "Privacy Policy",
    termsAndConditionsTitle: language === Language.Urdu ? "شرائط و ضوابط" : "Terms and Conditions",
    goBackToSearch: language === Language.Urdu ? "تلاش پر واپس جائیں" : "Go Back to Search",
    aiNotebookTitle: language === Language.Urdu ? "اے آئی نوٹ بک" : "AI Notebook",
    openAiNotebook: language === Language.Urdu ? "اے آئی نوٹ بک کھولیں" : "Open AI Notebook",
    welcomeToAiNotebook: language === Language.Urdu ? "سیکنٹو اے آئی نوٹ بک میں خوش آمدید! یہاں آپ اپنے ذرائع شامل کر سکتے ہیں اور ان کے بارے میں سوالات پوچھ سکتے ہیں۔" : "Welcome to Secnto AI Notebook! Add your sources and ask questions about them.",
    notebookFeatureSimplifiedMessage: language === Language.Urdu ? "یہ اے آئی نوٹ بک ایک آسان خصوصیت ہے جو فراہم کردہ مواد پر مبنی ہے۔" : "This AI Notebook is a simplified feature based on provided content.",
    notebookUnavailable: language === Language.Urdu ? "نوٹ بک اس وقت دستیاب نہیں ہے۔ برائے مہربانی API کنفیگریشن چیک کریں۔" : "Notebook is currently unavailable. Please check API configuration.",
    notebookError: language === Language.Urdu ? "نوٹ بک سے جواب حاصل کرنے میں ایک خرابی واقع ہوئی۔" : "An error occurred while getting a response from the notebook.",
    closeButtonLabel: language === Language.Urdu ? "بند کریں" : "Close",
  }), [language]);

  const isCriticalError = useMemo(() => {
    if (!error) return false;
    return error === S.geminiApiNotConfiguredError || error === S.imageGenerationUnavailableError || error === S.imageSearchUnavailableError;
  }, [error, S.geminiApiNotConfiguredError, S.imageGenerationUnavailableError, S.imageSearchUnavailableError]);


  useEffect(() => {
    aiSoundRef.current = new Audio('/sounds/ai_imagination.mp3');
    aiSoundRef.current.load();
  }, []);

  // Effect for Gemini API Key status (runs once on mount)
  useEffect(() => {
    if (typeof process.env.API_KEY !== 'string' || process.env.API_KEY === '') {
      setError(S.geminiApiNotConfiguredError);
      setIsApiAvailable(false);
    } else {
      setIsApiAvailable(true);
      if (error === S.geminiApiNotConfiguredError) {
        setError(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S.geminiApiNotConfiguredError]);

  // Effect for CSE Keys status (runs once on mount)
  useEffect(() => {
    const cseApiKey = process.env.GOOGLE_CSE_API_KEY;
    const cseCxId = process.env.GOOGLE_CSE_CX_ID;
    const configured = !!(cseApiKey && cseCxId);
    setIsCseKeysConfigured(configured);
  }, []);


  // Initial load from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialQueryFromUrl = searchParams.get('q');
    const initialSearchTypeFromUrl = searchParams.get('type') as SearchType | null;

    if (initialQueryFromUrl) {
      const validSearchType = initialSearchTypeFromUrl && Object.values(SearchType).includes(initialSearchTypeFromUrl)
        ? initialSearchTypeFromUrl
        : SearchType.All;
      
      setQuery(initialQueryFromUrl);
      setCurrentSearchType(validSearchType);
      searchInitiatedRef.current = true; 
      setLogoAnimationPlayed(true); 
      handleSearch(initialQueryFromUrl, validSearchType, true);
    } else if (initialSearchTypeFromUrl === SearchType.Images) {
        // No query, but on Images tab. Check CSE keys immediately.
        // Note: isCseKeysConfigured might not be set by its own effect yet on very first render.
        // So, we check process.env directly here for initial load.
        const cseApiKey = process.env.GOOGLE_CSE_API_KEY;
        const cseCxId = process.env.GOOGLE_CSE_CX_ID;
        if (!cseApiKey || !cseCxId) {
            setError(S.imageSearchUnavailableError);
        }
        setCurrentSearchType(SearchType.Images);
    } else if (initialSearchTypeFromUrl) {
        // No query, but some other tab type is specified
        setCurrentSearchType(initialSearchTypeFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [S.imageSearchUnavailableError]); // Added S.imageSearchUnavailableError dependency for initial error setting


  // Effect for Google Maps API Key (runs once on mount)
  useEffect(() => {
    const mapsKey = process.env.GOOGLE_MAPS_API_KEY;
    if (typeof mapsKey === 'string' && mapsKey !== '') {
      setGoogleMapsApiKey(mapsKey);
    } else {
      console.warn("Google Maps API Key not configured. Local search map view will be disabled.");
      setGoogleMapsApiKey(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial Microphone Permission Check Effect
  useEffect(() => {
    let permissionStatusObject: PermissionStatus | null = null;
    const checkInitialMicPermission = async () => {
      if (!navigator.permissions || !navigator.permissions.query) {
        setInitialMicrophoneStatus('unsupported');
        return;
      }
      try {
        permissionStatusObject = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setInitialMicrophoneStatus(permissionStatusObject.state);

        if (permissionStatusObject.state === 'denied') {
          const alreadyShown = localStorage.getItem(INITIAL_MIC_DENIED_MODAL_SHOWN_KEY);
          if (!alreadyShown) {
            setShowInitialMicDeniedModal(true);
          }
        }

        permissionStatusObject.onchange = () => {
          if(permissionStatusObject){ 
            setInitialMicrophoneStatus(permissionStatusObject.state);
            if (permissionStatusObject.state !== 'denied') {
                localStorage.removeItem(INITIAL_MIC_DENIED_MODAL_SHOWN_KEY);
                setShowInitialMicDeniedModal(false);
            } else {
                const alreadyShown = localStorage.getItem(INITIAL_MIC_DENIED_MODAL_SHOWN_KEY);
                if (!alreadyShown) {
                  setShowInitialMicDeniedModal(true);
                }
            }
          }
        };
      } catch (err) {
        console.error("Error querying initial microphone permission:", err);
        setInitialMicrophoneStatus('prompt'); // Fallback
      }
    };
    checkInitialMicPermission();

    return () => {
        if (permissionStatusObject && permissionStatusObject.onchange) {
            permissionStatusObject.onchange = null; 
        }
    };
  }, []);

  const handleCloseInitialMicDeniedModal = () => {
    setShowInitialMicDeniedModal(false);
    localStorage.setItem(INITIAL_MIC_DENIED_MODAL_SHOWN_KEY, 'true');
  };


  useEffect(() => {
    if (googleMapsApiKey && !mapsApiLoadedRef.current && !window.google?.maps) {
        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) {
            if (window.google?.maps) {
                setIsMapsApiReady(true);
                mapsApiLoadedRef.current = true;
            }
            return;
        }

        window.initMap = () => {
            console.log("App.tsx: initMap called by Google Maps script, API is ready.");
            setIsMapsApiReady(true);
            mapsApiLoadedRef.current = true;
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap&libraries=marker`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            console.error("Google Maps API script failed to load.");
            setError(S.mapsApiLoadError);
            setIsMapsApiReady(false);
            mapsApiLoadedRef.current = false;
            const existingScript = document.getElementById(scriptId);
            if (existingScript) existingScript.remove();
            delete window.initMap;
        };
        document.head.appendChild(script);

        return () => {
            delete window.initMap;
        };
    } else if (window.google?.maps) {
        if (!mapsApiLoadedRef.current) {
            setIsMapsApiReady(true);
            mapsApiLoadedRef.current = true;
        }
    }
  }, [googleMapsApiKey, S.mapsApiLoadError]);

  useEffect(() => {
    let initialTheme = localStorage.getItem('secnto-theme') as 'light' | 'dark' | null;
    if (!initialTheme) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      } else {
        initialTheme = 'light';
      }
    }
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('secnto-theme', theme);
  }, [theme]);


  useEffect(() => {
    const storedLanguage = localStorage.getItem('secnto-language') as Language | null;
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      setLanguage(Language.English);
      localStorage.setItem('secnto-language', Language.English);
    }
  }, []);

  useEffect(() => {
    const storedHistory = localStorage.getItem(GLOBAL_SEARCH_HISTORY_KEY);
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    } else {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    const suitableAds = placeholderAdsData.filter(
      (ad) => ad.isActive && ad.language === language && ad.displayLocation === 'sidebar'
    );
    if (suitableAds.length > 0) {
      setActiveSidebarAd(suitableAds[0]);
    } else {
      setActiveSidebarAd(null);
    }
  }, [language]);

  const addSearchToHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setSearchHistory(prevHistory => {
      const newHistoryItem: SearchHistoryItem = { id: `hist-${Date.now()}`, query: searchTerm, timestamp: Date.now() };
      const filteredHistory = prevHistory.filter(item => item.query.toLowerCase() !== searchTerm.toLowerCase());
      const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(GLOBAL_SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const removeSearchHistoryItem = useCallback((id: string) => {
    setSearchHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.id !== id);
        localStorage.setItem(GLOBAL_SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
      setSearchHistory([]);
      localStorage.setItem(GLOBAL_SEARCH_HISTORY_KEY, JSON.stringify([]));
  }, []);

  const fetchAndSetTrendingTopics = useCallback(async () => {
    const now = Date.now();
    if (now - lastTrendingFetchTimestampRef.current < TRENDING_TOPICS_COOLDOWN_MS && trendingTopics.length > 0) {
        return;
    }
    setIsLoadingTrending(true);
    try {
        const topics = await fetchTrendingTopics(language, userLocation);
        setTrendingTopics(topics);
        lastTrendingFetchTimestampRef.current = now;
    } catch (err) {
        console.error("Failed to fetch trending topics:", err);
    } finally {
        setIsLoadingTrending(false);
    }
  }, [language, userLocation, trendingTopics.length]);


  useEffect(() => {
      fetchAndSetTrendingTopics();
  }, [fetchAndSetTrendingTopics]);


  useEffect(() => {
    if (isAssistantModalOpen && assistantChatMessages.length === 0) {
        setAssistantChatMessages([{ id: `model-welcome-${Date.now()}`, role: 'model', text: S.welcomeToSecntoAssistant }]);
    }
  }, [isAssistantModalOpen, assistantChatMessages.length, S.welcomeToSecntoAssistant]);

  // Effect for AI Notebook initial message
  useEffect(() => {
    if (isNotebookModalOpen && notebookChatMessages.length === 0) {
      setNotebookChatMessages([{
        id: `nb-model-welcome-${Date.now()}`,
        role: 'model',
        text: `${S.welcomeToAiNotebook}<br /><small>${S.notebookFeatureSimplifiedMessage}</small>`
      }]);
    }
  }, [isNotebookModalOpen, notebookChatMessages.length, S.welcomeToAiNotebook, S.notebookFeatureSimplifiedMessage]);


  useEffect(() => {
    if (!areResultsDisplayed && !logoAnimationPlayed) {
      const timer = setTimeout(() => setLogoAnimationPlayed(true), 800);
      return () => clearTimeout(timer);
    }
  }, [areResultsDisplayed, logoAnimationPlayed]);

  const handleSearch = useCallback(async (searchTerm: string, searchTypeOverride?: SearchType, isFromSuggestionOrHistory?: boolean, forceOriginal?: boolean) => {
    const activeSearchType = searchTypeOverride || currentSearchType;
    const finalSearchTerm = searchCorrection && !forceOriginal ? searchCorrection.correctedQuery : searchTerm;
    
    if (!finalSearchTerm.trim()) {
      setIsLoading(false);
      return;
    }

    if (activeSearchType !== SearchType.Images && !isApiAvailable && (activeSearchType === SearchType.All || activeSearchType === SearchType.News || activeSearchType === SearchType.Videos || activeSearchType === SearchType.Local || activeSearchType === SearchType.Generate)) {
        setError(S.geminiApiNotConfiguredError); 
        setIsLoading(false);
        return;
    }
    
    try {
        const newParams = new URLSearchParams();
        newParams.set('q', finalSearchTerm);
        newParams.set('type', activeSearchType);
        window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
    } catch (e: any) {
        if (e.name === 'SecurityError') {
            console.warn("SecurityError: Could not update URL with pushState. This might happen in sandboxed environments. URL persistence may not work.", e);
        } else {
            console.error("Error updating URL with pushState:", e);
        }
    }

    setQuery(finalSearchTerm);
    searchInitiatedRef.current = true;
    setCurrentSearchType(activeSearchType);
    setIsLoading(true);
    setError(null);
    setAllFetchedResults([]);
    setResultsToDisplay([]);
    setGeneratedImages([]); 
    setWidgetData(null);
    if (!forceOriginal) {
      setSearchCorrection(null);
    }

    if (!isFromSuggestionOrHistory && activeSearchType !== SearchType.Generate) { 
        addSearchToHistory(finalSearchTerm);
    }

    const filters: SearchFilterOptions = {
      timeFilter: activeTimeFilter,
      customStartDate: activeTimeFilter === 'custom' ? customStartDate : null,
      customEndDate: activeTimeFilter === 'custom' ? customEndDate : null,
      imageSizeFilter: activeSearchType === SearchType.Images ? activeImageSizeFilter : undefined,
    };

    if (activeSearchType === SearchType.Generate) {
        if (!isApiAvailable) {
            setError(S.imageGenerationUnavailableError);
            setIsLoading(false);
            return;
        }
        try {
            const images = await generateImagesFromPrompt(finalSearchTerm, language);
            setGeneratedImages(images);
            if (images.length === 0) {
                setError(S.noImageGenerated);
            }
        } catch (e: any) {
            console.error("Image generation error in App.tsx:", e);
            const serviceErrorMessage = String(e?.message || '');
             if (serviceErrorMessage === API_KEY_INVALID || serviceErrorMessage === RATE_LIMIT_EXCEEDED) {
                setError(S.imageGenerationUnavailableError);
            } else if (serviceErrorMessage === NETWORK_ERROR) {
                setError(S.networkErrorDefault);
            } else {
                setError(S.imageGenerationError);
            }
            setGeneratedImages([]);
        } finally {
            setIsLoading(false);
        }
    } else if (activeSearchType === SearchType.Images) {
        if (!isCseKeysConfigured) { // Preemptive check
            setError(S.imageSearchUnavailableError);
            setIsLoading(false);
            setIsLoadingMore(false);
            setAllFetchedResults([]);
            setResultsToDisplay([]);
            return;
        }
        try {
            const cseImages = await fetchImagesFromGoogleCSE(finalSearchTerm, language, filters, 1, CSE_IMAGES_TO_FETCH);
            setAllFetchedResults(cseImages);
            setResultsToDisplay(cseImages.slice(0, RESULTS_PER_LOAD));
            if (cseImages.length === 0 && !error) { 
                setError(S.noResultsFound);
            }
        } catch (e: any) {
            console.error("Image search error (CSE Path) in App.tsx:", e);
            const serviceErrorMessage = String(e?.message || '');
            const errorMessageStringLC = serviceErrorMessage.toLowerCase();

            if (errorMessageStringLC.includes("google custom search api key or cx id not configured") ||
                errorMessageStringLC.includes("گوگل کسٹم سرچ api کلید یا cx id کنفیگر نہیں ہے۔")) {
                setError(S.imageSearchUnavailableError);
            } else if (serviceErrorMessage === NETWORK_ERROR) {
                setError(S.networkErrorDefault);
            } else {
                setError(S.generalError); 
            }
            setAllFetchedResults([]);
            setResultsToDisplay([]);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    } else if (USE_VERTEX_AI_FOR_GENERAL_SEARCH && (activeSearchType === SearchType.All || activeSearchType === SearchType.News)) {
        try {
            console.log(`[App.tsx] Attempting search with Vertex AI for query: "${finalSearchTerm}", type: ${activeSearchType}`);
            const vertexResponse = await fetchSearchResultsFromVertexAI(finalSearchTerm, language, filters);

            if (vertexResponse.correctedQuery && !forceOriginal) {
                setSearchCorrection({ originalQuery: finalSearchTerm, correctedQuery: vertexResponse.correctedQuery });
            }
            setAllFetchedResults(vertexResponse.items);
            setResultsToDisplay(vertexResponse.items.slice(0, RESULTS_PER_LOAD));
             if (vertexResponse.items.length === 0 && !error) {
                setError(S.noResultsFound);
            }
        } catch (e: any) {
            console.error("Vertex AI Search error in App.tsx:", e);
            const userFriendlyError = e.message && e.message.includes("not yet fully integrated") ? e.message : S.vertexAISearchError;
            setError(userFriendlyError);
            setAllFetchedResults([]);
            setResultsToDisplay([]);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    } else { 
        if (!isApiAvailable) { 
             setError(S.geminiApiNotConfiguredError);
             setIsLoading(false);
             return;
        }
        try {
          for await (const chunk of fetchSearchResultsFromGeminiStream(finalSearchTerm, activeSearchType, language, userLocation, filters, forceOriginal)) {
            if (chunk.type === 'items') {
              setAllFetchedResults(prevAll => [...prevAll, ...chunk.data]);
              setResultsToDisplay(prevDisplay => {
                const combined = [...prevDisplay, ...chunk.data];
                return isLoadingMore ? combined : combined.slice(0, RESULTS_PER_LOAD);
              });
            } else if (chunk.type === 'sources') {
              // Grounding sources are handled if needed
            } else if (chunk.type === 'widgetOrAnswer') {
              setWidgetData(chunk.data);
            } else if (chunk.type === 'searchCorrection') {
                if (chunk.data.correctedQuery.toLowerCase() !== chunk.data.originalQuery.toLowerCase()) {
                    setSearchCorrection(chunk.data);
                } else {
                    setSearchCorrection(null);
                }
            }
          }
        } catch (e: any) {
          console.error("Search error in App.tsx (Gemini Path):", e);
          const serviceErrorMessage = String(e?.message || '');

          if (serviceErrorMessage === API_KEY_INVALID || serviceErrorMessage === RATE_LIMIT_EXCEEDED) {
            setError(S.geminiApiNotConfiguredError);
          } else if (serviceErrorMessage === NETWORK_ERROR) {
            setError(S.networkErrorDefault);
          }
          else {
            setError(S.generalError);
          }
        } finally {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
    }
  }, [
    currentSearchType, 
    isApiAvailable,
    isCseKeysConfigured, // Added dependency
    language,
    addSearchToHistory,
    userLocation,
    activeTimeFilter,
    customStartDate,
    customEndDate,
    activeImageSizeFilter,
    searchCorrection,
    S, 
    isLoadingMore 
  ]);

  const handleSearchFromBar = useCallback((searchTermFromBar: string, isFromSuggestionOrHistory?: boolean) => {
    handleSearch(searchTermFromBar, undefined, isFromSuggestionOrHistory, false);
  }, [handleSearch]);

  const handleGoHome = () => {
    setQuery('');
    setAllFetchedResults([]);
    setResultsToDisplay([]);
    setGeneratedImages([]);
    setWidgetData(null);
    setSearchCorrection(null);
    searchInitiatedRef.current = false;
    setCurrentSearchType(SearchType.All);
    setError(null); // Clear errors on going home
    setLogoAnimationPlayed(false);
    setShowDashboard(false);
    setShowPrivacyPolicy(false);
    setShowTermsAndConditions(false); 
    try {
        window.history.pushState({}, '', window.location.pathname); 
    } catch (e: any) {
        if (e.name === 'SecurityError') {
            console.warn("SecurityError: Could not update URL with pushState on Go Home. URL persistence may not work.", e);
        } else {
            console.error("Error updating URL with pushState on Go Home:", e);
        }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const loadMoreResults = useCallback(() => {
    if (isLoading || isLoadingMore || currentSearchType === SearchType.Generate || resultsToDisplay.length >= allFetchedResults.length) return;

    setIsLoadingMore(true);
    setTimeout(() => {
        const currentLength = resultsToDisplay.length;
        const moreResults = allFetchedResults.slice(currentLength, currentLength + RESULTS_PER_LOAD);
        setResultsToDisplay(prev => [...prev, ...moreResults]);
        setIsLoadingMore(false);
    }, 300);
  }, [isLoading, isLoadingMore, resultsToDisplay.length, allFetchedResults, currentSearchType]);


  const handleTabChange = (newType: SearchType) => {
    setAllFetchedResults([]);
    setResultsToDisplay([]);
    setGeneratedImages([]);
    setWidgetData(null);
    // Don't clear searchCorrection here, handleSearch will do it if needed.
    // setError(null); // Clear general errors, specific errors will be set below or by handleSearch

    if (query.trim()) {
        handleSearch(query, newType, true); 
    } else {
        setCurrentSearchType(newType);
        try {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('type', newType);
            newParams.delete('q'); 
            window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
        } catch (e: any) {
            if (e.name === 'SecurityError') {
                console.warn("SecurityError: Could not update URL with pushState on Tab Change. URL persistence may not work.", e);
            } else {
                console.error("Error updating URL with pushState on Tab Change:", e);
            }
        }
        
        // Set specific errors for the new tab if applicable and query is empty
        if (newType === SearchType.Images) {
            if (!isCseKeysConfigured) {
                setError(S.imageSearchUnavailableError);
            } else if (error === S.imageSearchUnavailableError) { 
                setError(null);
            } else if (error && !isCriticalError) { // Clear "No results found" etc.
                 setError(null);
            }
        } else if (newType === SearchType.Generate) {
            if (!isApiAvailable) {
                setError(S.imageGenerationUnavailableError);
            } else if (error === S.imageGenerationUnavailableError) {
                setError(null);
            } else if (error && !isCriticalError) {
                 setError(null);
            }
        } else { // For All, News, Videos, Local
            if (!isApiAvailable) {
                setError(S.geminiApiNotConfiguredError);
            } else if (error === S.geminiApiNotConfiguredError || error === S.imageSearchUnavailableError || error === S.imageGenerationUnavailableError) {
                setError(null); // Clear critical config errors if API is fine for this tab
            } else if (error && !isCriticalError) {
                 setError(null);
            }
        }
    }
};

  const handleImageSearchFromBar = (imageQuery: string) => { 
    setQuery(imageQuery);
    searchInitiatedRef.current = true;
    setError(null); 

    if (imageQuery.trim()) {
        handleSearch(imageQuery, SearchType.Images, false); // isFromSuggestionOrHistory = false to add to history
    } else {
        setCurrentSearchType(SearchType.Images); 
        setAllFetchedResults([]);
        setResultsToDisplay([]);
        setGeneratedImages([]);
        setWidgetData(null);
        try {
            const newParams = new URLSearchParams(window.location.search);
            newParams.set('type', SearchType.Images);
            newParams.delete('q');
            window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`);
        } catch (e: any) { /* handle error if needed */ }
        
        if (!isCseKeysConfigured) {
            setError(S.imageSearchUnavailableError);
        } else if (error && !isCriticalError && error !== S.imageSearchUnavailableError) { 
            setError(null);
        }
    }
  };

  const toggleTheme = (newTheme: 'light' | 'dark') => setTheme(newTheme);

  const toggleLanguage = (newLanguage: Language) => {
    const oldError = error;

    setLanguage(newLanguage);
    localStorage.setItem('secnto-language', newLanguage);

    const S_for_new_lang = {
        geminiApiNotConfiguredError: newLanguage === Language.Urdu ? "سروس عارضی طور پر دستیاب نہیں ہے۔ براہ کرم کنفیگریشن چیک کریں۔ (Gemini API)" : "Service temporarily unavailable. Please check configuration. (Gemini API)",
        imageSearchUnavailableError: newLanguage === Language.Urdu ? "تصویری تلاش کے لیے گوگل کسٹم سرچ API کلید اور CX ID کی کنفیگریشن درکار ہے، جو فی الحال موجود نہیں ہیں۔ (CSE)" : "Image search requires Google Custom Search API Key and CX ID to be configured, which are currently missing. (CSE)",
        imageGenerationUnavailableError: newLanguage === Language.Urdu ? "تصویری جنریشن اس وقت دستیاب نہیں ہے۔ (Imagen API)" : "Image generation is currently unavailable. (Imagen API)",
        mapsApiLoadError: newLanguage === Language.Urdu ? "نقشہ لوڈ کرنے میں ناکامی۔ براہ کرم تھوڑی دیر بعد کوشش کریں." : "Failed to load map. Please try again later.",
        vertexAISearchError: newLanguage === Language.Urdu ? "ورٹیکس اے آئی سرچ سے نتائج حاصل کرنے میں خرابی ہوئی۔" : "Error fetching results from Vertex AI Search.",
        networkErrorDefault: newLanguage === Language.Urdu ? "نیٹ ورک میں خرابی۔ براہ کرم اپنا کنکشن چیک کریں اور دوبارہ کوشش کریں۔" : "A network error occurred. Please check your connection and try again.",
        generalError: newLanguage === Language.Urdu ? "نتائج حاصل کرنے میں ایک خرابی واقع ہوئی۔" : "An error occurred while fetching results.",
        imageGenerationError: newLanguage === Language.Urdu ? "تصویر بنانے میں ایک خرابی واقع ہوئی۔" : "An error occurred while generating the image.",
        noImageGenerated: newLanguage === Language.Urdu ? "کوئی تصویر نہیں بنائی گئی۔ براہ کرم مختلف پرامپٹ آزمائیں۔" : "No image generated. Please try a different prompt.",
        noResultsFound: newLanguage === Language.Urdu ? "کوئی نتیجہ نہیں ملا۔" : "No results found.",
    };

    // Remap existing error message to the new language
    if (oldError) {
        if (oldError === S.geminiApiNotConfiguredError) setError(S_for_new_lang.geminiApiNotConfiguredError);
        else if (oldError === S.imageSearchUnavailableError) setError(S_for_new_lang.imageSearchUnavailableError);
        else if (oldError === S.imageGenerationUnavailableError) setError(S_for_new_lang.imageGenerationUnavailableError);
        else if (oldError === S.mapsApiLoadError) setError(S_for_new_lang.mapsApiLoadError);
        else if (oldError === S.vertexAISearchError) setError(S_for_new_lang.vertexAISearchError);
        else if (oldError === S.networkErrorDefault) setError(S_for_new_lang.networkErrorDefault);
        else if (oldError === S.generalError) setError(S_for_new_lang.generalError);
        else if (oldError === S.imageGenerationError) setError(S_for_new_lang.imageGenerationError);
        else if (oldError === S.noImageGenerated) setError(S_for_new_lang.noImageGenerated);
        else if (oldError === S.noResultsFound) setError(S_for_new_lang.noResultsFound);
    }

    window.location.reload();
  };


  const requestUserLocation = useCallback(() => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError(S.geolocationNotSupported);
      setLocationPermission('error_fetching');
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationPermission('granted');
      },
      (error) => {
        let errorMsg = S.errorFetchingLocation;
        let permState: LocationPermission = 'error_fetching';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = S.locationAccessDenied;
            permState = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = S.locationInfoUnavailable;
            break;
          case error.TIMEOUT:
            errorMsg = S.locationRequestTimeout;
            break;
        }
        setLocationError(errorMsg);
        setUserLocation(null);
        setLocationPermission(permState);
      },
      options
    );
  }, [S]);

  useEffect(() => {
    const geoPermissionName = 'geolocation' as PermissionName;
    let permStatusObject: PermissionStatus | null = null;

    const updateLocationStateBasedOnBrowserPermission = (browserState: PermissionState) => {
      const appPermissionState = browserState as LocationPermission;
      setLocationPermission(appPermissionState);

      if (appPermissionState === 'granted' && !userLocation && !locationError) {
        requestUserLocation();
      } else if (appPermissionState === 'denied') {
        setUserLocation(null);
        if (!locationError) setLocationError(S.locationAccessDenied);
      }
    };

    const handleBrowserPermissionChange = () => {
      if (permStatusObject) {
        updateLocationStateBasedOnBrowserPermission(permStatusObject.state);
      }
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: geoPermissionName })
        .then(status => {
          permStatusObject = status;
          updateLocationStateBasedOnBrowserPermission(status.state);
          status.onchange = handleBrowserPermissionChange;
        })
        .catch(() => {
          if (!userLocation && locationPermission !== 'denied' && locationPermission !== 'granted') {
            setLocationPermission('prompt');
          }
        });
    } else {
      if (userLocation) {
         setLocationPermission('granted');
      } else if (locationPermission !== 'denied' && locationPermission !== 'error_fetching') {
        if (locationPermission === 'prompt') {
        }
      }
    }

    return () => {
      if (permStatusObject && permStatusObject.onchange) {
        permStatusObject.onchange = null;
      }
    };
  }, [S, requestUserLocation, userLocation, locationError, locationPermission]);

  const handleTimeFilterChange = (filter: string) => {
    setActiveTimeFilter(filter);
    if (filter !== 'custom' && query.trim() && searchInitiatedRef.current && currentSearchType !== SearchType.Generate && currentSearchType !== SearchType.Images) {
      handleSearch(query, currentSearchType, true);
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') setCustomStartDate(value);
    else setCustomEndDate(value);
  };

  const applyCustomDateFilter = () => {
    if (query.trim() && customStartDate && customEndDate && searchInitiatedRef.current && currentSearchType !== SearchType.Generate && currentSearchType !== SearchType.Images) {
      handleSearch(query, currentSearchType, true);
    }
  };

  const handleImageSizeChange = (size: string) => {
    setActiveImageSizeFilter(size);
    if (query.trim() && currentSearchType === SearchType.Images && searchInitiatedRef.current) {
      handleSearch(query, SearchType.Images, true); 
    }
  };

  const handleResetFilters = () => {
    const filtersWereActive = activeTimeFilter !== 'any' || customStartDate || customEndDate || activeImageSizeFilter !== 'any';
    setActiveTimeFilter('any');
    setCustomStartDate('');
    setCustomEndDate('');
    setActiveImageSizeFilter('any');
    if (query.trim() && searchInitiatedRef.current && filtersWereActive) {
      if (currentSearchType === SearchType.Images || (currentSearchType !== SearchType.Generate)) {
        handleSearch(query, currentSearchType, true);
      }
    }
  };

 const handleOpenAssistant = () => {
    if (aiSoundRef.current) {
      aiSoundRef.current.play().catch(error => console.warn("Error playing AI sound:", error));
    }
    setIsAssistantModalOpen(true);
  };

  const handleCloseAssistant = () => {
    setIsAssistantModalOpen(false);
  };

  const handleAssistantSendMessage = async (
    messageText: string,
    imagePayload?: { base64Data: string; mimeType: string; fileName?: string }
  ) => {
    if (!isApiAvailable) {
      setAssistantChatMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', text: S.assistantUnavailable }]);
      return;
    }
    const newUserMessage: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      image: imagePayload || null,
    };
    setAssistantChatMessages(prev => [...prev, newUserMessage]);
    setIsAssistantLoading(true);

    let modelResponseText = "";
    const modelMsgId = `model-${Date.now()}`;

    try {
      setAssistantChatMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: "" }]);

      for await (const chunk of streamAssistantResponse(
        messageText,
        assistantChatInstanceRef.current,
        language,
        (newChat) => { assistantChatInstanceRef.current = newChat; },
        imagePayload ? { base64Data: imagePayload.base64Data, mimeType: imagePayload.mimeType } : undefined
      )) {
        modelResponseText += chunk.textChunk;
        setAssistantChatMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: modelResponseText } : m));
      }
    } catch (e: any) {
      console.error("Assistant error:", e);
      const serviceErrorMessage = String(e?.message || '');
      let errorTextToShow = S.assistantError; 

      if (serviceErrorMessage === API_KEY_INVALID || serviceErrorMessage === RATE_LIMIT_EXCEEDED) {
        errorTextToShow = S.assistantUnavailable;
      } else if (serviceErrorMessage === NETWORK_ERROR) {
        errorTextToShow = S.networkErrorDefault;
      }

      setAssistantChatMessages(prev => prev.filter(m => m.id !== modelMsgId));
      setAssistantChatMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'model', text: errorTextToShow }]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // AI Notebook Handlers
  const handleOpenNotebook = () => {
    setIsNotebookModalOpen(true);
  };
  const handleCloseNotebook = () => setIsNotebookModalOpen(false);

  const handleNotebookSendMessage = async (question: string) => {
    if (!isApiAvailable) {
        setNotebookChatMessages(prev => [...prev, { id: `nb-err-${Date.now()}`, role: 'model', text: S.notebookUnavailable }]);
        return;
    }
    if (!notebookSources.length) {
        setNotebookChatMessages(prev => [...prev, { id: `nb-warn-${Date.now()}`, role: 'model', text: language === Language.Urdu ? "براہ کرم پہلے کچھ ذرائع شامل کریں۔" : "Please add some sources first." }]);
        return;
    }

    const newUserMessage: NotebookChatMessage = { id: `nb-user-${Date.now()}`, role: 'user', text: question };
    setNotebookChatMessages(prev => [...prev, newUserMessage]);
    setIsNotebookLoading(true);

    let modelResponseText = "";
    const modelMsgId = `nb-model-${Date.now()}`;

    try {
        setNotebookChatMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: "" }]); 

        for await (const chunk of streamNotebookResponse(
            notebookSources,
            question,
            notebookChatInstanceRef.current,
            language,
            (newChat) => { notebookChatInstanceRef.current = newChat; }
        )) {
            modelResponseText += chunk.textChunk;
            setNotebookChatMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text: modelResponseText } : m));
        }
    } catch (e:any) {
        console.error("AI Notebook error:", e);
        const serviceErrorMessage = String(e?.message || '');
        let errorTextToShow = S.notebookError;

        if (serviceErrorMessage === API_KEY_INVALID || serviceErrorMessage === RATE_LIMIT_EXCEEDED) {
            errorTextToShow = S.notebookUnavailable;
        } else if (serviceErrorMessage === NETWORK_ERROR) {
            errorTextToShow = S.networkErrorDefault;
        }
        setNotebookChatMessages(prev => prev.filter(m => m.id !== modelMsgId)); 
        setNotebookChatMessages(prev => [...prev, { id: `nb-err-${Date.now()}`, role: 'model', text: errorTextToShow }]);
    } finally {
        setIsNotebookLoading(false);
    }
  };

  const handleAddNotebookSource = (source: NotebookSource) => {
    setNotebookSources(prev => [...prev, source]);
  };

  const handleRemoveNotebookSource = (sourceId: string) => {
    setNotebookSources(prev => prev.filter(s => s.id !== sourceId));
  };


  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
    setSettingsAnimationKey(prev => prev + 1);
  };
  const handleCloseSettings = () => setIsSettingsModalOpen(false);

  const handleOpenImageDetailModal = (image: ImageSearchResult) => {
    setSelectedImageForModal(image);
    setIsImageDetailModalOpen(true);
    if (error && !isCriticalError) {
        setError(null);
    }
  };

  const handleCloseImageDetailModal = () => {
    setIsImageDetailModalOpen(false);
    setSelectedImageForModal(null);
  };

  const togglePrivacyPolicy = () => {
    setShowPrivacyPolicy(prev => !prev);
    if (showDashboard) setShowDashboard(false);
    if (showTermsAndConditions) setShowTermsAndConditions(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTermsAndConditions = () => {
    setShowTermsAndConditions(prev => !prev);
    if (showDashboard) setShowDashboard(false);
    if (showPrivacyPolicy) setShowPrivacyPolicy(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const showToolsButton = areResultsDisplayed && (
      currentSearchType === SearchType.All ||
      currentSearchType === SearchType.News ||
      currentSearchType === SearchType.Videos ||
      currentSearchType === SearchType.Local ||
      currentSearchType === SearchType.Images
  );

  const isGeneralSearchDisabled = useMemo(() => {
    if (isLoading) return true;
    if (currentSearchType === SearchType.Images) {
        return !isCseKeysConfigured || error === S.imageSearchUnavailableError;
    }
    if (currentSearchType === SearchType.Generate) {
        return !isApiAvailable || error === S.imageGenerationUnavailableError;
    }
    // For All, News, Videos, Local (Gemini dependent)
    return !isApiAvailable || error === S.geminiApiNotConfiguredError;
  }, [isLoading, currentSearchType, isCseKeysConfigured, isApiAvailable, error, S]);


  const showAnyPage = showDashboard || showPrivacyPolicy || showTermsAndConditions;


  return (
    <div className={`min-h-screen flex flex-col bg-secnto-gray dark:bg-gray-800 text-secnto-gray-text dark:text-secnto-gray-text-dark transition-colors duration-300 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
      <header className={`
        ${(areResultsDisplayed || showAnyPage)
            ? 'sticky top-0 z-30 bg-secnto-gray/90 dark:bg-gray-800/90 backdrop-blur-md shadow-sm pt-3 pb-2 sm:pt-4 sm:pb-3'
            : 'pt-4 sm:pt-6'
        } px-3 sm:px-4 md:px-6 transition-all duration-200`}
      >
        <div className="max-w-5xl mx-auto">
          <div className={`flex justify-between items-center ${ (areResultsDisplayed || showAnyPage) ? 'mb-3 sm:mb-4' : ''}`}>
            <div className="flex-1 flex justify-start items-center">
              {(areResultsDisplayed || showAnyPage) && (
                <button onClick={handleGoHome} aria-label={S.logoAriaLabel} className="focus:outline-none rounded-md">
                  <Logo theme={theme} className="h-7 sm:h-8 w-auto" />
                </button>
              )}
              {!(areResultsDisplayed || showAnyPage) && <LanguageToggle currentLanguage={language} onLanguageChange={toggleLanguage} />}
            </div>
            <div className="flex-1 flex justify-center"></div>
            <div className="flex-1 flex justify-end items-center space-x-1 sm:space-x-2">
              {(areResultsDisplayed || showAnyPage) && <LanguageToggle currentLanguage={language} onLanguageChange={toggleLanguage} />}
              <ThemeToggle theme={theme} onThemeToggle={toggleTheme} />
              <button
                onClick={handleOpenSettings}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none border-0"
                aria-label={language === Language.Urdu ? "ترتیبات کھولیں" : "Open Settings"}
              >
                <svg
                  key={settingsAnimationKey}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 dark:text-gray-300 settings-icon-animate"
                >
                  <path d="M0 0h24v24H0z" fill="none"/>
                  <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12-.64l2 3.46c.12.22.39.3.61.22l2.49 1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49.42l.38-2.65c.61-.25 1.17-.59 1.69.98l2.49 1c.23.09.49 0 .61.22l2-3.46c.12-.22-.07.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
                </svg>
              </button>
            </div>
          </div>

          {areResultsDisplayed && !showAnyPage && (
            <>
              <SearchBar
                onSearch={handleSearchFromBar}
                currentQuery={query}
                language={language}
                disabled={isGeneralSearchDisabled}
                isAppLoading={isLoading}
                onImageSearchClick={handleImageSearchFromBar}
                searchHistory={searchHistory}
                trendingTopics={trendingTopics}
                isLoadingTrendingTopics={isLoadingTrending}
                onRemoveHistoryItem={removeSearchHistoryItem}
                onClearSearchHistory={clearSearchHistory}
                areResultsDisplayed={areResultsDisplayed}
                currentSearchType={currentSearchType}
              />
              {error && (
                <p className={`mt-2 text-sm text-center text-red-500 dark:text-red-400 ${language === Language.Urdu ? 'urdu-text' : ''}`} role="alert">
                  {error}
                </p>
              )}
              <div className="mt-2.5 sm:mt-3.5 flex flex-col sm:flex-row justify-between items-center">
                <SearchTabs
                  currentType={currentSearchType}
                  onTypeChange={handleTabChange}
                  language={language}
                  disabled={isLoading || 
                           (currentSearchType === SearchType.Images && !isCseKeysConfigured) || 
                           (currentSearchType !== SearchType.Images && !isApiAvailable)}
                />
                {showToolsButton && (
                  <div className="mt-2 sm:mt-0">
                    <SearchTools
                      language={language}
                      currentSearchType={currentSearchType}
                      timeFilter={activeTimeFilter}
                      customStartDate={customStartDate}
                      customEndDate={customEndDate}
                      imageSizeFilter={activeImageSizeFilter}
                      onTimeFilterChange={handleTimeFilterChange}
                      onCustomDateChange={handleCustomDateChange}
                      onApplyCustomDateFilter={applyCustomDateFilter}
                      onImageSizeChange={handleImageSizeChange}
                      onResetFilters={handleResetFilters}
                      isLoading={isLoading || !!error}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {showDashboard ? (
          <Dashboard currentLanguage={language} onExitDashboard={() => setShowDashboard(false)} />
        ) : showPrivacyPolicy ? (
          <PrivacyPolicyPage
            currentLanguage={language}
            onExit={() => setShowPrivacyPolicy(false)}
            s={S}
          />
        ) : showTermsAndConditions ? (
          <TermsAndConditionsPage
            currentLanguage={language}
            onExit={() => setShowTermsAndConditions(false)}
            s={S}
          />
        ) : (
          !areResultsDisplayed ? (
            <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 pb-12">
              <div className="w-full flex flex-col items-center">
                <button onClick={handleGoHome} aria-label={S.logoAriaLabel} className="mb-6 sm:mb-8 focus:outline-none rounded-md">
                  <Logo
                    theme={theme}
                    className={`h-20 sm:h-24 w-auto ${!logoAnimationPlayed ? 'logo-flash-animation' : ''}`}
                  />
                </button>
                <div className="w-full max-w-3xl">
                  <SearchBar
                    onSearch={handleSearchFromBar}
                    currentQuery={query}
                    language={language}
                    disabled={isGeneralSearchDisabled}
                    isAppLoading={isLoading}
                    onImageSearchClick={handleImageSearchFromBar}
                    searchHistory={searchHistory}
                    trendingTopics={trendingTopics}
                    isLoadingTrendingTopics={isLoadingTrending}
                    onRemoveHistoryItem={removeSearchHistoryItem}
                    onClearSearchHistory={clearSearchHistory}
                    areResultsDisplayed={false}
                    currentSearchType={currentSearchType}
                  />
                  {error && (
                    <p className={`mt-3 text-sm text-center text-red-500 dark:text-red-400 ${language === Language.Urdu ? 'urdu-text' : ''}`} role="alert">
                      {error}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-8 sm:mt-10 w-full max-w-3xl">
                <LocationPrompt
                  language={language}
                  permissionStatus={locationPermission}
                  userLocation={userLocation}
                  locationError={locationError}
                  onRequestLocation={requestUserLocation}
                />
              </div>
            </div>
          ) : (
            <div className={`container mx-auto px-3 sm:px-4 md:px-6 pt-3 pb-6 ${language === Language.Urdu ? 'urdu-text' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:space-x-6">
                <div className="flex-grow lg:max-w-[calc(100%-320px-1.5rem)]">
                  {searchCorrection && (
                    <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-md bg-yellow-50 dark:bg-gray-700 text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                      <span className="font-medium">{S.showingResultsFor} "{searchCorrection.correctedQuery}"</span>.
                      <button
                        onClick={() => handleSearch(searchCorrection.originalQuery, currentSearchType, false, true)}
                        className="ml-2 underline hover:text-yellow-800 dark:hover:text-yellow-200"
                      >
                        {S.searchOriginalQuery} "{searchCorrection.originalQuery}"
                      </button>
                    </div>
                  )}
                  <ResultsArea
                    results={currentSearchType === SearchType.Generate ? generatedImages : resultsToDisplay}
                    isLoading={isLoading && query.trim() !== ''}
                    searchType={currentSearchType}
                    language={language}
                    loadMoreResults={loadMoreResults}
                    hasMoreResults={currentSearchType !== SearchType.Generate && resultsToDisplay.length < allFetchedResults.length}
                    isLoadingMore={isLoadingMore}
                    initialQuery={query}
                    widgetData={widgetData?.widgetType !== 'EntityInfoPanel' ? widgetData : null}
                    onImageClick={handleOpenImageDetailModal}
                    userLocation={userLocation}
                    mapsApiKey={googleMapsApiKey}
                    isMapsApiReady={isMapsApiReady}
                    sApp={S}
                  />
                  {!isLoading && query.trim() !== '' &&
                    ((currentSearchType !== SearchType.Generate && resultsToDisplay.length === 0 && allFetchedResults.length === 0) ||
                     (currentSearchType === SearchType.Generate && generatedImages.length === 0)) &&
                    !widgetData && !error && (
                    <div className={`text-center text-gray-500 dark:text-gray-400 py-8 sm:py-10 text-base sm:text-lg ${language === Language.Urdu ? 'urdu-text' : ''}`}>
                      {currentSearchType === SearchType.Generate ? S.noImageGenerated : S.noResultsFound}
                    </div>
                  )}
                </div>
                {(widgetData?.widgetType === 'EntityInfoPanel' || activeSidebarAd) && (
                  <aside className="lg:w-[320px] shrink-0 mt-4 lg:mt-0">
                    {widgetData?.widgetType === 'EntityInfoPanel' && (
                      <EntityInfoPanelWidget data={widgetData.data} language={language} />
                    )}
                    {activeSidebarAd && (
                      <AdsWidget adContent={activeSidebarAd.content} language={language} />
                    )}
                  </aside>
                )}
              </div>
            </div>
          )
        )}
      </main>
      <Footer
        language={language}
        onToggleDashboard={() => {
            setShowDashboard(prev => !prev);
            if (!showDashboard) { setShowPrivacyPolicy(false); setShowTermsAndConditions(false); }
        }}
        onToggleSettings={handleOpenSettings}
        onTogglePrivacy={togglePrivacyPolicy}
        onToggleTerms={toggleTermsAndConditions}
        secntoDescription={S.secntoDescription}
        onToggleNotebook={handleOpenNotebook} 
      />
      <AiAssistantIcon onClick={handleOpenAssistant} language={language} />
      {isAssistantModalOpen && (
        <AiAssistantModal
          isOpen={isAssistantModalOpen}
          onClose={handleCloseAssistant}
          messages={assistantChatMessages}
          onSendMessage={handleAssistantSendMessage}
          isLoading={isAssistantLoading}
          language={language}
        />
      )}
      {isNotebookModalOpen && (
        <AiNotebookModal
          isOpen={isNotebookModalOpen}
          onClose={handleCloseNotebook}
          sources={notebookSources}
          messages={notebookChatMessages}
          onSendMessage={handleNotebookSendMessage}
          onAddSource={handleAddNotebookSource}
          onRemoveSource={handleRemoveNotebookSource}
          isLoading={isNotebookLoading}
          language={language}
          sApp={S}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={handleCloseSettings}
            currentTheme={theme}
            onThemeChange={toggleTheme}
            currentLanguage={language}
            onLanguageChange={toggleLanguage}
        />
      )}
      {isImageDetailModalOpen && selectedImageForModal && (
        <ImageDetailModal
          isOpen={isImageDetailModalOpen}
          image={selectedImageForModal}
          onClose={handleCloseImageDetailModal}
          language={language}
        />
      )}
      {showInitialMicDeniedModal && initialMicrophoneStatus === 'denied' && (
        <InitialPermissionModal
          isOpen={showInitialMicDeniedModal}
          onClose={handleCloseInitialMicDeniedModal}
          language={language}
          permissionType="microphone"
          titleText={S.initialMicDeniedTitle}
          messageText={S.initialMicDeniedMessage}
          buttonText={S.initialMicDeniedButton}
        />
      )}
    </div>
  );
};

export default App;
