// lib/discoveryEngine.test.ts
// @ts-expect-error TS(2724): '"./discoveryEngine"' has no exported member named... Remove this comment to see the full error message
import { DiscoveryEngine } from './discoveryEngine';
import { supabaseAdmin } from './supabase';

// Mock dependencies
jest.mock('./supabase', () => ({
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
  let discoveryEngine: DiscoveryEngine;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    discoveryEngine = new DiscoveryEngine();
    jest.clearAllMocks();
  });

  describe('searchForFoodTrucks', () => {
    it('should search for food trucks in a city successfully', () => {
      // Mock successful Tavily API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => ({
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
      } as Response);

      // Mock supabase insert
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 1, url: 'https://charlestonbbq.com', status: 'new' }],
            error: undefined,
          }),
        }),
      });

      const result = await discoveryEngine.searchForFoodTrucks('Charleston', 'SC');

      expect(result.success).toBe(true);
      expect(result.urls_discovered).toBeGreaterThan(0);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/tavily',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Charleston'),
        }),
      );
    });

    it('should handle API errors gracefully', () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await discoveryEngine.searchForFoodTrucks('Charleston', 'SC');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Tavily API error: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await discoveryEngine.searchForFoodTrucks('Charleston', 'SC');

      expect(result.success).toBe(false);
      expect(result.errors.some((error: any) => error.includes('Network error'))).toBe(true);
    });

    it('should extract URLs from search results', () => {
      const mockResults = [
        {
          title: 'Food Truck Directory',
          url: 'https://directory.com',
          content: 'Visit https://truck1.com and https://truck2.com for great food',
          raw_content: 'Also check out https://truck3.com',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => ({
          success: true,
          data: { results: mockResults },
        }),
      } as Response);

      // Mock URL extraction
      const extractedUrls = ['https://truck1.com', 'https://truck2.com', 'https://truck3.com'];
      jest.spyOn(discoveryEngine as any, 'extractUrlsFromText').mockReturnValue(extractedUrls);

      // Mock supabase operations
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: extractedUrls.map((url, i) => ({ id: i + 1, url, status: 'new' })),
            error: undefined,
          }),
        }),
      });

      const result = await discoveryEngine.searchForFoodTrucks('Charleston', 'SC');

      expect(result.urls_discovered).toBe(extractedUrls.length);
    });
  });

  describe('crawlDirectory', () => {
    it('should crawl a directory URL successfully', () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => ({
          success: true,
          data: {
            results: [
              {
                url: 'https://directory.com/page1',
                content: 'Food truck listings...',
              },
            ],
          },
        }),
      } as Response);

      const result = await discoveryEngine.crawlDirectory('https://foodtruckdirectory.com');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/firecrawl',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should handle crawl errors', () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await discoveryEngine.crawlDirectory('https://badurl.com');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Firecrawl API error: 500 Internal Server Error');
    });
  });

  describe('runDiscovery', () => {
    it('should run complete discovery process', () => {
      // Mock search results
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            success: true,
            data: {
              results: [
                {
                  title: 'Charleston Food Trucks',
                  url: 'https://charleston-directory.com',
                  content: 'Food truck directory with https://truck1.com',
                  raw_content: 'Directory content...',
                },
              ],
            },
          }),
        } as Response)
        // Mock crawl results
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            success: true,
            data: {
              results: [
                {
                  url: 'https://charleston-directory.com/page1',
                  content: 'More food trucks: https://truck2.com',
                },
              ],
            },
          }),
        } as Response);

      // Mock URL extraction
      jest
        .spyOn(discoveryEngine as any, 'extractUrlsFromText')
        .mockReturnValueOnce(['https://truck1.com'])
        .mockReturnValueOnce(['https://truck2.com']);

      // Mock supabase operations
      let callCount = 0;
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockImplementation(() => {
            callCount++;
            return Promise.resolve({
              data:
                callCount === 1
                  ? [{ id: 1, url: 'https://truck1.com', status: 'new' }]
                  : [{ id: 2, url: 'https://truck2.com', status: 'new' }],
              error: undefined,
            });
          }),
        }),
      });

      const cities = ['Charleston'];
      const result = await discoveryEngine.runDiscovery(cities);

      expect(result.success).toBe(true);
      expect(result.urls_discovered).toBeGreaterThan(0);
      expect(result.urls_stored).toBeGreaterThan(0);
    });

    it('should handle partial failures gracefully', () => {
      // Mock one successful search, one failed crawl
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => ({
            success: true,
            data: {
              results: [
                {
                  title: 'Directory',
                  url: 'https://good-directory.com',
                  content: 'Content with https://truck1.com',
                  raw_content: 'Raw content...',
                },
              ],
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        } as Response);

      // Mock URL extraction
      jest
        .spyOn(discoveryEngine as any, 'extractUrlsFromText')
        .mockReturnValue(['https://truck1.com']);

      // Mock supabase operations
      (supabaseAdmin.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 1, url: 'https://truck1.com', status: 'new' }],
            error: undefined,
          }),
        }),
      });

      const cities = ['Charleston'];
      const result = await discoveryEngine.runDiscovery(cities);

      expect(result.success).toBe(true); // Should still succeed partially
      expect(result.urls_discovered).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0); // Should have errors
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
        expect((discoveryEngine as any).validateFoodTruckUrl(url)).toBe(true);
      }

      for (const url of invalidUrls) {
        expect((discoveryEngine as any).validateFoodTruckUrl(url)).toBe(false);
      }
    });
  });

  describe('extractUrlsFromText', () => {
    it('should extract URLs from text content', () => {
      const text = `
        Check out these great food trucks:
        - Visit https://charlestonbbq.com for the best BBQ
        - Try https://taco-heaven.net for amazing tacos
        - Don't miss http://burger-paradise.com
        Also social media: https://facebook.com/page (should be filtered)
      `;

      const urls = (discoveryEngine as any).extractUrlsFromText(text);

      expect(urls).toContain('https://charlestonbbq.com');
      expect(urls).toContain('https://taco-heaven.net');
      expect(urls).toContain('http://burger-paradise.com');
      expect(urls).not.toContain('https://facebook.com/page');
    });

    it('should handle text with no URLs', () => {
      const text = 'This text has no URLs in it';
      const urls = (discoveryEngine as any).extractUrlsFromText(text);
      expect(urls).toHaveLength(0);
    });

    it('should handle malformed URLs', () => {
      const text = 'Visit htp://broken-url.com and https://valid-url.com';
      const urls = (discoveryEngine as any).extractUrlsFromText(text);
      expect(urls).toContain('https://valid-url.com');
      expect(urls).not.toContain('htp://broken-url.com');
    });
  });
});
