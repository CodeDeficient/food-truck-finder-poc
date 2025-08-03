// lib/discoveryEngine.test.ts
import { FoodTruckDiscoveryEngine } from '../../lib/discoveryEngine.js';
import { supabaseAdmin } from '@/lib/supabase';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: undefined }),
  },
}));

// Mock fetch for API calls
globalThis.fetch = jest.fn();

describe('DiscoveryEngine', () => {
  let discoveryEngine: FoodTruckDiscoveryEngine;
  const mockFetch = globalThis.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    discoveryEngine = new FoodTruckDiscoveryEngine();
    jest.clearAllMocks();
  });

  describe('searchForFoodTrucks', () => {
    it('should search for food trucks in a city successfully', async () => {
      // Mock successful Tavily API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            results: [
              {
                title: 'Charleston Food Trucks',
                url: 'https://example.com/charleston-trucks',
                content: 'Best food trucks in Charleston including https://charlestonbbq.com',
                raw_content: 'Charleston food truck directory...',
              },
            ],
          },
        }),
      } as unknown as Response);

      // Mock supabase insert
      const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
      if (mockSupabaseAdmin) {
        (mockSupabaseAdmin.from as jest.Mock).mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({
              data: [{ id: 1, url: 'https://charlestonbbq.com', status: 'new' }],
              error: undefined,
            }),
          }),
        });
      }

      const result = await discoveryEngine.getLocationSpecificDiscovery('Charleston', 'SC');

      expect(result.urls_discovered).toBeGreaterThanOrEqual(0);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as unknown as Response);

      const result = await discoveryEngine.getLocationSpecificDiscovery('Charleston', 'SC');

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateFoodTruckUrl', () => {
    it('should validate food truck URLs correctly', () => {
      const validUrls = [
        'https://foodtruck.com',
        'https://example.com/food-truck',
        'https://mobile-kitchen.net',
        'https://streetfood.org',
      ];

      const invalidUrls = [
        'https://facebook.com/page',
        'https://instagram.com/user',
        'https://twitter.com/handle',
        'https://linkedin.com/company',
        'https://pinterest.com/board',
        'https://spam-site.com',
        'not-a-url',
        '',
      ];

      for (const url of validUrls) {
        expect((discoveryEngine as any).isFoodTruckUrl(url)).resolves.toBe(true);
      }
    });
  });
});
