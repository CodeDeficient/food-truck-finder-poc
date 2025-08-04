/**
 * SOTA Database Query Optimization and Caching
 * Implements Next.js unstable_cache for optimal performance
 */
import type { FoodTruck } from '@/lib/types';
/**
 * Cached food truck queries with optimized database access
 */
export declare const CachedFoodTruckService: {
    /**
     * Get all food trucks with caching
     * Cache for 30 minutes since truck data changes moderately
     */
    getAllTrucksCached: () => Promise<{
        trucks: FoodTruck[];
        count: number;
    }>;
    /**
     * Get trucks by location with caching
     * Cache for 5 minutes since location-based queries are time-sensitive
     */
    getTrucksByLocationCached: (lat: number, lng: number, radiusKm: number) => Promise<FoodTruck[]>;
    /**
     * Get truck by ID with caching
     * Cache for 30 minutes since individual truck data is relatively stable
     */
    getTruckByIdCached: (id: string) => Promise<FoodTruck | null>;
    /**
     * Search trucks with caching
     * Cache for 5 minutes since search results should be relatively fresh
     */
    searchTrucksCached: (query: string, filters?: {
        cuisine?: string;
        openNow?: boolean;
        lat?: number;
        lng?: number;
        radius?: number;
    }) => Promise<FoodTruck[]>;
    /**
     * Get data quality statistics with caching
     * Cache for 24 hours since quality stats change slowly
     */
    getDataQualityStatsCached: () => Promise<{
        averageScore: number;
        distribution: Record<string, number>;
        totalTrucks: number;
    }>;
};
/**
 * Cache invalidation utilities
 */
export declare const CacheManager: {
    /**
     * Invalidate all food truck related caches
     */
    invalidateAllFoodTruckCaches(): Promise<void>;
    /**
     * Invalidate specific truck cache
     */
    invalidateTruckCache(truckId: string): Promise<void>;
    /**
     * Invalidate search and location caches
     */
    invalidateSearchCaches(): Promise<void>;
};
