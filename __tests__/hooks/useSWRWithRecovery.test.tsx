import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { useSWRWithRecovery, useFoodTrucks, useFoodTruck, useAdminDashboard } from '@/lib/hooks/useSWRWithRecovery';

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock the logging utility
jest.mock('@/lib/logging', () => ({
  logError: jest.fn()
}));

// Mock the withRetry utility
jest.mock('@/lib/utils/withRetry', () => ({
  withRetry: jest.fn()
}));

import useSWR from 'swr';
import { logError } from '@/lib/logging';
import { withRetry } from '@/lib/utils/withRetry';

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockWithRetry = withRetry as jest.MockedFunction<typeof withRetry>;

// Mock fetch
const originalFetch = global.fetch;

describe('useSWRWithRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('basic functionality', () => {
    it('should return successful data', async () => {
      const mockData = { id: 1, name: 'Test Truck' };
      
      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false
      } as any);

      const { result } = renderHook(() =>
        useSWRWithRecovery('/api/test', null, {})
      );

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isUsingFallback).toBe(false);
      expect(result.current.isStale).toBe(false);
      expect(result.current.dataWithFallback).toEqual(mockData);
    });

    it('should use fallback data when no data and not loading', async () => {
      const fallbackData = { id: 0, name: 'Fallback Truck' };
      
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false
      } as any);

      const { result } = renderHook(() =>
        useSWRWithRecovery('/api/test', null, { fallbackData })
      );

      expect(result.current.data).toBeUndefined();
      expect(result.current.isUsingFallback).toBe(true);
      expect(result.current.dataWithFallback).toEqual(fallbackData);
    });

    it('should detect stale data when error exists with data', async () => {
      const mockData = { id: 1, name: 'Cached Truck' };
      const mockError = new Error('Network error');
      
      mockUseSWR.mockReturnValue({
        data: mockData,
        error: mockError,
        isLoading: false,
        mutate: jest.fn(),
        isValidating: false
      } as any);

      const { result } = renderHook(() =>
        useSWRWithRecovery('/api/test', null, {})
      );

      expect(result.current.isStale).toBe(true);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('error handling', () => {
    it('should call onError callback when fetcher fails', async () => {
      const mockError = new Error('Fetch failed');
      const onError = jest.fn();
      
      // Mock the enhanced fetcher to throw an error
      mockWithRetry.mockResolvedValue({
        success: false,
        error: mockError,
        attempts: 3,
        totalTimeMs: 1000
      });

      global.fetch = jest.fn().mockRejectedValue(mockError);

      mockUseSWR.mockImplementation((key, fetcher) => {
        // Simulate SWR calling the fetcher
        if (fetcher) {
          fetcher('/api/test').catch(() => {});
        }
        return {
          data: undefined,
          error: mockError,
          isLoading: false,
          mutate: jest.fn(),
          isValidating: false
        } as any;
      });

      renderHook(() =>
        useSWRWithRecovery('/api/test', null, { onError })
      );

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError);
      });
    });

    it('should call onSuccess callback when fetcher succeeds', async () => {
      const mockData = { id: 1, name: 'Success Truck' };
      const onSuccess = jest.fn();
      
      mockWithRetry.mockResolvedValue({
        success: true,
        data: mockData,
        attempts: 1,
        totalTimeMs: 500
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      mockUseSWR.mockImplementation((key, fetcher) => {
        // Simulate SWR calling the fetcher
        if (fetcher) {
          fetcher('/api/test');
        }
        return {
          data: mockData,
          error: undefined,
          isLoading: false,
          mutate: jest.fn(),
          isValidating: false
        } as any;
      });

      renderHook(() =>
        useSWRWithRecovery('/api/test', null, { onSuccess })
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });

    it('should log errors for monitoring', async () => {
      const mockError = new Error('Network failure');
      
      mockUseSWR.mockImplementation((key, fetcher) => {
        if (fetcher) {
          fetcher('/api/test').catch(() => {});
        }
        return {
          data: undefined,
          error: mockError,
          isLoading: false,
          mutate: jest.fn(),
          isValidating: false
        } as any;
      });

      renderHook(() =>
        useSWRWithRecovery('/api/test', null, {})
      );

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalledWith(
          mockError,
          'SWR Fetch Error',
          expect.objectContaining({
            tags: expect.objectContaining({
              key: '/api/test',
              component: 'useSWRWithRecovery'
            })
          })
        );
      });
    });
  });

  describe('refresh functionality', () => {
    it('should handle successful manual refresh', async () => {
      const mockData = { id: 1, name: 'Refreshed Truck' };
      const mockMutate = jest.fn().mockResolvedValue(mockData);
      
      mockUseSWR.mockReturnValue({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false
      } as any);

      const { result } = renderHook(() =>
        useSWRWithRecovery('/api/test', null, {})
      );

      const refreshedData = await result.current.refresh();
      
      expect(mockMutate).toHaveBeenCalled();
      expect(refreshedData).toEqual(mockData);
    });

    it('should handle failed manual refresh', async () => {
      const mockError = new Error('Refresh failed');
      const mockMutate = jest.fn().mockRejectedValue(mockError);
      
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: mockMutate,
        isValidating: false
      } as any);

      const { result } = renderHook(() =>
        useSWRWithRecovery('/api/test', null, {})
      );

      const refreshedData = await result.current.refresh();
      
      expect(refreshedData).toBeUndefined();
      expect(mockLogError).toHaveBeenCalledWith(
        mockError,
        'Manual refresh failed',
        expect.objectContaining({
          tags: expect.objectContaining({
            key: '/api/test',
            component: 'useSWRWithRecovery'
          })
        })
      );
    });
  });

  describe('custom fetcher', () => {
    it('should use custom fetcher when provided', async () => {
      const mockData = { id: 1, name: 'Custom Truck' };
      const customFetcher = jest.fn().mockResolvedValue(mockData);
      
      mockUseSWR.mockImplementation((key, fetcher) => {
        if (fetcher) {
          fetcher('/api/test');
        }
        return {
          data: mockData,
          error: undefined,
          isLoading: false,
          mutate: jest.fn(),
          isValidating: false
        } as any;
      });

      renderHook(() =>
        useSWRWithRecovery('/api/test', customFetcher, {})
      );

      await waitFor(() => {
        expect(customFetcher).toHaveBeenCalledWith('/api/test');
      });
    });
  });
});

