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
  dietary_tags: string[];
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
    is_south_carolina_location_confirmed?: boolean; // Added for SC location confirmation
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
  description: string | undefined;
  current_location: {
    lat: number;
    lng: number;
    address: string | undefined;
    timestamp: string;
  };
  scheduled_locations: ExtractedFoodTruckDetails['scheduled_locations'];
  operating_hours: OperatingHours;
  menu: ExtractedFoodTruckDetails['menu'];
  contact_info: ExtractedFoodTruckDetails['contact_info'];
  social_media: ExtractedFoodTruckDetails['social_media'];
  cuisine_type: string[];
  price_range: PriceRange | undefined;
  specialties: string[];
  data_quality_score: number;
  verification_status: 'pending' | 'verified' | 'flagged';
  source_urls: string[];
  last_scraped_at: string;
  test_run_flag?: boolean;
  state?: string; // Added new state field
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

export interface DirectoryClassificationOutput {
  is_directory: boolean;
  is_sc_focused: boolean;
  directory_name?: string;
  directory_description?: string; // Brief summary of the directory's content/purpose
  relevance_score: number; // e.g., 0.0 to 1.0, how relevant it is as a food truck source
  sc_focus_score: number;  // e.g., 0.0 to 1.0, how focused on SC it is
}
