import type { MenuCategory, RawMenuItemFromDB, FoodTruck } from '../types/index.js';
export declare function buildMenuByTruck(menuItems: RawMenuItemFromDB[]): Record<string, RawMenuItemFromDB[]>;
export declare function groupMenuItems(rawItems: RawMenuItemFromDB[]): MenuCategory[];
export declare function updateTruckData(id: string, updatesWithoutMenu: Partial<FoodTruck>): Promise<FoodTruck | {
    error: string;
}>;
export declare function updateTruckMenu(id: string, menuData: MenuCategory[] | unknown[]): Promise<void>;
