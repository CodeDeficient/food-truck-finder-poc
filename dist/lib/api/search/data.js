import { CachedFoodTruckService } from '@/lib/performance/databaseCache';
import {} from '@/lib/types';
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
        const radiusKm = Number.parseFloat(radius !== null && radius !== void 0 ? radius : '10');
        trucks = await CachedFoodTruckService.getTrucksByLocationCached(userLat, userLng, radiusKm);
    }
    else {
        const result = await CachedFoodTruckService.getAllTrucksCached();
        trucks = result.trucks;
    }
    return trucks;
}
export function sortFoodTrucksByQuality(trucks) {
    return [...trucks].sort((a, b) => { var _a, _b; return ((_a = b.data_quality_score) !== null && _a !== void 0 ? _a : 0) - ((_b = a.data_quality_score) !== null && _b !== void 0 ? _b : 0); });
}
