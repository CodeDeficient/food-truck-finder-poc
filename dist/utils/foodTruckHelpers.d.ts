import type { FoodTruck, DailyOperatingHours, MenuItem } from '@/lib/types';
export declare const getCurrentDay: () => string;
export declare const formatPrice: (price: number | string) => string;
/**
* Converts operational hours to a readable format or returns 'Closed' if applicable.
* @example
* formatOperatingHours({ open: '09:00', close: '17:00', closed: false })
* '9:00 AM - 5:00 PM'
* @param {DailyOperatingHours} hours - Object containing daily opening and closing times, and closed status.
* @returns {string} Formatted operating hours string or 'Closed'.
* @description
*   - Handles conversion of military time to 12-hour format.
*   - Adjusts for typical date parsing without relying on actual date due to fixed date string.
*   - Properly responds to 'closed' status by returning 'Closed'.
*   - Locales can impact formatted output by changing time conventions.
*/
export declare const formatHours: (hours: DailyOperatingHours) => string;
export declare const getPopularItems: (truck: FoodTruck) => MenuItem[];
/**
 * Calculates the price range of all items in the food truck's menu.
 * @example
 * getPriceRange(foodTruck)
 * "5.00 - 12.50"
 * @param {FoodTruck} truck - The food truck object containing menu details.
 * @returns {string} Returns a formatted string representing the price range or 'N/A' if no valid prices are found.
 * @description
 *   - Utilizes the optional chaining operator to safely access nested menu items.
 *   - Filters out non-numeric and undefined prices before calculating the range.
 *   - Formats the minimum and maximum prices using a helper function.
 */
export declare const getPriceRange: (truck: FoodTruck) => string;
export declare const getTodayHours: (truck: FoodTruck) => any;
/**
 * Retrieves the user's geolocation and updates the location state.
 * @example
 * getUserLocationHelper(setUserLocation)
 * // Updates user's location or defaults to San Francisco
 * @param {function} setUserLocation - Callback function to update user's location state with latitude and longitude.
 * @returns {void} Function does not return anything.
 * @description
 *   - Defaults the location to San Francisco if geolocation access is denied or not supported.
 *   - Utilizes browser's geolocation API to fetch current coordinates.
 *   - Provides a warning in the console if location access is denied.
 */
export declare function getUserLocationHelper(setUserLocation: (location: {
    lat: number;
    lng: number;
}) => void): void;
/**
 * Loads food truck data from the server and updates state.
 * @example
 * loadFoodTrucksHelper(setTrucks, setLoading)
 * undefined
 * @param {(trucks: FoodTruck[]) => void} setTrucks - Callback to update the state with loaded food trucks.
 * @param {(loading: boolean) => void} setLoading - Callback to update the loading state.
 * @returns {void} No return value.
 * @description
 *   - Fetches data from '/api/trucks' endpoint.
 *   - Parses the response and expects an object containing a 'trucks' array.
 *   - Logs an error message to the console if fetching or parsing fails.
 *   - Ensures loading state is updated to false in all cases.
 */
export declare function loadFoodTrucksHelper(setTrucks: (trucks: FoodTruck[]) => void, setLoading: (loading: boolean) => void): Promise<void>;
/**
* Loads nearby food trucks based on user's location.
* @example
* loadNearbyTrucksHelper({ lat: 37.7749, lng: -122.4194 }, setTrucksCallback)
* // sets trucks with food truck data or an empty array
* @param {{ lat: number; lng: number } | undefined} userLocation - The location of the user used to find nearby trucks.
* @param {(trucks: FoodTruck[]) => void} setTrucks - Callback function to set the trucks data.
* @returns {void} No return value.
* @description
*   - Fetches nearby trucks from the API using latitude and longitude.
*   - Uses a fixed radius of 10 units for truck search.
*   - Handles errors by logging them to the console.
*/
export declare function loadNearbyTrucksHelper(userLocation: {
    lat: number;
    lng: number;
} | undefined, setTrucks: (trucks: FoodTruck[]) => void): Promise<void>;
/**
 * Determines if a food truck has enough essential data to be displayed to users.
 * @example
 * isViableTruck(foodTruck)
 * // returns true if truck has name and location, false otherwise
 * @param {FoodTruck} truck - The food truck object to validate.
 * @returns {boolean} Indicates whether the truck should be displayed.
 * @description
 *   - Checks for minimum required fields: name and valid location coordinates.
 *   - Ensures location has either coordinates OR a meaningful address.
 *   - Flags trucks missing essential data for admin review.
 */
export declare function isViableTruck(truck: FoodTruck): boolean;
/**
 * Determines if the food truck is currently open based on its operating hours.
 * @example
 * isTruckOpen(myFoodTruck)
 * // returns true or false depending on current time and truck's operating hours
 * @param {FoodTruck} truck - The food truck object with operating hours.
 * @returns {boolean} Indicates whether the truck is open.
 * @description
 *   - Utilizes the current day's name to fetch operating hours.
 *   - Handles potential errors in parsing operating hours.
 *   - Logs errors related to parsing time and truck name.
 *   - Uses military time format (HHMM) for comparison.
 */
export declare function isTruckOpen(truck: FoodTruck): boolean;
