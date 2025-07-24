/**
 * Geocoding utilities using Nominatim (OpenStreetMap's free geocoding service)
 * Converts addresses to lat/lng coordinates for map display
 */
interface GeocodeResult {
    lat: number;
    lng: number;
    formatted_address: string;
    success: boolean;
}
/**
 * Geocodes an address to get latitude and longitude coordinates
 * @param address - The address to geocode
 * @param city - Optional city to improve accuracy (defaults to Charleston, SC)
 * @returns Promise containing coordinates and formatted address
 */
export declare function geocodeAddress(address: string, city?: string): Promise<GeocodeResult>;
/**
 * Fallback coordinates for Charleston, SC when geocoding fails
 */
export declare const CHARLESTON_FALLBACK: {
    lat: number;
    lng: number;
};
/**
 * Geocodes multiple addresses with rate limiting to avoid overwhelming the service
 * @param addresses - Array of addresses to geocode
 * @param delayMs - Delay between requests (default 1000ms as recommended by Nominatim)
 * @returns Promise array of geocoding results
 */
export declare function geocodeAddressesBatch(addresses: string[], delayMs?: number): Promise<GeocodeResult[]>;
export {};
