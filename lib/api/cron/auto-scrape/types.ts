interface AutoScrapeResult {
  trucksProcessed: number;
  newTrucksFound: number;
  errors?: string[];
}

export type { AutoScrapeResult };
