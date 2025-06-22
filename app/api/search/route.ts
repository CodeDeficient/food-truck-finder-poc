import { type NextRequest, NextResponse } from 'next/server';
import {
  applyCuisineFilter,
  applyOpenNowFilter,
  applyTextSearchFilter,
} from '@/lib/api/search/filters';
import { getAndFilterFoodTrucks, sortFoodTrucksByQuality } from '@/lib/api/search/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const cuisine = searchParams.get('cuisine');
  const openNow = searchParams.get('openNow') === 'true';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius');

  try {
    let trucks = await getAndFilterFoodTrucks(lat, lng, radius);

    // Apply filters
    trucks = applyTextSearchFilter(trucks, query);
    trucks = applyCuisineFilter(trucks, cuisine);
    trucks = applyOpenNowFilter(trucks, openNow);

    // Sort by data quality score
    const filteredAndSortedTrucks = sortFoodTrucksByQuality(trucks);

    return NextResponse.json({
      trucks: filteredAndSortedTrucks,
      total: filteredAndSortedTrucks.length,
      filters: {
        query,
        cuisine,
        openNow,
        location:
          lat != undefined && lng != undefined
            ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }
            : undefined,
        radius: Number.parseFloat(radius ?? '10'),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
