export interface FirecrawlResponse {
    success: boolean;
    data?: {
        markdown?: string;
        html?: string;
        metadata?: {
            title?: string;
            description?: string;
            language?: string;
            sourceURL?: string;
        };
        links?: string[];
    };
    error?: string;
}
interface CrawlJobResponse {
    success: boolean;
    jobId?: string;
    error?: string;
}
interface ScrapedMetadata {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
}
interface CrawlStatusResponse {
    success: boolean;
    status?: 'scraping' | 'completed' | 'failed';
    data?: Array<{
        markdown?: string;
        html?: string;
        metadata?: ScrapedMetadata;
    }>;
    error?: string;
}
export declare class FirecrawlService {
    private apiKey;
    private baseUrl;
    constructor();
    /**
     * Retrieves a cached result based on the given cache key if it hasn't expired.
     * @example
     * getCachedResult('uniqueCacheKey')
     * FirecrawlResponse or undefined
     * @param {string} cacheKey - The unique identifier for the cached result.
     * @returns {FirecrawlResponse | CrawlJobResponse | CrawlStatusResponse | undefined} The cached data if available and valid, otherwise undefined.
     * @description
     *   - Cleans up expired cache entries before attempting to return a cached result.
     *   - Logs a message when a cache hit occurs.
     */
    private getCachedResult;
    private setCacheResult;
    /**
    * Fetches and processes content from a specified URL, optionally customizing the output format and content inclusion/exclusion via provided options.
    * @example
    * scrapeUrl('https://example.com', { formats: ['html'], includeTags: ['h1', 'p'] })
    * Returns a FirecrawlResponse object containing the scraped data.
    * @param {string} url - The URL from which content will be scraped.
    * @param {Object} options - Optional parameters to customize the scraping process.
    * @param {(string[]|undefined)} options.formats - Specifies the desired output formats: 'markdown' or 'html'.
    * @param {(string[]|undefined)} options.includeTags - Tags to specifically include in the scraping results.
    * @param {(string[]|undefined)} options.excludeTags - Tags to exclude from the scraping results.
    * @param {(boolean|undefined)} options.onlyMainContent - If true, extracts only the main content from the URL.
    * @param {(number|undefined)} options.waitFor - Time in milliseconds to wait before starting the scraping process.
    * @returns {Promise<FirecrawlResponse>} A promise resolving to a FirecrawlResponse containing either the successful scraping results or error details.
    * @description
    *   - Utilizes caching to store and retrieve previously fetched data to minimize repeated requests.
    *   - Sends API requests with authentication headers using the instance's API key.
    *   - Handles errors gracefully, returning a descriptive error message if the scraping process fails.
    */
    scrapeUrl(url: string, options?: {
        formats?: ('markdown' | 'html')[];
        includeTags?: string[];
        excludeTags?: string[];
        onlyMainContent?: boolean;
        waitFor?: number;
    }): Promise<FirecrawlResponse>;
    /**
     * Initiates a web crawling process for a specified URL with given options.
     * @example
     * crawlWebsite('https://example.com', { crawlerOptions: { includes: ['.html'] }, pageOptions: { formats: ['markdown'] } })
     * // Returns a promise that resolves to a CrawlJobResponse object
     * @param {string} url - The URL of the website to be crawled.
     * @param {Object} options - Configuration options for the crawling process.
     * @param {Object} [options.crawlerOptions] - Specific options for controlling the crawler behavior.
     * @param {string[]} [options.crawlerOptions.includes] - List of patterns to include in the crawl.
     * @param {string[]} [options.crawlerOptions.excludes] - List of patterns to exclude from the crawl.
     * @param {number} [options.crawlerOptions.maxDepth] - Maximum depth the crawler should reach.
     * @param {number} [options.crawlerOptions.limit] - Limit to the number of pages to crawl.
     * @param {Object} [options.pageOptions] - Options for the page content format and selection.
     * @param {string[]} [options.pageOptions.formats] - Desired formats for the crawled page content.
     * @param {boolean} [options.pageOptions.onlyMainContent] - Whether to include only the main content of the pages.
     * @returns {Promise<CrawlJobResponse>} A promise that resolves with the results of the crawl job including success and potential errors.
     * @description
     *   - Performs a POST request to the Firecrawl service to crawl pages.
     *   - Uses caching to avoid redundant web crawling operations.
     *   - Handles errors gracefully, returning an appropriate error message if the fetch operation fails.
     *   - Crawls with default options which include markdown format and filtering for main content.
     */
    crawlWebsite(url: string, options?: {
        crawlerOptions?: {
            includes?: string[];
            excludes?: string[];
            maxDepth?: number;
            limit?: number;
        };
        pageOptions?: {
            formats?: ('markdown' | 'html')[];
            onlyMainContent?: boolean;
        };
    }): Promise<CrawlJobResponse>;
    /**
     * Retrieves the crawl status for a given job by its ID.
     * @example
     * getCrawlStatus('12345')
     * { success: true, status: 'completed' }
     * @param {string} jobId - The ID of the job for which the crawl status is requested.
     * @returns {Promise<CrawlStatusResponse>} Resolves to a `CrawlStatusResponse` object containing the crawl status or an error.
     * @description
     *   - Attempts to retrieve the crawl status from a cache before making an HTTP request.
     *   - Fetches crawl status using an authenticated request to the API.
     *   - Caches the crawl status response data to minimize redundant network calls.
     *   - Handles errors gracefully, returning a standardized error response.
     */
    getCrawlStatus(jobId: string): Promise<CrawlStatusResponse>;
    /**
     * Scrapes a food truck website and retrieves its main content in markdown format.
     * @example
     * scrapeFoodTruckWebsite('https://example.com/food-truck')
     * // Returns: Promise<{ success: true, data: { markdown: '...', name: 'Example Food Truck', source_url: 'https://example.com/food-truck' } }>
     * @param {string} url - The URL of the food truck website to scrape.
     * @returns {Promise<{ success: boolean, data?: { markdown: string, name?: string, source_url?: string }, error?: string }>} The result of the scrape operation, including markdown content and metadata if successful, or an error message if not.
     * @description
     *   - Configured to wait 2000 milliseconds to ensure all content is loaded.
     *   - Uses 'markdown' format for content extraction to maintain text structure.
     *   - Extracts metadata such as the title and source URL if available.
     */
    scrapeFoodTruckWebsite(url: string): Promise<{
        success: boolean;
        data?: {
            markdown: string;
            name?: string;
            source_url?: string;
        };
        error?: string;
    }>;
    private extractPattern;
    /**
    * Extracts a menu section from a given markdown string based on specific keywords.
    * @example
    * extractMenuSection("menu: Pizza, Pasta, Salad")
    * // Returns "Pizza, Pasta, Salad"
    * @param {string} markdown - The markdown string to search for menu-related content.
    * @returns {string | undefined} The extracted menu section if found, otherwise undefined.
    * @description
    *   - Searches for menu-related phrases like "menu", "food", "items" up to a maximum of 50 characters.
    *   - Implements case-insensitive search patterns.
    *   - Returns the portion of the markdown line following the specific keywords.
    */
    private extractMenuSection;
    /**
     * Extracts phone and email contact information from a markdown string.
     * @example
     * extractContactInfo("Contact: +123-456-7890, email: example@test.com")
     * { phone: "+123-456-7890", email: "example@test.com" }
     * @param {string} markdown - A markdown string potentially containing contact information.
     * @returns {ContactInfo | undefined} An object containing extracted phone and email, or undefined if none are found.
     * @description
     *   - Utilizes regular expressions to identify phone numbers and email addresses within the markdown.
     *   - Returns an object only when at least one type of contact information is successfully extracted.
     */
    private extractContactInfo;
    /**
    * Extracts social media profile names from a given markdown string.
    * @example
    * extractSocialMedia("@john_doe instagram.com/jane Facebook.com/joe")
    * { instagram: 'john_doe', facebook: 'jane', twitter: 'joe' }
    * @param {string} markdown - A string containing markdown text to parse for social media information.
    * @returns {SocialMediaInfo | undefined} An object containing social media profiles if any are found, otherwise undefined.
    * @description
    *   - Supports extracting profiles for Instagram, Facebook, and Twitter.
    *   - Uses regular expressions to match social media patterns.
    *   - Returns the trimmed username of identified social media profiles.
    *   - Returns undefined if no social media profiles are found in the input.
    */
    private extractSocialMedia;
    /**
     * Performs web scraping on multiple URLs with batching and delay options.
     * @example
     * scrapeMultipleUrls(['http://example.com', 'http://another.com'], { batchSize: 2, delay: 1500 })
     * Returns: Promise resolving to an array containing the results of the scraped URLs.
     * @param {string[]} urls - Array of URLs to be scraped.
     * @param {Object} options - Options object for configuring the scraping process.
     * @param {number} [options.batchSize=5] - Size of each batch in which URLs are processed.
     * @param {number} [options.delay=1000] - Delay between processing each batch in milliseconds.
     * @returns {Promise<Array<{ url: string; result: FirecrawlResponse }>>} Promise resolving to an array of objects, each containing a URL and its corresponding scrape result.
     * @description
     *   - Utilizes a batch mechanism to efficiently handle large sets of URLs.
     *   - Incorporates a delay between batches to comply with potential rate limits.
     */
    scrapeMultipleUrls(urls: string[], options?: {
        batchSize?: number;
        delay?: number;
    }): Promise<Array<{
        url: string;
        result: FirecrawlResponse;
    }>>;
    /**
     * Attempts to scrape content from a given URL with retries in case of failure.
     * @example
     * scrapeWithRetry('https://example.com', 3, 1000)
     * { success: true, data: {...} }
     * @param {string} url - The URL to scrape.
     * @param {number} maxRetries - Maximum number of retry attempts. Defaults to 3.
     * @param {number} backoffMs - Initial wait time before retrying in milliseconds. Defaults to 1000ms.
     * @returns {Promise<FirecrawlResponse>} Promise resolving to a FirecrawlResponse object indicating success or failure.
     * @description
     *   - Implements exponential backoff strategy for rate limit errors.
     *   - Logs attempt details and waiting times between retries.
     *   - Returns last error message if all retry attempts fail.
     */
    scrapeWithRetry(url: string, maxRetries?: number, backoffMs?: number): Promise<FirecrawlResponse>;
}
export declare const firecrawl: FirecrawlService;
export {};
