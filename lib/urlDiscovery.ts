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
