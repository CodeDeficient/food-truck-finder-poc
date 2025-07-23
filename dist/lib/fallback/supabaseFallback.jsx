// lib/fallback/supabaseFallback.tsx
// This creates a resilient data layer that gracefully handles Supabase outages
import { createClient, SupabaseClient } from '@supabase/supabase-js';
function isFoodTruckData(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'id' in obj &&
        'name' in obj &&
        'cuisine_type' in obj &&
        'price_range' in obj);
}
function isCachedData(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'trucks' in obj &&
        Array.isArray(obj.trucks) &&
        'timestamp' in obj &&
        'lastSuccessfulUpdate' in obj);
}
// Helper function to safely parse JSON with type validation
function safeJsonParse(jsonString, typeGuard) {
    try {
        const parsed = JSON.parse(jsonString);
        return typeGuard(parsed) ? parsed : undefined;
    }
    catch (_a) {
        return undefined;
    }
}
// Helper function to check if we're in a browser environment
function isBrowserEnvironment() {
    // Fixed: Use direct comparison with undefined instead of typeof
    return typeof globalThis !== 'undefined' &&
        globalThis.window != undefined &&
        globalThis.window === globalThis;
}
class SupabaseFallbackManager {
    constructor() {
        this.CACHE_KEY = 'food-trucks-cache';
        this.TRUCK_CACHE_KEY_PREFIX = 'food-truck-';
        this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (process.env.NEXT_PUBLIC_SUPABASE_URL === undefined || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined) {
            throw new Error('Supabase URL and Anon Key are required!');
        }
        this.supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    }
    /**
     * This is your main data fetching function that handles all the fallback logic
     * Think of it as your "smart" data fetcher that adapts to different situations
     */
    async getFoodTrucks() {
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
            return this.handleFallbackScenario();
        }
        catch (error) {
            // Supabase is definitely having issues - engage fallback mode
            console.warn('Supabase unavailable, using fallback strategy:', error);
            return this.handleFallbackScenario();
        }
    }
    async getFoodTruckById(id) {
        const cachedTruck = this.getCachedTruck(id);
        if (cachedTruck !== null) {
            return cachedTruck;
        }
        try {
            const { data, error } = await this.supabase
                .from('food_trucks')
                .select('*')
                .eq('id', id)
                .single();
            if (error !== null) {
                throw new Error(`Supabase error: ${error.message}`);
            }
            // Fixed: Properly handle the data assignment with type checking
            if (data !== null && isFoodTruckData(data)) {
                this.cacheTruck(data);
                return data;
            }
            return null;
        }
        catch (error) {
            console.warn(`Failed to fetch truck with id ${id} from Supabase, returning null.`, error);
            return null;
        }
    }
    /**
     * This handles the actual Supabase communication
     * Separated so you can easily modify your existing query logic
     */
    async fetchFromSupabase() {
        console.log('🔌 Connecting to Supabase...');
        console.log('📊 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('🔑 Anon key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        try {
            // The key is to set a reasonable timeout so we don't wait forever
            const response = await this.supabase
                .from('food_trucks')
                .select('*')
                .abortSignal(AbortSignal.timeout(10000)); // 10 second timeout
            console.log('📡 Raw Supabase response:', response);
            console.log('❌ Response error:', response.error);
            console.log('📋 Response data type:', typeof response.data);
            console.log('📊 Response data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
            if (response.error !== null) {
                console.error('💥 Supabase query error details:', {
                    message: response.error.message,
                    details: response.error.details,
                    hint: response.error.hint,
                    code: response.error.code
                });
                throw new Error(`Supabase error: ${response.error.message}`);
            }
            // Fixed: Properly handle the data with explicit null checking
            if (response.data != undefined && Array.isArray(response.data)) {
                console.log('✅ Found', response.data.length, 'raw records from Supabase');
                if (response.data.length > 0) {
                    console.log('👀 Sample record:', JSON.stringify(response.data[0], null, 2));
                }
                const filteredData = response.data.filter((item) => {
                    const isValid = isFoodTruckData(item);
                    if (!isValid) {
                        console.warn('⚠️ Invalid food truck data found:', item);
                    }
                    return isValid;
                });
                console.log('✅ Filtered to', filteredData.length, 'valid food trucks');
                return filteredData;
            }
            console.warn('⚠️ No data returned from Supabase or data is not an array');
            return [];
        }
        catch (error) {
            console.error('💥 Error in fetchFromSupabase:', error);
            throw error;
        }
    }
    /**
     * This is where the magic happens - graceful degradation
     * When Supabase fails, we still provide value to users
     */
    handleFallbackScenario() {
        const cachedData = this.getCachedData();
        if (cachedData !== null) {
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
    cacheData(trucks) {
        const cacheData = {
            trucks,
            timestamp: Date.now(),
            lastSuccessfulUpdate: new Date().toLocaleString()
        };
        try {
            // In a browser environment, use localStorage
            if (isBrowserEnvironment()) {
                globalThis.window.localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
            }
            // In a server environment, you might use a file or Redis
            // For now, we'll just log that we would cache this data
            console.info(`Cached ${trucks.length} trucks at ${cacheData.lastSuccessfulUpdate}`);
        }
        catch (error) {
            // Caching failed, but that's not critical - log and continue
            console.warn('Failed to cache data:', error);
        }
    }
    cacheTruck(truck) {
        try {
            if (isBrowserEnvironment()) {
                const cacheKey = `${this.TRUCK_CACHE_KEY_PREFIX}${truck.id}`;
                globalThis.window.localStorage.setItem(cacheKey, JSON.stringify(truck));
            }
        }
        catch (error) {
            console.warn(`Failed to cache truck with id ${truck.id}:`, error);
        }
    }
    getCachedTruck(id) {
        var _a;
        try {
            if (isBrowserEnvironment()) {
                const cacheKey = `${this.TRUCK_CACHE_KEY_PREFIX}${id}`;
                const cached = globalThis.window.localStorage.getItem(cacheKey);
                if (cached !== null) {
                    // Fixed: Return the parsed result or null instead of undefined
                    return (_a = safeJsonParse(cached, isFoodTruckData)) !== null && _a !== void 0 ? _a : null;
                }
            }
            return null;
        }
        catch (error) {
            console.warn(`Failed to retrieve cached truck with id ${id}:`, error);
            return null;
        }
    }
    /**
     * Retrieves cached data when Supabase is unavailable
     * This is your safety net
     */
    getCachedData() {
        var _a;
        try {
            if (isBrowserEnvironment()) {
                const cached = globalThis.window.localStorage.getItem(this.CACHE_KEY);
                if (cached !== null) {
                    // Fixed: Return the parsed result or null instead of undefined
                    return (_a = safeJsonParse(cached, isCachedData)) !== null && _a !== void 0 ? _a : null;
                }
            }
            return null;
        }
        catch (error) {
            console.warn('Failed to retrieve cached data:', error);
            return null;
        }
    }
}
// Usage in your components - this replaces your direct Supabase calls
export const supabaseFallback = new SupabaseFallbackManager();
// Example React hook that uses the fallback system
import { useState, useEffect } from 'react';
export function useFoodTrucks() {
    const [trucks, setTrucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataStatus, setDataStatus] = useState({
        isFromCache: false,
        lastUpdate: '',
        status: 'fresh'
    });
    useEffect(() => {
        const loadTrucks = async () => {
            try {
                const result = await supabaseFallback.getFoodTrucks();
                setTrucks(result.trucks);
                setDataStatus({
                    isFromCache: result.isFromCache,
                    lastUpdate: result.lastUpdate,
                    status: result.status
                });
            }
            catch (error) {
                console.error('Failed to load trucks:', error);
                // Even this fails, we still want to show something
                setDataStatus({
                    isFromCache: false,
                    lastUpdate: 'Error',
                    status: 'unavailable'
                });
            }
            finally {
                setLoading(false);
            }
        };
        void loadTrucks(); // Use void to explicitly ignore the Promise
    }, []);
    return { trucks, loading, dataStatus };
}
// Component that displays appropriate messages based on data status
export function DataStatusIndicator({ status, }) {
    if (status.status === 'fresh') {
        // Fixed: Return null instead of undefined when no component should render
        return;
    }
    if (status.status === 'cached') {
        return (<div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-2 rounded">
        Showing cached data from {status.lastUpdate}. Live data temporarily unavailable.
      </div>);
    }
    if (status.status === 'stale') {
        return (<div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded">
        Showing older data from {status.lastUpdate}. We're working to restore live updates.
      </div>);
    }
    if (status.status === 'unavailable') {
        return (<div className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded">
        Service temporarily unavailable. Please check back in a few minutes.
      </div>);
    }
    // Fixed: Return null instead of undefined for the fallback case
}
