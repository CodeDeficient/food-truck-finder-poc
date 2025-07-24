import { type PostgrestError } from '@supabase/supabase-js';
import type { FoodTruck, MenuCategory, MenuItem } from '../types';
declare function handleSupabaseError(error: PostgrestError | Error, context: string): void;
declare function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
declare function normalizeTruckLocation(truck: FoodTruck): FoodTruck;
declare function prepareMenuItemsForInsert(truckId: string, menuData: MenuCategory[] | unknown[] | undefined): MenuItem[];
declare function insertMenuItems(truckId: string, menuData: MenuCategory[] | unknown[] | undefined): Promise<void>;
export { handleSupabaseError, calculateDistance, normalizeTruckLocation, prepareMenuItemsForInsert, insertMenuItems, };
export { buildMenuByTruck, groupMenuItems } from './menuUtils';
