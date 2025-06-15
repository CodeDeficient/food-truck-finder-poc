interface FirecrawlResponse {
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
      firecrawlCache[cacheKey] &&
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
        throw new Error(errorData.error || `HTTP ${response.status}`);
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
        throw new Error(errorData.error || `HTTP ${response.status}`);
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
        throw new Error(errorData.error || `HTTP ${response.status}`);
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

    return result.success && result.data?.markdown
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
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  // Rate limiting and error handling
  async scrapeWithRetry(url: string, maxRetries = 3, backoffMs = 1000): Promise<FirecrawlResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.scrapeUrl(url);

        if (result.success) {
          return result;
        }

        // If it's a rate limit error, wait longer
        if (result.error?.includes('rate limit')) {
          const waitTime = backoffMs * Math.pow(2, attempt);
          console.info(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
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
        await new Promise((resolve) => setTimeout(resolve, waitTime));
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
