import { type FoodTruck } from '@/lib/types';
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
export declare function getAndFilterFoodTrucks(lat: string | null, lng: string | null, radius: string | null): Promise<FoodTruck[]>;
export declare function sortFoodTrucksByQuality(trucks: FoodTruck[]): FoodTruck[];
