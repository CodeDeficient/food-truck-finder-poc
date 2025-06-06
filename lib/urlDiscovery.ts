import { firecrawl } from './firecrawl'; // Adjust path as necessary
import { supabaseAdmin } from './supabase'; // Adjust path as necessary

export const SOUTH_CAROLINA_DIRECTORY_URLS: string[] = [
  "https://www.charlestoncitypaper.com/food/food-trucks", // Example, might change
  "https://www.visitgreenvillesc.com/restaurants/food-trucks/", // Example, might change
  "https://www.columbiatownship.com/business-directory/food-drinks", // Placeholder, needs verification
  // Add 1-2 more potentially good, general (city-level) business directories for SC cities if known
  "https://www.hiltonheadisland.org/restaurants", // Broader, but might contain relevant links
  "https://www.myrtlebeachareachamber.com/list/ql/restaurants-food-beverages-22" // Broader
];

const COMMON_FILE_EXTENSIONS = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|mp3|mp4|avi|mov|css|js)$/i;
const SOCIAL_MEDIA_DOMAINS = [
  'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com', 'pinterest.com',
  'youtube.com', 'tiktok.com', 'yelp.com', 'tripadvisor.com', 'foursquare.com',
  // Add more specific social/review platforms if needed
];


interface DiscoveredUrlEntry {
  url: string;
  source_directory_url: string;
  region: string;
  status: 'new'; // Default to new, other statuses managed by different processes
  // discovered_at will be set by db default
}

/**
 * Extracts all absolute URLs from an HTML string.
 * @param htmlContent The HTML content to parse.
 * @param baseUrl The base URL to resolve relative paths.
 * @returns A Set of unique absolute URLs.
 */
function extractLinksFromHtml(htmlContent: string, baseUrl: string): Set<string> {
    const links = new Set<string>();
    // Regex to find href attributes in <a> tags
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
    let match;
    while ((match = linkRegex.exec(htmlContent)) !== null) {
        let href = match[2];
        if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            try {
                const absoluteUrl = new URL(href, baseUrl).toString();
                links.add(absoluteUrl);
            } catch (e) {
                // console.warn(`Could not parse URL: ${href} relative to ${baseUrl}`);
            }
        }
    }
    return links;
}


/**
 * Discovers potential food truck URLs from a list of directory websites
 * using Firecrawl and saves new, valid URLs to Supabase.
 *
 * @param directoryUrls - A list of URLs for directories that might list food trucks.
 * @param region - The region these directories pertain to (e.g., "SC").
 * @returns A promise that resolves to a list of newly inserted DiscoveredUrlEntry objects.
 */
