import { isMenuCategory, isMenuItem } from './typeGuards';
import { supabaseAdmin } from '../client';
import { handleSupabaseError } from './index';
import {} from '@supabase/supabase-js';
export function buildMenuByTruck(menuItems) {
    const menuByTruck = {};
    for (const item of menuItems) {
        if (typeof item.food_truck_id === 'string' && item.food_truck_id.trim() !== '') {
            if (!menuByTruck[item.food_truck_id]) {
                menuByTruck[item.food_truck_id] = [];
            }
            menuByTruck[item.food_truck_id].push(item);
        }
    }
    return menuByTruck;
}
export function groupMenuItems(rawItems) {
    var _a, _b, _c, _d, _e;
    const byCategory = {};
    for (const rawItem of rawItems) {
        const categoryName = (_a = rawItem.category) !== null && _a !== void 0 ? _a : 'Uncategorized';
        (_b = byCategory[categoryName]) !== null && _b !== void 0 ? _b : (byCategory[categoryName] = []);
        const menuItem = {
            name: rawItem.name,
            description: (_c = rawItem.description) !== null && _c !== void 0 ? _c : undefined,
            price: (_d = rawItem.price) !== null && _d !== void 0 ? _d : undefined,
            dietary_tags: (_e = rawItem.dietary_tags) !== null && _e !== void 0 ? _e : [],
        };
        byCategory[categoryName].push(menuItem);
    }
    return Object.entries(byCategory).map(([categoryName, itemsList]) => ({
        name: categoryName,
        items: itemsList,
    }));
}
export async function updateTruckData(id, updatesWithoutMenu) {
    if (!supabaseAdmin) {
        return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const { data: truck, error } = await supabaseAdmin
        .from('food_trucks')
        .update(updatesWithoutMenu)
        .eq('id', id)
        .select()
        .single();
    if (error) {
        handleSupabaseError(error, 'updateTruckData');
        return { error: 'Failed to update truck data.' };
    }
    return truck;
}
export async function updateTruckMenu(id, menuData) {
    if (!supabaseAdmin) {
        throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }
    const { error: deleteError } = await supabaseAdmin
        .from('menu_items')
        .delete()
        .eq('food_truck_id', id);
    if (deleteError) {
        console.error('Error deleting existing menu items for truck', id, deleteError);
    }
    if (menuData != undefined && menuData.length > 0) {
        const menuItems = menuData.flatMap((category) => {
            var _a;
            if (!isMenuCategory(category)) {
                console.warn('Skipping invalid category in updateTruckMenu:', category);
                return [];
            }
            return ((_a = category.items) !== null && _a !== void 0 ? _a : []).map((item) => {
                var _a, _b, _c, _d;
                if (!isMenuItem(item)) {
                    console.warn('Skipping invalid menu item in updateTruckMenu:', item);
                    return {
                        food_truck_id: id,
                        category: (_a = category.name) !== null && _a !== void 0 ? _a : 'Uncategorized',
                        name: 'Unknown Item',
                        description: undefined,
                        price: undefined,
                        dietary_tags: [],
                    };
                }
                return {
                    food_truck_id: id,
                    category: (_b = category.name) !== null && _b !== void 0 ? _b : 'Uncategorized',
                    name: (_c = item.name) !== null && _c !== void 0 ? _c : 'Unknown Item',
                    description: (_d = item.description) !== null && _d !== void 0 ? _d : undefined,
                    price: typeof item.price === 'number' ? item.price : undefined,
                    dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
                };
            });
        });
        if (menuItems.length > 0) {
            const { error: menuError } = await supabaseAdmin.from('menu_items').insert(menuItems);
            if (menuError) {
                console.error('Error inserting updated menu items for truck', id, menuError);
            }
        }
    }
}
