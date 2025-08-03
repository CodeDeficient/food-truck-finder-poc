import { getSupabase, getSupabaseAdmin } from '../client.js';
import type { FoodTruck, RawMenuItemFromDB } from '../types/index.js';
import { handleSupabaseError, normalizeTruckLocation, calculateDistance, insertMenuItems } from '../utils/index.js';
import { buildMenuByTruck, groupMenuItems, updateTruckData, updateTruckMenu } from '../utils/menuUtils.js';
import { type PostgrestResponse, type PostgrestSingleResponse } from '@supabase/supabase-js';
import { logAndReturnError, createSuccess, type Result } from '../../errors/errorEnvelope.js';

export const FoodTruckService = {
  async getAllTrucks(
    limit = 50,
    offset = 0,
  ): Promise<Result<{ trucks: FoodTruck[]; total: number }>> {
    try {
      const supabase = getSupabase();
      const { data, error, count }: PostgrestResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      
      const trucks: FoodTruck[] = (data ?? []).map((t: FoodTruck) => normalizeTruckLocation(t));
      if (trucks.length === 0) {
        return createSuccess({ trucks: [], total: count ?? 0 });
      }
      
      const truckIds = trucks.map((t: FoodTruck) => t.id);
      let menuItems: RawMenuItemFromDB[] = [];
      
      try {
        if (truckIds.length > 0) {
          const { data: items, error: menuError } = await supabase
            .from('menu_items')
            .select('*')
            .in('food_truck_id', truckIds) as { data: RawMenuItemFromDB[] | null; error: Error | null };
          if (menuError) {
            throw new Error(`Menu items query failed: ${menuError.message}`);
          }
          menuItems = items ?? [];
        }
      } catch (menuError) {
        return logAndReturnError(menuError, `getAllTrucks:menu_items (limit=${limit}, offset=${offset})`);
      }
      
      const menuByTruck = buildMenuByTruck(menuItems);
      for (const truck of trucks) {
        truck.menu = groupMenuItems(menuByTruck[truck.id] ?? []);
      }
      
      return createSuccess({ trucks, total: count ?? 0 });
    } catch (error: unknown) {
      return logAndReturnError(error, `getAllTrucks (limit=${limit}, offset=${offset})`);
    }
  },
  async getTruckById(id: string): Promise<Result<FoodTruck>> {
    try {
      if (!id || typeof id !== 'string') {
        return logAndReturnError(new Error('Invalid truck ID provided'), `getTruckById (id=${id})`);
      }

      const supabase = getSupabase();
      const { data, error }: PostgrestSingleResponse<FoodTruck> = await supabase
        .from('food_trucks')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      if (!data) {
        return logAndReturnError(new Error('Truck not found'), `getTruckById (id=${id})`);
      }
      
      const truck: FoodTruck = normalizeTruckLocation(data);
      
      try {
        const { data: items, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('food_truck_id', id) as { data: RawMenuItemFromDB[] | null; error: Error | null };
          
        if (menuError) {
          throw new Error(`Menu items query failed: ${menuError.message}`);
        }
        
        truck.menu = groupMenuItems(items ?? []);
      } catch (menuError) {
        // Log menu error but don't fail the whole request
        console.warn(`Failed to load menu for truck ${id}:`, menuError);
        truck.menu = [];
      }
      
      return createSuccess(truck);
    } catch (error: unknown) {
      return logAndReturnError(error, `getTruckById (id=${id})`);
    }
  },

  async getTrucksByLocation(
    lat: number,
    lng: number,
    radiusKm: number,
  ): Promise<Result<FoodTruck[]>> {
    try {
      const { trucks } = await FoodTruckService.getAllTrucks() ?? {};
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
      return createSuccess(nearbyTrucks);
    } catch (error: unknown) {
      return logAndReturnError(error, `getTrucksByLocation (lat=${lat}, lng=${lng}, radiusKm=${radiusKm})`);
    }
  },
  async createTruck(truckData: Partial<FoodTruck>): Promise<Result<FoodTruck>> {
    try {
      if (!truckData || typeof truckData !== 'object') {
        return logAndReturnError(new Error('Invalid truck data provided'), 'createTruck');
      }

      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return logAndReturnError(
          new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY'),
          'createTruck'
        );
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
        throw new Error(`Database insert failed: ${error.message}`);
      }

      if (!truck) {
        throw new Error('Failed to create truck - no data returned');
      }

      // Insert menu items if provided
      if (menuData && Array.isArray(menuData) && menuData.length > 0) {
        try {
          await insertMenuItems(truck.id, menuData);
        } catch (menuError) {
          // Log menu error but don't fail the truck creation
          console.warn(`Failed to insert menu items for truck ${truck.id}:`, menuError);
        }
      }

      return createSuccess(truck);
    } catch (error: unknown) {
      return logAndReturnError(error, `createTruck (name=${truckData?.name || 'unknown'})`);
    }
  },

  async updateTruck(
    id: string,
    updates: Partial<FoodTruck>,
  ): Promise<Result<FoodTruck>> {
    try {
      if (!id || typeof id !== 'string') {
        return logAndReturnError(new Error('Invalid truck ID provided'), `updateTruck (id=${id})`);
      }

      if (!updates || typeof updates !== 'object') {
        return logAndReturnError(new Error('Invalid update data provided'), `updateTruck (id=${id})`);
      }

      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        return logAndReturnError(
          new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY'),
          `updateTruck (id=${id})`
        );
      }

      const menuData = updates.menu;
      const updatesWithoutMenu = { ...updates };
      delete updatesWithoutMenu.menu;

      try {
        const truckResult = await updateTruckData(id, updatesWithoutMenu);
        if ('error' in truckResult) {
          return logAndReturnError(
            new Error(truckResult.error),
            `updateTruck:updateTruckData (id=${id})`
          );
        }

        // Update menu if provided
        if (menuData !== undefined) {
          try {
            await updateTruckMenu(id, menuData);
          } catch (menuError) {
            // Log menu error but don't fail the truck update
            console.warn(`Failed to update menu for truck ${id}:`, menuError);
          }
        }

        return createSuccess(truckResult);
      } catch (updateError) {
        throw new Error(`Failed to update truck data: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
      }
    } catch (error: unknown) {
      return logAndReturnError(error, `updateTruck (id=${id})`);
    }
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
