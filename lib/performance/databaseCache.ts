/**
 * SOTA Database Query Optimization and Caching
 * Implements Next.js unstable_cache for optimal performance
 */

import { unstable_cache } from 'next/cache';
import { supabaseAdmin, FoodTruckService } from '@/lib/supabase';
import type { FoodTruck } from '@/lib/types';

// Cache configuration
const CACHE_CONFIG = {
  // Short-term cache for frequently changing data
  SHORT_TTL: 60 * 5, // 5 minutes
  // Medium-term cache for semi-static data
  MEDIUM_TTL: 60 * 30, // 30 minutes
  // Long-term cache for static data
  LONG_TTL: 60 * 60 * 24, // 24 hours
} as const;

/**
 * Cached food truck queries with optimized database access
 */
export const CachedFoodTruckService = {
  /**
   * Get all food trucks with caching
   * Cache for 30 minutes since truck data changes moderately
   */
  getAllTrucksCached : unstable_cache(
    async (): Promise<{ trucks: FoodTruck[]; count: number }> => {
      console.info('CachedFoodTruckService: Cache miss - fetching all trucks from database');
      // @ts-expect-error TS(2741): Property 'count' is missing in type '{ trucks: Foo... Remove this comment to see the full error message
      return await FoodTruckService.getAllTrucks();
    },
    ['all-trucks'],
    {
      revalidate: CACHE_CONFIG.MEDIUM_TTL,
      tags: ['food-trucks', 'all-trucks']
    }
  ),

  /**
   * Get trucks by location with caching
   * Cache for 5 minutes since location-based queries are time-sensitive
   */
  getTrucksByLocationCached : unstable_cache(
    async (lat: number, lng: number, radiusKm: number): Promise<FoodTruck[]> => {
      console.info(`CachedFoodTruckService: Cache miss - fetching trucks near ${lat},${lng} (${radiusKm}km)`);
      // @ts-expect-error TS(2322): Type 'import("C:/AI/food-truck-finder-poc/lib/supa... Remove this comment to see the full error message
      return await FoodTruckService.getTrucksByLocation(lat, lng, radiusKm);
    },
    ['trucks-by-location'],
    {
      revalidate: CACHE_CONFIG.SHORT_TTL,
      tags: ['food-trucks', 'location-search']
    }
  ),

  /**
   * Get truck by ID with caching
   * Cache for 30 minutes since individual truck data is relatively stable
   */
  getTruckByIdCached : unstable_cache(
    async (id: string): Promise<FoodTruck | null> => {
      console.info(`CachedFoodTruckService: Cache miss - fetching truck ${id} from database`);
      // @ts-expect-error TS(2322): Type 'import("C:/AI/food-truck-finder-poc/lib/supa... Remove this comment to see the full error message
      return await FoodTruckService.getTruckById(id);
    },
    ['truck-by-id'],
    {
      revalidate: CACHE_CONFIG.MEDIUM_TTL,
      tags: ['food-trucks', 'truck-details']
    }
  ),

  /**
   * Search trucks with caching
   * Cache for 5 minutes since search results should be relatively fresh
   */
  searchTrucksCached : unstable_cache(
    async (query: string, filters?: {
      cuisine?: string;
      openNow?: boolean;
      lat?: number;
      lng?: number;
      radius?: number;
    }): Promise<FoodTruck[]> => {
      console.info(`CachedFoodTruckService: Cache miss - searching trucks for "${query}"`);
      
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      let dbQuery = supabaseAdmin
        .from('food_trucks')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,cuisine_type.cs.{${query}}`);

      // Apply filters
      if (filters?.cuisine) {
        dbQuery = dbQuery.contains('cuisine_type', [filters.cuisine]);
      }

      const { data: trucks, error } = await dbQuery.limit(50);

      if (error) {
        throw new Error(`Search query failed: ${error.message}`);
      }

      let results = trucks ?? [];

      // Apply location filter if provided
      if (filters?.lat && filters?.lng && filters?.radius) {
        results = results.filter((truck: FoodTruck) => {
          if (!truck.current_location?.lat || !truck.current_location?.lng) {
            return false;
          }
          const distance = calculateDistance(
            filters.lat!,
            filters.lng!,
            truck.current_location.lat,
            truck.current_location.lng
          );
          return distance <= (filters.radius ?? 10);
        });
      }

      // Apply openNow filter if provided
      if (filters?.openNow) {
        const now = new Date();
        // @ts-expect-error TS(2339): Property 'toLocaleLowerCase' does not exist on typ... Remove this comment to see the full error message
        const currentDay = now.toLocaleLowerCase().slice(0, 3); // 'mon', 'tue', etc.
        const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format

        results = results.filter((truck: FoodTruck) => {
          // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
          const hours = truck.operating_hours?.[currentDay];
          if (!hours || hours.closed) return false;
          
          const openTime = parseTimeString(hours.open);
          const closeTime = parseTimeString(hours.close);
          
          return currentTime >= openTime && currentTime <= closeTime;
        });
      }

      return results;
    },
    ['search-trucks'],
    {
      revalidate: CACHE_CONFIG.SHORT_TTL,
      tags: ['food-trucks', 'search']
    }
  ),

  /**
   * Get data quality statistics with caching
   * Cache for 24 hours since quality stats change slowly
   */
  getDataQualityStatsCached : unstable_cache(
    async (): Promise<{
      averageScore: number;
      distribution: Record<string, number>;
      totalTrucks: number;
    }> => {
      console.info('CachedFoodTruckService: Cache miss - calculating data quality stats');
      
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      const { data: trucks, error } = await supabaseAdmin
        .from('food_trucks')
        .select('data_quality_score');

      if (error) {
        throw new Error(`Quality stats query failed: ${error.message}`);
      }

      const scores = trucks?.map((t: any) => t.data_quality_score ?? 0) || [];
      const averageScore = scores.length > 0 
        ? scores.reduce((sum: any, score: any) => sum + score, 0) / scores.length 
        : 0;

      const distribution = {
        high: scores.filter((s: any) => s >= 0.8).length,
        medium: scores.filter((s: any) => s >= 0.6 && s < 0.8).length,
        low: scores.filter((s: any) => s < 0.6).length
      };

      return {
        averageScore: Math.round(averageScore * 100) / 100,
        distribution,
        totalTrucks: scores.length
      };
    },
    ['data-quality-stats'],
    {
      revalidate: CACHE_CONFIG.LONG_TTL,
      tags: ['food-trucks', 'data-quality']
    }
  ),
};

/**
 * Cache invalidation utilities
 */
export const CacheManager = {
  /**
   * Invalidate all food truck related caches
   */
  async invalidateAllFoodTruckCaches(): Promise<void> {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag('food-trucks');
      console.info('CacheManager: Invalidated all food truck caches');
    } catch (error) {
      console.warn('CacheManager: Failed to invalidate caches:', error);
    }
  },

  /**
   * Invalidate specific truck cache
   */
  async invalidateTruckCache(truckId: string): Promise<void> {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`truck-${truckId}`);
      revalidateTag('food-trucks'); // Also invalidate general caches
      console.info(`CacheManager: Invalidated cache for truck ${truckId}`);
    } catch (error) {
      console.warn('CacheManager: Failed to invalidate truck cache:', error);
    }
  },

  /**
   * Invalidate search and location caches
   */
  async invalidateSearchCaches(): Promise<void> {
    try {
      const { revalidateTag } = await import('next/cache');
      revalidateTag('search');
      revalidateTag('location-search');
      console.info('CacheManager: Invalidated search caches');
    } catch (error) {
      console.warn('CacheManager: Failed to invalidate search caches:', error);
    }
  },
};

/**
 * Utility functions
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function parseTimeString(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 100 + (minutes ?? 0);
}
