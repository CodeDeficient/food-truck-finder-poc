// lib/directoryProspector.ts
import { firecrawl } from './firecrawl';
import { URL } from 'url'; // Node.js URL module for parsing

// --- Constants (based on conceptual step) ---

const SC_DIRECTORY_PROSPECTOR_SEED_URLS: string[] = [
  'https://www.sc.gov',
  'https://www.discoversouthcarolina.com',
  'https://www.sccommerce.com',
  'https://www.charleston-sc.gov', // Example city site
  'https://www.columbiasc.gov',    // Example city site
  'https://www.greenvillesc.gov',  // Example city site
  'https://www.postandcourier.com' // Example major newspaper
];

const SC_DIRECTORY_PROSPECTOR_SEARCH_QUERIES: string[] = [
  "South Carolina food truck directory",
  "food trucks South Carolina listings",
  "Charleston SC food truck schedule",
  "Columbia SC mobile food vendors",
  "Greenville SC street food events",
  "Myrtle Beach food truck catering directory",
  "Upstate South Carolina food truck association",
  "Lowcountry SC local food directories",
  "South Carolina farmers market vendor list food",
  "SC food festival directory"
];

const IRRELEVANT_DOMAINS: string[] = [
  'google.com', 'facebook.com', 'twitter.com', 'instagram.com', 'youtube.com', 'linkedin.com',
  'pinterest.com', 'tiktok.com', 'yelp.com', 'tripadvisor.com', 'amazon.com', 'ebay.com',
  'apple.com', 'microsoft.com', 'adobe.com', 'wordpress.org', 'wordpress.com',
  // Add more as needed based on observation
];

const IRRELEVANT_FILE_EXTENSIONS: RegExp = /\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|rar|exe|dmg|mp4|mov|avi|webp|ico)$/i;

// --- Helper Functions ---

/**
 * Extracts all absolute URLs from an HTML string.
 * @param htmlContent The HTML content of a page.
 *   baseOrigin The base URL of the page, used to resolve relative links.
 * @returns A Set of unique absolute URLs found on the page.
 */
function extractAbsoluteLinks(htmlContent: string, baseOrigin: string): Set<string> {
  const links = new Set<string>();
  // Regex to find href attributes in anchor tags
  // This regex is simple and might miss some edge cases but is generally effective for straightforward HTML.
  // It looks for <a ... href="VALUE" ...>
  const hrefRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)/gi;
  let match;
  while ((match = hrefRegex.exec(htmlContent)) !== null) {
    let link = match[2].trim();
    if (link && !link.startsWith('#') && !link.startsWith('mailto:') && !link.startsWith('tel:')) {
      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(link, baseOrigin).href;
        links.add(absoluteUrl);
      } catch (e) {
        // console.warn(`DirectoryProspector: Could not parse or resolve link: ${link} from base ${baseOrigin}`, e);
      }
    }
  }
  return links;
}

/**
 * Filters a list of URLs, removing irrelevant ones.
 * @param urls A Set of URLs to filter.
 * @returns A Set of filtered URLs.
 */
function filterCandidateUrls(urls: Set<string>): Set<string> {
  const filteredUrls = new Set<string>();
  for (const url of urls) {
    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace(/^www\./, '');

      if (IRRELEVANT_DOMAINS.includes(domain) || IRRELEVANT_FILE_EXTENSIONS.test(parsedUrl.pathname)) {
        continue;
      }
      // Further filtering can be added here if needed
      filteredUrls.add(url);
    } catch (e) {
      // console.warn(`DirectoryProspector: Could not parse URL for filtering: ${url}`, e);
    }
  }
  return filteredUrls;
}

// --- Main Prospecting Function ---

/**
 * Prospects for candidate directory URLs by crawling seed URLs and scraping SERPs.
 * @returns A Promise that resolves to an array of unique candidate directory URLs.
 */
