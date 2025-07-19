import { supabaseAdmin } from '../client';
import type { FoodTruck } from '../types';
import { handleSupabaseError } from '../utils';
import { type PostgrestSingleResponse } from '@supabase/supabase-js';

export const DataQualityService = {
  calculateQualityScore: (truck: FoodTruck) => {
    // Placeholder for actual quality score calculation logic
    // This should be implemented based on defined data quality rules
    let score = 0;
    if (typeof truck.name === 'string' && truck.name.trim() !== '') score += 20;
    if (
      truck.current_location &&
      typeof truck.current_location.lat === 'number' &&
      !Number.isNaN(truck.current_location.lat) &&
      typeof truck.current_location.lng === 'number' &&
      !Number.isNaN(truck.current_location.lng)
    )
      score += 30;
    if (
      truck.contact_info &&
      ((typeof truck.contact_info.phone === 'string' && truck.contact_info.phone.trim() !== '') ||
        (typeof truck.contact_info.email === 'string' && truck.contact_info.email.trim() !== '') ||
        (typeof truck.contact_info.website === 'string' &&
          truck.contact_info.website.trim() !== ''))
    )
      score += 25;
    if (Array.isArray(truck.menu) && truck.menu.length > 0) score += 15;
    if (truck.operating_hours != undefined) score += 10;
    return { score: Math.min(100, score) };
  },

  async updateTruckQualityScore(truckId: string): Promise<FoodTruck | { error: string }> {
    if (!supabaseAdmin) {
      return { error: 'Admin operations require SUPABASE_SERVICE_ROLE_KEY' };
    }
    const { data: truck, error: fetchError }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .eq('id', truckId)
      .single();

    if (fetchError) {
      handleSupabaseError(fetchError, 'updateTruckQualityScore:fetch');
      return { error: `Failed to fetch truck with ID ${truckId}.` };
    }
    if (!truck) {
      return { error: `Truck with ID ${truckId} not found.` };
    }

    const { score } = this.calculateQualityScore(truck);

    const { data, error }: PostgrestSingleResponse<FoodTruck> = await supabaseAdmin
      .from('food_trucks')
      .update({ data_quality_score: score })
      .eq('id', truckId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateTruckQualityScore:update');
      return { error: `Failed to update quality score for truck with ID ${truckId}.` };
    }
    return data;
  },
};
