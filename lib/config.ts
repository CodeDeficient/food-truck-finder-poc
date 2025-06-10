// lib/config.ts

// A list of default URLs that the application should attempt to scrape automatically
// if their data is missing or stale.
export const DEFAULT_SCRAPE_URLS: string[] = [
  'https://eatrotirolls.com/',
  // Dynamic URLs will be added from the discovered_urls table
];

// Defines how old data can be (in days) before it's considered stale and needs re-scraping.
export const DEFAULT_STALENESS_THRESHOLD_DAYS: number = 7; // 7 days

// South Carolina cities to target for autonomous discovery
export const SC_TARGET_CITIES: string[] = [
  'Charleston',
  'Columbia',
  'Greenville',
  'Spartanburg',
  'Rock Hill',
  'Mount Pleasant',
  'North Charleston',
  'Summerville',
  'Goose Creek',
  'Hilton Head',
];

// Discovery configuration
export const DISCOVERY_CONFIG = {
  maxUrlsPerRun: 50,
  maxDepthCrawl: 2,
  searchResultsLimit: 15,
  batchSize: 10,
  rateLimitDelayMs: 1000,
};

// You can add other global configurations here as the application grows.
