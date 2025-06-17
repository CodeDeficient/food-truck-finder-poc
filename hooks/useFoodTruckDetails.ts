import { FoodTruckService } from '@/lib/supabase';
import type { FoodTruck } from '@/lib/supabase';

export interface FoodTruckWithRatings extends FoodTruck {
  average_rating?: number;
  review_count?: number;
}

export async function getFoodTruckDetails(id: string): Promise<FoodTruckWithRatings | null> {
  try {
    const truck = await FoodTruckService.getTruckById(id);
    return truck as FoodTruckWithRatings;
  } catch (error) {
    console.error('Error fetching food truck details:', error);
    return null;
  }
}
