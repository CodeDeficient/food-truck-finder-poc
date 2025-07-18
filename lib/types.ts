// Shared types for the Food Truck Finder application

export type PriceRange = '$' | '$$' | '$$$' | '$$$$' | undefined;

export type DailyOperatingHours =
  | { open: string; close: string; closed?: boolean }
  | { closed: true }
  | undefined;

export interface OperatingHours {
  monday: DailyOperatingHours;
  tuesday: DailyOperatingHours;
  wednesday: DailyOperatingHours;
  thursday: DailyOperatingHours;
  friday: DailyOperatingHours;
  saturday: DailyOperatingHours;
  sunday: DailyOperatingHours;
  [key: string]: DailyOperatingHours; // Add index signature
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  name: string;
  description: string | undefined;
  price: number | string | undefined;
  dietary_tags: string[];
  is_popular?: boolean;
}

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string | undefined;
  city: string | undefined;
  state: string | undefined;
  landmarks: string[];
  coordinates: UserCoordinates;
  confidence: number;
  raw_location_text: string | undefined;
}





export interface ExtractedFoodTruckDetails {
  name: string | undefined;
  description: string | undefined;
  cuisine_type: string[];
  price_range: PriceRange | undefined;
  specialties: string[];
  current_location: {
    address: string | undefined;
    city: string | undefined;
    state: string | undefined;
    zip_code: string | undefined;
    lat?: number;
    lng?: number;
    raw_text: string | undefined;
  };
  scheduled_locations?: {
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    lat?: number;
    lng?: number;
    timestamp: string;
    start_time: string;
    end_time: string;
  }[];
  operating_hours: OperatingHours;
  menu: MenuCategory[];
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    yelp?: string;
  };
  source_url: string;
}

export interface FirecrawlOutputData {
  markdown: string;
  name?: string;
  source_url?: string;
}

export interface FoodTruckSchema {
  name: string;
  description: string | undefined;
  current_location: {
    lat: number;
    lng: number;
    address: string | undefined;
    timestamp: string;
  };
  scheduled_locations: ExtractedFoodTruckDetails['scheduled_locations'];
  operating_hours: OperatingHours;
  menu: MenuCategory[];
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    yelp?: string;
  };
  cuisine_type: string[];
  price_range: PriceRange | undefined;
  specialties: string[];
  data_quality_score: number;
  verification_status: 'pending' | 'verified' | 'flagged';
  source_urls: string[];
  last_scraped_at: string;
  test_run_flag?: boolean;
  website?: string;
  phone_number?: string;
  email?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  schedule?: unknown[];
  average_rating?: number;
  review_count?: number;
}

export interface FoodTruck extends FoodTruckSchema {
  id: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  image_url?: string;
  average_rating?: number;
  review_count?: number;
}

export interface GeminiResponse<T = unknown> {
  success: boolean;
  data?: T;
  tokensUsed?: number;
  error?: string;
  promptSent?: string;
}

export interface StageResult {
  status: string;
  data?: FirecrawlOutputData | ExtractedFoodTruckDetails | FoodTruckSchema;
  error?: string;
  details?: string;
  prompt?: string;
  tokensUsed?: number;
  metadata?: { name?: string; source_url?: string };
  rawContent?: string;
  preparedData?: FoodTruckSchema;
  recordId?: string;
}

export interface TestPipelineResults {
  firecrawl?: StageResult;
  gemini?: StageResult;
  supabase?: StageResult;
  overallStatus?: string;
  logs?: string[];
  error?: string;
}

export interface PipelineRunResult {
  firecrawl?: StageResult;
  gemini?: StageResult;
  supabase?: StageResult;
  logs: string[];
  overallStatus: 'Success' | 'Error';
}

export interface ScrapingJob {
  id: string;
  job_type: string;
  target_url?: string;
  target_handle?: string;
  platform?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: number;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  data_collected?: Record<string, unknown>;
  errors?: string[];
  retry_count: number;
  max_retries: number;
  created_at: string;
}

export interface RealtimeMetrics {
  scrapingJobs: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  };
  dataQuality: {
    averageScore: number;
    totalTrucks: number;
    recentChanges: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastUpdate: string;
  };
}

export interface TruckRating {
  id: number;
  title: string;
  score: number;
}

export interface PipelineEvent {
  type: string; // e.g., 'job_started', 'job_completed', 'data_updated'
  payload: Record<string, unknown>; // Generic payload for event-specific data
  timestamp: string;
}

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  key_topics: string[];
  positive_aspects: string[];
  negative_aspects: string[];
  summary: string;
  recommended: boolean;
}

export interface EnhancedFoodTruckData {
  name: string | undefined;
  description: string | undefined;
  cuisine_type: string[];
  price_range: PriceRange;
  specialties: string[];
  dietary_options: string[];
  enhanced_menu: {
    categories: MenuCategory[];
  };
  standardized_hours: OperatingHours;
  cleaned_contact: {
    phone: string | undefined;
    email: string | undefined;
    website: string | undefined;
  };
  data_quality_improvements: string[];
  confidence_score: number;
}
