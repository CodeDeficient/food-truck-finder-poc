import { Truck } from '@/lib/types';
import { getPopularItems, getPriceRange, getTodayHours } from '@/lib/utils/foodTruckHelpers';

export const useTruckCard = (truck: Truck) => {
  const popularItems = getPopularItems(truck);
  const priceRange = getPriceRange(truck);
  const todayHours = getTodayHours(truck);

  return {
    popularItems,
    priceRange,
    todayHours,
  };
};
