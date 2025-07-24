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
interface TavilySearchResult {
    url: string;
    content?: string;
    raw_content?: string;
}
export declare class FoodTruckDiscoveryEngine {
    private readonly searchTerms;
    private readonly directoryUrls;
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
    private processSearchResults;
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
    private performSearchTermDiscovery;
    private performDirectoryCrawling;
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
    private crawlSingleDirectory;
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
    private processCrawlResults;
    private performLocationDiscovery;
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
    private searchSingleCity;
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
    private processLocationSearchResults;
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
    private storeDiscoveredUrlsFromDiscovery;
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
    discoverNewFoodTrucks(): Promise<DiscoveryResult>;
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
    private extractFoodTruckUrls;
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
    private isFoodTruckUrl;
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
    getLocationSpecificDiscovery(city: string, state?: string): Promise<DiscoveryResult>;
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
    private performLocationSpecificSearch;
    private processSearchResult;
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
    private extractUrlsFromContent;
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
    private storeLocationDiscoveryResults;
    private delay;
    /**
     * Store multiple discovered URLs with metadata
     */
    storeDiscoveredUrls(urls: string[], discoveryMethod?: string, metadata?: Record<string, unknown>): Promise<{
        urls_stored: number;
        urls_duplicates: number;
        errors: string[];
    }>;
    /**
     * Enhanced store method with discovery method and metadata
     */
    private storeDiscoveredUrl;
    /**
     * Search for food truck directories
     */
    searchFoodTruckDirectories(query?: string): Promise<TavilySearchResult[]>;
    /**
     * Search for food truck websites
     */
    searchFoodTruckWebsites(query: string): Promise<TavilySearchResult[]>;
}
export declare const discoveryEngine: FoodTruckDiscoveryEngine;
export {};
