// lib/autoScraper.ts
import { DEFAULT_SCRAPE_URLS, DEFAULT_STALENESS_THRESHOLD_DAYS } from './config';
import { supabaseAdmin, ScrapingJobService } from './supabase';
import { processScrapingJob } from '@/lib/pipelineProcessor';
import { discoverUrlsFromDirectories, SOUTH_CAROLINA_DIRECTORY_URLS } from './urlDiscovery'; // Added

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
   - Use Firecrawl/Tavily search/crawl to find food truck directories and individual truck sites.
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
    void processScrapingJob(job.id); // Mark as void to explicitly ignore promise
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

// Renamed function
export async function initiateFoodTruckProcessing(): Promise<
  Array<{ url: string; status: string; details?: string; jobId?: string }>
> {
  console.info('AutoScraper: Starting food truck processing initiation...');
  const results: Array<{ url: string; status: string; details?: string; jobId?: string }> = [];

  // 1. Discover and Process New SC URLs
  console.info('AutoScraper: Starting URL discovery for South Carolina...');
  try {
    const newlyDiscoveredUrls = await discoverUrlsFromDirectories(SOUTH_CAROLINA_DIRECTORY_URLS, "SC");
    console.info(`AutoScraper: Discovered ${newlyDiscoveredUrls.length} new URLs from directories, saved to 'discovered_urls'.`);

    // Fetch all 'new' URLs for SC region from discovered_urls table
    const { data: newScUrls, error: fetchError } = await supabaseAdmin
      .from('discovered_urls')
      .select('*') // Select all fields to get id, url etc.
      .eq('status', 'new')
      .eq('region', 'SC');

    if (fetchError) {
      console.error('AutoScraper: Error fetching new URLs from discovered_urls:', fetchError.message);
      results.push({
        url: 'SC_DISCOVERY_FETCH',
        status: 'error',
        details: `Failed to fetch new SC URLs: ${fetchError.message}`,
      });
    } else if (newScUrls && newScUrls.length > 0) {
      console.info(`AutoScraper: Found ${newScUrls.length} new URLs in 'discovered_urls' with status 'new' for SC region. Processing them...`);
      for (const discoveredUrl of newScUrls) {
        try {
          console.info(`AutoScraper: Processing newly discovered SC URL: ${discoveredUrl.url} (ID: ${discoveredUrl.id})`);
          const triggerResult = await triggerScrapingProcess(discoveredUrl.url);
          results.push({
            url: discoveredUrl.url,
            status: triggerResult.success ? 'newly_discovered_scrape_triggered' : 'error_triggering_discovered_scrape',
            details: triggerResult.error || triggerResult.message,
            jobId: triggerResult.jobId,
          });

          if (triggerResult.success) {
            // Update status to 'processing'
            const { error: updateError } = await supabaseAdmin
              .from('discovered_urls')
              .update({ status: 'processing', last_processed_at: new Date().toISOString() })
              .eq('id', discoveredUrl.id);
            if (updateError) {
              console.warn(`AutoScraper: Failed to update status for discovered_url ID ${discoveredUrl.id}: ${updateError.message}`);
              // Add a note to results or log, but don't override primary status if trigger was successful
               const resultIndex = results.length -1;
               results[resultIndex].details = (results[resultIndex].details || "") + ` | DB status update failed: ${updateError.message}`;
            } else {
              console.info(`AutoScraper: Successfully updated status to 'processing' for discovered_url ID ${discoveredUrl.id}`);
            }
          }
        } catch (e: unknown) {
          console.error(`AutoScraper: Error processing discovered URL ${discoveredUrl.url}:`, e);
          results.push({
            url: discoveredUrl.url,
            status: 'error',
            details: e instanceof Error ? e.message : 'Unknown error during discovered URL processing',
          });
        }
      }
    } else {
      console.info("AutoScraper: No new URLs with status 'new' found in 'discovered_urls' for SC region.");
    }
  } catch (discoveryError: unknown) {
    console.error('AutoScraper: Error during URL discovery phase:', discoveryError);
    results.push({
      url: 'SC_DISCOVERY_PROCESS',
      status: 'error',
      details: discoveryError instanceof Error ? discoveryError.message : 'Unknown error during URL discovery',
    });
  }

  // 2. Maintain Existing DEFAULT_SCRAPE_URLS Logic
  console.info('AutoScraper: Starting check for default configured URLs...');
  for (const url of DEFAULT_SCRAPE_URLS) {
    try {
      console.info(`AutoScraper: Checking default URL: ${url}`);
      const { data: existingTrucks, error: truckQueryError } = await supabaseAdmin
        .from('food_trucks')
        .select('id, last_scraped_at, source_urls')
        .or(`source_urls.cs.{"${url}"}`)
        .limit(1);

      if (truckQueryError) {
        console.warn(`AutoScraper: Error querying existing truck for default URL ${url}:`, truckQueryError.message);
        results.push({ url, status: 'error', details: `Supabase query error: ${truckQueryError.message}` });
        continue;
      }

      const truck: FoodTruck | undefined = existingTrucks && existingTrucks.length > 0 ? (existingTrucks[0] as FoodTruck) : undefined;

      if (truck) {
        // Using await here to ensure results are added in order for default trucks
        const result = await handleExistingTruck(url, truck);
        results.push(result);
      } else {
        const result = await handleNewTruck(url);
        results.push(result);
      }
    } catch (error: unknown) {
      console.warn(`AutoScraper: Unexpected error processing default URL ${url}:`, error);
      results.push({ url, status: 'error', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  console.info('AutoScraper: Finished food truck processing initiation.');
  return results;
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
  let result: unknown;
  switch (type) {
    case 'menu': {
      result = await gemini.processMenuData(input);
      break;
    }
    case 'location': {
      result = await gemini.extractLocationFromText(input);
      break;
    }
    case 'hours': {
      result = await gemini.standardizeOperatingHours(input);
      break;
    }
    case 'sentiment': {
      result = await gemini.analyzeSentiment(input);
      break;
    }
    case 'enhance': {
      result = await gemini.enhanceFoodTruckData(input);
      break;
    }
    default: {
      throw new Error(`Unknown Gemini call type: ${type}`);
    }
  }
  geminiCache[cacheKey] = { data: result, timestamp: now };
  return result;
}

// Note on processScrapingJob import:
// The direct import of `processScrapingJob` from `@/app/api/scrape/route.ts` can be problematic
// if `route.ts` has side effects or dependencies not suitable for a library context (like NextRequest/Response).
// A cleaner way would be to refactor `processScrapingJob` into a shared utility if it's to be called directly,
// or for `triggerScrapingProcess` to make an internal http post request to `/api/scrape`.
// For this iteration, we are attempting direct call, assuming it's manageable.
