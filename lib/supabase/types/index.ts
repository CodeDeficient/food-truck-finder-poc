import { FoodTruckSchema } from '../../types';

export interface FoodTruckLocation {
  lat: number;
  lng: number;
  address?: string;
  timestamp: string;
}

export interface FoodTruck extends FoodTruckSchema {
  id: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  exact_location?: FoodTruckLocation;
  city_location?: FoodTruckLocation;
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

export interface DataProcessingQueue {
  id: string;
  truck_id?: string;
  processing_type: string;
  raw_data: Record<string, unknown>;
  processed_data?: Record<string, unknown>;
  gemini_tokens_used: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: number;
  created_at: string;
  processed_at?: string;
}

export interface ApiUsage {
  id: string;
  service_name: string;
  usage_date: string;
  requests_count: number;
  tokens_used: number;
}

export interface RawMenuItemFromDB {
  name: string;
  description?: string;
  price?: number;
  dietary_tags?: string[];
  category?: string;
  [key: string]: unknown;
}

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

export type PriceRange = '$' | '$$' | '$$$' | '$$$$' | undefined;

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface MenuItem {
  name: string;
  description: string | undefined;
  price: number | string | undefined;
  dietary_tags: any[];
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
