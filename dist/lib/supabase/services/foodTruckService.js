import { supabase, supabaseAdmin } from '../client';
import { handleSupabaseError, normalizeTruckLocation, calculateDistance, insertMenuItems } from '../utils';
import { buildMenuByTruck, groupMenuItems, updateTruckData, updateTruckMenu } from '../utils/menuUtils';
import {} from '@supabase/supabase-js';
export const FoodTruckService = {
    async getAllTrucks(limit = 50, offset = 0) {
        var _a;
        try {
            const { data, error, count } = await supabase
                .from('food_trucks')
                .select('*', { count: 'exact' })
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);
            if (error)
                throw error;
            const trucks = (data !== null && data !== void 0 ? data : []).map((t) => normalizeTruckLocation(t));
            if (trucks.length === 0)
                return { trucks: [], total: count !== null && count !== void 0 ? count : 0 };
            const truckIds = trucks.map((t) => t.id);
            let menuItems = [];
            try {
                if (truckIds.length > 0) {
                    const { data: items, error: menuError } = await supabase
                        .from('menu_items')
                        .select('*')
                        .in('food_truck_id', truckIds);
                    if (menuError)
                        throw new Error(menuError.message);
                    menuItems = items !== null && items !== void 0 ? items : [];
                }
            }
            catch (menuError) {
                handleSupabaseError(menuError, 'getAllTrucks:menu_items');
            }
            const menuByTruck = buildMenuByTruck(menuItems);
            for (const truck of trucks) {
                truck.menu = groupMenuItems((_a = menuByTruck[truck.id]) !== null && _a !== void 0 ? _a : []);
            }
            return { trucks, total: count !== null && count !== void 0 ? count : 0 };
        }
        catch (error) {
            handleSupabaseError(error, 'getAllTrucks');
            return { trucks: [], total: 0, error: "That didn't work, please try again later." };
        }
    },
    async getTruckById(id) {
        try {
            const { data, error } = await supabase
                .from('food_trucks')
                .select('*')
                .eq('id', id)
                .single();
            if (error)
                throw error;
            if (!data) {
                return { error: "That didn't work, please try again later." };
            }
            const truck = normalizeTruckLocation(data);
            const { data: items, error: menuError } = await supabase
                .from('menu_items')
                .select('*')
                .eq('food_truck_id', id);
            if (menuError)
                throw menuError;
            truck.menu = groupMenuItems(items !== null && items !== void 0 ? items : []);
            return truck;
        }
        catch (error) {
            handleSupabaseError(error, 'getTruckById');
            return { error: "That didn't work, please try again later." };
        }
    },
    async getTrucksByLocation(lat, lng, radiusKm) {
        try {
            const { trucks } = await FoodTruckService.getAllTrucks();
            const nearbyTrucks = trucks.filter((truck) => {
                if (truck.current_location == undefined ||
                    typeof truck.current_location.lat !== 'number' ||
                    typeof truck.current_location.lng !== 'number') {
                    return false;
                }
                const distance = calculateDistance(lat, lng, truck.current_location.lat, truck.current_location.lng);
                return distance <= radiusKm;
            });
            return nearbyTrucks;
        }
        catch (error) {
            handleSupabaseError(error, 'getTrucksByLocation');
            return { error: "That didn't work, please try again later." };
        }
    },
    async createTruck(truckData) {
        if (!supabaseAdmin) {
            return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
        }
        const menuData = truckData.menu;
        const truckDataWithoutMenu = Object.assign({}, truckData);
        delete truckDataWithoutMenu.menu;
        const { data: truck, error } = await supabaseAdmin
            .from('food_trucks')
            .insert([truckDataWithoutMenu])
            .select()
            .single();
        if (error) {
            handleSupabaseError(error, 'createTruck');
            return { error: 'Failed to create truck.' };
        }
        await insertMenuItems(truck.id, menuData);
        return truck;
    },
    async updateTruck(id, updates) {
        if (!supabaseAdmin) {
            return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
        }
        const menuData = updates.menu;
        const updatesWithoutMenu = Object.assign({}, updates);
        delete updatesWithoutMenu.menu;
        const truckResult = await updateTruckData(id, updatesWithoutMenu);
        if ('error' in truckResult) {
            return truckResult;
        }
        if (menuData != undefined) {
            await updateTruckMenu(id, menuData);
        }
        return truckResult;
    },
    async getDataQualityStats() {
        try {
            const { data, error, } = await supabase.rpc('get_data_quality_stats').single();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            console.warn('Error fetching data quality stats:', error);
            return {
                total_trucks: 0,
                avg_quality_score: 0,
                high_quality_count: 0,
                medium_quality_count: 0,
                low_quality_count: 0,
                verified_count: 0,
                pending_count: 0,
                flagged_count: 0,
            };
        }
    },
};
