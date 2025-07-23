import {} from '@supabase/supabase-js';
import { supabaseAdmin } from '../client';
import { isMenuItem } from './typeGuards';
function handleSupabaseError(error, context) {
    console.warn(`Error in ${context}:`, error.message);
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
function normalizeTruckLocation(truck) {
    var _a, _b, _c;
    const fallback = {
        lat: 0,
        lng: 0,
        address: 'Unknown',
        timestamp: new Date().toISOString(),
    };
    const loc = (_c = (_b = (_a = truck.exact_location) !== null && _a !== void 0 ? _a : truck.current_location) !== null && _b !== void 0 ? _b : truck.city_location) !== null && _c !== void 0 ? _c : {};
    const lat = typeof loc.lat === 'number' ? loc.lat : 0;
    const lng = typeof loc.lng === 'number' ? loc.lng : 0;
    const { address } = loc;
    const { timestamp } = loc;
    truck.current_location =
        lat === 0 || lng === 0
            ? Object.assign(Object.assign({}, fallback), { address: address !== null && address !== void 0 ? address : fallback.address }) : {
            lat,
            lng,
            address: address !== null && address !== void 0 ? address : fallback.address,
            timestamp: timestamp !== null && timestamp !== void 0 ? timestamp : fallback.timestamp,
        };
    return truck;
}
function prepareMenuItemsForInsert(truckId, menuData) {
    if (!Array.isArray(menuData) || menuData.length === 0) {
        return [];
    }
    const categories = menuData.filter((category) => typeof category === 'object' &&
        category != undefined &&
        'name' in category &&
        'items' in category &&
        Array.isArray(category.items));
    return categories.flatMap((category) => (Array.isArray(category.items) ? category.items : [])
        .map((item) => {
        if (!isMenuItem(item)) {
            console.warn('Skipping invalid menu item:', item);
            return;
        }
        return {
            food_truck_id: truckId,
            category: typeof category.name === 'string' && category.name !== ''
                ? category.name
                : 'Uncategorized',
            name: typeof item.name === 'string' && item.name !== '' ? item.name : 'Unknown Item',
            description: typeof item.description === 'string' && item.description !== ''
                ? item.description
                : undefined,
            price: typeof item.price === 'number' && !Number.isNaN(item.price) ? item.price : undefined,
            dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
        };
    })
        .filter(Boolean));
}
async function insertMenuItems(truckId, menuData) {
    const menuItems = prepareMenuItemsForInsert(truckId, menuData);
    if (menuItems.length === 0)
        return;
    const { error: menuError } = await supabaseAdmin.from('menu_items').insert(menuItems);
    if (menuError) {
        console.error('Error inserting menu items for truck', truckId, menuError);
    }
}
export { handleSupabaseError, calculateDistance, normalizeTruckLocation, prepareMenuItemsForInsert, insertMenuItems, };
export { buildMenuByTruck, groupMenuItems } from './menuUtils';
