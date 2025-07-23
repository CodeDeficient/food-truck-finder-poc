import { CachedFoodTruckService } from '@/lib/performance/databaseCache.js';
/**
* Retrieves and filters food trucks based on specified location and radius.
* @example
* getAndFilterFoodTrucks("37.7749", "-122.4194", "5")
* [FoodTruck, FoodTruck, FoodTruck]
* @param {string | null} lat - Latitude of the user's location.
* @param {string | null} lng - Longitude of the user's location.
* @param {string | null} radius - Search radius in kilometers.
* @returns {Promise<FoodTruck[]>} List of food trucks within the specified location and radius.
* @description
*   - Parses latitude, longitude, and radius from strings to floats for calculations.
*   - If latitude or longitude are not provided, fetches all cached food trucks.
*   - Defaults radius to 10 kilometers if not provided.
*/
export async function getAndFilterFoodTrucks(lat, lng, radius) {
    let trucks = [];
    if (lat != undefined && lng != undefined) {
        const userLat = Number.parseFloat(lat);
        const userLng = Number.parseFloat(lng);
        const radiusKm = Number.parseFloat(radius ?? '10');
        trucks = await CachedFoodTruckService.getTrucksByLocationCached(userLat, userLng, radiusKm);
    }
    else {
        const result = await CachedFoodTruckService.getAllTrucksCached();
        trucks = result.trucks;
    }
    return trucks;
}
export function sortFoodTrucksByQuality(trucks) {
    return [...trucks].sort((a, b) => (b.data_quality_score ?? 0) - (a.data_quality_score ?? 0));
}
