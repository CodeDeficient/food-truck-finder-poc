import { getPopularItems, getPriceRange, getTodayHours } from '@/lib/utils/foodTruckHelpers';
export const useTruckCard = (truck) => {
    const popularItems = getPopularItems(truck);
    const priceRange = getPriceRange(truck);
    const todayHours = getTodayHours(truck);
    return {
        popularItems,
        priceRange,
        todayHours,
    };
};
