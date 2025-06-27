// Shared types for the Food Truck Finder application

export type PriceRange = '$|$$,$$$';

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  name: string;
  description: string | undefined;
  price: number | string | undefined;
  dietary_tags: unknown[];
  is_popular?: boolean;
}

export interface LocationData {
  address: string | undefined;
  city: string | undefined;
  state: string | undefined;
  landmarks: string[];
  coordinates: {
    lat: number | undefined;
    lng: number | undefined;
  };
  confidence: number;
  raw_location_text: string | undefined;
}

export type DailyOperatingHours =
  | { open: string; close: string; closed: boolean }
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
  cuisine_type: any[];
  price_range: PriceRange;
  specialties: any[];
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

export interface ExtractedFoodTruckDetails {
  name: string | undefined;
  description: string | undefined;
  cuisine_type: unknown[];
  price_range: PriceRange | undefined;
  specialties: any[];
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
    // Added scheduled_locations
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    lat?: number;
    lng?: number;
    timestamp: string;
    start_time: string; // Added start_time
    end_time: string; // Added end_time
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
  description?: string;
  current_location: {
    lat: number;
    lng: number;
    address: string | undefined;
    timestamp: string;
  };
  scheduled_locations: ExtractedFoodTruckDetails['scheduled_locations'];
  operating_hours: OperatingHours;
  menu: MenuCategory[] | unknown[];
  contact_info: ExtractedFoodTruckDetails['contact_info'];
  social_media: ExtractedFoodTruckDetails['social_media'];
  cuisine_type: any[];
  price_range: PriceRange | undefined;
  specialties: any[];
  data_quality_score: number;
  verification_status: 'pending' | 'verified' | 'flagged';
  source_urls: any[];
  last_scraped_at: string;
  test_run_flag?: boolean;
  website?: string;
  phone_number?: string;
  email?: string;
  instagram_handle?: string;
  facebook_handle?: string;
  twitter_handle?: string;
  schedule?: unknown[]; // Assuming schedule is an array, adjust type if known
  average_rating?: number;
  review_count?: number;
}

// Database record type with additional fields
export interface FoodTruck extends FoodTruckSchema {
  id: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
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
