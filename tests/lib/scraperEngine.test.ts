// lib/scraperEngine.test.ts
import { ScraperEngine, GeminiDataProcessor } from '@/lib/ScraperEngine.ts';
import { firecrawl } from '@/lib/firecrawl.ts';

// Mock firecrawl
jest.mock('@/lib/firecrawl', () => ({
  firecrawl: {
    scrapeUrl: jest.fn(),
  },
}));

const mockedFirecrawl = firecrawl as jest.Mocked<typeof firecrawl>;

// Mock fetch for fallback scraping
globalThis.fetch = jest.fn();

describe('ScraperEngine', () => {
  let scraperEngine: ScraperEngine;
  const mockFetch = globalThis.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    scraperEngine = new ScraperEngine();
    jest.clearAllMocks();
  });

  describe('scrapeWebsite', () => {
    it('should scrape website using Firecrawl successfully', async () => {
      const mockFirecrawlResponse = {
        success: true,
        data: {
          markdown: '# Food Truck Name\nGreat food truck serving delicious meals.',
          html: '<h1>Food Truck Name</h1><p>Great food truck serving delicious meals.</p>',
          metadata: { title: 'Food Truck Name', description: 'Best food truck in town' },
        },
      };

      mockedFirecrawl.scrapeUrl.mockResolvedValue(mockFirecrawlResponse);

      const result = await scraperEngine.scrapeWebsite('https://example-foodtruck.com');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        markdown: '# Food Truck Name\nGreat food truck serving delicious meals.',
        html: '<h1>Food Truck Name</h1><p>Great food truck serving delicious meals.</p>',
        metadata: { title: 'Food Truck Name', description: 'Best food truck in town' },
      });
      expect(result.source).toBe('https://example-foodtruck.com');
      expect(mockedFirecrawl.scrapeUrl).toHaveBeenCalledWith('https://example-foodtruck.com', {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      });
    });

    it('should fallback to fetch when Firecrawl fails', async () => {
      const mockHtmlContent = '<html><body><h1>Food Truck</h1></body></html>';

      mockedFirecrawl.scrapeUrl.mockResolvedValue({
        success: false,
        error: 'Firecrawl failed',
      });

      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(mockHtmlContent),
      } as Response);

      const result = await scraperEngine.scrapeWebsite('https://example-foodtruck.com');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        html: mockHtmlContent,
        is_fallback: true,
      });
      expect(result.note).toBe('Fetched using basic fetch as Firecrawl failed.');
    });
  });

  describe('scrapeSocialMedia', () => {
    it('should scrape Instagram handle', async () => {
      const result = await scraperEngine.scrapeSocialMedia('instagram', 'foodtruckhandle');

      expect(result.success).toBe(true);
      expect(result.source).toBe('instagram:foodtruckhandle');
    }, 10000);

    it('should scrape Facebook handle', async () => {
      const result = await scraperEngine.scrapeSocialMedia('facebook', 'foodtruckpage');

      expect(result.success).toBe(true);
      expect(result.source).toBe('facebook:foodtruckpage');
    });

    it('should scrape Twitter handle', async () => {
      const result = await scraperEngine.scrapeSocialMedia('twitter', 'foodtrucktweet');

      expect(result.success).toBe(true);
      expect(result.source).toBe('twitter:foodtrucktweet');
    }, 10000);

    it('should handle unsupported platform', async () => {
      const result = await scraperEngine.scrapeSocialMedia('unsupported', 'handle');

      expect(result.success).toBe(false);
      expect(result.error).toBe('That didn\'t work, please try again later.');
    });
  });
});

describe('GeminiDataProcessor', () => {
  let processor: GeminiDataProcessor;

  beforeEach(() => {
    processor = new GeminiDataProcessor('test-api-key');
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', () => {
      const stats = processor.getUsageStats();

      expect(stats).toHaveProperty('requests');
      expect(stats).toHaveProperty('tokens');
      expect(stats.requests).toHaveProperty('used');
      expect(stats.requests).toHaveProperty('limit');
      expect(stats.requests).toHaveProperty('remaining');
    });
  });
});
