// lib/autoScraper.ts
import { DEFAULT_SCRAPE_URLS, DEFAULT_STALENESS_THRESHOLD_DAYS } from './config';
import { supabaseAdmin, ScrapingJobService } from './supabase';
import { processScrapingJob } from '@/lib/pipelineProcessor';
import { dispatchGeminiOperation } from './gemini';

// Define interfaces for better type safety
interface FoodTruck {
  id: string;
  last_scraped_at: string;
  source_urls: string[];
}

interface TriggerScrapingProcessResult {
  success: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

export interface AutoScrapeResult {
  trucksProcessed: number;
  newTrucksFound: number;
  errors: Array<{ url: string; details?: string }>;
}

// Define interfaces for Gemini service inputs/outputs
interface GeminiUsageLimits {
  canMakeRequest: boolean;
}

interface ProcessedMenuData {
  // Define structure based on expected output from Gemini's processMenuData
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
  // Define structure based on expected output from Gemini's extractLocationFromText
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
  // Define structure based on expected output from Gemini's standardizeOperatingHours
  hours: Record<string, string>; // e.g., { "Monday": "9 AM - 5 PM" }
}

interface SentimentAnalysisResult {
  // Define structure based on expected output from Gemini's analyzeSentiment
  overall_sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  // Add more detailed sentiment breakdown if available
}

interface EnhancedFoodTruckData {
  // Define structure based on expected output from Gemini's enhanceFoodTruckData
  description: string;
  cuisine_type: string[];
  specialties: string[];
  // Add other enhanced fields
}

interface GeminiService {
  checkUsageLimits(): Promise<GeminiUsageLimits>;
  processMenuData(input: unknown): Promise<ProcessedMenuData>;
  extractLocationFromText(input: unknown): Promise<ExtractedLocationData>;
  standardizeOperatingHours(input: unknown): Promise<StandardizedOperatingHours>;
  analyzeSentiment(input: unknown): Promise<SentimentAnalysisResult>;
  enhanceFoodTruckData(input: unknown): Promise<EnhancedFoodTruckData>;
}

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
async function triggerScrapingProcess(targetUrl: string): Promise<TriggerScrapingProcessResult> {
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
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create or process job',
    };
  }
}

