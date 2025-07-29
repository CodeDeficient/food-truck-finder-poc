type FallbackResult = {
    readonly trucks: FoodTruck[];
    readonly isFromCache: boolean;
    readonly lastUpdate: string;
    readonly status: 'fresh' | 'cached' | 'stale' | 'unavailable';
};
declare class SupabaseFallbackManager {
    private readonly CACHE_KEY;
    private readonly TRUCK_CACHE_KEY_PREFIX;
    private readonly CACHE_DURATION;
    private readonly supabase;
    constructor();
    /**
     * This is your main data fetching function that handles all the fallback logic
     * Think of it as your "smart" data fetcher that adapts to different situations
     */
    getFoodTrucks(): Promise<FallbackResult>;
    getFoodTruckById(id: string): Promise<FoodTruck | null>;
    /**
     * This handles the actual Supabase communication
     * Separated so you can easily modify your existing query logic
     */
    private fetchFromSupabase;
    /**
     * This is where the magic happens - graceful degradation
     * When Supabase fails, we still provide value to users
     */
    private handleFallbackScenario;
    /**
     * Stores successful data fetches for later use
     * This runs every time we successfully get data from Supabase
     */
    private cacheData;
    private cacheTruck;
    private getCachedTruck;
    /**
     * Retrieves cached data when Supabase is unavailable
     * This is your safety net
     */
    private getCachedData;
}
export declare const supabaseFallback: SupabaseFallbackManager;
export declare function useFoodTrucks(): {
    trucks: FoodTruck[];
    loading: boolean;
    dataStatus: {
        readonly isFromCache: boolean;
        readonly lastUpdate: string;
        readonly status: "fresh" | "cached" | "stale" | "unavailable";
    };
};
export declare function DataStatusIndicator({ status, }: {
    readonly status: {
        isFromCache: boolean;
        lastUpdate: string;
        status: 'fresh' | 'cached' | 'stale' | 'unavailable';
    };
}): import("react").JSX.Element | undefined;
export {};
