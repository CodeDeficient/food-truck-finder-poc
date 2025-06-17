import { type NextRequest, NextResponse } from 'next/server';
import { CachedFoodTruckService } from '@/lib/performance/databaseCache';
import { MenuCategory, MenuItem, OperatingHours, type FoodTruck } from '@/lib/types';

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
    if (lat !== undefined && lng !== undefined) {
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
    if (query !== undefined && query !== '') {
      filteredTrucks = filteredTrucks.filter(
        (truck: FoodTruck) => truck.name.toLowerCase().includes(query.toLowerCase()) ||
        truck.description?.toLowerCase().includes(query.toLowerCase()) ||
        truck.menu?.some((category: MenuCategory) =>
          category.items?.some(
            (item: MenuItem) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              (item.description?.toLowerCase().includes(query.toLowerCase()) ?? false),
          ) ?? false,
        ) ?? false,
      );
    }

    // Cuisine filter
    if (cuisine !== undefined && cuisine !== '') {
      filteredTrucks = filteredTrucks.filter((truck: FoodTruck) => truck.menu?.some((category: MenuCategory) =>
        category.name.toLowerCase().includes(cuisine.toLowerCase()),
      ),
      );
    }

    // Open now filter
    if (openNow) {
      const now = new Date();
      const daysOfWeek: Array<keyof OperatingHours> = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const currentDay = daysOfWeek[now.getDay()];
      const currentTime = now.getHours() * 100 + now.getMinutes();

      filteredTrucks = filteredTrucks.filter((truck: FoodTruck) => {
        const hours = truck.operating_hours?.[currentDay];
        if (!hours || hours.closed) return false;

        const openTime = Number.parseInt(hours.open.replace(':', ''));
        const closeTime = Number.parseInt(hours.close.replace(':', ''));
        return currentTime >= openTime && currentTime <= closeTime;
      });
    }

    // Sort by data quality score
    filteredTrucks.sort((a: FoodTruck, b: FoodTruck) => (b.data_quality_score ?? 0) - (a.data_quality_score ?? 0));

    return NextResponse.json({
      trucks: filteredTrucks,
      total: filteredTrucks.length,
      filters: {
        query,
        cuisine,
        openNow,
        location:
          lat !== undefined && lng !== undefined ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) } : undefined,
        radius: Number.parseFloat(radius),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
