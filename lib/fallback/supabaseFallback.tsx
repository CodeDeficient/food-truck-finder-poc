// lib/fallback/supabaseFallback.new.tsx
// This creates a resilient data layer that gracefully handles Supabase outages

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types'; // Assuming this is your Supabase database types



interface CachedData {
  readonly trucks: FoodTruckData[];
  readonly timestamp: number;
  readonly lastSuccessfulUpdate: string;
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
    readonly trucks: FoodTruckData[];
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

  public async getFoodTruckById(id: string): Promise<FoodTruckData | undefined> {
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

      if (data) {
        this.cacheTruck(data as FoodTruckData);
        return data as FoodTruckData;
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
  private async fetchFromSupabase(): Promise<FoodTruckData[]> {
    // The key is to set a reasonable timeout so we don't wait forever
    const { data, error } = await this.supabase
      .from('food_trucks')
      .select('*')
      .abortSignal(AbortSignal.timeout(5000)); // 5 second timeout

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    // Ensure data is an array and cast it to FoodTruckData[]
    return (data as FoodTruckData[]) ?? [];
  }

  /**
   * This is where the magic happens - graceful degradation
   * When Supabase fails, we still provide value to users
   */
  private handleFallbackScenario(): Promise<{
    readonly trucks: FoodTruckData[];
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
  private cacheData(trucks: FoodTruckData[]): void {
    const cacheData: CachedData = {
      trucks,
      timestamp: Date.now(),
      lastSuccessfulUpdate: new Date().toLocaleString()
    };

    try {
      // In a browser environment, use localStorage
      // eslint-disable-next-line sonarjs/different-types-comparison
      // eslint-disable-next-line sonarjs/different-types-comparison
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

  private cacheTruck(truck: FoodTruckData): void {
    try {
      if (globalThis.window !== undefined) {
        const cacheKey = `${this.TRUCK_CACHE_KEY_PREFIX}${truck.id}`;
        globalThis.window.localStorage.setItem(cacheKey, JSON.stringify(truck));
      }
    } catch (error) {
      console.warn(`Failed to cache truck with id ${truck.id}:`, error);
    }
  }

  private getCachedTruck(id: string): FoodTruckData | undefined {
    try {
      if (globalThis.window !== undefined) {
        const cacheKey = `${this.TRUCK_CACHE_KEY_PREFIX}${id}`;
        const cached = globalThis.window.localStorage.getItem(cacheKey);
        if (cached !== null) {
          return JSON.parse(cached) as FoodTruckData;
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
      // eslint-disable-next-line sonarjs/different-types-comparison
      // eslint-disable-next-line sonarjs/different-types-comparison
      if (globalThis.window !== undefined) {
        const cached = globalThis.window.localStorage.getItem(this.CACHE_KEY);
        if (cached !== null) { // Explicitly check for null
          return JSON.parse(cached) as CachedData; // Cast to CachedData
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
  const [trucks, setTrucks] = useState<FoodTruckData[]>([]);
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
export function DataStatusIndicator({ status }: { readonly status: typeof dataStatus }) {
  if (status.status === 'fresh') {
    return; // No need to show anything for fresh data
  }

  if (status.status === 'cached') {
    const typedStatus = status as { status: 'cached'; lastUpdate: string };
    return (
      <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded">
        Showing cached data from {typedStatus.lastUpdate}. Live data temporarily unavailable.
      </div>
    );
  }

  if (status.status === 'stale') {
    const typedStatus = status as { status: 'stale'; lastUpdate: string };
    return (
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded">
        Showing older data from {typedStatus.lastUpdate}. We're working to restore live updates.
      </div>
    );
  }

  if (status.status === 'unavailable') {
    return (
      <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
        Service temporarily unavailable. Please check back in a few minutes.
      }
    );
  }

  return;
}