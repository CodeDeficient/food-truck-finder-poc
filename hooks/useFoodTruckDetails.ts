import { supabaseFallback } from '@/lib/fallback/supabaseFallback';
import type { FoodTruck } from '@/lib/supabase';

export interface FoodTruckWithRatings extends FoodTruck {
  average_rating?: number;
  review_count?: number;
}

function isFoodTruckWithRatings(truck: FoodTruck): truck is FoodTruckWithRatings {
  return 'average_rating' in truck && 'review_count' in truck;
}

export async function getFoodTruckDetails(id: string): Promise<FoodTruckWithRatings | undefined> {
  try {
    const truck = await supabaseFallback.getFoodTruckById(id);
    if (truck && isFoodTruckWithRatings(truck)) {
      return truck;
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching food truck details:', error);
    return undefined;
  }
}
