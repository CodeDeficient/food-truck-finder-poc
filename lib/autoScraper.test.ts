// lib/autoScraper.test.ts

import { ensureDefaultTrucksAreScraped } from './autoScraper';
import { DEFAULT_SCRAPE_URLS, DEFAULT_STALENESS_THRESHOLD_DAYS } from './config';
import { supabaseAdmin, ScrapingJobService } from './supabase';
import { processScrapingJob } from './pipelineProcessor'; // Import from refactored location

// Mock dependencies
jest.mock('./config', () => ({
  DEFAULT_SCRAPE_URLS: ['https://example.com/default1'],
  DEFAULT_STALENESS_THRESHOLD_DAYS: 7,
}));

jest.mock('./supabase', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  },
  ScrapingJobService: {
    createJob: jest.fn(),
    getJobsByStatus: jest.fn(),
  },
}));

jest.mock('./pipelineProcessor', () => ({
  processScrapingJob: jest.fn(),
}));

describe('autoScraper', () => {
  describe('ensureDefaultTrucksAreScraped', () => {
    beforeEach(() => {
      // Reset mocks
      (supabaseAdmin.from('food_trucks').select().or().limit as jest.Mock).mockReset();
      (ScrapingJobService.createJob as jest.Mock).mockReset();
      (ScrapingJobService.getJobsByStatus as jest.Mock).mockReset();
      (processScrapingJob as jest.Mock).mockReset();
    });

    it('should trigger initial scrape if truck does not exist and no pending job', async () => {
      // Mock supabaseAdmin.from...limit to return { data: [], error: null } (no truck)
      // Mock ScrapingJobService.getJobsByStatus to return [] (no pending jobs)
      // Mock ScrapingJobService.createJob to return a mock job object
      // Call ensureDefaultTrucksAreScraped
      // Assert ScrapingJobService.createJob was called for the default URL
      // Assert processScrapingJob was called with the new job's ID
    });

    it('should trigger re-scrape if truck data is stale and no pending job', async () => {
      // Mock supabaseAdmin.from...limit to return a stale truck
      // Mock ScrapingJobService.getJobsByStatus to return []
      // Mock ScrapingJobService.createJob
      // Call ensureDefaultTrucksAreScraped
      // Assert createJob and processScrapingJob were called
    });

    it('should not scrape if truck data is fresh', async () => {
      // Mock supabaseAdmin.from...limit to return a fresh truck
      // Call ensureDefaultTrucksAreScraped
      // Assert createJob and processScrapingJob were NOT called
    });

    it('should not trigger scrape if a pending/running job already exists', async () => {
      // Mock supabaseAdmin.from...limit to return no truck (or stale truck)
      // Mock ScrapingJobService.getJobsByStatus to return an existing pending/running job
      // Call ensureDefaultTrucksAreScraped
      // Assert ScrapingJobService.createJob was NOT called
    });

    // Add tests for Supabase query errors, createJob errors, etc.
  });
});
