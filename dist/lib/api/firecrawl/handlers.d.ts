import { NextResponse } from 'next/server';
/**
 * Executes a web scraping operation on the specified URL.
 * @example
 * handleScrapeOperation('https://example.com', { headers: {'User-Agent': 'Mozilla/5.0'} })
 * { success: true, data: [ <scrapedContent> ], error: null }
 * @param {string} url - The URL to be scraped.
 * @param {Record<string, unknown>} options - Additional configurations for the scraping operation.
 * @returns {object} An object containing the success status, scraped data if successful, and any error encountered.
 * @description
 *   - Utilizes 'firecrawl' library to perform the scraping.
 *   - The scrape operation targets the main content of the page only.
 *   - The resulting data is returned in both 'markdown' and 'html' formats.
 */
export declare function handleScrapeOperation(url: string, options: Record<string, unknown>): Promise<any>;
/**
* Polls the crawl status of a given job ID until the job is completed or a maximum number of attempts is reached.
* @example
* pollCrawlStatus('12345xyz')
* NextResponse { success: true, data: {...} }
* @param {string} jobId - The unique identifier for the crawl job.
* @returns {Promise<NextResponse>} A JSON response indicating the result of the crawl job: completed, failed, or timed out.
* @description
*   - Uses a polling mechanism with a fixed interval to check the job status repeatedly.
*   - Handles completed and failed job statuses with different JSON responses.
*   - Implemented timeout after 30 attempts to prevent indefinite polling.
*   - Provides appropriate HTTP status codes for each response scenario.
*/
export declare function pollCrawlStatus(jobId: string): Promise<NextResponse>;
/**
* Initiates and handles the web crawling operation with specified options.
* @example
* handleCrawlOperation('http://example.com', { maxDepth: 3, limit: 50 })
* Returns the status of the crawl job operation.
* @param {string} url - The URL of the website to be crawled.
* @param {Record<string, unknown>} options - Options to configure the crawling operation including maxDepth, limit, includes, and excludes.
* @returns {Promise<Object>} A JSON response object containing the success status and error message, or initiates the crawl status polling.
* @description
*   - Uses `firecrawl` library to start a web crawling job with specific configurations.
*   - Handles crawl job initiation success and failure scenarios.
*   - Returns a JSON response on failure with error details.
*/
export declare function handleCrawlOperation(url: string, options: Record<string, unknown>): Promise<any>;
export declare function handleSearchOperation(): any;
