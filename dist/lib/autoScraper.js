// lib/autoScraper.ts
import { DEFAULT_SCRAPE_URLS, DEFAULT_STALENESS_THRESHOLD_DAYS } from './config.js';
import { supabaseAdmin, ScrapingJobService } from './supabase.js';
import { processScrapingJob } from '@/lib/pipelineProcessor';
import { dispatchGeminiOperation } from './gemini.js';
/*
Food Truck Scraping Strategy (wbs 2.1.2)
----------------------------------------
Goal: Extract structured data for food trucks (description, menu, prices, locations, events) from web sources.

1. Discovery:
   - Use internal API endpoints that leverage Tavily MCP tools to find food truck directories and individual truck sites.
   - Filter urls to target only likely food truck homepages or menu/schedule pages.

2. Content Extraction:
   - For each truck site, extract:
     - Description: Look for about/landing page text, business summary, or meta description.
     - Menu: Scrape menu sections, parse categories, items, prices, and dietary tags.
     - Prices: Extract explicit prices as numbers; fallback to price range if only text is available.
     - Locations: Parse current and scheduled locations, addresses, and geocoordinates if present.
     - Events: Identify event/calendar/schedule sections for upcoming appearances.

3. Data Mapping:
   - Map extracted fields to Supabase schema:
     - name, description, cuisine_type, specialties
     - menu (categories/items/prices/dietary_tags)
     - current_location, scheduled_locations, exact_location, city_location
     - events (future: event table)

4. Quality & Validation:
   - Use Gemini to summarize/clean descriptions and standardize menu/locations.
   - Validate extracted data types and required fields before db insert.
   - Log and skip/flag incomplete or ambiguous records for review.

5. Ingestion:
   - Upsert into Supabase using unique identifier (e.g., website url or business name).
   - Avoid duplicates and resolve conflicts by preferring most recent or most complete data.

6. Automation:
   - Schedule regular crawls and re-scrapes.
   - Track api usage and cache results to stay within rate limits.
   - Monitor for site changes and trigger updates as needed.
*/
// Helper to trigger a scraping process for a given url
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
async function triggerScrapingProcess(targetUrl) {
    try {
        const job = await ScrapingJobService.createJob({
            job_type: 'website_auto',
            target_url: targetUrl,
            priority: 5,
            scheduled_at: new Date().toISOString(),
        });
        processScrapingJob(job.id).catch((error) => {
            console.error('Failed to process scraping job:', error);
        });
        return {
            success: true,
            jobId: job.id,
            message: `Scraping job created and processing initiated for ${targetUrl}.`,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create or process job',
        };
    }
}
// Helper function to process existing truck results
/**
 * Processes the result of an existing truck scraping operation.
 * @example
 * processExistingTruckResult('http://example.com', { status: 'fresh' }, { trucksProcessed: 1, newTrucksFound: 0 }, []);
 * // no return value, updates states and logs errors if any
 * @param {string} url - The URL of the truck to process.
 * @param {{ status: string; details?: string }} result - The result of the truck scraping operation, including status and optional details.
 * @param {{ trucksProcessed: number; newTrucksFound: number }} counters - Trackers for counting processed and newly found trucks.
 * @param {Array<{ url: string; details?: string }>} errors - A list to record any URLs that result in errors, along with optional error details.
 * @returns {Promise<void>} Resolves when processing is complete, performing status updates.
 * @description
 *   - Updates the status of the URL based on the result: either processing, processed, or irrelevant.
 *   - Pushes any error information to the errors array for further processing or logging.
 *   - Utilizes different status handling depending on the freshness or error state of the data.
 */
