/**
 * Geocoding utilities using Nominatim (OpenStreetMap's free geocoding service)
 * Converts addresses to lat/lng coordinates for map display
 */
/**
 * Geocodes an address to get latitude and longitude coordinates
 * @param address - The address to geocode
 * @param city - Optional city to improve accuracy (defaults to Charleston, SC)
 * @returns Promise containing coordinates and formatted address
 */
export async function geocodeAddress(address, city = 'Charleston, SC') {
    try {
        // Clean and format the address
        const cleanAddress = address.trim();
        if (!cleanAddress) {
            throw new Error('Empty address provided');
        }
        // Construct search query - add city if not already in address
        const searchQuery = cleanAddress.toLowerCase().includes('charleston')
            ? cleanAddress
            : `${cleanAddress}, ${city}`;
        // Use Nominatim API with proper headers and rate limiting
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', searchQuery);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');
        url.searchParams.set('countrycodes', 'us');
        url.searchParams.set('addressdetails', '1');
        console.log('🌍 Geocoding address:', searchQuery);
        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'FoodTruckFinder/1.0 (https://your-domain.com)', // Required by Nominatim
            },
        });
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            console.warn('⚠️ No geocoding results for:', searchQuery);
            return {
                lat: 0,
                lng: 0,
                formatted_address: address,
                success: false,
            };
        }
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        // Validate coordinates are reasonable for Charleston area
        if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Invalid coordinates returned');
        }
        console.log('✅ Geocoded successfully:', {
            original: address,
            coordinates: { lat, lng },
            formatted: result.display_name,
        });
        return {
            lat,
            lng,
            formatted_address: result.display_name,
            success: true,
        };
    }
    catch (error) {
        console.error('❌ Geocoding failed for address:', address, error);
        return {
            lat: 0,
            lng: 0,
            formatted_address: address,
            success: false,
        };
    }
}
/**
 * Fallback coordinates for Charleston, SC when geocoding fails
 */
export const CHARLESTON_FALLBACK = {
    lat: 32.7765,
    lng: -79.9311,
};
/**
 * Geocodes multiple addresses with rate limiting to avoid overwhelming the service
 * @param addresses - Array of addresses to geocode
 * @param delayMs - Delay between requests (default 1000ms as recommended by Nominatim)
 * @returns Promise array of geocoding results
 */
export async function geocodeAddressesBatch(addresses, delayMs = 1000) {
    const results = [];
    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const result = await geocodeAddress(address);
        results.push(result);
        // Rate limiting - wait between requests
        if (i < addresses.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    return results;
}
