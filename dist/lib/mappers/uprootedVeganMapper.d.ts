/**
 * Data mapper for Uprooted Vegan Cuisine onboarding
 *
 * This utility handles the transformation of Uprooted Vegan Cuisine data
 * to match our FoodTruck schema, including field mappings and defaults.
 */
import type { FoodTruck, MenuCategory, OperatingHours } from '../types.js';
export interface UprootedVeganData {
    name: string;
    description?: string;
    cuisine_type: string | string[];
    price_range?: '$' | '$$' | '$$$' | '$$$$';
    specialties?: string | string[];
    user_id?: string;
    state?: string;
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
    operating_hours?: OperatingHours | Record<string, any>;
    menu?: MenuCategory[] | any[];
    contact_info?: {
        phone?: string;
        email?: string;
        website?: string;
    };
    social_media?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        tiktok?: string;
        yelp?: string;
    };
    data_quality_score?: number;
    verification_status?: 'pending' | 'verified' | 'flagged';
    source_urls?: string | string[];
    last_scraped_at?: string;
    created_at?: string;
    updated_at?: string;
}
/**
 * Maps Uprooted Vegan Cuisine data to our FoodTruck schema
 */
export declare function mapUprootedVeganData(data: UprootedVeganData): Partial<FoodTruck>;
/**
 * Validates that required fields are present
 */
export declare function validateUprootedVeganData(data: UprootedVeganData): {
    isValid: boolean;
    errors: string[];
};
/**
 * Example usage and testing function
 */
export declare function createUprootedVeganExample(): UprootedVeganData;