async function processExistingTruckResult(url, result, counters, errors) {
    switch (result.status) {
        case 're-scraping_triggered': {
            counters.trucksProcessed += 1;
            await updateDiscoveredUrlStatus(url, 'processing', 'Re-scraping triggered due to stale data');
            break;
        }
        case 'fresh': {
            await updateDiscoveredUrlStatus(url, 'processed', 'Data is fresh, no action needed');
            break;
        }
        case 'error': {
            errors.push({ url, details: result.details });
            await updateDiscoveredUrlStatus(url, 'irrelevant', `Error: ${result.details}`);
            break;
        }
        // No default
    }
}
// Helper function to process new truck results
/**
 * Processes the result of a new truck resource and updates the counters accordingly.
 * @example
 * processNewTruckResult('https://example.com/truck', { status: 'initial_scrape_triggered' }, { trucksProcessed: 5, newTrucksFound: 2 }, []);
 * // Updates counters and changes URL status to 'processing'.
 * @param {string} url - The URL of the new truck resource to be processed.
 * @param {Object} result - The result object containing the status and optional details of the process.
 * @param {string} result.status - The status of the truck processing result.
 * @param {string} [result.details] - Optional detailed message about the result.
 * @param {Object} counters - An object keeping count of processed trucks and newly found trucks.
 * @param {number} counters.trucksProcessed - The current count of processed trucks.
 * @param {number} counters.newTrucksFound - The count of newly found trucks.
 * @param {Array<Object>} errors - A list of error objects for unsuccessful processing attempts.
 * @param {string} errors.url - The URL of the truck resource that encountered an error.
 * @param {string} [errors.details] - Optional error details associated with the URL.
 * @returns {Promise<void>} This function returns nothing but performs asynchronous URL status updates and error logging.
 * @description
 *   - The function distinguishes between two specific statuses: 'initial_scrape_triggered' and 'error'.
 *   - For 'initial_scrape_triggered', it updates the counters and marks the URL as 'processing'.
 *   - For 'error', it logs the error details and marks the URL as 'irrelevant'.
 */
