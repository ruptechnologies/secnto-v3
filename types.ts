
export enum SearchType {
  All = 'All',
  News = 'News',
  Images = 'Images',
  Videos = 'Videos',
  Local = 'Local',
  Generate = 'Generate', // Added new search type for image generation
}

export enum Language {
  English = 'English',
  Urdu = 'Urdu',
}

export interface BaseSearchResult {
  id: string;
}

export interface TextSearchResult extends BaseSearchResult {
  type: SearchType.All | SearchType.News;
  title: string;
  url: string | null; // Changed from string to string | null
  snippet: string;
  publishedDate?: string; // Added optional published date
}

export interface ImageSearchResult extends BaseSearchResult {
  type: SearchType.Images | SearchType.Generate; // Allow Generate type here
  caption: string;
  imageUrl: string;
  pageTitle: string; 
  sourceUrl: string; 
}

export interface VideoSearchResult extends BaseSearchResult {
  type: SearchType.Videos;
  title: string;
  channel: string;
  thumbnailUrl: string;
  videoUrl: string; // Added videoUrl
}

export interface LocalSearchResult extends BaseSearchResult {
  type: SearchType.Local;
  name: string;
  category: string;
  address: string;
  latitude: number; // Added for map integration
  longitude: number; // Added for map integration
}

export type SearchResultItem =
  | TextSearchResult
  | ImageSearchResult
  | VideoSearchResult
  | LocalSearchResult;

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  }
}

// CMS Dashboard Related Types
export interface PremiumFeature {
  id:string;
  name: string;
  description: string;
  isEnabled: boolean;
  language: Language; // To store which language the feature name/desc is in
}

export interface Advertisement {
  id: string;
  name: string;
  content: string; // Could be text, image URL, or HTML snippet
  displayLocation: 'search-top' | 'sidebar' | 'footer';
  isActive: boolean;
  language: Language; // To store which language the ad name/content is in
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'PKR';
  interval: 'month' | 'year';
  features: string[]; // List of features included in this plan
  language: Language; // Language for plan name/features
}

// Geolocation types
export type UserLocation = {
  latitude: number;
  longitude: number;
} | null;

export type LocationPermission = 'prompt' | 'granted' | 'denied' | 'error_fetching'; // Added 'error_fetching'

// Search Filter Options
export interface SearchFilterOptions {
  timeFilter?: string; // 'any', 'hour', 'day', 'week', 'month', 'year', 'custom'
  customStartDate?: string | null;
  customEndDate?: string | null;
  imageSizeFilter?: string; // 'any', 'small', 'medium', 'large'
}

// Search Suggestion Type
export enum SuggestionType {
  API = 'api', // Standard auto-suggestion from API
  HISTORY = 'history',
  TRENDING = 'trending'
}
export interface SearchSuggestion {
  id: string;
  text: string;
  imageUrl?: string; // Optional URL for a small icon/thumbnail
  suggestionType?: SuggestionType; // To differentiate history, trending, or API suggestions
  dataType?: SearchType.News | SearchType.Images | SearchType.Videos | SearchType.Local | SearchType.All | SearchType.Generate; // Hint for trending topic type
  query?: string; // Optional: For history items, this holds the original query
  timestamp?: number; // Optional: For history items, this holds the timestamp
}

// Search History Item Type
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

// Dominant Result Types
export type DominantResultType = SearchType.Images | SearchType.Videos | SearchType.Local | 'None';

export interface DominantResultPayload {
  dominantResultType: DominantResultType;
  data?: SearchResultItem[]; // Data for Images is fetched client-side (CSE), for Videos/Local it's parsed from Gemini strings
}

// AI Notebook Types
export enum NotebookSourceType {
  TEXT = 'text',
  URL = 'url',
}

export interface NotebookSource {
  id: string;
  type: NotebookSourceType;
  content: string; // For TEXT, this is the text itself. For URL, this is the URL string.
  title?: string; // Optional title, e.g., from URL or first line of text
}

export interface NotebookChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  relatedSourceIds?: string[]; // Optional: To link AI response to specific sources
}