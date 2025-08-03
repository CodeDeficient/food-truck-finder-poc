'use client';

import useSWR, { type SWRConfiguration, type SWRResponse } from 'swr';
import { withRetry, type RetryOptions } from '@/lib/utils/withRetry';
import { logError } from '@/lib/logging';

/**
 * Configuration for SWR with recovery mechanisms
 */
export interface SWRRecoveryConfig<T> extends SWRConfiguration<T> {
  /** Fallback data to use when cache is stale or unavailable */
  fallbackData?: T;
  /** Enable revalidation when window gains focus */
  revalidateOnFocus?: boolean;
  /** Enable revalidation when network reconnects */
  revalidateOnReconnect?: boolean;
  /** Retry configuration for failed requests */
  retryOptions?: RetryOptions;
  /** Enable background revalidation even with stale data */
  revalidateIfStale?: boolean;
  /** Custom error handler */
  onError?: (error: unknown) => void;
  /** Custom success handler */
  onSuccess?: (data: T) => void;
}

/**
 * Enhanced SWR response with recovery information
 */
export interface SWRRecoveryResponse<T> extends SWRResponse<T, unknown> {
  /** Whether we're currently using fallback data */
  isUsingFallback: boolean;
  /** Whether the current data is considered stale */
  isStale: boolean;
  /** Manually refresh data */
  refresh: () => Promise<T | undefined>;
  /** Get data with fallback if available */
  dataWithFallback: T | undefined;
}

/**
 * Default fetcher with retry logic
 */
async function defaultFetcher(url: string, retryOptions?: RetryOptions): Promise<unknown> {
  const result = await withRetry(
    async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    retryOptions
  );

  if (result.success) {
    return result.data;
  }

  throw result.error || new Error('Request failed after retries');
}

/**
 * Enhanced useSWR hook with recovery mechanisms for stale API cache
 * 
 * Features:
 * - Fallback data when cache is stale or unavailable
 * - Automatic revalidation on focus/reconnect
 * - Retry logic with exponential backoff
 * - Background revalidation with stale data
 * 
 * @param key - SWR cache key
 * @param fetcher - Optional custom fetcher function
 * @param config - SWR and recovery configuration
 * @returns Enhanced SWR response with recovery features
 * 
 * @example
 * ```typescript
 * // Basic usage with fallback data
 * const { data, error, isLoading, isUsingFallback } = useSWRWithRecovery(
 *   '/api/trucks',
 *   null,
 *   {
 *     fallbackData: [],
 *     revalidateOnFocus: true,
 *     retryOptions: { maxAttempts: 3 }
 *   }
 * );
 * 
 * // With custom fetcher
 * const fetchTruckDetails = async (url: string) => {
 *   const response = await fetch(url);
 *   return response.json();
 * };
 * 
 * const { dataWithFallback, refresh, isStale } = useSWRWithRecovery(
 *   `/api/trucks/${id}`,
 *   fetchTruckDetails,
 *   {
 *     fallbackData: { name: 'Loading...', id },
 *     revalidateIfStale: true,
 *     onError: (error) => console.error('Truck fetch failed:', error)
 *   }
 * );
 * ```
 */
