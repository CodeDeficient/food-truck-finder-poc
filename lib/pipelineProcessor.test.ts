// lib/pipelineProcessor.test.ts

import { processScrapingJob, createOrUpdateFoodTruck } from './pipelineProcessor';
import { ScrapingJobService, FoodTruckService } from './supabase';
import { firecrawl } from './firecrawl';
import { gemini } from './gemini';

// Mock dependent services
jest.mock('./supabase', () => ({
  ScrapingJobService: {
    updateJobStatus: jest.fn(),
    getJobsByStatus: jest.fn(), // Added for the catch block in processScrapingJob
    incrementRetryCount: jest.fn().mockResolvedValue({ retry_count: 1, max_retries: 3 }),
  },
  FoodTruckService: {
    createTruck: jest.fn(),
  },
}));
jest.mock('./firecrawl');
jest.mock('./gemini');

describe('pipelineProcessor', () => {
  describe('processScrapingJob', () => {
    const mockJobId = 'test-job-id';
    const mockTargetUrl = 'https://example.com/foodtruck';

    beforeEach(() => {
      // Reset all mocks before each test
      (ScrapingJobService.updateJobStatus as jest.Mock).mockReset();
      (ScrapingJobService.getJobsByStatus as jest.Mock).mockReset();
      (ScrapingJobService.incrementRetryCount as jest.Mock).mockReset().mockResolvedValue({ retry_count: 1, max_retries: 3 });
      (FoodTruckService.createTruck as jest.Mock).mockReset();
      (firecrawl.scrapeFoodTruckWebsite as jest.Mock).mockReset();
      (gemini.extractFoodTruckDetailsFromMarkdown as jest.Mock).mockReset();

      // Default mock implementation for updateJobStatus to return a basic job object
      (ScrapingJobService.updateJobStatus as jest.Mock).mockImplementation(async (jobId, status, updates) => ({
        id: jobId,
        status,
        target_url: mockTargetUrl,
        ...updates
      }));
       // Default mock for getJobsByStatus for the catch block
      (ScrapingJobService.getJobsByStatus as jest.Mock).mockResolvedValue([{ id: mockJobId, status: 'running' }]);
    });

    it('should successfully process a job with valid scrape and Gemini extraction', async () => {
      // Mock successful responses from firecrawl.scrapeFoodTruckWebsite and gemini.extractFoodTruckDetailsFromMarkdown
      // Mock FoodTruckService.createTruck to be successful
      // Call processScrapingJob
      // Assert ScrapingJobService.updateJobStatus was called for 'running' and 'completed'
      // Assert firecrawl.scrapeFoodTruckWebsite was called
      // Assert gemini.extractFoodTruckDetailsFromMarkdown was called
      // Assert createOrUpdateFoodTruck (via FoodTruckService.createTruck) was effectively called
    });

    it('should handle Firecrawl failure and update job status to failed', async () => {
      // Mock firecrawl.scrapeFoodTruckWebsite to return { success: false, error: '...' }
      // Call processScrapingJob
      // Assert ScrapingJobService.updateJobStatus was called for 'running' and then 'failed'
      // Assert gemini.extractFoodTruckDetailsFromMarkdown was NOT called
    });

    it('should handle Gemini failure and update job status to failed', async () => {
      // Mock firecrawl.scrapeFoodTruckWebsite for success
      // Mock gemini.extractFoodTruckDetailsFromMarkdown to return { success: false, error: '...' }
      // Call processScrapingJob
      // Assert ScrapingJobService.updateJobStatus was called for 'running' and then 'failed' (for Gemini error)
    });

    it('should attempt retry if job fails and retry count < max_retries', async () => {
      // jest.useFakeTimers(); // To control setTimeout
      // Mock firecrawl failure
      // (ScrapingJobService.incrementRetryCount as jest.Mock).mockResolvedValue({ retry_count: 1, max_retries: 3 });
      // Call processScrapingJob
      // Assert ScrapingJobService.incrementRetryCount was called
      // Assert setTimeout was called (or the next processScrapingJob call if not using fake timers and testing chained calls)
      // jest.runAllTimers(); // if using fake timers
      // jest.useRealTimers();
    });

    // Add more tests for other scenarios, like target_url missing, createOrUpdateFoodTruck errors, etc.
  });

  describe('createOrUpdateFoodTruck', () => {
    const mockJobId = 'test-job-id-for-creation';
    const mockExtractedData = { name: 'Test Truck', current_location: { address: '123 Main St' } };
    const mockSourceUrl = 'https://example.com/newtruck';

    it('should correctly map extracted data and call FoodTruckService.createTruck', async () => {
      // Mock FoodTruckService.createTruck to return a mock truck object
      // Call createOrUpdateFoodTruck
      // Assert FoodTruckService.createTruck was called with correctly mapped data
    });

    it('should handle errors during truck creation', async () => {
      // Mock FoodTruckService.createTruck to throw an error
      // Call createOrUpdateFoodTruck
      // Assert error is logged (or rethrown, or job status updated if that logic were here)
    });
  });
});
