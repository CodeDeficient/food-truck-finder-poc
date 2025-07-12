// lib/fallback/supabaseFallback.new.tsx
// This creates a resilient data layer that gracefully handles Supabase outages

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types'; // Assuming this is your Supabase database types



import { FoodTruck } from '@/lib/types';

function isFoodTruckData(obj: unknown): obj is FoodTruck {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'cuisine_type' in obj &&
    'price_range' in obj
  );
}

interface CachedData {
  readonly trucks: FoodTruck[];
  readonly timestamp: number;
  readonly lastSuccessfulUpdate: string;
}

function isCachedData(obj: unknown): obj is CachedData {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'trucks' in obj &&
    Array.isArray((obj as CachedData).trucks) &&
    'timestamp' in obj &&
    'lastSuccessfulUpdate' in obj
  );
}

class SupabaseFallbackManager {
  private readonly CACHE_KEY = 'food-trucks-cache';
  private readonly TRUCK_CACHE_KEY_PREFIX = 'food-truck-';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly supabase: SupabaseClient<Database>;

  constructor() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined) {
      throw new Error('Supabase URL and Anon Key are required!');
    }
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  /**
   * This is your main data fetching function that handles all the fallback logic
   * Think of it as your "smart" data fetcher that adapts to different situations
   */
  public async getFoodTrucks(): Promise<{
    readonly trucks: FoodTruck[];
    readonly isFromCache: boolean;
    readonly lastUpdate: string;
    readonly status: 'fresh' | 'cached' | 'stale' | 'unavailable';
  }> {
    try {
      // First, try to get fresh data from Supabase
      const freshData = await this.fetchFromSupabase();

      if (freshData.length > 0) {
        // Success! Cache this data for future fallback use
        this.cacheData(freshData);

        return {
          trucks: freshData,
          isFromCache: false,
          lastUpdate: 'Just now',
          status: 'fresh'
        };
      }

      // If we reach here, Supabase returned empty results
      // This might mean no trucks are available, or there's a data issue
      return await this.handleFallbackScenario();

    } catch (error: unknown) {
      // Supabase is definitely having issues - engage fallback mode
      console.warn('Supabase unavailable, using fallback strategy:', error);
      return await this.handleFallbackScenario();
    }
  }

  public async getFoodTruckById(id: string): Promise<FoodTruck | undefined> {
    const cachedTruck = this.getCachedTruck(id);
    if (cachedTruck) {
      return cachedTruck;
    }

    try {
      const { data, error } = await this.supabase
        .from('food_trucks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (data && isFoodTruckData(data)) {
        this.cacheTruck(data);
        return data;
      }

      return undefined;
    } catch (error) {
      console.warn(`Failed to fetch truck with id ${id} from Supabase, returning undefined.`, error);
      return undefined;
    }
  }

  /**
   * This handles the actual Supabase communication
   * Separated so you can easily modify your existing query logic
   */
  private async fetchFromSupabase(): Promise<FoodTruck[]> {
    // The key is to set a reasonable timeout so we don't wait forever
    const { data, error } = await this.supabase
      .from('food_trucks')
      .select('*')
      .abortSignal(AbortSignal.timeout(5000)); // 5 second timeout

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Ensure data is an array and cast it to FoodTruck[]
    if (Array.isArray(data)) {
      return data.filter((d): d is FoodTruck => isFoodTruckData(d));
    }
    return [];
  }

  /**
   * This is where the magic happens - graceful degradation
   * When Supabase fails, we still provide value to users
   */
  private handleFallbackScenario(): Promise<{
    readonly trucks: FoodTruck[];
    readonly isFromCache: boolean;
    readonly lastUpdate: string;
    readonly status: 'cached' | 'stale' | 'unavailable';
  }> {
    const cachedData = this.getCachedData();

    if (cachedData !== undefined) {
      const age = Date.now() - cachedData.timestamp;
      const isStale = age > this.CACHE_DURATION;

      return {
        trucks: cachedData.trucks,
        isFromCache: true,
        lastUpdate: cachedData.lastSuccessfulUpdate,
        status: isStale ? 'stale' : 'cached'
      };
    }

    // No cached data available - this is the worst case scenario
    return {
      trucks: [],
      isFromCache: false,
      lastUpdate: 'Never',
      status: 'unavailable'
    };
  }

  /**
   * Stores successful data fetches for later use
   * This runs every time we successfully get data from Supabase
   */
  private cacheData(trucks: FoodTruck[]): void {
    const cacheData: CachedData = {
      trucks,
      timestamp: Date.now(),
      lastSuccessfulUpdate: new Date().toLocaleString()
    };

    try {
      // In a browser environment, use localStorage
      if (globalThis.window !== undefined) {
        globalThis.window.localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      }

      // In a server environment, you might use a file or Redis
      // For now, we'll just log that we would cache this data
      console.info(`Cached ${trucks.length} trucks at ${cacheData.lastSuccessfulUpdate}`);
    } catch (error: unknown) {
      // Caching failed, but that's not critical - log and continue
      console.warn('Failed to cache data:', error);
    }
  }

  private cacheTruck(truck: FoodTruck): void {
    try {
      if (globalThis.window !== undefined) {
        const cacheKey = `${this.TRUCK_CACHE_KEY_PREFIX}${truck.id}`;
        globalThis.window.localStorage.setItem(cacheKey, JSON.stringify(truck));
      }
    } catch (error) {
      console.warn(`Failed to cache truck with id ${truck.id}:`, error);
    }
  }

  private getCachedTruck(id: string): FoodTruck | undefined {
    try {
      if (globalThis.window !== undefined) {
        const cacheKey = `${this.TRUCK_CACHE_KEY_PREFIX}${id}`;
        const cached = globalThis.window.localStorage.getItem(cacheKey);
        if (cached !== null) {
          const parsed = JSON.parse(cached);
          if (isFoodTruckData(parsed)) {
            return parsed;
          }
        }
      }
      return undefined;
    } catch (error) {
      console.warn(`Failed to retrieve cached truck with id ${id}:`, error);
      return undefined;
    }
  }

  /**
   * Retrieves cached data when Supabase is unavailable
   * This is your safety net
   */
  private getCachedData(): CachedData | undefined {
    try {
      if (globalThis.window != undefined) {
        const cached = globalThis.window.localStorage.getItem(this.CACHE_KEY);
        if (cached != null) {
          const parsed = JSON.parse(cached);
          if (isCachedData(parsed)) {
            return parsed;
          }
        }
      }
      return undefined;
    } catch (error: unknown) {
      console.warn('Failed to retrieve cached data:', error);
      return undefined;
    }
  }
}

