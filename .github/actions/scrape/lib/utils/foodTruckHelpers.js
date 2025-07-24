import { supabaseFallback } from '../../../../../lib/fallback/supabaseFallback.js';
export const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
};
export const formatPrice = (price) => {
    // Updated to accept string
    if (typeof price === 'string') {
        // Handle cases where price might be a string like "$10-$20" or "Varies"
        return price;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};
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
export const formatHours = (hours) => {
    // Updated to accept DailyOperatingHours
    if (!hours || hours.closed) {
        return 'Closed';
    }
    const open = new Date(`1970-01-01T${hours.open}Z`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    const close = new Date(`1970-01-01T${hours.close}Z`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    return `${open} - ${close}`;
};
export const getPopularItems = (truck) => {
    // Explicitly define return type
    // Explicitly check for nullish and boolean
    return (truck.menu
        ?.flatMap((category) => category.items)
        .filter((item) => Boolean(item && item.is_popular === true)) ?? []);
};
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
export const getPriceRange = (truck) => {
    const allItems = truck.menu?.flatMap((category) => category.items);
    if (!allItems || allItems.length === 0) {
        return 'N/A';
    }
    const numericPrices = allItems
        .map((item) => item.price)
        .filter((price) => typeof price === 'number' && price != undefined); // Filter for numbers
    if (numericPrices.length === 0) {
        return 'N/A'; // No numeric prices found
    }
    const minPrice = Math.min(...numericPrices);
    const maxPrice = Math.max(...numericPrices);
    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};
export const getTodayHours = (truck) => {
    const today = getCurrentDay();
    return truck.operating_hours?.[today];
};
// Get user's current location or default to San Francisco
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
export function getUserLocationHelper(setUserLocation) {
    if (typeof navigator !== 'undefined' && navigator.geolocation != undefined) {
        // eslint-disable-next-line sonarjs/no-intrusive-permissions -- Geolocation is essential for finding nearby food trucks
        navigator.geolocation.getCurrentPosition((position) => {
            console.log('📍 User location accuracy:', position.coords.accuracy, 'meters');
            setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        }, (error) => {
            console.warn('Location access denied:', error);
            // Default to Charleston, SC for this project
            setUserLocation({ lat: 32.7765, lng: -79.9311 });
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        });
    }
    else {
        // Default to San Francisco if geolocation is not supported
        setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
}
// Load all food trucks from API
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
export async function loadFoodTrucksHelper(setTrucks, setLoading) {
    try {
        console.log('🔍 Starting to load food trucks...');
        const result = await supabaseFallback.getFoodTrucks();
        console.log('📦 Full result from supabaseFallback:', result);
        console.log('🚛 Number of trucks found:', result.trucks.length);
        console.log('📊 Data status:', result.status);
        console.log('💾 Is from cache:', result.isFromCache);
        setTrucks(result.trucks);
    }
    catch (error) {
        console.error('❌ Failed to load food trucks:', error);
        setTrucks([]);
    }
    finally {
        setLoading(false);
    }
}
// Load nearby food trucks based on user location
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
export async function loadNearbyTrucksHelper(userLocation, setTrucks) {
    if (!userLocation)
        return;
    try {
        const { trucks } = await supabaseFallback.getFoodTrucks();
        setTrucks(trucks);
    }
    catch (error) {
        console.error('Failed to load nearby trucks:', error);
    }
}
// Filter trucks that have minimum viable data to display
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
export function isViableTruck(truck) {
    // Must have a name
    if (!truck.name || truck.name.trim() === '' || truck.name === 'Unnamed Truck') {
        console.warn('🚨 Truck missing name:', truck.id);
        return false;
    }
    // Must have location data
    if (!truck.current_location) {
        console.warn('🚨 Truck missing location data:', truck.name);
        return false;
    }
    // Must have either coordinates OR a meaningful address
    const hasCoordinates = typeof truck.current_location.lat === 'number' &&
        typeof truck.current_location.lng === 'number';
    const hasAddress = truck.current_location.address &&
        truck.current_location.address.trim() !== '' &&
        truck.current_location.address !== 'Unknown';
    if (!hasCoordinates && !hasAddress) {
        console.warn('🚨 Truck missing both coordinates and address:', truck.name);
        return false;
    }
    return true;
}
// Check if a food truck is currently open
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
export function isTruckOpen(truck) {
    const today = getCurrentDay();
    const hours = truck.operating_hours?.[today];
    // Ensure hours and its properties are not null/undefined before accessing
    if (hours == undefined ||
        hours.closed === true ||
        hours.open == undefined ||
        hours.close == undefined) {
        return false;
    }
    try {
        const now = new Date();
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const openTime = Number.parseInt(hours.open.replace(':', ''), 10);
        const closeTime = Number.parseInt(hours.close.replace(':', ''), 10);
        return currentTime >= openTime && currentTime <= closeTime;
    }
    catch (error) {
        console.error('Error parsing operating hours for truck', truck.name, error);
        return false;
    }
}
