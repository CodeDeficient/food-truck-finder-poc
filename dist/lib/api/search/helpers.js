import { NextResponse } from 'next/server';
import { applyCuisineFilter, applyOpenNowFilter, applyTextSearchFilter, } from '@/lib/api/search/filters';
import { getAndFilterFoodTrucks, sortFoodTrucksByQuality } from '@/lib/api/search/data';
/**
 * Processes a search request and returns filtered and sorted food trucks based on query parameters.
 * @example
 * processSearchRequest(request)
 * { trucks: [/* filtered food trucks */
export async function processSearchRequest({ query, cuisine, openNow, lat, lng, radius }) {
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
            location: lat != undefined && lng != undefined
                ? { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) }
                : undefined,
            radius: Number.parseFloat(radius ?? '10'),
        },
    });
}