// Usage in your components - this replaces your direct Supabase calls
export const supabaseFallback = new SupabaseFallbackManager();

// Example React hook that uses the fallback system
import { useState, useEffect } from 'react';

export function useFoodTrucks() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dataStatus, setDataStatus] = useState<{
    readonly isFromCache: boolean;
    readonly lastUpdate: string;
    readonly status: 'fresh' | 'cached' | 'stale' | 'unavailable';
  }>({
    isFromCache: false,
    lastUpdate: '',
    status: 'fresh'
  });

  useEffect(() => {
    const loadTrucks = async (): Promise<void> => {
      try {
        const result = await supabaseFallback.getFoodTrucks();
        setTrucks(result.trucks);
        setDataStatus({
          isFromCache: result.isFromCache,
          lastUpdate: result.lastUpdate,
          status: result.status
        });
      } catch (error: unknown) {
        console.error('Failed to load trucks:', error);
        // Even this fails, we still want to show something
        setDataStatus({
          isFromCache: false,
          lastUpdate: 'Error',
          status: 'unavailable'
        });
      } finally {
        setLoading(false);
      }
    };

    void loadTrucks(); // Use void to explicitly ignore the Promise
  }, []);

  return { trucks, loading, dataStatus };
}

// Component that displays appropriate messages based on data status
export function DataStatusIndicator({
  status,
}: {
  readonly status: {
    isFromCache: boolean;
    lastUpdate: string;
    status: 'fresh' | 'cached' | 'stale' | 'unavailable';
  };
}) {
  if (status.status === 'fresh') {
    return null; // No need to show anything for fresh data
  }

  if (status.status === 'cached') {
    return (
      <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded">
        Showing cached data from {status.lastUpdate}. Live data temporarily unavailable.
      </div>
    );
  }

  if (status.status === 'stale') {
    return (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded">
        Showing older data from {status.lastUpdate}. We're working to restore live updates.
      </div>
    );
  }

  if (status.status === 'unavailable') {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
        Service temporarily unavailable. Please check back in a few minutes.
      </div>
    );
  }

  return null;
}