async function processNewTruckResult(url, result, counters, errors) {
    if (result.status === 'initial_scrape_triggered') {
        counters.newTrucksFound += 1;
        counters.trucksProcessed += 1;
        await updateDiscoveredUrlStatus(url, 'processing', 'Initial scraping triggered');
    }
    else if (result.status === 'error') {
        errors.push({ url, details: result.details });
        await updateDiscoveredUrlStatus(url, 'irrelevant', `Error: ${result.details}`);
    }
}
// Helper function to find existing truck for URL
/**
* Find an existing food truck based on the provided source URL.
* @example
* findExistingTruck('https://foodtruck.com/123')
* { truck: { id: 1, last_scraped_at: '2023-09-16T00:00:00Z', source_urls: ['https://foodtruck.com'] } }
* @param {string} url - The source URL used to search for an existing truck in the database.
* @returns {Promise<{ truck?: FoodTruck; error?: string }>} An object containing either the existing truck data or an error message.
* @description
*   - Utilizes Supabase admin client to query the 'food_trucks' database table.
*   - Warns in the console when a query error occurs during the database lookup.
*   - Limits the query results to a single truck that matches the URL criteria.
*/
async function findExistingTruck(url) {
    if (!supabaseAdmin) {
        return { error: 'Supabase admin client not available' };
    }
    const { data: existingTrucks, error: truckQueryError } = await supabaseAdmin
        .from('food_trucks')
        .select('id, last_scraped_at, source_urls')
        .or(`source_urls.cs.{"${url}"}`)
        .limit(1);
    if (truckQueryError) {
        console.warn(`AutoScraper: Error querying for existing truck for url ${url}:`, truckQueryError.message);
        return { error: `Supabase query error: ${truckQueryError.message}` };
    }
    const truck = existingTrucks != undefined && existingTrucks.length > 0
        ? existingTrucks[0]
        : undefined;
    return { truck };
}
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
export async function ensureDefaultTrucksAreScraped() {
    console.info('AutoScraper: Starting autonomous scraping process...');
    const counters = { trucksProcessed: 0, newTrucksFound: 0 };
    const errors = [];
    // Get URLs to scrape - combine static defaults with dynamically discovered URLs
    const urlsToScrape = await getUrlsToScrape();
    console.info(`AutoScraper: Found ${urlsToScrape.length} URLs to process`);
    for (const url of urlsToScrape) {
        try {
            console.info(`AutoScraper: Checking url: ${url}`);
            const { truck, error } = await findExistingTruck(url);
            if (error != undefined) {
                errors.push({ url, details: error });
                continue;
            }
            if (truck) {
                const result = await handleExistingTruck(url, truck);
                await processExistingTruckResult(url, result, counters, errors);
            }
            else {
                const result = await handleNewTruck(url);
                await processNewTruckResult(url, result, counters, errors);
            }
        }
        catch (error) {
            console.warn(`AutoScraper: Unexpected error processing url ${url}:`, error);
            errors.push({
                url,
                details: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    console.info('AutoScraper: Finished autonomous scraping process.');
    return {
        trucksProcessed: counters.trucksProcessed,
        newTrucksFound: counters.newTrucksFound,
        errors,
    };
}
/**
* Handles the existing truck data by checking staleness and potentially triggering a re-scrape process.
* @example
* handleExistingTruck('https://example.com/truck', { id: '123', last_scraped_at: '2023-09-01T00:00:00Z' })
* { url: 'https://example.com/truck', status: 'fresh', details: 'Last scraped at 2023-09-01T00:00:00Z' }
* @param {string} url - The URL of the food truck to check for staleness.
* @param {FoodTruck} truck - The food truck object containing its ID and last scrape date.
* @returns {Promise<{url: string; status: string; details?: string; jobId?: string}>} Returns the status and additional detail about the scraping process.
* @description
*   - Only triggers the re-scraping process if the data is considered stale based on a predefined threshold.
*   - Logs information about the current state of the truck's data freshness.
*   - Utilizes an asynchronous operation to potentially trigger a re-scrape.
*   - Returns an object indicating whether action was taken or not.
*/
async function handleExistingTruck(url, truck) {
    console.info(`AutoScraper: Found existing truck for ${url} (id: ${truck.id}). Last scraped: ${truck.last_scraped_at}`);
    const lastScrapedDate = new Date(truck.last_scraped_at);
    const stalenessLimit = new Date();
    stalenessLimit.setDate(stalenessLimit.getDate() - DEFAULT_STALENESS_THRESHOLD_DAYS);
    if (lastScrapedDate < stalenessLimit) {
        console.info(`AutoScraper: Data for ${url} is stale. Triggering re-scrape.`);
        const triggerResult = await triggerScrapingProcess(url);
        return {
            url,
            status: triggerResult.success ? 're-scraping_triggered' : 'error',
            details: triggerResult.error ?? triggerResult.message,
            jobId: triggerResult.jobId,
        };
    }
    console.info(`AutoScraper: Data for ${url} is fresh. No action needed.`);
    return { url, status: 'fresh', details: `Last scraped at ${truck.last_scraped_at}` };
}
/**
 * Initiates a scraping process for a new truck based on the given URL and returns the scraping status.
 * @example
 * handleNewTruck("https://example.com/truck-detail")
 * // Returns: { url: "https://example.com/truck-detail", status: "initial_scrape_triggered", details: "Scraping initiated", jobId: "12345" }
 * @param {string} url - The URL of the truck details page to be scraped.
 * @returns {Promise<{ url: string; status: string; details?: string; jobId?: string }>} An object containing the URL, status of the scraping attempt, optional details message, and optional job ID.
 * @description
 *   - Uses an asynchronous function to trigger the scraping process.
 *   - Logs an informational message when no existing truck is found for the given URL.
 *   - Returns a status indicating whether the scrape was successfully triggered or if there was an error.
 */
async function handleNewTruck(url) {
    console.info(`AutoScraper: No existing truck found for ${url}. Triggering initial scrape.`);
    const triggerResult = await triggerScrapingProcess(url);
    return {
        url,
        status: triggerResult.success ? 'initial_scrape_triggered' : 'error',
        details: triggerResult.error ?? triggerResult.message,
        jobId: triggerResult.jobId,
    };
}
// --- Gemini API Rate Limiting & Caching ---
const GEMINI_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const geminiCache = {};
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
export async function callGeminiWithCache(type, input, gemini) {
    const cacheKey = `${type}:${JSON.stringify(input)}`;
    const now = Date.now();
    // Clean up expired cache
    for (const key in geminiCache) {
        if (Object.prototype.hasOwnProperty.call(geminiCache, key) &&
            now - geminiCache[key].timestamp > GEMINI_CACHE_TTL_MS) {
            delete geminiCache[key];
        }
    }
    if (geminiCache[cacheKey] != undefined &&
        now - geminiCache[cacheKey].timestamp < GEMINI_CACHE_TTL_MS) {
        return geminiCache[cacheKey].data;
    }
    // Check Gemini usage limits before making a call
    const usage = await gemini.checkUsageLimits();
    if (!usage.canMakeRequest) {
        throw new Error('Gemini API daily limit reached. Try again tomorrow.');
    }
    // @ts-expect-error TS(2345): Argument of type 'string' is not assignable to par... Remove this comment to see the full error message
    const result = await dispatchGeminiOperation(type, input);
    geminiCache[cacheKey] = { data: result, timestamp: now };
    return result;
}
// Helper to get URLs to scrape from both static defaults and dynamic discovery
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
async function getUrlsToScrape() {
    const urls = new Set();
    // Add static default URLs
    for (const url of DEFAULT_SCRAPE_URLS)
        urls.add(url);
    // Add dynamically discovered URLs that are ready for processing
    try {
        if (!supabaseAdmin) {
            console.warn('AutoScraper: Supabase admin client not available for discovered URLs');
            return [...urls];
        }
        const { data: discoveredUrls, error } = await supabaseAdmin
            .from('discovered_urls')
            .select('url')
            .in('status', ['new', 'processed']) // Include both new and previously processed URLs
            .order('discovered_at', { ascending: false })
            .limit(100); // Limit to prevent overwhelming the system
        if (error) {
            console.warn('AutoScraper: Error fetching discovered URLs:', error.message);
        }
        else if (discoveredUrls != undefined) {
            for (const { url } of discoveredUrls)
                urls.add(url);
            console.info(`AutoScraper: Added ${discoveredUrls.length} discovered URLs to scraping queue`);
        }
    }
    catch (error) {
        console.warn('AutoScraper: Failed to fetch discovered URLs:', error);
    }
    return [...urls];
}
// Helper to update discovered URL status after processing
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
async function updateDiscoveredUrlStatus(url, status, notes) {
    try {
        if (!supabaseAdmin) {
            console.warn(`AutoScraper: Cannot update status for ${url} - Supabase admin client not available`);
            return;
        }
        const { error } = await supabaseAdmin
            .from('discovered_urls')
            .update({
            status,
            last_processed_at: new Date().toISOString(),
            notes: notes ?? undefined,
        })
            .eq('url', url);
        if (error != undefined) {
            console.warn(`AutoScraper: Failed to update status for ${url}:`, error.message);
        }
    }
    catch (error) {
        console.warn(`AutoScraper: Error updating discovered URL status for ${url}:`, error);
    }
}
// Note on processScrapingJob import:
// The direct import of `processScrapingJob` from `@/app/api/scrape/route.ts` can be problematic
// if `route.ts` has side effects or dependencies not suitable for a library context (like NextRequest/Response).
// A cleaner way would be to refactor `processScrapingJob` into a shared utility if it's to be called directly,
// or for `triggerScrapingProcess` to make an internal http post request to `/api/scrape`.
// For this iteration, we are attempting direct call, assuming it's manageable.
// Export autoScraper object for use in cron jobs
export const autoScraper = {
    runAutoScraping: ensureDefaultTrucksAreScraped,
    triggerScrapingProcess,
    callGeminiWithCache,
    getUrlsToScrape,
    updateDiscoveredUrlStatus,
};
// Main autonomous scraping function that combines discovery and scraping
export async function runAutonomousScraping() {
    console.info('AutoScraper: Starting fully autonomous scraping cycle...');
    // This function can be called by the autonomous scheduler
    // It uses the updated ensureDefaultTrucksAreScraped which now pulls from discovered_urls
    return await ensureDefaultTrucksAreScraped();
}
