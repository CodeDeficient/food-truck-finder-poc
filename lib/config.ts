// lib/config.ts

// A list of default URLs that the application should attempt to scrape automatically
// if their data is missing or stale.
export const DEFAULT_SCRAPE_URLS: string[] = [
  "https://eatrotirolls.com/"
  // Add more default URLs here in the future if needed
];

// Defines how old data can be (in days) before it's considered stale and needs re-scraping.
export const DEFAULT_STALENESS_THRESHOLD_DAYS: number = 7; // 7 days

// You can add other global configurations here as the application grows.
