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
export function applyTextSearchFilter(trucks, query) {
    if (query != undefined && query !== '') {
        return trucks.filter((truck) => {
            var _a, _b, _c, _d;
            return truck.name.toLowerCase().includes(query.toLowerCase()) ||
                ((_b = (_a = truck.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.toLowerCase())) !== null && _b !== void 0 ? _b : false) ||
                ((_d = (_c = truck.menu) === null || _c === void 0 ? void 0 : _c.some((category) => {
                    var _a;
                    return (_a = category.items) === null || _a === void 0 ? void 0 : _a.some((item) => {
                        var _a, _b;
                        return item.name.toLowerCase().includes(query.toLowerCase()) ||
                            ((_b = (_a = item.description) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query.toLowerCase())) !== null && _b !== void 0 ? _b : false);
                    });
                })) !== null && _d !== void 0 ? _d : false);
        });
    }
    return trucks;
}
export function applyCuisineFilter(trucks, cuisine) {
    if (cuisine != undefined && cuisine !== '') {
        return trucks.filter((truck) => {
            var _a;
            return (_a = truck.menu) === null || _a === void 0 ? void 0 : _a.some((category) => category.name.toLowerCase().includes(cuisine.toLowerCase()));
        });
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
export function applyOpenNowFilter(trucks, openNow) {
    if (openNow) {
        const now = new Date();
        const daysOfWeek = [
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
        return trucks.filter((truck) => {
            var _a;
            const hours = (_a = truck.operating_hours) === null || _a === void 0 ? void 0 : _a[currentDay];
            if (!hours || hours.closed)
                return false;
            const openTime = Number.parseInt(hours.open.replace(':', ''), 10);
            const closeTime = Number.parseInt(hours.close.replace(':', ''), 10);
            return currentTime >= openTime && currentTime <= closeTime;
        });
    }
    return trucks;
}