// Helper function to process existing truck results
async function processExistingTruckResult(
  url: string,
  result: { status: string; details?: string },
  counters: { trucksProcessed: number; newTrucksFound: number },
  errors: Array<{ url: string; details?: string }>,
): Promise<void> {
  switch (result.status) {
    case 're-scraping_triggered': {
      counters.trucksProcessed++;
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
async function processNewTruckResult(
  url: string,
  result: { status: string; details?: string },
  counters: { trucksProcessed: number; newTrucksFound: number },
  errors: Array<{ url: string; details?: string }>,
): Promise<void> {
  if (result.status === 'initial_scrape_triggered') {
    counters.newTrucksFound++;
    counters.trucksProcessed++;
    await updateDiscoveredUrlStatus(url, 'processing', 'Initial scraping triggered');
  } else if (result.status === 'error') {
    errors.push({ url, details: result.details });
    await updateDiscoveredUrlStatus(url, 'irrelevant', `Error: ${result.details}`);
  }
}

// Helper function to find existing truck for URL
async function findExistingTruck(url: string): Promise<{ truck?: FoodTruck; error?: string }> {
  if (!supabaseAdmin) {
    return { error: 'Supabase admin client not available' };
  }

  const { data: existingTrucks, error: truckQueryError } = await supabaseAdmin
    .from('food_trucks')
    .select('id, last_scraped_at, source_urls')
    .or(`source_urls.cs.{"${url}"}`)
    .limit(1);

  if (truckQueryError) {
    console.warn(
      `AutoScraper: Error querying for existing truck for url ${url}:`,
      truckQueryError.message,
    );
    return { error: `Supabase query error: ${truckQueryError.message}` };
  }

  const truck: FoodTruck | undefined =
    existingTrucks && existingTrucks.length > 0 ? (existingTrucks[0] as FoodTruck) : undefined;

  return { truck };
}

export async function ensureDefaultTrucksAreScraped(): Promise<AutoScrapeResult> {
  console.info('AutoScraper: Starting autonomous scraping process...');
  const counters = { trucksProcessed: 0, newTrucksFound: 0 };
  const errors: Array<{ url: string; details?: string }> = [];

  // Get URLs to scrape - combine static defaults with dynamically discovered URLs
  const urlsToScrape = await getUrlsToScrape();
  console.info(`AutoScraper: Found ${urlsToScrape.length} URLs to process`);

  for (const url of urlsToScrape) {
    try {
      console.info(`AutoScraper: Checking url: ${url}`);

      const { truck, error } = await findExistingTruck(url);

      if (error) {
        errors.push({ url, details: error });
        continue;
      }

      if (truck) {
        const result = await handleExistingTruck(url, truck);
        await processExistingTruckResult(url, result, counters, errors);
      } else {
        const result = await handleNewTruck(url);
        await processNewTruckResult(url, result, counters, errors);
      }
    } catch (error: unknown) {
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

async function handleExistingTruck(
  url: string,
  truck: FoodTruck,
): Promise<{ url: string; status: string; details?: string; jobId?: string }> {
  console.info(
    `AutoScraper: Found existing truck for ${url} (id: ${truck.id}). Last scraped: ${truck.last_scraped_at}`,
  );
  const lastScrapedDate = new Date(truck.last_scraped_at);
  const stalenessLimit = new Date();
  stalenessLimit.setDate(stalenessLimit.getDate() - DEFAULT_STALENESS_THRESHOLD_DAYS);

  if (lastScrapedDate < stalenessLimit) {
    console.info(`AutoScraper: Data for ${url} is stale. Triggering re-scrape.`);
    const triggerResult = await triggerScrapingProcess(url);
    return {
      url,
      status: triggerResult.success ? 're-scraping_triggered' : 'error',
      details: triggerResult.error || triggerResult.message,
      jobId: triggerResult.jobId,
    };
  } else {
    console.info(`AutoScraper: Data for ${url} is fresh. No action needed.`);
    return { url, status: 'fresh', details: `Last scraped at ${truck.last_scraped_at}` };
  }
}

async function handleNewTruck(
  url: string,
): Promise<{ url: string; status: string; details?: string; jobId?: string }> {
  console.info(`AutoScraper: No existing truck found for ${url}. Triggering initial scrape.`);
  const triggerResult = await triggerScrapingProcess(url);
  return {
    url,
    status: triggerResult.success ? 'initial_scrape_triggered' : 'error',
    details: triggerResult.error || triggerResult.message,
    jobId: triggerResult.jobId,
  };
}

// --- Gemini API Rate Limiting & Caching ---
const GEMINI_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const geminiCache: Record<string, { data: unknown; timestamp: number }> = {};

export async function callGeminiWithCache(
  type: string,
  input: unknown,
  gemini: GeminiService,
): Promise<unknown> {
  const cacheKey = `${type}:${JSON.stringify(input)}`;
  const now = Date.now();
  // Clean up expired cache
  for (const key in geminiCache) {
    if (
      Object.prototype.hasOwnProperty.call(geminiCache, key) &&
      now - geminiCache[key].timestamp > GEMINI_CACHE_TTL_MS
    ) {
      delete geminiCache[key];
    }
  }
  if (geminiCache[cacheKey] && now - geminiCache[cacheKey].timestamp < GEMINI_CACHE_TTL_MS) {
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
async function getUrlsToScrape(): Promise<string[]> {
  const urls = new Set<string>();

  // Add static default URLs
  for (const url of DEFAULT_SCRAPE_URLS) urls.add(url);

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
    } else if (discoveredUrls) {
      for (const { url } of discoveredUrls) urls.add(url as string);
      console.info(`AutoScraper: Added ${discoveredUrls.length} discovered URLs to scraping queue`);
    }
  } catch (error) {
    console.warn('AutoScraper: Failed to fetch discovered URLs:', error);
  }

  return [...urls];
}

// Helper to update discovered URL status after processing
async function updateDiscoveredUrlStatus(
  url: string,
  status: 'processing' | 'processed' | 'irrelevant',
  notes?: string,
): Promise<void> {
  try {
    if (!supabaseAdmin) {
      console.warn(
        `AutoScraper: Cannot update status for ${url} - Supabase admin client not available`,
      );
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

    if (error) {
      console.warn(`AutoScraper: Failed to update status for ${url}:`, error.message);
    }
  } catch (error) {
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
export async function runAutonomousScraping(): Promise<AutoScrapeResult> {
  console.info('AutoScraper: Starting fully autonomous scraping cycle...');

  // This function can be called by the autonomous scheduler
  // It uses the updated ensureDefaultTrucksAreScraped which now pulls from discovered_urls
  return await ensureDefaultTrucksAreScraped();
}
