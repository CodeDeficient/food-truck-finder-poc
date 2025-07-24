// Type definitions for food truck data model
export type FoodTruck = {
  id: string;
  name: string;
  description?: string;
  cuisine_type: string[];
  menu?: MenuCategory[];
  current_location?: FoodTruckLocation;
  contact_info?: ContactInfo;
  operating_hours?: OperatingHours;
  data_quality_score?: number;
  source_urls?: string[];
};

export type MenuCategory = {
  category: string;
  description?: string;
  items: MenuItem[];
};

export type MenuItem = {
  name: string;
  description?: string;
  price?: number;
  dietary_tags?: string[];
  is_popular?: boolean;
};

export type FoodTruckLocation = {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  parking_details?: string;
};

export type ContactInfo = {
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
};

export type OperatingHours = {
  monday?: DailyOperatingHours;
  tuesday?: DailyOperatingHours;
  wednesday?: DailyOperatingHours;
  thursday?: DailyOperatingHours;
  friday?: DailyOperatingHours;
  saturday?: DailyOperatingHours;
  sunday?: DailyOperatingHours;
};

export type DailyOperatingHours = {
  open: string;
  close: string;
  closed?: boolean;
};

// Pipeline types
export type ExtractedFoodTruckDetails = {
  name: string;
  description?: string;
  menu?: MenuCategory[];
  contact_info?: ContactInfo;
  operating_hours?: OperatingHours;
  cuisine_type?: string[];
};

export type StageResult = {
  status: 'Success' | 'Error';
  error?: string;
};

export type PipelineRunResult = {
  status: 'Success' | 'Error';
  firecrawlResult: StageResult;
  geminiResult?: StageResult;
  supabaseResult?: StageResult;
  error?: string;
  extractedData?: ExtractedFoodTruckDetails;
};

export type FirecrawlResponse = {
  url: string;
  content: string;
  error?: string;
};

export type GeminiResponse<T> = {
  status: 'Success' | 'Error';
  data?: T;
  error?: string;
  suggestedPrompt?: string;
};

export type ScrapingJob = {
  id: string;
  target_url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error?: string;
  result?: FirecrawlResponse;
};

export type DataProcessingQueue = {
  id: string;
  food_truck_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error?: string;
};

// Security types
export type SecurityEvent = {
  event_type: 'access_denied' | 'rate_limit_exceeded' | 'invalid_token';
  severity: 'low' | 'medium' | 'high';
};

// Data cleanup types
export type CleanupOperation = {
  type: 'remove_duplicates' | 'fix_placeholders' | 'validate_coordinates' | 'normalize_contact';
  options?: Record<string, unknown>;
};

// Metrics types
export type RealtimeMetrics = {
  scraping_jobs: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  };
};

// Service types
export type APIService = 'gemini' | 'tavily' | 'firecrawl';
