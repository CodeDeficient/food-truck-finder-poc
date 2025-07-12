import { supabaseFallback } from '@/lib/fallback/supabaseFallback';
import type { FoodTruck } from '@/lib/supabase';

export interface FoodTruckWithRatings extends FoodTruck {
  average_rating?: number;
  review_count?: number;
}

export async function getFoodTruckDetails(id: string): Promise<FoodTruckWithRatings | undefined> {
  try {
    const truck = await supabaseFallback.getFoodTruckById(id);
    return truck as FoodTruckWithRatings;
  } catch (error) {
    console.error('Error fetching food truck details:', error);
    return undefined;
  }
}
