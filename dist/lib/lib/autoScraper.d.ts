interface TriggerScrapingProcessResult {
    success: boolean;
    jobId?: string;
    message?: string;
    error?: string;
}
export interface AutoScrapeResult {
    trucksProcessed: number;
    newTrucksFound: number;
    errors: Array<{
        url: string;
        details?: string;
    }>;
}
interface GeminiUsageLimits {
    canMakeRequest: boolean;
}
interface ProcessedMenuData {
    menu: Array<{
        category: string;
        items: Array<{
            name: string;
            description?: string;
            price?: number;
            dietary_tags?: string[];
        }>;
    }>;
}
interface ExtractedLocationData {
    location: {
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
}
interface StandardizedOperatingHours {
    hours: Record<string, string>;
}
interface SentimentAnalysisResult {
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
}
interface EnhancedFoodTruckData {
    description: string;
    cuisine_type: string[];
    specialties: string[];
}
interface GeminiService {
    checkUsageLimits(): Promise<GeminiUsageLimits>;
    processMenuData(input: unknown): Promise<ProcessedMenuData>;
    extractLocationFromText(input: unknown): Promise<ExtractedLocationData>;
    standardizeOperatingHours(input: unknown): Promise<StandardizedOperatingHours>;
    analyzeSentiment(input: unknown): Promise<SentimentAnalysisResult>;
    enhanceFoodTruckData(input: unknown): Promise<EnhancedFoodTruckData>;
}
/**
 * Initiates a web scraping process for a given target URL.
 * @example
 * triggerScrapingProcess('https://example.com')
 * { success: true, jobId: '12345', message: 'Scraping job created and processing initiated for https://example.com.' }
 * @param {string} targetUrl - The URL of the website to be scraped.
 * @returns {Promise<TriggerScrapingProcessResult>} Result of the attempt to trigger the scraping process, including success status, job ID, and message or error.
 * @description
 *   - Creates a web scraping job with a priority of 5 and triggers its processing.
 *   - Handles errors during job creation or processing gracefully.
 *   - Uses the current timestamp to schedule the job.
 */
declare function triggerScrapingProcess(targetUrl: string): Promise<TriggerScrapingProcessResult>;
/**
 * Initiates the autonomous scraping process and ensures default trucks data is fetched.
 * @example
 * ensureDefaultTrucksAreScraped()
 * Returns a result object containing the number of trucks processed, new trucks found, and any errors encountered.
 * @returns {Promise<AutoScrapeResult>} An object containing the results of the scraping process, including processed trucks count, new trucks discovered count, and encountered errors.
 * @description
 *   - Combines static default URLs with dynamically discovered URLs for scraping.
 *   - Handles both existing and new trucks, updating counters and tracking errors.
 *   - Logs process information and warnings for unexpected errors during execution.
 */
export declare function ensureDefaultTrucksAreScraped(): Promise<AutoScrapeResult>;
/**
 * Makes a call to Gemini service and caches the result to optimize performance.
 * @example
 * callGeminiWithCache('getData', { id: 123 }, geminiInstance)
 * // returns the result from the Gemini service or cache
 * @param {string} type - The type of operation to perform with Gemini.
 * @param {unknown} input - The input data required for the Gemini operation.
 * @param {GeminiService} gemini - The instance of GeminiService to interact with.
 * @returns {Promise<unknown>} Returns a promise that resolves to the result of the Gemini operation.
 * @description
 *   - Caches the result of Gemini service calls to avoid redundant requests.
 *   - Automatically cleans up expired cache entries based on a specified TTL.
 *   - Checks Gemini usage limits before making API calls to prevent exceeding the daily cap.
 *   - Constructs a unique cache key for each request using the operation type and input.
 */
export declare function callGeminiWithCache(type: string, input: unknown, gemini: GeminiService): Promise<unknown>;
/**
* Retrieves a list of URLs that are ready for scraping.
* @example
* getUrlsToScrape()
* // Returns a Promise that resolves to an array of URLs
* @param {void} - This function does not take any arguments.
* @returns {Promise<string[]>} A promise that resolves to an array of URLs to be scraped.
* @description
*   - The function returns a combination of default URLs and dynamically discovered URLs.
*   - Utilizes Supabase to fetch URLs marked with 'new' or 'processed' status.
*   - Limits results to prevent system overload, fetching a maximum of 100 URLs.
*   - Handles errors gracefully, logging warnings if the Supabase client is not available or if there is an error in fetching URLs.
*/
declare function getUrlsToScrape(): Promise<string[]>;
/**
 * Updates the status of a discovered URL in the database.
 * @example
 * updateDiscoveredUrlStatus('http://example.com', 'processed', 'Page successfully processed')
 * // Returns: void
 * @param {string} url - The URL whose status needs updating.
 * @param {'processing' | 'processed' | 'irrelevant'} status - The new status for the URL.
 * @param {string} [notes] - Optional notes regarding the URL status update.
 * @returns {Promise<void>} Resolves when the update operation is complete.
 * @description
 *   - Logs a warning if the Supabase admin client is not available.
 *   - Uses Supabase to update the status and logs an error if the operation fails.
 *   - Assumes the existence of a 'discovered_urls' table in the database.
 */
declare function updateDiscoveredUrlStatus(url: string, status: 'processing' | 'processed' | 'irrelevant', notes?: string): Promise<void>;
export declare const autoScraper: {
    runAutoScraping: typeof ensureDefaultTrucksAreScraped;
    triggerScrapingProcess: typeof triggerScrapingProcess;
    callGeminiWithCache: typeof callGeminiWithCache;
    getUrlsToScrape: typeof getUrlsToScrape;
    updateDiscoveredUrlStatus: typeof updateDiscoveredUrlStatus;
};
export declare function runAutonomousScraping(): Promise<AutoScrapeResult>;
export {};
