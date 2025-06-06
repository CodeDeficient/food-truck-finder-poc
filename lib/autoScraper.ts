// lib/autoScraper.ts
import { DEFAULT_SCRAPE_URLS, DEFAULT_STALENESS_THRESHOLD_DAYS } from './config';
import { supabaseAdmin, ScrapingJobService } from './supabase';
import { processScrapingJob } from '@/lib/pipelineProcessor';
// Import for Phase 1 - Directory Prospecting & Classification
import { prospectForCandidateDirectories } from './directoryProspector';
import { classifyAndStoreDirectory } from './directoryClassifier';
// Original import for discoverUrlsFromDirectories (now part of Phase 2, to be refactored/removed from direct call here)
// import { discoverUrlsFromDirectories, SOUTH_CAROLINA_DIRECTORY_URLS } from './urlDiscovery'; // This line will be removed
import { discoverTruckUrlsFromConfirmedDirectories } from './urlDiscovery'; // Added for Phase 2


// --- Pipeline Configuration and Summary Types ---
interface PipelineRunConfig {
  forceRunDirectoryProspecting?: boolean;
  directoryProspectingIntervalDays?: number; // e.g., 7
  maxDirectoriesToClassifyPerRun?: number; // e.g., 5

  forceRunTruckUrlDiscovery?: boolean;
  truckUrlDiscoveryIntervalDays?: number; // e.g., 1
  // maxConfirmedDirectoriesToCrawlPerRun is already handled by discoverTruckUrlsFromConfirmedDirectories's internal limit

  forceProcessNewTrucks?: boolean;
  processNewTrucksIntervalDays?: number; // e.g., 1
  maxNewTrucksToProcessPerRun?: number; // e.g., 20

  forceProcessStaleTrucks?: boolean;
  processStaleTrucksIntervalDays?: number; // e.g., 1
  stalenessThresholdDays?: number; // e.g., DEFAULT_STALENESS_THRESHOLD_DAYS (30)
  maxStaleTrucksToProcessPerRun?: number; // e.g., 10

  forceProcessDefaultUrls?: boolean;
  processDefaultUrlsIntervalDays?: number; // e.g., 1
}

interface PipelineProcessingSummary {
  ranDirectoryProspecting: boolean;
  candidateDirectoriesFound?: number;
  directoriesClassified?: number;

  ranTruckUrlDiscovery: boolean;
  newTruckUrlsDiscoveredFromDirs?: number;

  newlyDiscoveredTrucksTriggered: number;
  staleTrucksRetriggered: number;
  defaultUrlsProcessed: number;
  errors: Array<{ phase: string; message: string; url?: string }>;
}

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

// --- Frequency Control Helper Functions ---
async function checkFrequency(eventName: string, intervalDays: number): Promise<boolean> {
  if (intervalDays <= 0) return true; // Always run if interval is zero or negative

  const { data, error } = await supabaseAdmin
    .from('pipeline_metadata')
    .select('last_run_at')
    .eq('event_name', eventName)
    .maybeSingle();

  if (error) {
    console.error(`AutoScraper.checkFrequency: Error fetching metadata for ${eventName}:`, error.message);
    return true; // Default to running if there's an error fetching metadata
  }

  if (!data || !data.last_run_at) {
    console.info(`AutoScraper.checkFrequency: No previous run found for ${eventName}. Will run.`);
    return true; // Never run before
  }

  const lastRun = new Date(data.last_run_at);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - intervalDays);

  const shouldRun = lastRun < threshold;
  console.info(`AutoScraper.checkFrequency: Event ${eventName} last ran at ${lastRun.toISOString()}. Threshold is ${threshold.toISOString()}. Should run: ${shouldRun}`);
  return shouldRun;
}

async function updateFrequency(eventName: string, runAt: Date): Promise<void> {
  const { error } = await supabaseAdmin
    .from('pipeline_metadata')
    .upsert({ event_name: eventName, last_run_at: runAt.toISOString() }, { onConflict: 'event_name' });

  if (error) {
    console.error(`AutoScraper.updateFrequency: Error updating metadata for ${eventName}:`, error.message);
  } else {
    console.info(`AutoScraper.updateFrequency: Updated last_run_at for ${eventName} to ${runAt.toISOString()}`);
  }
}


