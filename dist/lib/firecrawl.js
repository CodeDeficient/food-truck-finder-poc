const FIRECRAWL_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const firecrawlCache = {};
export class FirecrawlService {
    constructor() {
        this.apiKey = process.env.FIRECRAWL_API_KEY;
        this.baseUrl = 'https://api.firecrawl.dev/v0';
    }
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
    getCachedResult(cacheKey) {
        const now = Date.now();
        // Clean up expired cache
        for (const key in firecrawlCache) {
            if (Object.prototype.hasOwnProperty.call(firecrawlCache, key) &&
                now - firecrawlCache[key].timestamp > FIRECRAWL_CACHE_TTL_MS) {
                delete firecrawlCache[key];
            }
        }
        if (firecrawlCache[cacheKey] != undefined &&
            now - firecrawlCache[cacheKey].timestamp < FIRECRAWL_CACHE_TTL_MS) {
            console.info(`FirecrawlService: Cache hit for ${cacheKey}`);
            return firecrawlCache[cacheKey].data;
        }
        return undefined;
    }
    setCacheResult(cacheKey, data) {
        firecrawlCache[cacheKey] = { data, timestamp: Date.now() };
    }
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
    async scrapeUrl(url, options = {}) {
        var _a, _b, _c, _d;
        const cacheKey = `scrape:${url}:${JSON.stringify(options)}`;
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await fetch(`${this.baseUrl}/scrape`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    formats: (_a = options.formats) !== null && _a !== void 0 ? _a : ['markdown'],
                    includeTags: options.includeTags,
                    excludeTags: options.excludeTags,
                    onlyMainContent: (_b = options.onlyMainContent) !== null && _b !== void 0 ? _b : true,
                    waitFor: (_c = options.waitFor) !== null && _c !== void 0 ? _c : 0,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorData = data;
                throw new Error((_d = errorData.error) !== null && _d !== void 0 ? _d : `HTTP ${response.status}`);
            }
            this.setCacheResult(cacheKey, data);
            return data;
        }
        catch (error) {
            console.warn('Firecrawl scrape error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
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
    async crawlWebsite(url, options = {}) {
        var _a;
        const cacheKey = `crawl:${url}:${JSON.stringify(options)}`;
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await fetch(`${this.baseUrl}/crawl`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url,
                    crawlerOptions: Object.assign({ maxDepth: 2, limit: 10 }, options.crawlerOptions),
                    pageOptions: Object.assign({ formats: ['markdown'], onlyMainContent: true }, options.pageOptions),
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorData = data;
                throw new Error((_a = errorData.error) !== null && _a !== void 0 ? _a : `HTTP ${response.status}`);
            }
            this.setCacheResult(cacheKey, data);
            return data;
        }
        catch (error) {
            console.warn('Firecrawl crawl error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
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
    async getCrawlStatus(jobId) {
        var _a;
        const cacheKey = `crawlStatus:${jobId}`;
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await fetch(`${this.baseUrl}/crawl/status/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                const errorData = data;
                throw new Error((_a = errorData.error) !== null && _a !== void 0 ? _a : `HTTP ${response.status}`);
            }
            this.setCacheResult(cacheKey, data);
            return data;
        }
        catch (error) {
            console.warn('Firecrawl status error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    // Specialized methods for food truck data
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
    async scrapeFoodTruckWebsite(url) {
        var _a, _b, _c, _d;
        const result = await this.scrapeUrl(url, {
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
        });
        return result.success && ((_a = result.data) === null || _a === void 0 ? void 0 : _a.markdown) != undefined
            ? {
                success: true,
                data: {
                    markdown: result.data.markdown,
                    name: (_b = result.data.metadata) === null || _b === void 0 ? void 0 : _b.title,
                    source_url: (_c = result.data.metadata) === null || _c === void 0 ? void 0 : _c.sourceURL,
                },
            }
            : { success: false, error: (_d = result.error) !== null && _d !== void 0 ? _d : 'Markdown content not found' };
    }
    extractPattern(text, pattern) {
        const match = pattern.exec(text);
        return match ? match[1].trim() : undefined;
    }
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
    extractMenuSection(markdown) {
        // Use simpler, more efficient regex patterns with fixed max length
        const menuPatterns = [
            /menu\s*:\s*([^\n]{1,50})/i,
            /food\s*:\s*([^\n]{1,50})/i,
            /items?\s*:\s*([^\n]{1,50})/i,
            /what we serve\s*:\s*([^\n]{1,50})/i,
            /our food\s*:\s*([^\n]{1,50})/i,
        ];
        for (const pattern of menuPatterns) {
            const match = pattern.exec(markdown);
            if (match) {
                return match[1].trim();
            }
        }
        return undefined;
    }
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
    extractContactInfo(markdown) {
        const contact = {}; // Phone number - Use specific patterns to prevent backtracking
        const phoneRegex = /(?:phone|call|contact)(?:\s*:\s*)?([+]?\d{3,4}[.\s-]\d{3}[.\s-]\d{3,4})/i;
        const phoneMatch = phoneRegex.exec(markdown);
        if (phoneMatch) {
            contact.phone = phoneMatch[1].trim();
        } // Email - Use specific pattern to avoid backtracking
        const emailRegex = /([a-zA-Z0-9._%-]{1,64}@[a-zA-Z0-9-]{1,63}\.[a-zA-Z]{2,6})/;
        const emailMatch = emailRegex.exec(markdown);
        if (emailMatch) {
            contact.email = emailMatch[1].trim();
        }
        return Object.keys(contact).length > 0 ? contact : undefined;
    }
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
    extractSocialMedia(markdown) {
        const social = {};
        // Instagram - Use concise character class
        const instagramRegex = /(?:instagram|@)\s*([\w.]+)/i;
        const instagramMatch = instagramRegex.exec(markdown);
        if (instagramMatch) {
            social.instagram = instagramMatch[1].trim();
        }
        // Facebook - With fixed character class
        const facebookRegex = /facebook\.com\/([\w.-]+)/i;
        const facebookMatch = facebookRegex.exec(markdown);
        if (facebookMatch) {
            social.facebook = facebookMatch[1].trim();
        }
        // Twitter - Use concise character class
        const twitterRegex = /(?:twitter|@)\s*([\w.]+)/i; // Changed \w+ to [\w.]+ to allow dots in usernames
        const twitterMatch = twitterRegex.exec(markdown);
        if (twitterMatch) {
            social.twitter = twitterMatch[1].trim();
        }
        return Object.keys(social).length > 0 ? social : undefined;
    }
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
    async scrapeMultipleUrls(urls, options = {}) {
        var _a, _b;
        const batchSize = (_a = options.batchSize) !== null && _a !== void 0 ? _a : 5;
        const delay = (_b = options.delay) !== null && _b !== void 0 ? _b : 1000;
        const results = [];
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            const batchPromises = batch.map(async (url) => {
                const result = await this.scrapeUrl(url);
                return { url, result };
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Add delay between batches to respect rate limits
            if (i + batchSize < urls.length) {
                await new Promise((resolve) => { setTimeout(resolve, delay); });
            }
        }
        return results;
    }
    // Rate limiting and error handling
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
    async scrapeWithRetry(url, maxRetries = 3, backoffMs = 1000) {
        var _a;
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
            try {
                const result = await this.scrapeUrl(url);
                if (result.success) {
                    return result;
                }
                // If it's a rate limit error, wait longer
                if (((_a = result.error) === null || _a === void 0 ? void 0 : _a.includes('rate limit')) === true) {
                    const waitTime = backoffMs * 2 ** attempt;
                    console.info(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
                    await new Promise((resolve) => { setTimeout(resolve, waitTime); });
                    continue;
                }
                throw new Error(result.error);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt === maxRetries) {
                    break;
                }
                const waitTime = backoffMs * 2 ** attempt;
                console.info(`Attempt ${attempt} failed. Retrying in ${waitTime}ms...`);
                await new Promise((resolve) => { setTimeout(resolve, waitTime); });
            }
        }
        return {
            success: false,
            error: lastError.message,
        };
    }
}
// Export singleton instance
export const firecrawl = new FirecrawlService();
