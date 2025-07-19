/**
 * Data mapper for Uprooted Vegan Cuisine onboarding
 * 
 * This utility handles the transformation of Uprooted Vegan Cuisine data
 * to match our FoodTruck schema, including field mappings and defaults.
 */

import type { FoodTruck, MenuCategory, OperatingHours } from '../types';

export interface UprootedVeganData {
  // Core fields
  name: string;
  description?: string;
  cuisine_type: string | string[]; // Handle both single and array formats
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  specialties?: string | string[]; // Handle both single and array formats
  
  // User/ownership fields
  user_id?: string;
  state?: string;
  
  // Location fields
  exact_location?: {
    lat: number;
    lng: number;
    address?: string;
    timestamp?: string;
  };
  city_location?: {
    lat: number;
    lng: number;
    address?: string;
    timestamp?: string;
  };
  current_location?: {
    lat: number;
    lng: number;
    address?: string;
    timestamp?: string;
  };
  
  // Schedule fields
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
  
  // Menu and hours
  operating_hours?: OperatingHours | Record<string, any>;
  menu?: MenuCategory[] | any[];
  
  // Contact information
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Social media
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    yelp?: string;
  };
  
  // Quality and verification
  data_quality_score?: number;
  verification_status?: 'pending' | 'verified' | 'flagged';
  source_urls?: string | string[];
  
  // Timestamps (for mapping purposes)
  last_scraped_at?: string; // Data scraping timestamp
  created_at?: string;
  updated_at?: string;
}

/**
 * Normalizes cuisine_type to always be an array
 */
function normalizeCuisineType(cuisine_type: string | string[]): string[] {
  if (typeof cuisine_type === 'string') {
    // Split on common separators and clean up
    return cuisine_type
      .split(/[,;&]/)
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }
  return Array.isArray(cuisine_type) ? cuisine_type : [];
}

/**
 * Normalizes specialties to always be an array
 */
function normalizeSpecialties(specialties?: string | string[]): string[] {
  if (!specialties) return [];
  if (typeof specialties === 'string') {
    return specialties
      .split(/[,;&]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  return Array.isArray(specialties) ? specialties : [];
}

/**
 * Normalizes source URLs to always be an array
 */
function normalizeSourceUrls(source_urls?: string | string[]): string[] {
  if (!source_urls) return [];
  if (typeof source_urls === 'string') {
    return [source_urls];
  }
  return Array.isArray(source_urls) ? source_urls : [];
}

/**
 * Creates default operating hours
 */
function createDefaultOperatingHours(): OperatingHours {
  return {
    monday: undefined,
    tuesday: undefined,
    wednesday: undefined,
    thursday: undefined,
    friday: undefined,
    saturday: undefined,
    sunday: undefined
  };
}

/**
 * Maps Uprooted Vegan Cuisine data to our FoodTruck schema
 */
export function mapUprootedVeganData(data: UprootedVeganData): Partial<FoodTruck> {
  const now = new Date().toISOString();
  
  // Handle location priority: exact_location > current_location > city_location
  const primaryLocation = data.exact_location || data.current_location || data.city_location;
  
  const mapped: Partial<FoodTruck> = {
    // Core fields
    name: data.name,
    description: data.description,
    cuisine_type: normalizeCuisineType(data.cuisine_type),
    price_range: data.price_range,
    specialties: normalizeSpecialties(data.specialties),
    
    // New fields for Uprooted Vegan support
    user_id: data.user_id,
    state: data.state,
    
    // Location fields
    current_location: primaryLocation ? {
      lat: primaryLocation.lat,
      lng: primaryLocation.lng,
      address: primaryLocation.address,
      timestamp: primaryLocation.timestamp || now,
    } : {
      lat: 0,
      lng: 0,
      address: undefined,
      timestamp: now,
    },
    scheduled_locations: data.scheduled_locations,
    
    // Menu and hours
    operating_hours: data.operating_hours as OperatingHours || createDefaultOperatingHours(),
    menu: (data.menu as MenuCategory[]) || [],
    
    // Contact information
    contact_info: data.contact_info || {},
    social_media: data.social_media || {},
    
    // Quality and verification
    data_quality_score: data.data_quality_score ?? 0.5, // Default to medium quality
    verification_status: data.verification_status || 'pending',
    source_urls: normalizeSourceUrls(data.source_urls),
    
    // Handle timestamps
    last_scraped_at: data.last_scraped_at || now,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
    
    // Additional helpful defaults
    is_active: true, // Assume new entries are active
    test_run_flag: false // Not a test import
  };
  
  return mapped;
}

/**
 * Validates that required fields are present
 */
export function validateUprootedVeganData(data: UprootedVeganData): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.name || data.name.trim().length === 0) {
    errors.push('name is required');
  }
  
  if (!data.cuisine_type || 
      (Array.isArray(data.cuisine_type) && data.cuisine_type.length === 0) ||
      (typeof data.cuisine_type === 'string' && data.cuisine_type.trim().length === 0)) {
    errors.push('cuisine_type is required');
  }
  
  // Validate state format if provided
  if (data.state && (typeof data.state !== 'string' || data.state.length !== 2)) {
    errors.push('state must be a 2-character string (e.g., CA, NY, TX)');
  }
  
  // Validate user_id format if provided
  if (data.user_id && typeof data.user_id !== 'string') {
    errors.push('user_id must be a valid UUID string');
  }
  
  // Validate price range if provided
  if (data.price_range && !['$', '$$', '$$$', '$$$$'].includes(data.price_range)) {
    errors.push('price_range must be one of: $, $$, $$$, $$$$');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Example usage and testing function
 */
export function createUprootedVeganExample(): UprootedVeganData {
  return {
    name: "Uprooted Vegan Cuisine",
    description: "Plant-based comfort food truck serving delicious vegan alternatives",
    cuisine_type: ["Vegan", "American", "Comfort Food"],
    price_range: "$$",
    specialties: ["Vegan Burgers", "Plant-Based Mac & Cheese", "Cashew-Based Desserts"],
    user_id: "123e4567-e89b-12d3-a456-426614174000", // Example UUID
    state: "CA",
    current_location: {
      lat: 37.7749,
      lng: -122.4194,
      address: "San Francisco, CA",
      timestamp: new Date().toISOString()
    },
    operating_hours: {
      monday: { open: "11:00 AM", close: "8:00 PM" },
      tuesday: { open: "11:00 AM", close: "8:00 PM" },
      wednesday: { open: "11:00 AM", close: "8:00 PM" },
      thursday: { open: "11:00 AM", close: "8:00 PM" },
      friday: { open: "11:00 AM", close: "9:00 PM" },
      saturday: { open: "10:00 AM", close: "9:00 PM" },
      sunday: { closed: true }
    },
    contact_info: {
      phone: "(415) 555-0123",
      email: "hello@uprootedvegan.com",
      website: "https://uprootedvegan.com"
    },
    social_media: {
      instagram: "@uprootedvegan",
      facebook: "UprootedVeganCuisine"
    },
    verification_status: "pending",
    data_quality_score: 0.8,
    source_urls: ["https://uprootedvegan.com"]
  };
}
