import { NextResponse } from 'next/server';
import type { FoodTruck } from '@/lib/types';
/**
 * Processes a search request and returns filtered and sorted food trucks based on query parameters.
 * @example
 * processSearchRequest(request)
 * { trucks: [/* filtered food trucks */
export declare function processSearchRequest({ query, cuisine, openNow, lat, lng, radius }: {
    query: string | null;
    cuisine: string | null;
    openNow: boolean;
    lat: string | null;
    lng: string | null;
    radius: string | null;
}): Promise<NextResponse<{
    trucks: FoodTruck[];
    total: number;
    filters: {
        query: string | null;
        cuisine: string | null;
        openNow: boolean;
        location: {
            lat: number;
            lng: number;
        } | undefined;
        radius: number;
    };
}>>;
