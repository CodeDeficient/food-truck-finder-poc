// lib/pipelineProcessor.test.ts
import { processScrapingJob, createOrUpdateFoodTruck } from '@/lib/pipelineProcessor';
import { ScrapingJobService, FoodTruckService } from '@/lib/supabase';
import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
// Mock dependent services
jest.mock('@/lib/supabase', () => ({
    ScrapingJobService: {
        updateJobStatus: jest.fn(),
        getJobsByStatus: jest.fn().mockResolvedValue(Promise.resolve([mockJob])),
        incrementRetryCount: jest.fn().mockResolvedValue({ retry_count: 1, max_retries: 3 }),
    },
    FoodTruckService: {
        createTruck: jest.fn(),
        getAllTrucks: jest.fn().mockResolvedValue({ trucks: [] }),
    },
}));
jest.mock('@/lib/firecrawl', () => ({
    firecrawl: {
        scrapeFoodTruckWebsite: jest.fn(),
    },
}));
jest.mock('@/lib/gemini', () => ({
    gemini: {
        extractFoodTruckDetailsFromMarkdown: jest.fn(),
    },
}));
const mockJob = {
    id: 'test-job-id',
    target_url: 'https://example-foodtruck.com',
    job_type: 'website_auto',
    status: 'pending',
    priority: 5,
    scheduled_at: new Date().toISOString(),
    retry_count: 0,
    max_retries: 3,
    created_at: new Date().toISOString(),
};
describe('pipelineProcessor', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        ScrapingJobService.updateJobStatus.mockImplementation((jobId, status, updates) => {
            return Promise.resolve({ ...mockJob, id: jobId, status, ...updates });
        });
    });
    it('should process a scraping job successfully', async () => {
        // Mock successful firecrawl scraping
        firecrawl.scrapeFoodTruckWebsite.mockResolvedValue({
            success: true,
            data: {
                markdown: '# Test Food Truck\nGreat tacos and burritos!',
                source_url: 'https://example-foodtruck.com',
            },
        });
        // Mock successful Gemini extraction
        const mockExtractedData = {
            name: 'Test Food Truck',
            description: 'Great tacos and burritos',
            cuisine_type: ['Mexican'],
            specialties: ['tacos', 'burritos'],
            price_range: '$',
            confidence_score: 0.95,
        };
        gemini.extractFoodTruckDetailsFromMarkdown.mockResolvedValue({
            success: true,
            data: mockExtractedData,
        });
        // Mock successful truck creation
        FoodTruckService.createTruck.mockResolvedValue({
            id: 'truck-123',
            name: 'Test Food Truck',
        });
        await processScrapingJob('test-job-id');
        // Verify the correct sequence of calls
        expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('test-job-id', 'running');
        expect(firecrawl.scrapeFoodTruckWebsite).toHaveBeenCalledWith('https://example-foodtruck.com');
        expect(gemini.extractFoodTruckDetailsFromMarkdown).toHaveBeenCalledWith('# Test Food Truck\nGreat tacos and burritos!', 'https://example-foodtruck.com');
        expect(FoodTruckService.createTruck).toHaveBeenCalled();
        expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('test-job-id', 'completed', expect.any(Object));
    });
    it('should handle scraping failures', async () => {
        // Mock failed firecrawl scraping
        firecrawl.scrapeFoodTruckWebsite.mockResolvedValue({
            success: false,
            error: 'Failed to scrape website',
        });
        await processScrapingJob('test-job-id');
        expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('test-job-id', 'running');
        expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('test-job-id', 'failed', {
            errors: ['Failed to scrape website'],
        });
    });
    it('should handle Gemini extraction failures', async () => {
        // Mock successful scraping but failed Gemini extraction
        firecrawl.scrapeFoodTruckWebsite.mockResolvedValue({
            success: true,
            data: {
                markdown: '# Test Content',
                source_url: 'https://example.com',
            },
        });
        gemini.extractFoodTruckDetailsFromMarkdown.mockResolvedValue({
            success: false,
            error: 'Gemini processing failed',
        });
        await processScrapingJob('test-job-id');
        expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('test-job-id', 'failed', {
            errors: ['Gemini processing failed'],
        });
    });
    it('should handle missing target URL', async () => {
        const jobWithoutUrl = { ...mockJob, target_url: undefined };
        ScrapingJobService.updateJobStatus.mockResolvedValueOnce(jobWithoutUrl);
        await processScrapingJob('test-job-id');
        expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('test-job-id', 'failed', {
            errors: ['No target URL specified'],
        });
    });
    it('should handle retry logic on failures', async () => {
        // Mock scraping failure
        firecrawl.scrapeFoodTruckWebsite.mockResolvedValue({
            success: false,
            error: 'Network error',
        });
        // Mock retry increment
        ScrapingJobService.incrementRetryCount.mockResolvedValue({
            retry_count: 1,
            max_retries: 3,
        });
        // Mock getJobsByStatus for retry logic
        ScrapingJobService.getJobsByStatus.mockResolvedValue([mockJob]);
        const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
        await processScrapingJob('test-job-id');
        expect(ScrapingJobService.incrementRetryCount).toHaveBeenCalledWith('test-job-id');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Retrying job'));
        consoleSpy.mockRestore();
    });
    it('should stop retrying after max retries', async () => {
        // Mock scraping failure
        firecrawl.scrapeFoodTruckWebsite.mockResolvedValue({
            success: false,
            error: 'Persistent error',
        });
        // Mock max retries reached
        ScrapingJobService.incrementRetryCount.mockResolvedValue({
            retry_count: 3,
            max_retries: 3,
        });
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        await processScrapingJob('test-job-id');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('reached max retries'));
        consoleSpy.mockRestore();
    });
    describe('createOrUpdateFoodTruck', () => {
        const mockExtractedData = {
            name: 'Test Food Truck',
            description: 'Amazing food truck serving delicious meals',
            cuisine_type: ['Mexican', 'American'],
            specialties: ['tacos', 'burritos', 'nachos'],
            price_range: '$',
            confidence_score: 0.92,
        };
        beforeEach(() => {
            FoodTruckService.createTruck.mockResolvedValue({
                id: 'truck-123',
                name: 'Test Food Truck',
            });
        });
        it('should create a food truck successfully', async () => {
            // @ts-expect-error TS(2345): Argument of type '{ name: string; description: str... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', mockExtractedData, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith({
                name: 'Test Food Truck',
                description: 'Amazing food truck serving delicious meals',
                cuisine_type: ['Mexican', 'American'],
                price_range: '$',
                specialties: ['tacos', 'burritos', 'nachos'],
                data_quality_score: 0.92,
                verification_status: 'pending',
                source_urls: ['https://example.com'],
                last_scraped_at: expect.any(String),
            });
            expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('job-123', 'completed_with_data', {
                truck_id: 'truck-123',
                completed_at: expect.any(String),
            });
        });
        it('should handle invalid extracted data', async () => {
            await createOrUpdateFoodTruck('job-123', null, 'https://example.com');
            expect(FoodTruckService.createTruck).not.toHaveBeenCalled();
            expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('job-123', 'failed', {
                errors: ['Invalid extracted data received from AI processing step.'],
            });
        });
        it('should handle missing source URL gracefully', async () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            // @ts-expect-error TS(2345): Argument of type '{ name: string; description: str... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', mockExtractedData, '');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing sourceUrl'));
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                source_urls: [],
            }));
            consoleSpy.mockRestore();
        });
        it('should handle missing name with fallback', async () => {
            const dataWithoutName = { ...mockExtractedData, name: undefined };
            await createOrUpdateFoodTruck('job-123', dataWithoutName, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Unknown Food Truck',
            }));
        });
        it('should clamp confidence score between 0 and 1', async () => {
            const dataWithHighConfidence = { ...mockExtractedData, confidence_score: 1.5 };
            // @ts-expect-error TS(2345): Argument of type '{ confidence_score: number; name... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', dataWithHighConfidence, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                data_quality_score: 1,
            }));
            const dataWithLowConfidence = { ...mockExtractedData, confidence_score: -0.5 };
            // @ts-expect-error TS(2345): Argument of type '{ confidence_score: number; name... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-124', dataWithLowConfidence, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                data_quality_score: 0,
            }));
        });
        it('should handle database errors', async () => {
            FoodTruckService.createTruck.mockRejectedValue(new Error('Database connection failed'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            // @ts-expect-error TS(2345): Argument of type '{ name: string; description: str... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', mockExtractedData, 'https://example.com');
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error in createOrUpdateFoodTruck'), expect.any(Error));
            expect(ScrapingJobService.updateJobStatus).toHaveBeenCalledWith('job-123', 'failed', {
                errors: ['Food truck data processing/saving failed: Database connection failed'],
            });
            consoleSpy.mockRestore();
        });
        it('should handle invalid cuisine_type array', async () => {
            const dataWithInvalidCuisine = { ...mockExtractedData, cuisine_type: 'Mexican' };
            // @ts-expect-error TS(2345): Argument of type '{ cuisine_type: any; name: strin... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', dataWithInvalidCuisine, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                cuisine_type: [],
            }));
        });
        it('should handle invalid specialties array', async () => {
            const dataWithInvalidSpecialties = { ...mockExtractedData, specialties: 'tacos' };
            // @ts-expect-error TS(2345): Argument of type '{ specialties: any; name: string... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', dataWithInvalidSpecialties, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                specialties: [],
            }));
        });
        it('should use default confidence score for invalid values', async () => {
            const dataWithInvalidConfidence = { ...mockExtractedData, confidence_score: 'high' };
            // @ts-expect-error TS(2345): Argument of type '{ confidence_score: any; name: s... Remove this comment to see the full error message
            await createOrUpdateFoodTruck('job-123', dataWithInvalidConfidence, 'https://example.com');
            expect(FoodTruckService.createTruck).toHaveBeenCalledWith(expect.objectContaining({
                data_quality_score: 0.5,
            }));
        });
    });
});
