import { getSupabase, getSupabaseAdmin } from '../client.js';
import type { FoodTruck, RawMenuItemFromDB } from '../types/index.js';
import { handleSupabaseError, normalizeTruckLocation, calculateDistance, insertMenuItems } from '../utils/index.js';
import { buildMenuByTruck, groupMenuItems, updateTruckData, updateTruckMenu } from '../utils/menuUtils.js';
import { type PostgrestResponse, type PostgrestSingleResponse } from '@supabase/supabase-js';

export const FoodTruckService = {
  async getAllTrucks(
    limit = 50,
    offset = 0,
  ): Promise<{ trucks: FoodTruck[]; total: number; error?: string }> {
    try {
      const supabase = getSupabase();
      const { data, error, count }: PostgrestResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      const trucks: FoodTruck[] = (data ?? []).map((t: FoodTruck) => normalizeTruckLocation(t));
      if (trucks.length === 0) return { trucks: [], total: count ?? 0 };
      const truckIds = trucks.map((t: FoodTruck) => t.id);
      let menuItems: RawMenuItemFromDB[] = [];
      try {
        if (truckIds.length > 0) {
          const { data: items, error: menuError } = await supabase
            .from('menu_items')
            .select('*')
            .in('food_truck_id', truckIds) as { data: RawMenuItemFromDB[] | null; error: Error | null };
          if (menuError) throw new Error(menuError.message);
          menuItems = items ?? [];
        }
      } catch (menuError) {
        handleSupabaseError(menuError as Error, 'getAllTrucks:menu_items');
      }
      const menuByTruck = buildMenuByTruck(menuItems);
      for (const truck of trucks) {
        truck.menu = groupMenuItems(menuByTruck[truck.id] ?? []);
      }
      return { trucks, total: count ?? 0 };
    } catch (error) {
      handleSupabaseError(error as Error, 'getAllTrucks');
      return { trucks: [], total: 0, error: "That didn't work, please try again later." };
    }
  },
  async getTruckById(id: string): Promise<FoodTruck | { error: string }> {
    try {
      const supabase = getSupabase();
      const { data, error }: PostgrestSingleResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (!data) {
        return { error: "That didn't work, please try again later." };
      }
      const truck: FoodTruck = normalizeTruckLocation(data);
      const { data: items, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('food_truck_id', id) as { data: RawMenuItemFromDB[] | null; error: Error | null };
      if (menuError) throw menuError;
      truck.menu = groupMenuItems(items ?? []);
      return truck;
    } catch (error) {
      handleSupabaseError(error as Error, 'getTruckById');
      return { error: "That didn't work, please try again later." };
    }
  },

  async getTrucksByLocation(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<FoodTruck[] | { error: string }> {
    try {
      const { trucks } = await FoodTruckService.getAllTrucks();
      const nearbyTrucks = trucks.filter((truck: FoodTruck) => {
        if (
          truck.current_location == undefined ||
          typeof truck.current_location.lat !== 'number' ||
          typeof truck.current_location.lng !== 'number'
        ) {
          return false;
        }
        const distance = calculateDistance(
          lat,
          lng,
          truck.current_location.lat,
          truck.current_location.lng,
        );
        return distance <= radiusKm;
      });
      return nearbyTrucks;
    } catch (error: unknown) {
      handleSupabaseError(error as Error, 'getTrucksByLocation');
      return { error: "That didn't work, please try again later." };
    }
  },
  async createTruck(truckData: Partial<FoodTruck>): Promise<FoodTruck | { error: string }> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const menuData = truckData.menu;
    const truckDataWithoutMenu = { ...truckData };
    delete truckDataWithoutMenu.menu;
    const { data: truck, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
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

  async updateTruck(
    id: string,
    updates: Partial<FoodTruck>,
  ): Promise<FoodTruck | { error: string }> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const menuData = updates.menu;
    const updatesWithoutMenu = { ...updates };
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

  async getDataQualityStats(): Promise<{
    total_trucks: number;
    avg_quality_score: number;
    high_quality_count: number;
    medium_quality_count: number;
    low_quality_count: number;
    verified_count: number;
    pending_count: number;
    flagged_count: number;
  }> {
    try {
      const supabase = getSupabase();
      const {
        data,
        error,
      }: PostgrestSingleResponse<{
        total_trucks: number;
        avg_quality_score: number;
        high_quality_count: number;
        medium_quality_count: number;
        low_quality_count: number;
        verified_count: number;
        pending_count: number;
        flagged_count: number;
      }> = await supabase.rpc('get_data_quality_stats').single();
      if (error) throw error;
      return data as {
        total_trucks: number;
        avg_quality_score: number;
        high_quality_count: number;
        medium_quality_count: number;
        low_quality_count: number;
        verified_count: number;
        pending_count: number;
        flagged_count: number;
      };
    } catch (error: unknown) {
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
