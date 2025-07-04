import { MenuCategory, MenuItem, OperatingHours, type FoodTruck } from '@/lib/types';

/**
* Filters an array of FoodTruck objects based on a given search query.
* @example
* applyTextSearchFilter(foodTrucksArray, 'taco')
* // Returns an array of FoodTruck objects where the truck name, description, or menu contains 'taco'
* @param {FoodTruck[]} trucks - An array of FoodTruck objects to be filtered.
* @param {string | null} query - Search query to filter the food trucks by.
* @returns {FoodTruck[]} An array of FoodTruck objects that match the search query.
* @description
*   - If the query is null or an empty string, the original array is returned unfiltered.
*   - The search is case-insensitive.
*   - Searches through truck names, descriptions, and menu item names and descriptions.
*   - Utilizes optional chaining to handle undefined or null values in truck descriptions and menus.
*/
export function applyTextSearchFilter(trucks: FoodTruck[], query: string | null): FoodTruck[] {
  if (query != undefined && query !== '') {
    return trucks.filter(
      (truck: FoodTruck) =>
        truck.name.toLowerCase().includes(query.toLowerCase()) ||
        (truck.description?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (truck.menu?.some((category: MenuCategory) =>
          category.items?.some(
            (item: MenuItem) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              (item.description?.toLowerCase().includes(query.toLowerCase()) ?? false),
          ),
        ) ??
          false),
    );
  }
  return trucks;
}

export function applyCuisineFilter(trucks: FoodTruck[], cuisine: string | null): FoodTruck[] {
  if (cuisine != undefined && cuisine !== '') {
    return trucks.filter((truck: FoodTruck) =>
      truck.menu?.some((category: MenuCategory) =>
        category.name.toLowerCase().includes(cuisine.toLowerCase()),
      ),
    );
  }
  return trucks;
}

/**
 * Filters a list of food trucks to only include those that are currently open.
 * @example
 * applyOpenNowFilter(trucks, true)
 * // returns list of trucks open at the current date and time
 * @param {FoodTruck[]} trucks - Array of food truck objects to be filtered.
 * @param {boolean} openNow - Flag to filter trucks that are open at the current time.
 * @returns {FoodTruck[]} Array of food trucks that are open now, or the unfiltered array if openNow is false.
 * @description
 *   - Uses the system's current date and time to determine if trucks are open.
 *   - Filters based on the truck's operating hours for the current day.
 */
export function applyOpenNowFilter(trucks: FoodTruck[], openNow: boolean): FoodTruck[] {
  if (openNow) {
    const now = new Date();
    const daysOfWeek: Array<keyof OperatingHours> = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = daysOfWeek[now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes();

    return trucks.filter((truck: FoodTruck) => {
      const hours = truck.operating_hours?.[currentDay];
      if (!hours || hours.closed) return false;

      const openTime = Number.parseInt(hours.open.replace(':', ''), 10);
      const closeTime = Number.parseInt(hours.close.replace(':', ''), 10);
      return currentTime >= openTime && currentTime <= closeTime;
    });
  }
  return trucks;
}
