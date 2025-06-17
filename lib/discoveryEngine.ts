// lib/discoveryEngine.ts
import { supabaseAdmin } from './supabase';
import { SC_TARGET_CITIES, DISCOVERY_CONFIG } from './config';

export interface DiscoveredUrl {
  url: string;
  source_directory_url?: string;
  region?: string;
  status: 'new' | 'processing' | 'processed' | 'irrelevant';
  notes?: string;
}

export interface DiscoveryResult {
  urls_discovered: number;
  urls_stored: number;
  urls_duplicates: number;
  errors: string[];
}

/**
 * Autonomous Discovery Engine
 *
 * This engine discovers new food truck websites across South Carolina using Tavily for search
 * and Firecrawl for crawling. It operates autonomously without human intervention, finding and
 * validating new URLs to add to the discovered_urls table for subsequent scraping.
 *
 * Strategy:
 * 1. Search for food trucks in each SC city using Tavily search
 * 2. Find food truck directories and event listings using Firecrawl crawling
 * 3. Extract individual food truck website URLs from discovered content
 * 4. Validate and filter URLs to avoid false positives
 * 5. Store new URLs in discovered_urls table for processing
 *
 * NOTE: Uses Tavily for search operations and Firecrawl for crawling/scraping
 */

// Helper functions to call APIs
// Use Tavily for search, Firecrawl for crawling/scraping
interface TavilySearchResult {
  url: string;
  content?: string;
  raw_content?: string;
}