export async function prospectForCandidateDirectories(): Promise<string[]> {
  console.info('DirectoryProspector: Starting to prospect for candidate directory URLs...');
  const allCandidateLinks = new Set<string>();

  // 1. Process Seed URLs (Temporarily modified for focused testing)
  // console.info(`DirectoryProspector: Processing ${SC_DIRECTORY_PROSPECTOR_SEED_URLS.length} seed URLs...`);
  // for (const seedUrl of SC_DIRECTORY_PROSPECTOR_SEED_URLS) {
  const singleTestSeedUrl = 'https://www.sc.gov'; // Focused test URL
  console.info(`DirectoryProspector: [Focused Test] Processing SINGLE seed URL: ${singleTestSeedUrl}`);
  try {
    // Using scrapeUrl to get HTML content directly.
    console.info(`DirectoryProspector: [Focused Test] About to call firecrawl.scrapeUrl for: ${singleTestSeedUrl}`);
    const firecrawlOptions = { pageOptions: { format: 'html' } };
    console.info(`DirectoryProspector: [Focused Test] Options:`, JSON.stringify(firecrawlOptions, null, 2));
    const scrapeResult = await firecrawl.scrapeUrl(singleTestSeedUrl, firecrawlOptions);
    console.info(`DirectoryProspector: [Focused Test] Raw scrapeResult for ${singleTestSeedUrl}:`, JSON.stringify(scrapeResult, null, 2));

    if (scrapeResult.success && scrapeResult.data?.html) {
      const baseOrigin = new URL(singleTestSeedUrl).origin;
      const linksFromSeed = extractAbsoluteLinks(scrapeResult.data.html, baseOrigin);
      console.info(`DirectoryProspector: [Focused Test] Found ${linksFromSeed.size} links from ${singleTestSeedUrl}`);
      linksFromSeed.forEach(link => allCandidateLinks.add(link));
    } else {
      console.warn(`DirectoryProspector: [Focused Test] Failed to scrape seed URL ${singleTestSeedUrl}. Error: ${scrapeResult.error}`);
    }
  } catch (error) {
    console.error(`DirectoryProspector: [Focused Test] Exception while processing seed URL ${singleTestSeedUrl}:`, error);
  }
  // } // End of original loop (commented out for focused test)

  // 2. Process Search Queries (SERP Scraping) - Temporarily Commented Out
  // console.info(`DirectoryProspector: Processing ${SC_DIRECTORY_PROSPECTOR_SEARCH_QUERIES.length} search queries via Google SERP scraping...`);
  // console.warn("DirectoryProspector: SERP scraping is experimental and may be unreliable due to Google's anti-scraping measures and changing page structures.");
  // for (const query of SC_DIRECTORY_PROSPECTOR_SEARCH_QUERIES) {
  //   const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us`; // Added hl and gl for consistency
  //   console.info(`DirectoryProspector: Attempting to scrape SERP for query: "${query}" via URL: ${googleSearchUrl}`);
  //   try {
  //     // Using scrapeUrl to get HTML content of the Google SERP.
  //     const serpResult = await firecrawl.scrapeUrl(googleSearchUrl, {
  //       pageOptions: { format: 'html' },
  //       scraperOptions: {
  //         // It's possible specific Firecrawl scraper options might be needed here
  //       }
  //     });
  //     if (serpResult.success && serpResult.data?.html) {
  //       const linksFromSerp = extractAbsoluteLinks(serpResult.data.html, 'https://www.google.com');
  //       console.info(`DirectoryProspector: Found ${linksFromSerp.size} links from SERP for query "${query}"`);
  //       linksFromSerp.forEach(link => {
  //         if (!link.startsWith('https://www.google.com/url?') && !link.startsWith('https://accounts.google.com')) {
  //           allCandidateLinks.add(link);
  //         }
  //       });
  //     } else {
  //       console.warn(`DirectoryProspector: Failed to scrape SERP for query "${query}". Error: ${serpResult.error}`);
  //     }
  //   } catch (error) {
  //     console.error(`DirectoryProspector: Exception while processing SERP for query "${query}":`, error);
  //   }
  // }

  // 3. Filter all collected links
  console.info(`DirectoryProspector: [Focused Test] Collected ${allCandidateLinks.size} raw candidate links (from single seed). Filtering...`);
  const filteredUrls = filterCandidateUrls(allCandidateLinks);
  console.info(`DirectoryProspector: Filtered down to ${filteredUrls.size} unique candidate directory URLs.`);

  return Array.from(filteredUrls);
}

// Example Usage (for testing purposes, would typically be called from autoScraper.ts)
/*
async function testProspector() {
  const candidates = await prospectForCandidateDirectories();
  console.log("\n--- Candidate Directory URLs ---");
  candidates.forEach(url => console.log(url));
  console.log(`Found ${candidates.length} candidates.`);
}
// testProspector();
*/
