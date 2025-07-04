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

interface ContactInfo {
  phone?: string;
  email?: string;
}

interface SocialMediaInfo {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

const FIRECRAWL_CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const firecrawlCache: Record<string, { data: unknown; timestamp: number }> = {};

export class FirecrawlService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY!;
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
  private getCachedResult(
    cacheKey: string,
  ): FirecrawlResponse | CrawlJobResponse | CrawlStatusResponse | undefined {
    const now = Date.now();
    // Clean up expired cache
    for (const key in firecrawlCache) {
      if (
        Object.prototype.hasOwnProperty.call(firecrawlCache, key) &&
        now - firecrawlCache[key].timestamp > FIRECRAWL_CACHE_TTL_MS
      ) {
        delete firecrawlCache[key];
      }
    }
    if (
      firecrawlCache[cacheKey] != undefined &&
      now - firecrawlCache[cacheKey].timestamp < FIRECRAWL_CACHE_TTL_MS
    ) {
      console.info(`FirecrawlService: Cache hit for ${cacheKey}`);
      return firecrawlCache[cacheKey].data as
        | FirecrawlResponse
        | CrawlJobResponse
        | CrawlStatusResponse;
    }
    return undefined;
  }

  private setCacheResult(cacheKey: string, data: unknown) {
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
  async scrapeUrl(
    url: string,
    options: {
      formats?: ('markdown' | 'html')[];
      includeTags?: string[];
      excludeTags?: string[];
      onlyMainContent?: boolean;
      waitFor?: number;
    } = {},
  ): Promise<FirecrawlResponse> {
    const cacheKey = `scrape:${url}:${JSON.stringify(options)}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached as FirecrawlResponse;
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
          formats: options.formats ?? ['markdown'],
          includeTags: options.includeTags,
          excludeTags: options.excludeTags,
          onlyMainContent: options.onlyMainContent ?? true,
          waitFor: options.waitFor ?? 0,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error ?? `HTTP ${response.status}`);
      }

      this.setCacheResult(cacheKey, data);
      return data as FirecrawlResponse;
    } catch (error: unknown) {
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
  async crawlWebsite(
    url: string,
    options: {
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
    } = {},
  ): Promise<CrawlJobResponse> {
    const cacheKey = `crawl:${url}:${JSON.stringify(options)}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached as CrawlJobResponse;
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
          crawlerOptions: {
            maxDepth: 2,
            limit: 10,
            ...options.crawlerOptions,
          },
          pageOptions: {
            formats: ['markdown'],
            onlyMainContent: true,
            ...options.pageOptions,
          },
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error ?? `HTTP ${response.status}`);
      }

      this.setCacheResult(cacheKey, data);
      return data as CrawlJobResponse;
    } catch (error: unknown) {
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
  async getCrawlStatus(jobId: string): Promise<CrawlStatusResponse> {
    const cacheKey = `crawlStatus:${jobId}`;
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached as CrawlStatusResponse;
    }

    try {
      const response = await fetch(`${this.baseUrl}/crawl/status/${jobId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error ?? `HTTP ${response.status}`);
      }

      this.setCacheResult(cacheKey, data);
      return data as CrawlStatusResponse;
    } catch (error: unknown) {
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
  async scrapeFoodTruckWebsite(url: string): Promise<{
    success: boolean;
    data?: { markdown: string; name?: string; source_url?: string };
    error?: string;
  }> {
    const result = await this.scrapeUrl(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 2000,
    });

    return result.success && result.data?.markdown != undefined
      ? {
          success: true,
          data: {
            markdown: result.data.markdown,
            name: result.data.metadata?.title,
            source_url: result.data.metadata?.sourceURL,
          },
        }
      : { success: false, error: result.error ?? 'Markdown content not found' };
  }

  private extractPattern(text: string, pattern: RegExp): string | undefined {
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
  private extractMenuSection(markdown: string): string | undefined {
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
  private extractContactInfo(markdown: string): ContactInfo | undefined {
    const contact: ContactInfo = {}; // Phone number - Use specific patterns to prevent backtracking
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
  private extractSocialMedia(markdown: string): SocialMediaInfo | undefined {
    const social: SocialMediaInfo = {};
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
  async scrapeMultipleUrls(
    urls: string[],
    options: {
      batchSize?: number;
      delay?: number;
    } = {},
  ): Promise<Array<{ url: string; result: FirecrawlResponse }>> {
    const batchSize = options.batchSize ?? 5;
    const delay = options.delay ?? 1000;
    const results: Array<{ url: string; result: FirecrawlResponse }> = [];

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
        await new Promise((resolve) => {setTimeout(resolve, delay)});
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
  async scrapeWithRetry(url: string, maxRetries = 3, backoffMs = 1000): Promise<FirecrawlResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt+=1) {
      try {
        const result = await this.scrapeUrl(url);

        if (result.success) {
          return result;
        }

        // If it's a rate limit error, wait longer
        if (result.error?.includes('rate limit') === true) {
          const waitTime = backoffMs * Math.pow(2, attempt);
          console.info(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise((resolve) => {setTimeout(resolve, waitTime)});
          continue;
        }

        throw new Error(result.error);
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxRetries) {
          break;
        }

        const waitTime = backoffMs * Math.pow(2, attempt);
        console.info(`Attempt ${attempt} failed. Retrying in ${waitTime}ms...`);
        await new Promise((resolve) => {setTimeout(resolve, waitTime)});
      }
    }

    return {
      success: false,
      error: lastError!.message,
    };
  }
}

// Export singleton instance
export const firecrawl = new FirecrawlService();
