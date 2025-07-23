import { supabaseFallback } from '@/lib/fallback/supabaseFallback';
function isFoodTruckWithRatings(truck) {
    return 'average_rating' in truck && 'review_count' in truck;
}
export async function getFoodTruckDetails(id) {
    try {
        const truck = await supabaseFallback.getFoodTruckById(id);
        if (truck && isFoodTruckWithRatings(truck)) {
            return truck;
        }
        return undefined;
    }
    catch (error) {
        console.error('Error fetching food truck details:', error);
        return undefined;
    }
}
