import { isMenuCategory, isMenuItem } from './typeGuards';
import { supabaseAdmin } from '../supabase/client.js';
import { handleSupabaseError } from './index';
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
    const byCategory = {};
    for (const rawItem of rawItems) {
        const categoryName = rawItem.category ?? 'Uncategorized';
        byCategory[categoryName] ??= [];
        const menuItem = {
            name: rawItem.name,
            description: rawItem.description ?? undefined,
            price: rawItem.price ?? undefined,
            dietary_tags: rawItem.dietary_tags ?? [],
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
            if (!isMenuCategory(category)) {
                console.warn('Skipping invalid category in updateTruckMenu:', category);
                return [];
            }
            return (category.items ?? []).map((item) => {
                if (!isMenuItem(item)) {
                    console.warn('Skipping invalid menu item in updateTruckMenu:', item);
                    return {
                        food_truck_id: id,
                        category: category.name ?? 'Uncategorized',
                        name: 'Unknown Item',
                        description: undefined,
                        price: undefined,
                        dietary_tags: [],
                    };
                }
                return {
                    food_truck_id: id,
                    category: category.name ?? 'Uncategorized',
                    name: item.name ?? 'Unknown Item',
                    description: item.description ?? undefined,
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
