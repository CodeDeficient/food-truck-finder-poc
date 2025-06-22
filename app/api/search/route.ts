import { type NextRequest, NextResponse } from 'next/server';
import { CachedFoodTruckService } from '@/lib/performance/databaseCache';
import { type FoodTruck } from '@/lib/types';
import {
  applyCuisineFilter,
  applyOpenNowFilter,
  applyTextSearchFilter,
} from '@/lib/api/search/filters';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const cuisine = searchParams.get('cuisine');
  const openNow = searchParams.get('openNow') === 'true';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '10';

  try {
    let trucks: FoodTruck[] = [];

    // Get trucks by location if coordinates provided
    if (lat != undefined && lng != undefined) {
      const userLat = Number.parseFloat(lat);
      const userLng = Number.parseFloat(lng);
      const radiusKm = Number.parseFloat(radius);
      trucks = await CachedFoodTruckService.getTrucksByLocationCached(userLat, userLng, radiusKm);
    } else {
      // Get all trucks
      const result = await CachedFoodTruckService.getAllTrucksCached();
      trucks = result.trucks;
    }

    // Apply filters
    let filteredTrucks = trucks;

    // Text search filter
    filteredTrucks = applyTextSearchFilter(filteredTrucks, query);

    // Cuisine filter
    filteredTrucks = applyCuisineFilter(filteredTrucks, cuisine);

    // Open now filter
    filteredTrucks = applyOpenNowFilter(filteredTrucks, openNow);

    // Sort by data quality score
    filteredTrucks.sort(
      (a: FoodTruck, b: FoodTruck) => (b.data_quality_score ?? 0) - (a.data_quality_score ?? 0),
    );

    return NextResponse.json({
      trucks: filteredTrucks,
      total: filteredTrucks.length,
      filters: {
        query,
        cuisine,
        openNow,
        location:
          lat != undefined && lng != undefined
            ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }
            : undefined,
        radius: Number.parseFloat(radius),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
