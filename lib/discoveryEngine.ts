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

/**
* Executes a search request against the Tavily API.
* @example
* tavilySearch('example query', { limit: 5 })
* // returns array of TavilySearchResult objects
* @param {string} query - The search query string.
* @param {Record<string, unknown>} options - Optional configurations such as 'limit' to restrict the number of results.
* @returns {Promise<TavilySearchResult[]>} Promise resolving to an array of search results.
* @description
*   - Defaults to 10 results if 'limit' is not specified in options.
*   - Throws an error if the API response is not successful.
*   - Combines 'query' and other options into a request payload.
*   - Uses environment variable NEXT_PUBLIC_APP_URL for base URL, or defaults to 'http://localhost:3003'.
*/
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

/**
* Initiates a web crawling operation asynchronously via Firecrawl API and returns the resulting data.
* @example
* firecrawlCrawl('https://example.com', { maxDepth: 3, limit: 50 })
* // Returns a Promise resolving to an array of CrawlResult objects.
* @param {string} url - The URL of the website to initiate the crawl.
* @param {Record<string, unknown>} options - Optional parameters to customize the crawling operation. Default values are maxDepth: 2 and limit: 20.
* @returns {Promise<CrawlResult[]>} Promise resolving to an array of resulting data from the crawl operation.
* @description
*   - Utilizes server URL from environment variable NEXT_PUBLIC_APP_URL or defaults to 'http://localhost:3003'.
*   - Sends a POST request to the '/api/firecrawl' endpoint with specified crawl operation settings.
*   - Throws an error if the HTTP response status is not OK indicating a failure in the crawl operation.
*/
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
  /**
   * Processes search results to discover and store food truck URLs.
   * @example
   * processSearchResults([{ url: 'http://example.com', content: '...' }], new Set())
   * // No return value; `discoveredUrls` will contain food truck URLs.
   * @param {TavilySearchResult[]} searchResults - An array of search result objects each possibly containing a URL and content.
   * @param {Set<string>} discoveredUrls - A set to store discovered food truck URLs.
   * @returns {Promise<void>} No return value; operates by modifying the `discoveredUrls` set.
   * @description
   *   - URLs are checked for validity as food truck URLs before being added to the set.
   *   - Extracts URLs from either the `content` or `raw_content` fields.
   *   - Uses asynchronous URL validation.
   */
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
  /**
   * Performs search term discovery using the specified search terms.
   * @example
   * performSearchTermDiscovery(new Set(), discoveryResult)
   * No specific return value, performs actions on `discoveredUrls` and `results`.
   * @param {Set<string>} discoveredUrls - A set to store discovered URLs that have been processed.
   * @param {DiscoveryResult} results - An object to accumulate results and errors stemming from the discovery process.
   * @returns {Promise<void>} Returns a promise that resolves when search term discovery is complete.
   * @description
   *   - Utilizes a search function `tavilySearch` to find results based on search terms.
   *   - Incorporates error handling and logs errors to `results.errors`.
   *   - Implements rate limiting by delaying subsequent searches using `DISCOVERY_CONFIG.rateLimitDelayMs`.
   *   - Processes search results using the `processSearchResults` method if valid results are found.
   */
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
  /**
   * Crawls a single directory and processes discovered URLs.
   * @example
   * crawlSingleDirectory('http://example.com', new Set(), resultsInstance)
   * void
   * @param {string} directoryUrl - The URL of the directory to be crawled.
   * @param {Set<string>} discoveredUrls - A set to store URLs discovered during the crawl.
   * @param {DiscoveryResult} results - An object to store the results and errors of the crawl process.
   * @returns {Promise<void>} Resolves when crawl and processing are complete.
   * @description
   *   - Uses a third-party library, `firecrawlCrawl`, for the crawling operation.
   *   - Handles errors by logging and storing error messages in the results object.
   *   - Limits the depth and number of URLs explored based on configuration.
   */
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
  /**
   * Processes the results from a web crawl and adds discovered URLs to a set if they meet certain criteria.
   * @example
   * processCrawlResults(crawlResults, discoveredUrls)
   * // adds qualifying URLs to the discoveredUrls set
   * @param {unknown} crawlResults - The results obtained from the crawling operation.
   * @param {Set<string>} discoveredUrls - A set to store URLs discovered during processing.
   * @returns {Promise<void>}
   * @description
   *   - Only accepts results that are valid non-empty arrays.
   *   - Checks each item to ensure it's an object containing a 'url' property.
   *   - Uses a helper function isFoodTruckUrl to decide if a URL should be added to the set.
   */
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
  /**
  * Initiates a search for food trucks within a specified city in South Carolina.
  * @example
  * searchSingleCity("Charleston", discoveredUrls, results)
  * // Returns undefined but processes the data internally and updates results object.
  * @param {string} city - The name of the city where food trucks are to be searched.
  * @param {Set<string>} discoveredUrls - A Set to keep track of URLs that have been discovered during the search.
  * @param {DiscoveryResult} results - Object to store errors and possibly other results related to the discovery process.
  * @returns {Promise<void>} Resolves after processing the search results.
  * @description
  *   - Uses `tavilySearch` function to perform the location-based search with a limit of 5 results.
  *   - Handles errors by logging them and updating the results object with error messages.
  *   - Assumes South Carolina as the default state for city searches.
  */
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
  /**
   * Processes search results to discover specific URLs and add them to a set.
   * @example
   * processLocationSearchResults(searchResults, discoveredUrls);
   * // The set discoveredUrls will be populated with food truck URLs from searchResults
   * @param {unknown} searchResults - Array of search result objects potentially containing URLs.
   * @param {Set<string>} discoveredUrls - Set used to collect discovered food truck URLs.
   * @returns {Promise<void>} Resolves when all URLs are processed and added to the set.
   * @description
   *   - Ensures the searchResults contain an array of objects with valid URL properties.
   *   - Filters URLs through isFoodTruckUrl method before adding them to discoveredUrls.
   */
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
  /**
   * Stores a set of discovered URLs from a discovery process into a database.
   * @example
   * storeDiscoveredUrlsFromDiscovery(new Set(['http://example.com', 'http://example.org']), discoveryResult)
   * // No return value (undefined).
   * @param {Set<string>} discoveredUrls - A set of URLs that have been discovered and need to be stored.
   * @param {DiscoveryResult} results - An object to track and accumulate errors encountered during storage.
   * @returns {Promise<void>} Resolves when all URLs are processed and stored.
   * @description
   *   - This function iterates over a set of URLs and stores each individually.
   *   - Errors encountered during the storage process are logged and appended to the provided results object.
   *   - Utilizes an asynchronous operation to store URLs and handle potential failures gracefully.
   */
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
          results.urls_stored += 1;
        } else {
          results.urls_duplicates += 1;
        }
      } catch (error) {
        console.error(`❌ Failed to store URL ${url}:`, error);
        results.errors.push(
          `Failed to store URL ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  /**
  * Initiates autonomous discovery of new food truck URLs.
  * @example
  * discoverNewFoodTrucks()
  * Returns a Promise resolving to a DiscoveryResult object.
  * @param {none} No parameters required.
  * @returns {Promise<DiscoveryResult>} An object containing the counts of discovered, stored, and duplicate URLs and any errors encountered.
  * @description
  *   - Utilizes multiple discovery methods: search term, directory crawling, and location-specific search.
  *   - Aggregates discovered URLs in a Set to ensure uniqueness.
  *   - Logs informative messages regarding the discovery and storage process.
  *   - Handles the storage of newly discovered URLs and logs duplicates.
  */
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
  /**
   * Extracts valid URLs from a given string content.
   * @example
   * extractFoodTruckUrls("Check out these two links: https://foodtrucklink.com/menu, and https://anotherlink.com!")
   * ["https://foodtrucklink.com/menu", "https://anotherlink.com"]
   * @param {string} content - The textual content from which URLs are extracted.
   * @returns {string[]} An array of valid URLs extracted from the content.
   * @description
   *   - Utilizes a regular expression pattern to identify potential URLs.
   *   - Performs basic URL validation using the URL constructor.
   *   - Cleans up URLs by removing trailing punctuation such as periods, commas, semicolons, etc.
   *   - Skips invalid URLs identified during the validation process.
   */
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

  /**
   * Checks if a given URL is related to a food truck.
   * @example
   * isFoodTruckUrl("https://bestfoodtruck.com")
   * true
   * @param {string} url - The URL to validate and check against known food truck patterns.
   * @returns {Promise<boolean>} True if the URL is likely related to a food truck, false otherwise.
   * @description
   *   - Uses keyword matching to detect food truck-related URLs.
   *   - Excludes common social media and review domains via blacklist.
   *   - Validates if the URL is already present in `discovered_urls` or `food_trucks` database.
   *   - Accepts common business domains not typically associated with blogs or news sites.
   */
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

  /**
   * Initiates a discovery process for food trucks in the specified city and state.
   * @example
   * getLocationSpecificDiscovery('Charleston', 'SC')
   * Promise <DiscoveryResult> {urls_discovered: 5, urls_stored: 4, urls_duplicates: 1, errors: []}
   * @param {string} city - The city where the search is to be performed.
   * @param {string} [state='SC'] - The state where the search is to be performed; defaults to 'SC'.
   * @returns {Promise<DiscoveryResult>} An object containing the discovery results and any errors encountered.
   * @description
   *   - Logs the initiation and completion of the discovery process with results.
   *   - Performs the search using a specified query and stores new URLs found.
   *   - Captures and logs any errors encountered during the search process.
   */
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
      await this.storeLocationDiscoveryResults({
        discoveredUrls,
        locationQuery,
        city,
        state,
        results,
      });
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
  /**
  * Executes a location-specific search and processes the results.
  * @example
  * performLocationSpecificSearch("San Francisco", new Set())
  * // Processes search results for "San Francisco" location
  * @param {string} locationQuery - The location query to perform the search.
  * @param {Set<string>} discoveredUrls - A set to track URLs that have already been discovered.
  * @returns {Promise<void>} Completes search processing without return value.
  * @description
  *   - Searches are performed with a limit of 15 results.
  *   - Only non-empty search results are processed.
  *   - Uses asynchronous calls to handle search and processing operations.
  */
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
      if (resultUrl != undefined && resultUrl !== '' && (await this.isFoodTruckUrl(resultUrl))) {
        discoveredUrls.add(resultUrl);
      }

      // Extract URLs from content
      await this.extractUrlsFromContent(result, discoveredUrls);
    }
  }

  // Helper method to extract URLs from content
  /**
   * Extracts food truck URLs from a given result object and adds them to a discovered URL set.
   * @example
   * extractUrlsFromContent(resultObject, discoveredUrlSet)
   * void
   * @param {unknown} result - The result object potentially containing content with URLs.
   * @param {Set<string>} discoveredUrls - A set where extracted food truck URLs will be added.
   * @returns {Promise<void>} Resolves when URLs are added to the set.
   * @description
   *   - Parses both `content` and `raw_content` properties for URLs.
   *   - Uses helper method `extractFoodTruckUrls` to identify specific URLs.
   *   - Filters URLs through `isFoodTruckUrl` method to ensure relevance before adding.
   */
  private async extractUrlsFromContent(
    result: unknown,
    discoveredUrls: Set<string>,
  ): Promise<void> {
    if (typeof result === 'object' && result != undefined) {
      const resultObj = result as { content?: string; raw_content?: string };
      if (resultObj.content != undefined || resultObj.raw_content != undefined) {
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
  /**
   * Stores location discovery results by iterating through a set of discovered URLs.
   * @example
   * storeLocationDiscoveryResults({
   *   discoveredUrls: new Set(['http://example.com']),
   *   locationQuery: 'pizza restaurant',
   *   city: 'San Francisco',
   *   state: 'CA',
   *   results: {}
   * })
   * 
   * @param {Object} params - Parameters for storing the discovery results.
   * @param {Set<string>} params.discoveredUrls - A set of URLs to be stored.
   * @param {string} params.locationQuery - The location query used in the search.
   * @param {string} params.city - The target city for the location search.
   * @param {string} params.state - The target state for the location search.
   * @param {DiscoveryResult} params.results - Object to store results and errors.
   * @returns {Promise<void>} No return value.
   * @description
   *   - Logs an error and records it in the results if storing a URL fails.
   *   - Assumes the existence of a method `storeDiscoveredUrl` to handle storage logic.
   *   - The `results` object is mutated by adding error messages directly.
   */
  private async storeLocationDiscoveryResults(params: {
    discoveredUrls: Set<string>;
    locationQuery: string;
    city: string;
    state: string;
    results: DiscoveryResult;
  }): Promise<void> {
    const { discoveredUrls, locationQuery, city, state, results } = params;
    for (const url of discoveredUrls) {
      try {
        const stored = await this.storeDiscoveredUrl(url, 'tavily_search', {
          search_query: locationQuery,
          target_city: city,
          target_state: state,
        });
        if (stored.isNew === true) {
          results.urls_stored += 1;
        } else {
          results.urls_duplicates += 1;
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
          result.urls_stored += 1;
        } else {
          result.urls_duplicates += 1;
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