async function tavilySearch(
  query: string,
  options: Record<string, unknown> = {},
): Promise<TavilySearchResult[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const response = await fetch(`${baseUrl}/api/tavily`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'search',
      params: {
        query,
        limit: options.limit ?? 10,
        ...options,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.statusText}`);
  }

  const result = (await response.json()) as {
    data?: { results?: TavilySearchResult[] };
    results?: TavilySearchResult[];
  };
  return result.data?.results ?? result.results ?? [];
}

interface CrawlResult {
  url: string;
}

async function firecrawlCrawl(
  url: string,
  options: Record<string, unknown> = {},
): Promise<CrawlResult[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3003';
  const response = await fetch(`${baseUrl}/api/firecrawl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      operation: 'crawl',
      url,
      options: {
        maxDepth: options.maxDepth ?? 2,
        limit: options.limit ?? 20,
        ...options,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Firecrawl crawl failed: ${response.statusText}`);
  }

  const result = (await response.json()) as { data: CrawlResult[] };
  return result.data ?? [];
}

export class FoodTruckDiscoveryEngine {
  private readonly searchTerms = [
    'food truck South Carolina',
    'mobile food vendor SC',
    'food truck Charleston',
    'food truck Columbia SC',
    'food truck Greenville SC',
    'street food South Carolina',
    'food truck directory SC',
  ];

  private readonly directoryUrls = [
    'https://www.foodtrucksin.com/south-carolina',
    'https://www.roaminghunger.com/sc/',
    'https://southcarolinafoodtrucks.com',
    'https://www.yelp.com/sc/food-trucks',
  ];

  // Helper method to process search results
  private async processSearchResults(
    searchResults: TavilySearchResult[],
    discoveredUrls: Set<string>,
  ): Promise<void> {
    for (const result of searchResults) {
      if (result.url && (await this.isFoodTruckUrl(result.url))) {
        discoveredUrls.add(result.url);
      }

      // Extract URLs from content
      if (result.content != undefined || result.raw_content != undefined) {
        const content = result.content ?? result.raw_content ?? '';
        const extractedUrls = this.extractFoodTruckUrls(content);
        for (const url of extractedUrls) {
          if (await this.isFoodTruckUrl(url)) {
            discoveredUrls.add(url);
          }
        }
      }
    }
  }

  // Helper method to perform search term discovery
  private async performSearchTermDiscovery(
    discoveredUrls: Set<string>,
    results: DiscoveryResult,
  ): Promise<void> {
    for (const searchTerm of this.searchTerms) {
      try {
        console.info(`🔍 Searching for: ${searchTerm}`);

        const searchResults = await tavilySearch(searchTerm, {
          limit: DISCOVERY_CONFIG.searchResultsLimit,
        });

        if (searchResults != undefined && searchResults.length > 0) {
          await this.processSearchResults(searchResults, discoveredUrls);
        }
      } catch (error) {
        console.error(`❌ Search failed for "${searchTerm}":`, error);
        results.errors.push(
          `Search failed for "${searchTerm}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      await this.delay(DISCOVERY_CONFIG.rateLimitDelayMs);
    }
  }

  // Helper method to perform directory crawling
  private async performDirectoryCrawling(
    discoveredUrls: Set<string>,
    results: DiscoveryResult,
  ): Promise<void> {
    for (const directoryUrl of this.directoryUrls) {
      await this.crawlSingleDirectory(directoryUrl, discoveredUrls, results);
      await this.delay(DISCOVERY_CONFIG.rateLimitDelayMs);
    }
  }

  // Helper method to crawl a single directory
  private async crawlSingleDirectory(
    directoryUrl: string,
    discoveredUrls: Set<string>,
    results: DiscoveryResult,
  ): Promise<void> {
    try {
      console.info(`🕷️ Crawling directory: ${directoryUrl}`);

      const crawlResults = await firecrawlCrawl(directoryUrl, {
        maxDepth: DISCOVERY_CONFIG.maxDepthCrawl,
        limit: DISCOVERY_CONFIG.maxUrlsPerRun,
      });

      await this.processCrawlResults(crawlResults, discoveredUrls);
    } catch (error) {
      console.error(`❌ Crawl failed for ${directoryUrl}:`, error);
      results.errors.push(
        `Crawl failed for ${directoryUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Helper method to process crawl results
  private async processCrawlResults(
    crawlResults: unknown,
    discoveredUrls: Set<string>,
  ): Promise<void> {
    if (crawlResults != undefined && Array.isArray(crawlResults) && crawlResults.length > 0) {
      for (const result of crawlResults) {
        if (typeof result === 'object' && result !== null && 'url' in result) {
          const resultUrl = (result as { url?: string }).url;
          if (
            resultUrl != undefined &&
            typeof resultUrl === 'string' &&
            (await this.isFoodTruckUrl(resultUrl))
          ) {
            discoveredUrls.add(resultUrl);
          }
        }
      }
    }
  }

  // Helper method to perform location-specific discovery
  private async performLocationDiscovery(
    discoveredUrls: Set<string>,
    results: DiscoveryResult,
  ): Promise<void> {
    for (const city of SC_TARGET_CITIES) {
      await this.searchSingleCity(city, discoveredUrls, results);
      await this.delay(DISCOVERY_CONFIG.rateLimitDelayMs);
    }
  }

  // Helper method to search a single city
  private async searchSingleCity(
    city: string,
    discoveredUrls: Set<string>,
    results: DiscoveryResult,
  ): Promise<void> {
    try {
      console.info(`📍 Searching for food trucks in ${city}, SC`);
      const locationQuery = `food trucks in ${city} South Carolina`;
      const searchResults = await tavilySearch(locationQuery, {
        limit: 5,
      });

      await this.processLocationSearchResults(searchResults, discoveredUrls);
    } catch (error) {
      console.error(`❌ Location search failed for ${city}:`, error);
      results.errors.push(
        `Location search failed for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Helper method to process location search results
  private async processLocationSearchResults(
    searchResults: unknown,
    discoveredUrls: Set<string>,
  ): Promise<void> {
    if (searchResults != undefined && Array.isArray(searchResults) && searchResults.length > 0) {
      for (const result of searchResults) {
        if (typeof result === 'object' && result !== null && 'url' in result) {
          const resultUrl = (result as { url?: string }).url;
          if (
            resultUrl != undefined &&
            typeof resultUrl === 'string' &&
            (await this.isFoodTruckUrl(resultUrl))
          ) {
            discoveredUrls.add(resultUrl);
          }
        }
      }
    }
  }

  // Helper method to store discovered URLs from discovery process
  private async storeDiscoveredUrlsFromDiscovery(
    discoveredUrls: Set<string>,
    results: DiscoveryResult,
  ): Promise<void> {
    for (const url of discoveredUrls) {
      try {
        const stored = await this.storeDiscoveredUrl(url, 'autonomous_search', {
          search_context: 'full_discovery',
          discovery_timestamp: new Date().toISOString(),
        });
        if (stored.isNew === true) {
          results.urls_stored++;
        } else {
          results.urls_duplicates++;
        }
      } catch (error) {
        console.error(`❌ Failed to store URL ${url}:`, error);
        results.errors.push(
          `Failed to store URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  async discoverNewFoodTrucks(): Promise<DiscoveryResult> {
    console.info('🔍 Starting autonomous food truck discovery...');

    const results: DiscoveryResult = {
      urls_discovered: 0,
      urls_stored: 0,
      urls_duplicates: 0,
      errors: [],
    };

    const discoveredUrls = new Set<string>();

    // 1. Search for food trucks using Tavily search
    await this.performSearchTermDiscovery(discoveredUrls, results);

    // 2. Crawl known food truck directory sites
    await this.performDirectoryCrawling(discoveredUrls, results);

    // 3. Location-specific discovery for SC cities
    await this.performLocationDiscovery(discoveredUrls, results);

    results.urls_discovered = discoveredUrls.size;
    console.info(`🎯 Discovered ${results.urls_discovered} potential food truck URLs`);

    // 4. Store new URLs in database
    await this.storeDiscoveredUrlsFromDiscovery(discoveredUrls, results);

    console.info(
      `✅ Discovery complete: ${results.urls_stored} new URLs stored, ${results.urls_duplicates} duplicates skipped`,
    );

    return results;
  }
  private extractFoodTruckUrls(content: string): string[] {
    const urls: string[] = [];

    // Look for URL patterns in content - using a safer regex to avoid backtracking
    const urlRegex = /https?:\/\/[^\s<>"']{1,200}/g;
    const foundUrls = content.match(urlRegex) ?? [];

    for (const url of foundUrls) {
      try {
        // Basic URL validation
        new URL(url);
        // Remove trailing punctuation - using safer regex to avoid backtracking
        const cleanUrl = url.replace(/[.,;!?]$/, '');
        urls.push(cleanUrl);
      } catch {
        // Invalid URL, skip
        continue;
      }
    }

    return urls;
  }

  private async isFoodTruckUrl(url: string): Promise<boolean> {
    try {
      // Basic URL validation
      new URL(url);

      // Food truck indicators in URL
      const foodTruckKeywords = [
        'food-truck',
        'foodtruck',
        'mobile-food',
        'street-food',
        'truck',
        'kitchen',
        'eats',
        'bbq',
        'burger',
        'taco',
        'catering',
        'mobile',
        'chef',
        'bistro',
        'cafe',
      ];

      // Blacklist - skip these domains
      const blacklistKeywords = [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'linkedin.com',
        'youtube.com',
        'yelp.com',
        'google.com',
        'maps.google.com',
        'foursquare.com',
        'tripadvisor.com',
        'zomato.com',
        'eventbrite.com',
        'meetup.com',
      ];

      const urlLower = url.toLowerCase();

      // Skip social media and review sites
      if (blacklistKeywords.some((keyword) => urlLower.includes(keyword))) {
        return false;
      }

      // Check if we already have this URL in discovered_urls
      if (supabaseAdmin == undefined) {
        return false;
      }

      const { data: existingDiscovered } = await supabaseAdmin
        .from('discovered_urls')
        .select('id')
        .eq('url', url)
        .limit(1);

      if (existingDiscovered != undefined && existingDiscovered.length > 0) {
        return false; // Already discovered
      }

      // Check if we already have this URL in food_trucks
      const { data: existingTrucks } = await supabaseAdmin
        .from('food_trucks')
        .select('id')
        .contains('source_urls', [url])
        .limit(1);

      if (existingTrucks != undefined && existingTrucks.length > 0) {
        return false; // Already have this URL
      }

      // Accept if has food truck keywords or if it's a business domain
      return (
        foodTruckKeywords.some((keyword) => urlLower.includes(keyword)) ||
        (/\.(com|net|org|biz|info)/.test(urlLower) &&
          !urlLower.includes('blog') &&
          !urlLower.includes('news'))
      );
    } catch (error) {
      console.error('Error validating food truck URL:', error);
      return false;
    }
  }

  async getLocationSpecificDiscovery(city: string, state: string = 'SC'): Promise<DiscoveryResult> {
    console.info(`🔍 Starting location-specific discovery for ${city}, ${state}`);

    const locationQuery = `food trucks in ${city} ${state}`;
    const results: DiscoveryResult = {
      urls_discovered: 0,
      urls_stored: 0,
      urls_duplicates: 0,
      errors: [],
    };

    const discoveredUrls = new Set<string>();

    try {
      await this.performLocationSpecificSearch(locationQuery, discoveredUrls);
      results.urls_discovered = discoveredUrls.size;
      await this.storeLocationDiscoveryResults(discoveredUrls, locationQuery, city, state, results);
    } catch (error) {
      console.error(`❌ Location search failed for ${city}:`, error);
      results.errors.push(
        `Location search failed for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    console.info(
      `✅ Location discovery complete for ${city}: ${results.urls_stored} new URLs stored`,
    );
    return results;
  }

  // Helper method to perform location-specific search
  private async performLocationSpecificSearch(
    locationQuery: string,
    discoveredUrls: Set<string>,
  ): Promise<void> {
    const searchResults = await tavilySearch(locationQuery, { limit: 15 });

    if (searchResults != undefined && searchResults.length > 0) {
      for (const result of searchResults) {
        await this.processSearchResult(result, discoveredUrls);
      }
    }
  }

  // Helper method to process a single search result
  private async processSearchResult(result: unknown, discoveredUrls: Set<string>): Promise<void> {
    if (typeof result === 'object' && result !== null && 'url' in result) {
      const resultUrl = (result as { url?: string }).url;
      if (resultUrl && (await this.isFoodTruckUrl(resultUrl))) {
        discoveredUrls.add(resultUrl);
      }

      // Extract URLs from content
      await this.extractUrlsFromContent(result, discoveredUrls);
    }
  }

  // Helper method to extract URLs from content
  private async extractUrlsFromContent(
    result: unknown,
    discoveredUrls: Set<string>,
  ): Promise<void> {
    if (typeof result === 'object' && result != undefined) {
      const resultObj = result as { content?: string; raw_content?: string };
      if (resultObj.content || resultObj.raw_content) {
        const content = resultObj.content ?? resultObj.raw_content ?? '';
        const extractedUrls = this.extractFoodTruckUrls(content);
        for (const url of extractedUrls) {
          if (await this.isFoodTruckUrl(url)) {
            discoveredUrls.add(url);
          }
        }
      }
    }
  }

  // Helper method to store location discovery results
  private async storeLocationDiscoveryResults(
    discoveredUrls: Set<string>,
    locationQuery: string,
    city: string,
    state: string,
    results: DiscoveryResult,
  ): Promise<void> {
    for (const url of discoveredUrls) {
      try {
        const stored = await this.storeDiscoveredUrl(url, 'tavily_search', {
          search_query: locationQuery,
          target_city: city,
          target_state: state,
        });
        if (stored.isNew === true) {
          results.urls_stored++;
        } else {
          results.urls_duplicates++;
        }
      } catch (error) {
        console.error(`❌ Failed to store URL ${url}:`, error);
        results.errors.push(
          `Failed to store URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Store multiple discovered URLs with metadata
   */
  async storeDiscoveredUrls(
    urls: string[],
    discoveryMethod: string = 'manual',
    metadata: Record<string, unknown> = {},
  ): Promise<{
    urls_stored: number;
    urls_duplicates: number;
    errors: string[];
  }> {
    const result: {
      urls_stored: number;
      urls_duplicates: number;
      errors: string[];
    } = {
      urls_stored: 0,
      urls_duplicates: 0,
      errors: [],
    };

    for (const url of urls) {
      try {
        const stored = await this.storeDiscoveredUrl(url, discoveryMethod, metadata);
        if (stored.isNew === true) {
          result.urls_stored++;
        } else {
          result.urls_duplicates++;
        }
      } catch (error) {
        const errorMsg = `Failed to store URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return result;
  }

  /**
   * Enhanced store method with discovery method and metadata
   */
  private async storeDiscoveredUrl(
    url: string,
    discoveryMethod: string = 'manual',
    metadata: Record<string, unknown> = {},
  ): Promise<{ isNew: boolean }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      // Check if URL already exists
      const { data: existing } = await supabaseAdmin
        .from('discovered_urls')
        .select('id')
        .eq('url', url)
        .limit(1);

      if (existing && existing.length > 0) {
        return { isNew: false };
      }

      // Store new URL - handle missing columns gracefully
      const insertData: Record<string, unknown> = {
        url,
        status: 'new',
        notes: `Discovered via ${discoveryMethod}`,
      };

      // Add optional columns only if they exist in the table
      try {
        // Check if discovery_method column exists
        const { error: testError } = await supabaseAdmin
          .from('discovered_urls')
          .select('discovery_method')
          .limit(1);

        if (!testError) {
          insertData.discovery_method = discoveryMethod;
          insertData.region = 'SC';
          insertData.metadata = metadata;
        }
      } catch {
        // Column doesn't exist, continue without it
        console.info('Some columns missing in discovered_urls table, using basic structure');
      }

      const { error } = await supabaseAdmin.from('discovered_urls').insert(insertData);

      if (error) {
        throw error;
      }

      return { isNew: true };
    } catch (error) {
      console.error('Error storing discovered URL:', error);
      throw error;
    }
  }

  /**
   * Search for food truck directories
   */
  async searchFoodTruckDirectories(
    query: string = 'food truck directory South Carolina',
  ): Promise<TavilySearchResult[]> {
    try {
      return await tavilySearch(query, { limit: 10 });
    } catch (error) {
      console.error('Error searching food truck directories:', error);
      return [];
    }
  }

  /**
   * Search for food truck websites
   */
  async searchFoodTruckWebsites(query: string): Promise<TavilySearchResult[]> {
    try {
      return await tavilySearch(query, { limit: 15 });
    } catch (error) {
      console.error('Error searching food truck websites:', error);
      return [];
    }
  }
}

export const discoveryEngine = new FoodTruckDiscoveryEngine();
