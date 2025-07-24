import { isMenuItem, isMenuCategory } from './typeGuards.js';
/**
 * Groups menu items by category and returns an array of menu categories.
 * @example
 * groupMenuItems([
 *   { category: 'Appetizers', name: 'Fries', price: 2.99 },
 *   { category: 'Main Course', name: 'Burger', price: 8.99 },
 *   { category: 'Appetizers', name: 'Onion Rings', price: 3.99 },
 * ])
 * // Returns:
 * // [
 * //   { name: 'Appetizers', items: [...] },
 * //   { name: 'Main Course', items: [...] },
 * // ]
 * @param {MenuItem[]} menuItems - An array of menu items to be grouped.
 * @returns {MenuCategory[]} An array of menu categories, each with a list of items.
 * @description
 *   - Uses a Map to group menu items by their category name.
 *   - Filters out any invalid or undefined menu items before processing.
 *   - Returns an empty array if no valid menu items are provided.
 */
export function groupMenuItems(menuItems) {
    if (!Array.isArray(menuItems) || menuItems.length === 0)
        return [];
    const categoryMap = new Map();
    menuItems.forEach((item) => {
        if (!isMenuItem(item))
            return;
        const categoryName = item.category ?? 'Uncategorized';
        const category = categoryMap.get(categoryName) ?? {
            name: categoryName,
            items: [],
        };
        category.items.push(item);
        categoryMap.set(categoryName, category);
    });
    return [...categoryMap.values()];
}
/**
 * Builds a menu structure for a given truck by fetching its menu items.
 * @example
 * buildMenuByTruck(123)
 * // Returns a promise that resolves to an array of MenuCategory objects.
 * @param {number} truckId - The unique identifier for the food truck.
 * @returns {Promise<MenuCategory[]>} A promise that resolves to an array of menu categories for the truck.
 * @description
 *   - Fetches menu items for the specified truck ID using the FoodTruckService.
 *   - Groups the fetched menu items into categories using the groupMenuItems function.
 *   - Returns an empty array if there's an error or no menu items are found.
 */
export async function buildMenuByTruck(truckId) {
    const menuResult = await FoodTruckService.getMenuByTruckId(truckId);
    if (menuResult.error != undefined || menuResult.data == undefined) {
        return [];
    }
    return groupMenuItems(menuResult.data);
}
/**
 * Updates the menu for a specific food truck.
 * @example
 * updateTruckMenu(123, [{ name: 'Drinks', items: [{ name: 'Coke', price: 1.99 }] }])
 * // Returns a promise that resolves when the menu is updated.
 * @param {number} truckId - The ID of the food truck to update.
 * @param {MenuCategory[]} menuData - An array of menu categories to be set as the new menu.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 * @description
 *   - First, deletes all existing menu items for the specified truck to ensure a fresh start.
 *   - Then, inserts the new menu items provided in the menuData array.
 *   - Handles potential errors during deletion or insertion and logs them.
 */
export async function updateTruckMenu(truckId, menuData) {
    await FoodTruckService.deleteMenuByTruckId(truckId);
    await insertMenuItems(truckId, menuData);
}
/**
 * Updates the data for a specific food truck.
 * @example
 * updateTruckData(123, { name: 'New Truck Name' })
 * // Returns a promise that resolves to the updated food truck data.
 * @param {number} truckId - The ID of the food truck to update.
 * @param {Partial<FoodTruckSchema>} truckData - An object containing the fields to update.
 * @returns {Promise<FoodTruck>} A promise that resolves to the updated food truck object.
 * @description
 *   - Updates the food truck's data with the provided partial data.
 *   - If menu data is included, it updates the menu separately using updateTruckMenu.
 *   - Returns the updated food truck data, excluding the menu from the main update object.
 */
export async function updateTruckData(truckId, truckData) {
    if (truckData.menu != undefined) {
        await updateTruckMenu(truckId, truckData.menu);
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete truckData.menu;
    }
    return await FoodTruckService.updateTruck(truckId, truckData);
}
