import { CachedFoodTruckService } from '@/lib/performance/databaseCache';
import { type FoodTruck } from '@/lib/types';

export async function getAndFilterFoodTrucks(
  lat: string | null,
  lng: string | null,
  radius: string | null,
): Promise<FoodTruck[]> {
  let trucks: FoodTruck[] = [];

  if (lat != undefined && lng != undefined) {
    const userLat = Number.parseFloat(lat);
    const userLng = Number.parseFloat(lng);
    const radiusKm = Number.parseFloat(radius ?? '10');
    trucks = await CachedFoodTruckService.getTrucksByLocationCached(userLat, userLng, radiusKm);
  } else {
    const result = await CachedFoodTruckService.getAllTrucksCached();
    trucks = result.trucks;
  }
  return trucks;
}

export function sortFoodTrucksByQuality(trucks: FoodTruck[]): FoodTruck[] {
  return [...trucks].sort(
    (a: FoodTruck, b: FoodTruck) => (b.data_quality_score ?? 0) - (a.data_quality_score ?? 0),
  );
}