export function useSWRWithRecovery<T>(
  key: string | null,
  fetcher?: ((key: string) => Promise<T>) | null,
  config: SWRRecoveryConfig<T> = {}
): SWRRecoveryResponse<T> {
  const {
    fallbackData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    revalidateIfStale = true,
    retryOptions,
    onError,
    onSuccess,
    ...swrConfig
  } = config;

  // Create enhanced fetcher with retry logic
  const enhancedFetcher = async (url: string): Promise<T> => {
    try {
      const data = fetcher 
        ? await fetcher(url)
        : await defaultFetcher(url, retryOptions) as T;
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    } catch (error) {
      if (onError) {
        onError(error);
      }
      
      // Log error for monitoring
      logError(error, 'SWR Fetch Error', {
        tags: { key: url, component: 'useSWRWithRecovery' }
      });
      
      throw error;
    }
  };

  // Configure SWR with recovery options
  const swrResponse = useSWR<T>(
    key,
    key ? enhancedFetcher : null,
    {
      fallbackData,
      revalidateOnFocus,
      revalidateOnReconnect,
      revalidateIfStale,
      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,
      // Keep data fresh for 5 minutes
      focusThrottleInterval: 5 * 60 * 1000,
      // Background revalidation
      refreshInterval: 0, // Disabled by default, can be overridden
      ...swrConfig
    }
  );

  const { data, error, isLoading, mutate } = swrResponse;

  // Determine if we're using fallback data
  const isUsingFallback = !data && !isLoading && Boolean(fallbackData);
  
  // Data is stale if we have an error but also have data (from cache)
  const isStale = Boolean(error && data);
  
  // Manual refresh function
  const refresh = async (): Promise<T | undefined> => {
    try {
      const result = await mutate();
      return result;
    } catch (error) {
      logError(error, 'Manual refresh failed', {
        tags: { key: key || 'unknown', component: 'useSWRWithRecovery' }
      });
      return undefined;
    }
  };

  // Get data with fallback
  const dataWithFallback = data ?? fallbackData;

  return {
    ...swrResponse,
    isUsingFallback,
    isStale,
    refresh,
    dataWithFallback
  };
}

/**
 * Hook for food trucks with built-in recovery mechanisms
 * 
 * @example
 * ```typescript
 * const { trucks, isLoading, error, isUsingFallback, refresh } = useFoodTrucks({
 *   revalidateOnFocus: true,
 *   retryOptions: { maxAttempts: 3, initialDelayMs: 1000 }
 * });
 * 
 * if (isUsingFallback) {
 *   // Show indicator that we're using cached/fallback data
 * }
 * ```
 */
export function useFoodTrucks(config: SWRRecoveryConfig<any[]> = {}) {
  const response = useSWRWithRecovery(
    '/api/trucks',
    null,
    {
      fallbackData: [],
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      retryOptions: {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000
      },
      ...config
    }
  );

  return {
    trucks: response.dataWithFallback || [],
    isLoading: response.isLoading,
    error: response.error,
    isUsingFallback: response.isUsingFallback,
    isStale: response.isStale,
    refresh: response.refresh,
    mutate: response.mutate
  };
}

/**
 * Hook for single food truck with recovery mechanisms
 * 
 * @param truckId - ID of the truck to fetch
 * @param config - SWR configuration with recovery options
 */
export function useFoodTruck(truckId: string | null, config: SWRRecoveryConfig<any> = {}) {
  const response = useSWRWithRecovery(
    truckId ? `/api/trucks/${truckId}` : null,
    null,
    {
      fallbackData: null,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      retryOptions: {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000
      },
      ...config
    }
  );

  return {
    truck: response.dataWithFallback,
    isLoading: response.isLoading,
    error: response.error,
    isUsingFallback: response.isUsingFallback,
    isStale: response.isStale,
    refresh: response.refresh,
    mutate: response.mutate
  };
}

/**
 * Hook for admin dashboard data with recovery mechanisms
 */
export function useAdminDashboard(config: SWRRecoveryConfig<any> = {}) {
  const response = useSWRWithRecovery(
    '/api/dashboard',
    null,
    {
      fallbackData: {
        totalTrucks: 0,
        qualityScore: 0,
        recentErrors: [],
        pipelineStatus: 'unknown'
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      retryOptions: {
        maxAttempts: 2,
        initialDelayMs: 2000
      },
      ...config
    }
  );

  return {
    dashboardData: response.dataWithFallback,
    isLoading: response.isLoading,
    error: response.error,
    isUsingFallback: response.isUsingFallback,
    isStale: response.isStale,
    refresh: response.refresh
  };
}