describe('useFoodTrucks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return trucks data with default configuration', () => {
    const mockTrucks = [
      { id: 1, name: 'Truck 1' },
      { id: 2, name: 'Truck 2' }
    ];
    
    mockUseSWR.mockReturnValue({
      data: mockTrucks,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    const { result } = renderHook(() => useFoodTrucks());

    expect(result.current.trucks).toEqual(mockTrucks);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.isUsingFallback).toBe(false);
  });

  it('should use empty array as fallback', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    const { result } = renderHook(() => useFoodTrucks());

    expect(result.current.trucks).toEqual([]);
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('should configure retry options', () => {
    mockUseSWR.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    renderHook(() => useFoodTrucks());

    // Verify SWR was called with correct configuration
    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/trucks',
      expect.any(Function),
      expect.objectContaining({
        fallbackData: [],
        revalidateOnFocus: true,
        revalidateOnReconnect: true
      })
    );
  });
});

describe('useFoodTruck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch single truck data', () => {
    const mockTruck = { id: 1, name: 'Single Truck' };
    const truckId = '1';
    
    mockUseSWR.mockReturnValue({
      data: mockTruck,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    const { result } = renderHook(() => useFoodTruck(truckId));

    expect(result.current.truck).toEqual(mockTruck);
    expect(mockUseSWR).toHaveBeenCalledWith(
      `/api/trucks/${truckId}`,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('should not fetch when truckId is null', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    const { result } = renderHook(() => useFoodTruck(null));

    expect(result.current.truck).toBeNull();
    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });
});

describe('useAdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return dashboard data with default fallback', () => {
    const mockDashboard = {
      totalTrucks: 10,
      qualityScore: 85,
      recentErrors: [],
      pipelineStatus: 'active'
    };
    
    mockUseSWR.mockReturnValue({
      data: mockDashboard,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    const { result } = renderHook(() => useAdminDashboard());

    expect(result.current.dashboardData).toEqual(mockDashboard);
    expect(result.current.isLoading).toBe(false);
  });

  it('should use fallback data for admin dashboard', () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    const { result } = renderHook(() => useAdminDashboard());

    expect(result.current.dashboardData).toEqual({
      totalTrucks: 0,
      qualityScore: 0,
      recentErrors: [],
      pipelineStatus: 'unknown'
    });
    expect(result.current.isUsingFallback).toBe(true);
  });

  it('should configure refresh interval', () => {
    mockUseSWR.mockReturnValue({
      data: {},
      error: undefined,
      isLoading: false,
      mutate: jest.fn(),
      isValidating: false
    } as any);

    renderHook(() => useAdminDashboard());

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/api/dashboard',
      expect.any(Function),
      expect.objectContaining({
        refreshInterval: 30000
      })
    );
  });
});