export async function discoverUrlsFromDirectories(
  directoryUrls: string[],
  region: string,
): Promise<DiscoveredUrlEntry[]> {
  console.log(`[URL Discovery] Starting for region: ${region} from ${directoryUrls.length} directories.`);
  const newlyInsertedUrls: DiscoveredUrlEntry[] = [];
  const processedCandidateUrls = new Set<string>(); // Track candidates within this run to avoid processing duplicates from same crawl

  for (const dirUrl of directoryUrls) {
    console.log(`[URL Discovery] Processing directory: ${dirUrl}`);

    // 1. Crawl the directory URL
    const crawlJob = await firecrawl.crawlWebsite(dirUrl, {
      crawlerOptions: { maxDepth: 1, limit: 10 }, // Limit depth and pages for directories
      pageOptions: { formats: ['html'], onlyMainContent: false }, // Need full HTML to find all links
    });

    if (!crawlJob.success || !crawlJob.jobId) {
      console.error(`[URL Discovery] Failed to start crawl for ${dirUrl}. Error: ${crawlJob.error}`);
      continue;
    }
    console.log(`[URL Discovery] Crawl job started for ${dirUrl}, Job ID: ${crawlJob.jobId}. Waiting for completion...`);

    let crawlStatus;
    let attempts = 0;
    const maxAttempts = 10; // Max attempts to check status (e.g., 10 * 30s = 5 minutes)
    const checkInterval = 30000; // 30 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      crawlStatus = await firecrawl.getCrawlStatus(crawlJob.jobId);
      attempts++;

      if (crawlStatus.success && crawlStatus.status === 'completed') {
        console.log(`[URL Discovery] Crawl completed for ${dirUrl}.`);
        break;
      } else if (crawlStatus.status === 'failed' || !crawlStatus.success) {
        console.error(`[URL Discovery] Crawl failed for ${dirUrl}. Error: ${crawlStatus.error || 'Unknown crawl error'}`);
        crawlStatus = undefined; // Ensure it's not processed further
        break;
      }
      console.log(`[URL Discovery] Crawl status for ${dirUrl}: ${crawlStatus.status} (Attempt ${attempts}/${maxAttempts})`);
    }

    if (!crawlStatus || crawlStatus.status !== 'completed' || !crawlStatus.data) {
      console.error(`[URL Discovery] Crawl for ${dirUrl} did not complete successfully or returned no data.`);
      continue;
    }

    // 2. Extract and filter links from crawled data
    const candidateUrls = new Set<string>();
    for (const page of crawlStatus.data) {
      if (page.html) {
        const pageLinks = extractLinksFromHtml(page.html, page.metadata?.sourceURL || dirUrl);
        pageLinks.forEach(link => candidateUrls.add(link));
      } else if (page.metadata?.sourceURL) {
        // If only metadata (e.g. a redirect or non-HTML page), consider its sourceURL as a candidate if it's different from dirUrl
        // This is less common with formats:['html'] but good for robustness
         if(page.metadata.sourceURL !== dirUrl) candidateUrls.add(page.metadata.sourceURL);
      }
    }
    console.log(`[URL Discovery] Extracted ${candidateUrls.size} unique links from ${dirUrl}. Filtering...`);


    const urlsToInsert: DiscoveredUrlEntry[] = [];

    for (const candidateUrl of candidateUrls) {
      if (processedCandidateUrls.has(candidateUrl)) {
        continue; // Already processed in this run (e.g. from another page in the same directory crawl)
      }
      processedCandidateUrls.add(candidateUrl);

      // Basic URL validation and normalization
      let parsedUrl;
      try {
        parsedUrl = new URL(candidateUrl);
      } catch (e) {
        // console.warn(`[URL Discovery] Invalid URL format: ${candidateUrl}`);
        continue;
      }

      const normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}`.toLowerCase();

      // Filter out common file extensions
      if (COMMON_FILE_EXTENSIONS.test(normalizedUrl)) {
        // console.log(`[URL Discovery] Filtered out (file extension): ${normalizedUrl}`);
        continue;
      }

      // Filter out known social media domains
      if (SOCIAL_MEDIA_DOMAINS.some(domain => parsedUrl.hostname.includes(domain))) {
        // console.log(`[URL Discovery] Filtered out (social media): ${normalizedUrl}`);
        continue;
      }

      // Filter out URLs that are subpaths of the directory itself (unless dir is very generic)
      // This helps avoid crawling internal links of the directory that aren't distinct businesses
      if (parsedUrl.hostname === new URL(dirUrl).hostname && parsedUrl.pathname.startsWith(new URL(dirUrl).pathname) && parsedUrl.pathname !== new URL(dirUrl).pathname) {
          // console.log(`[URL Discovery] Filtered out (subpath of directory): ${normalizedUrl}`);
          continue;
      }


      // 3. Check if URL (domain or full URL) already exists in `discovered_urls` or `food_trucks`
      // For simplicity, checking `discovered_urls` for the exact normalized URL.
      // A more robust check might involve checking just the domain (parsedUrl.hostname)
      // or querying the food_trucks table as well.
      const { data: existingUrls, error: dbError } = await supabaseAdmin
        .from('discovered_urls')
        .select('url')
        .eq('url', normalizedUrl)
        .limit(1);

      if (dbError) {
        console.error(`[URL Discovery] Supabase error checking URL ${normalizedUrl}: ${dbError.message}`);
        continue; // Skip this URL on error
      }

      if (existingUrls && existingUrls.length > 0) {
        // console.log(`[URL Discovery] Filtered out (already exists in discovered_urls): ${normalizedUrl}`);
        continue;
      }

      // Add to list for batch insertion
      console.log(`[URL Discovery]  [Potential Add] ${normalizedUrl} (from ${candidateUrl} via ${dirUrl})`);
      urlsToInsert.push({
        url: normalizedUrl,
        source_directory_url: dirUrl,
        region: region,
        status: 'new',
      });
    }

    // 4. Save new URLs to Supabase
    if (urlsToInsert.length > 0) {
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('discovered_urls')
        .insert(urlsToInsert)
        .select(); // Important to get the inserted data back

      if (insertError) {
        console.error(`[URL Discovery] Supabase insert error for directory ${dirUrl}: ${insertError.message}. Details: ${insertError.details}`);
        // Handle potential unique constraint violations if any URL slipped through despite checks
        if (insertError.code === '23505') { // Unique violation
          console.warn(`[URL Discovery] A unique constraint violation occurred. Some URLs might have been inserted by a concurrent process.`);
        }
      } else if (insertedData) {
        console.log(`[URL Discovery] Successfully saved ${insertedData.length} new URLs from ${dirUrl} to Supabase.`);
        newlyInsertedUrls.push(...insertedData as DiscoveredUrlEntry[]);
      }
    } else {
      console.log(`[URL Discovery] No new, valid URLs to save from ${dirUrl}.`);
    }
  }

  console.log(`[URL Discovery] Finished for region: ${region}. Total newly discovered and saved URLs: ${newlyInsertedUrls.length}`);
  return newlyInsertedUrls;
}

// Example Usage (can be run with `npx ts-node -r dotenv/config lib/urlDiscovery.ts` if set up)
/*
async function main() {
  // Ensure your .env file has SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FIRECRAWL_API_KEY
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.FIRECRAWL_API_KEY) {
    console.error("Missing environment variables. Ensure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and FIRECRAWL_API_KEY are set.");
    return;
  }

  console.log("Starting manual discovery process...");
  const region = "SC"; // Or any other region
  // Using a subset for testing to avoid excessive crawling
  const testDirectories = SOUTH_CAROLINA_DIRECTORY_URLS.slice(0, 1);

  try {
    const results = await discoverUrlsFromDirectories(testDirectories, region);
    console.log("\n--- URL Discovery Summary ---");
    if (results.length > 0) {
      console.log(`Successfully discovered and saved ${results.length} new URLs:`);
      results.forEach(r => console.log(`  - ${r.url} (Source: ${r.source_directory_url})`));
    } else {
      console.log("No new URLs were discovered and saved in this run.");
    }
  } catch (error) {
    console.error("\n--- Error during URL Discovery ---");
    console.error(error);
  }
}

// main().catch(console.error); // Comment out if not running directly
*/

// --- Constants for Truck URL Discovery (copied/adapted from directoryProspector) ---
// These are distinct from SOCIAL_MEDIA_DOMAINS and COMMON_FILE_EXTENSIONS used in discoverUrlsFromDirectories
// as the filtering logic might be different or more specific.
const TRUCK_URL_IRRELEVANT_DOMAINS: string[] = [
  'google.com', 'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'linkedin.com',
  'pinterest.com', 'tiktok.com', 'yelp.com', 'tripadvisor.com', 'amazon.com', 'ebay.com',
  'apple.com', 'microsoft.com', 'adobe.com', 'wordpress.org', 'wordpress.com', 'eventbrite.com',
  'ticketmaster.com', 'seatgeek.com', 'axs.com', 'etsy.com', 'doordash.com', 'grubhub.com', 'uber.com',
  // Add more general platforms that are unlikely to be a food truck's primary website
];

const TRUCK_URL_IRRELEVANT_FILE_EXTENSIONS: RegExp = /\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|rar|exe|dmg|mp4|mov|avi|webp|ico|xml|txt|map)$/i;
const DIRECTORY_KEYWORDS_IN_PATH: string[] = ["directory", "listings", "categories", "event", "calendar", "search", "guide", "list", "vendors"];


// --- Helper for Truck URL Discovery ---

/**
 * Filters a set of URLs found on a directory page to identify potential individual food truck websites.
 * @param urls A Set of URLs to filter.
 * @param directoryDomain The domain of the directory website from which URLs were extracted.
 * @returns A Set of filtered URLs that are more likely to be individual food truck sites.
 */
function filterPotentialTruckUrls(urls: Set<string>, directoryDomain: string): Set<string> {
  const filteredUrls = new Set<string>();
  const lowerDirectoryDomain = directoryDomain.toLowerCase().replace(/^www\./, '');

  for (const url of urls) {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
      const path = parsedUrl.pathname.toLowerCase();

      // 1. Skip irrelevant domains and file extensions
      if (TRUCK_URL_IRRELEVANT_DOMAINS.includes(domain) || TRUCK_URL_IRRELEVANT_FILE_EXTENSIONS.test(path)) {
        continue;
      }

      // 2. Skip if it's the same domain as the directory AND path looks like a directory/listing page itself
      if (domain === lowerDirectoryDomain) {
        if (DIRECTORY_KEYWORDS_IN_PATH.some(keyword => path.includes(`/${keyword}/`) || path.endsWith(`/${keyword}`))) {
          // console.log(`TruckURLDiscovery: [Filter] Skipping (directory keyword in path on same domain): ${url}`);
          continue;
        }
        // Allow if it's on the same domain but path doesn't scream "directory section"
        // e.g., directory.com/my-cool-truck could be a profile page that links to the actual site.
        // This might need more refinement; for now, if it's not a clear directory path, keep it for consideration.
      } else {
        // 3. If it's an external domain, be more aggressive about filtering out other directories/event sites.
        if (DIRECTORY_KEYWORDS_IN_PATH.some(keyword => path.includes(keyword) || domain.includes(keyword))) {
           // console.log(`TruckURLDiscovery: [Filter] Skipping (directory keyword in path/domain on external site): ${url}`);
          continue;
        }
      }

      // 4. Basic path depth check (very deep paths might be articles, blog posts, etc.)
      // Allow up to 3-4 path segments (e.g. example.com/blog/2024/my-truck)
      if (path.split('/').filter(p => p.length > 0).length > 4) {
        // console.log(`TruckURLDiscovery: [Filter] Skipping (path too deep): ${url}`);
        continue;
      }

      // 5. Avoid common "share" or "print" type links
      if (path.includes('share=') || path.includes('/print/') || path.includes('javascript:window.print()')) {
        continue;
      }

      // If it passed all filters, add it
      filteredUrls.add(url);
    } catch (e) {
      // console.warn(`TruckURLDiscovery: Could not parse URL for truck filtering: ${url}`, e);
    }
  }
  return filteredUrls;
}


// --- Main Function for Discovering Truck URLs from Confirmed Directories ---

export async function discoverTruckUrlsFromConfirmedDirectories(region: string = "SC"): Promise<string[]> {
  console.info(`TruckURLDiscovery: Starting discovery of individual truck URLs from confirmed directories for region: ${region}`);
  const newTruckUrlsFound = new Set<string>();

  // 1. Fetch active, SC-focused directories from 'discovered_directories'
  //    Prioritize those not recently crawled for trucks.
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const { data: directories, error: dirError } = await supabaseAdmin
    .from('discovered_directories')
    .select('id, url')
    .eq('status', 'active')
    .eq('is_sc_focused', true) // Assuming this flag is reliably set by classifier
    .or(`last_crawled_for_trucks_at.is.null,last_crawled_for_trucks_at.lt.${twoDaysAgo}`)
    // .gt('relevance_score', 0.7) // Example: Add a relevance threshold
    .limit(5); // Process a few directories per run to manage load/API usage

  if (dirError) {
    console.error(`TruckURLDiscovery: Error fetching confirmed directories:`, dirError.message);
    return [];
  }

  if (!directories || directories.length === 0) {
    console.info(`TruckURLDiscovery: No active SC directories found needing a truck URL crawl at this time.`);
    return [];
  }

  console.info(`TruckURLDiscovery: Found ${directories.length} directories to crawl for truck URLs.`);

  for (const dir of directories) {
    console.info(`TruckURLDiscovery: Crawling directory ${dir.url} for truck URLs.`);
    try {
      const directoryDomain = new URL(dir.url).hostname; // Moved here for use in logging/filtering
      // Use Firecrawl.crawlWebsite to get links from the directory.
      // Depth 1 or 2 should be sufficient for most directories.
      // We need HTML to extract links.
      const crawlJob = await firecrawl.crawlWebsite(dir.url, {
        crawlerOptions: { maxDepth: 1, limit: 20 }, // Limit pages per directory crawl
        pageOptions: { formats: ['html'], onlyMainContent: false }
      });

      if (!crawlJob.success || !crawlJob.jobId) {
        console.warn(`TruckURLDiscovery: Failed to initiate crawl for directory ${dir.url}. Error: ${crawlJob.error}`);
        continue;
      }

      console.info(`TruckURLDiscovery: Crawl job ${crawlJob.jobId} started for ${dir.url}. Polling for completion...`);

      let jobStatusData;
      let attempts = 0;
      const maxAttempts = 10; // Poll for max 5 minutes (10 * 30s)

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30-second delay
        jobStatusData = await firecrawl.getCrawlStatus(crawlJob.jobId);
        attempts++;
        if (jobStatusData.success && jobStatusData.status === 'completed') {
          console.info(`TruckURLDiscovery: Crawl job ${crawlJob.jobId} for ${dir.url} completed.`);
          break;
        } else if (!jobStatusData.success || jobStatusData.status === 'failed') {
          console.warn(`TruckURLDiscovery: Crawl job for ${dir.url} failed or error fetching status. Error: ${jobStatusData.error}`);
          jobStatusData = null; // Ensure it's null if failed
          break;
        }
        console.info(`TruckURLDiscovery: Job ${crawlJob.jobId} status: ${jobStatusData.status}. Attempt ${attempts}/${maxAttempts}.`);
      }

      if (!jobStatusData || !jobStatusData.data || jobStatusData.status !== 'completed') {
        console.warn(`TruckURLDiscovery: Crawl for ${dir.url} did not complete successfully or yield data after ${attempts} attempts.`);
        // Update directory's last_crawled_for_trucks_at to avoid immediate re-crawl if it consistently fails
        await supabaseAdmin.from('discovered_directories').update({ last_crawled_for_trucks_at: new Date().toISOString() }).eq('id', dir.id);
        continue;
      }

      const allLinksFromDir = new Set<string>();

      for (const page of jobStatusData.data) {
        if (page.html) {
          const baseOrigin = page.metadata?.sourceURL ? new URL(page.metadata.sourceURL).origin : new URL(dir.url).origin;
          // Using existing extractLinksFromHtml from this file
          const links = extractLinksFromHtml(page.html, baseOrigin);
          links.forEach(link => allLinksFromDir.add(link));
        }
      }
      console.info(`TruckURLDiscovery: Extracted ${allLinksFromDir.size} raw links from ${dir.url}.`);

      const potentialTruckSiteUrls = filterPotentialTruckUrls(allLinksFromDir, directoryDomain);

      console.info(`TruckURLDiscovery: Filtered down to ${potentialTruckSiteUrls.size} potential truck site URLs from ${dir.url}.`);

      if (potentialTruckSiteUrls.size > 0) {
        const urlsToInsert = Array.from(potentialTruckSiteUrls).map(truckUrl => ({
          url: truckUrl,
          source_directory_url: dir.url,
          region: region,
          status: 'new' as 'new' // Default status for URLs to be scraped, ensure type correctness
        }));

        // Batch insert, ignoring duplicates on 'url'
        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('discovered_urls')
          .insert(urlsToInsert, { upsert: false, onConflict: 'url' });

        if (insertError) {
          console.error(`TruckURLDiscovery: Error inserting truck URLs from ${dir.url}:`, insertError.message);
        } else if (inserted) {
          // The 'inserted' variable from Supabase 'insert' with onConflict might be null or an empty array
                  // if all records caused a conflict and were ignored.
                  // It usually returns the records that were actually inserted (not ignored).
          const actuallyInsertedCount = inserted ? inserted.length : 0;
          console.info(`TruckURLDiscovery: Attempted to save ${urlsToInsert.length} URLs. Successfully saved/ignored ${actuallyInsertedCount} new truck URLs from ${dir.url} into 'discovered_urls'.`);
          if (inserted) {
            inserted.forEach((u: any) => newTruckUrlsFound.add(u.url)); // Add any actually inserted URLs to the overall set
          }
        } else {
           console.info(`TruckURLDiscovery: No new truck URLs were inserted from ${dir.url} (all may have been duplicates or list was empty after filtering).`);
        }
      }
      // Update the directory's last_crawled_for_trucks_at timestamp
      await supabaseAdmin.from('discovered_directories').update({ last_crawled_for_trucks_at: new Date().toISOString() }).eq('id', dir.id);

    } catch (error: any) {
      console.error(`TruckURLDiscovery: Exception while crawling directory ${dir.url}:`, error.message);
      // Update directory's last_crawled_for_trucks_at to avoid immediate re-crawl on error
      await supabaseAdmin.from('discovered_directories').update({ last_crawled_for_trucks_at: new Date().toISOString() }).eq('id', dir.id);
    }
  }

  console.info(`TruckURLDiscovery: Finished. Found and saved/ignored ${newTruckUrlsFound.size} new unique truck URLs in this run.`);
  return Array.from(newTruckUrlsFound);
}
