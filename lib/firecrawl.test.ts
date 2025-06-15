// lib/firecrawl.test.ts

// Remove unused import
// import { FirecrawlService } from './firecrawl';

// Mock global fetch
globalThis.fetch = jest.fn();

describe('FirecrawlService', () => {
  const mockApiKey = 'test-firecrawl-api-key';

  beforeEach(() => {
    // Reset mocks and service instance before each test
    (globalThis.fetch as jest.Mock).mockClear();
    process.env.FIRECRAWL_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.FIRECRAWL_API_KEY;
  });

  describe('scrapeUrl', () => {
    it('should correctly call the Firecrawl API and return markdown data on success', () => {
      // Mock successful fetch response for scrapeUrl
      // Assert that fetch was called with the correct URL, method, headers, and body
      // Assert that the method returns the expected data structure
    });

    it('should handle API errors gracefully for scrapeUrl', () => {
      // Mock failed fetch response (e.g., 400, 500 error)
      // Assert that the method returns success: false and an error message
    });
    it('should handle network errors gracefully for scrapeUrl', () => {
      // Mock fetch to throw a network error
      // Assert that the method returns success: false and an error message
    });
  });

  describe('scrapeFoodTruckWebsite', () => {
    // This method now primarily calls scrapeUrl and returns markdown + basic metadata
    it('should call scrapeUrl with correct parameters and return its markdown and metadata', () => {
      // Mock firecrawlService.scrapeUrl to return a successful response with markdown and metadata
      // Call scrapeFoodTruckWebsite
      // Assert that scrapeUrl was called with markdown format and other relevant options
      // Assert that scrapeFoodTruckWebsite returns the expected structure
    });

    it('should return an error if scrapeUrl fails or returns no markdown', () => {
      // Mock firecrawlService.scrapeUrl to return a failure or no markdown
      // Call scrapeFoodTruckWebsite
      // Assert that it returns success: false and an appropriate error message
    });
  });

  // Add more tests for other methods like crawlWebsite, getCrawlStatus if they are actively used
  // and need robust testing. Consider testing retry logic in scrapeWithRetry.
});