// Updated function signature and initial setup
export async function initiateFoodTruckProcessing(config: PipelineRunConfig = {}): Promise<PipelineProcessingSummary> {
  console.info('AutoScraper: Starting food truck processing initiation with config:', config);

  const summary: PipelineProcessingSummary = {
    ranDirectoryProspecting: false,
    ranTruckUrlDiscovery: false,
    newlyDiscoveredTrucksTriggered: 0,
    staleTrucksRetriggered: 0,
    defaultUrlsProcessed: 0,
    errors: [],
  };
  const now = new Date(); // For updating timestamps

  // TODO: Main processing loops for phases 1-5 will be added in subsequent subtasks.
  // For now, this function will just initialize the summary and then proceed to the existing logic
  // which will be refactored/integrated later.

  // The existing logic needs to be adapted to fit into the new summary structure
  // and to respect the new config parameters (e.g., maxNewTrucksToProcessPerRun).
  // For this subtask, we are only setting up the new structure.
  // The old return type Array<{ url: string; status: string; details?: string; jobId?: string }>
  // will be replaced by PipelineProcessingSummary.

  // --- Phase 1: Directory Prospecting & Classification (Less Frequent) ---
  console.info('AutoScraper: Checking frequency for Directory Prospecting & Classification phase...');
  const directoryProspectingInterval = config.directoryProspectingIntervalDays ?? 7; // Default to 7 days
  const shouldRunDirectoryProspecting = config.forceRunDirectoryProspecting || await checkFrequency('lastDirectoryProspectingRun', directoryProspectingInterval);

  if (shouldRunDirectoryProspecting) {
    console.info('AutoScraper: Running Directory Prospecting & Classification phase...');
    summary.ranDirectoryProspecting = true;
    try {
      const candidateDirectoryUrls = await prospectForCandidateDirectories();
      summary.candidateDirectoriesFound = candidateDirectoryUrls.length;
      console.info(`AutoScraper: Directory Prospector found ${candidateDirectoryUrls.length} candidate URLs.`);

      let classifiedCount = 0;
      const maxToClassify = config.maxDirectoriesToClassifyPerRun ?? 5; // Default to classifying 5 per run

      // Process a limited number of candidate directories per run
      for (const candUrl of candidateDirectoryUrls.slice(0, maxToClassify)) {
        try {
          console.info(`AutoScraper: Classifying candidate directory: ${candUrl}`);
          await classifyAndStoreDirectory(candUrl);
          classifiedCount++;
        } catch (classError: any) {
          console.error(`AutoScraper: Error during classification of ${candUrl}:`, classError.message);
          summary.errors.push({ phase: 'DirectoryClassification', message: `Error classifying ${candUrl}: ${classError.message}`, url: candUrl });
        }
      }
      summary.directoriesClassified = classifiedCount;
      console.info(`AutoScraper: Classified ${classifiedCount} candidate directories.`);

      if (candidateDirectoryUrls.length > 0 || classifiedCount > 0) { // Only update if work was attempted or done
           await updateFrequency('lastDirectoryProspectingRun', now);
      }
    } catch (prospectError: any) {
      console.error('AutoScraper: Error during Directory Prospecting phase:', prospectError.message);
      summary.errors.push({ phase: 'DirectoryProspecting', message: prospectError.message });
    }
  } else {
    console.info('AutoScraper: Skipping Directory Prospecting & Classification phase based on frequency or config.');
  }

  // --- Phase 2: Discover Truck URLs from Confirmed Active Directories (More Frequent) ---
  console.info('AutoScraper: Checking frequency for Truck URL Discovery from Confirmed Directories phase...');
  const truckUrlDiscoveryInterval = config.truckUrlDiscoveryIntervalDays ?? 1; // Default to 1 day
  const shouldRunTruckUrlDiscovery = config.forceRunTruckUrlDiscovery || await checkFrequency('lastTruckUrlDiscoveryRun', truckUrlDiscoveryInterval);

  if (shouldRunTruckUrlDiscovery) {
    console.info('AutoScraper: Running Truck URL Discovery from Confirmed Directories phase for region SC...');
    summary.ranTruckUrlDiscovery = true;
    try {
      // This function internally queries 'discovered_directories' for active, SC-focused ones,
      // crawls them, filters for truck URLs, and saves them to 'discovered_urls' with 'new' status.
      // It returns a list of newly found unique truck URLs.
      const newTruckUrls = await discoverTruckUrlsFromConfirmedDirectories("SC");
      summary.newTruckUrlsDiscoveredFromDirs = newTruckUrls.length;
      console.info(`AutoScraper: Truck URL Discovery found ${newTruckUrls.length} new truck URLs and saved/updated them in 'discovered_urls'.`);

      if (newTruckUrls.length > 0) { // Only update if work was done
          await updateFrequency('lastTruckUrlDiscoveryRun', now);
      }
    } catch (truckDiscoveryError: any) {
      console.error('AutoScraper: Error during Truck URL Discovery from Confirmed Directories phase:', truckDiscoveryError.message);
      summary.errors.push({ phase: 'TruckUrlDiscoveryFromDirs', message: truckDiscoveryError.message });
    }
  } else {
    console.info('AutoScraper: Skipping Truck URL Discovery from Confirmed Directories phase based on frequency or config.');
  }

  // The OLD Block for "Discover and Process New SC URLs" has been removed as its functionality
  // is superseded by Phase 2 (for discovering truck URLs from directories) and upcoming Phase 3/4 (for processing those URLs).

  // --- Phase 3: Process 'new' Individual Truck URLs from 'discovered_urls' ---
  console.info('AutoScraper.Phase3: Checking frequency for Processing New Truck URLs...');
  const processNewTrucksInterval = config.processNewTrucksIntervalDays ?? 1; // Default to 1 day
  const shouldProcessNewTrucks = config.forceProcessNewTrucks || await checkFrequency('lastProcessNewTrucksRun', processNewTrucksInterval);

  if (shouldProcessNewTrucks) {
    console.info('AutoScraper.Phase3: Running Processing New Truck URLs phase for region SC...');
    try {
      const maxNewToProcess = config.maxNewTrucksToProcessPerRun ?? 20;
      const { data: newTrucksToProcess, error: fetchError } = await supabaseAdmin
        .from('discovered_urls')
        .select('*')
        .eq('status', 'new')
        .eq('region', 'SC') // Assuming we are focusing on SC for now
        .limit(maxNewToProcess);

      if (fetchError) {
        console.error('AutoScraper.Phase3: Error fetching new truck URLs from discovered_urls:', fetchError.message);
        summary.errors.push({ phase: 'ProcessNewTrucks', message: `Failed to fetch new trucks: ${fetchError.message}` });
      } else if (newTrucksToProcess && newTrucksToProcess.length > 0) {
        console.info(`AutoScraper.Phase3: Found ${newTrucksToProcess.length} new truck URLs to process.`);
        let processedCount = 0;
        for (const truckUrlRecord of newTrucksToProcess) {
          try {
            console.info(`AutoScraper.Phase3: Processing new truck URL (ID: ${truckUrlRecord.id}): ${truckUrlRecord.url}`);
            const triggerResult = await triggerScrapingProcess(truckUrlRecord.url);

            if (triggerResult.success) {
              summary.newlyDiscoveredTrucksTriggered++;
              processedCount++;
              // Update status to 'processing' in discovered_urls
              const { error: updateError } = await supabaseAdmin
                .from('discovered_urls')
                .update({ status: 'processing', last_processed_at: new Date().toISOString() })
                .eq('id', truckUrlRecord.id);
              if (updateError) {
                console.warn(`AutoScraper.Phase3: Failed to update status for discovered_url ID ${truckUrlRecord.id}: ${updateError.message}`);
                summary.errors.push({ phase: 'ProcessNewTrucks', message: `Failed to update status for ${truckUrlRecord.url}: ${updateError.message}`, url: truckUrlRecord.url });
              }
            } else {
              summary.errors.push({ phase: 'ProcessNewTrucks', message: `Failed to trigger scrape for ${truckUrlRecord.url}: ${triggerResult.error}`, url: truckUrlRecord.url });
            }
          } catch (e: any) {
            console.error(`AutoScraper.Phase3: Error processing new truck URL ${truckUrlRecord.url}:`, e.message);
            summary.errors.push({ phase: 'ProcessNewTrucks', message: `Error processing ${truckUrlRecord.url}: ${e.message}`, url: truckUrlRecord.url });
          }
        }
        if (processedCount > 0) {
          await updateFrequency('lastProcessNewTrucksRun', now);
        }
        console.info(`AutoScraper.Phase3: Triggered processing for ${summary.newlyDiscoveredTrucksTriggered} new truck URLs.`);
      } else {
        console.info('AutoScraper.Phase3: No new truck URLs found to process.');
      }
    } catch (e: any) {
      console.error('AutoScraper.Phase3: Error in Processing New Truck URLs phase:', e.message);
      summary.errors.push({ phase: 'ProcessNewTrucks', message: e.message });
    }
  } else {
    console.info('AutoScraper.Phase3: Skipping Processing New Truck URLs phase based on frequency or config.');
  }

  // --- Phase 4: Re-scrape Stale Food Trucks ---
  console.info('AutoScraper.Phase4: Checking frequency for Re-scraping Stale Food Trucks...');
  const processStaleTrucksInterval = config.processStaleTrucksIntervalDays ?? 1; // Default to 1 day
  const shouldProcessStaleTrucks = config.forceProcessStaleTrucks || await checkFrequency('lastProcessStaleTrucksRun', processStaleTrucksInterval);

  if (shouldProcessStaleTrucks) {
    console.info('AutoScraper.Phase4: Running Re-scraping Stale Food Trucks phase for region SC...');
    try {
      const stalenessThresholdDate = new Date();
      stalenessThresholdDate.setDate(stalenessThresholdDate.getDate() - (config.stalenessThresholdDays ?? DEFAULT_STALENESS_THRESHOLD_DAYS));

      const maxStaleToProcess = config.maxStaleTrucksToProcessPerRun ?? 10;
      const { data: staleTrucks, error: staleFetchError } = await supabaseAdmin
        .from('food_trucks')
        .select('id, source_urls')
        .eq('state', 'SC') // Assuming 'state' column is populated for SC trucks
        .lt('last_scraped_at', stalenessThresholdDate.toISOString())
        .order('last_scraped_at', { ascending: true })
        .limit(maxStaleToProcess);

      if (staleFetchError) {
        console.error('AutoScraper.Phase4: Error fetching stale trucks:', staleFetchError.message);
        summary.errors.push({ phase: 'ProcessStaleTrucks', message: `Error fetching stale trucks: ${staleFetchError.message}` });
      } else if (staleTrucks && staleTrucks.length > 0) {
        console.info(`AutoScraper.Phase4: Found ${staleTrucks.length} stale SC food trucks to re-scrape.`);
        let retriggeredCount = 0;
        for (const truck of staleTrucks) {
          if (truck.source_urls && truck.source_urls.length > 0) {
            const primaryUrl = truck.source_urls[0]; // Assuming the first URL is primary
            try {
              console.info(`AutoScraper.Phase4: Triggering re-scrape for stale truck (ID: ${truck.id}), URL: ${primaryUrl}`);
              const triggerResult = await triggerScrapingProcess(primaryUrl);
              if (triggerResult.success) {
                summary.staleTrucksRetriggered++;
                retriggeredCount++;
              } else {
                summary.errors.push({ phase: 'ProcessStaleTrucks', message: `Failed to trigger re-scrape for ${primaryUrl}: ${triggerResult.error}`, url: primaryUrl });
              }
            } catch (e: any) {
              console.error(`AutoScraper.Phase4: Error re-scraping stale truck ${primaryUrl}:`, e.message);
              summary.errors.push({ phase: 'ProcessStaleTrucks', message: `Error re-scraping ${primaryUrl}: ${e.message}`, url: primaryUrl });
            }
          }
        }
        if (retriggeredCount > 0) {
           await updateFrequency('lastProcessStaleTrucksRun', now);
        }
        console.info(`AutoScraper.Phase4: Triggered re-scraping for ${summary.staleTrucksRetriggered} stale SC trucks.`);
      } else {
        console.info('AutoScraper.Phase4: No stale SC food trucks found needing re-scraping.');
      }
    } catch (e: any) {
      console.error('AutoScraper.Phase4: Error in Re-scraping Stale Food Trucks phase:', e.message);
      summary.errors.push({ phase: 'ProcessStaleTrucks', message: e.message });
    }
  } else {
    console.info('AutoScraper.Phase4: Skipping Re-scraping Stale Food Trucks phase based on frequency or config.');
  }


  // Maintain Existing DEFAULT_SCRAPE_URLS Logic (This will become part of Phase 3/4 or a separate maintenance task)
  // This section's new/stale processing is largely superseded by Phase 3 and 4 for SC trucks.
  // --- Phase 5: Process DEFAULT_SCRAPE_URLS ---
  console.info('AutoScraper.Phase5: Checking frequency for Processing Default URLs...');
  const processDefaultUrlsInterval = config.processDefaultUrlsIntervalDays ?? 1; // Default to 1 day
  const shouldProcessDefaultUrls = config.forceProcessDefaultUrls || await checkFrequency('lastProcessDefaultUrlsRun', processDefaultUrlsInterval);

  if (shouldProcessDefaultUrls) {
    console.info('AutoScraper.Phase5: Running Processing Default URLs phase...');
    let processedInPhaseCount = 0;
    for (const url of DEFAULT_SCRAPE_URLS) {
      processedInPhaseCount++;
      try {
        console.info(`AutoScraper.Phase5: Checking default URL: ${url}`);
        const { data: existingTrucks, error: truckQueryError } = await supabaseAdmin
          .from('food_trucks')
          .select('id, last_scraped_at, source_urls')
          .or(`source_urls.cs.{"${url}"}`) // Check if url is in the source_urls array
          .limit(1);

        if (truckQueryError) {
          console.warn(`AutoScraper.Phase5: Error querying existing truck for default URL ${url}:`, truckQueryError.message);
          summary.errors.push({ phase: 'ProcessDefaultUrls_Query', message: truckQueryError.message, url });
          continue;
        }

        const truck: FoodTruck | undefined = existingTrucks && existingTrucks.length > 0 ? (existingTrucks[0] as FoodTruck) : undefined;

        if (truck) {
          const result = await handleExistingTruck(url, truck); // handleExistingTruck checks for staleness internally
          if (result.status === 're-scraping_triggered') {
             summary.staleTrucksRetriggered++; // Counted as stale if re-triggered from default list
          }
        } else {
          const result = await handleNewTruck(url);
          if (result.status === 'initial_scrape_triggered') {
            // This counts towards newlyDiscoveredTrucksTriggered as it's a new entity to the system.
            summary.newlyDiscoveredTrucksTriggered++;
          }
        }
      } catch (error: any) {
        console.warn(`AutoScraper.Phase5: Unexpected error processing default URL ${url}:`, error.message);
        summary.errors.push({ phase: 'ProcessDefaultUrls_Processing', message: error.message, url });
      }
    }
    summary.defaultUrlsProcessed = processedInPhaseCount;
    if (processedInPhaseCount > 0) {
        await updateFrequency('lastProcessDefaultUrlsRun', now);
    }
    console.info(`AutoScraper.Phase5: Finished processing ${processedInPhaseCount} default URLs.`);
  } else {
    console.info('AutoScraper.Phase5: Skipping Processing Default URLs phase based on frequency or config.');
  }

  console.info('AutoScraper: ===== Pipeline Processing Summary =====');
  console.info(`Directory Prospecting Ran: ${summary.ranDirectoryProspecting}`);
  if (summary.ranDirectoryProspecting) {
    console.info(`  Candidate Directories Found: ${summary.candidateDirectoriesFound ?? 0}`);
    console.info(`  Directories Classified: ${summary.directoriesClassified ?? 0}`);
  }
  console.info(`Truck URL Discovery Ran: ${summary.ranTruckUrlDiscovery}`);
  if (summary.ranTruckUrlDiscovery) {
    console.info(`  New Truck URLs Discovered from Dirs: ${summary.newTruckUrlsDiscoveredFromDirs ?? 0}`);
  }
  console.info(`New Discovered Trucks Triggered for Scraping (Phases 3 & 5): ${summary.newlyDiscoveredTrucksTriggered}`);
  console.info(`Stale Trucks Retriggered for Scraping (Phases 4 & 5): ${summary.staleTrucksRetriggered}`);
  console.info(`Default URLs Processed (Phase 5): ${summary.defaultUrlsProcessed}`);
  if (summary.errors.length > 0) {
    console.warn('AutoScraper: Errors during pipeline execution:');
    summary.errors.forEach(err => console.warn(`  Phase: ${err.phase}, URL: ${err.url || 'N/A'}, Message: ${err.message}`));
  }
  console.info('AutoScraper: ======================================');

  // This existing log can stay or be removed if redundant with summary.
  console.info('AutoScraper: Finished full food truck processing pipeline.');
  return summary;
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
