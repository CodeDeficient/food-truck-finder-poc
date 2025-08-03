import { describe, it, expect, jest } from '@jest/globals';
import { z } from 'zod';

/**
 * Pipeline Job Validation Integration Tests
 * Tests the validation of pipeline jobs and processing workflows
 */

// Define pipeline job schemas
const ScrapingJobSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  source_type: z.enum(['instagram', 'facebook', 'website', 'twitter']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  priority: z.number().min(1).max(10).default(5),
  retry_count: z.number().min(0).default(0),
  max_retries: z.number().min(0).default(3),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

const PipelineJobResultSchema = z.object({
  job_id: z.string().uuid(),
  success: z.boolean(),
  data: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    menu_items: z.array(z.object({
      name: z.string(),
      price: z.union([z.number(), z.string()]).optional(),
      description: z.string().optional(),
    })).optional(),
    location: z.object({
      address: z.string().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }).optional(),
  }).optional(),
  error: z.string().optional(),
  processing_time_ms: z.number().min(0),
});

describe('Pipeline Job Validation Integration', () => {
  describe('Scraping Job Validation', () => {
    it('should validate a complete scraping job', () => {
      const validJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://example-foodtruck.com',
        source_type: 'website' as const,
        status: 'pending' as const,
        priority: 7,
        retry_count: 0,
        max_retries: 3,
        created_at: new Date().toISOString(),
      };

      expect(() => ScrapingJobSchema.parse(validJob)).not.toThrow();
      const parsed = ScrapingJobSchema.parse(validJob);
      expect(parsed.id).toBe(validJob.id);
      expect(parsed.url).toBe(validJob.url);
    });

    it('should reject invalid job with bad URL', () => {
      const invalidJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'not-a-valid-url',
        source_type: 'website' as const,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      expect(() => ScrapingJobSchema.parse(invalidJob)).toThrow();
    });

    it('should reject invalid job with invalid UUID', () => {
      const invalidJob = {
        id: 'not-a-uuid',
        url: 'https://example.com',
        source_type: 'website' as const,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      expect(() => ScrapingJobSchema.parse(invalidJob)).toThrow();
    });

    it('should apply default values correctly', () => {
      const minimalJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://example.com',
        source_type: 'website' as const,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      const parsed = ScrapingJobSchema.parse(minimalJob);
      expect(parsed.priority).toBe(5); // default value
      expect(parsed.retry_count).toBe(0); // default value
      expect(parsed.max_retries).toBe(3); // default value
    });
  });

  describe('Pipeline Job Result Validation', () => {
    it('should validate successful job result', () => {
      const successResult = {
        job_id: '550e8400-e29b-41d4-a716-446655440000',
        success: true,
        data: {
          title: 'Amazing Food Truck',
          description: 'Best tacos in town',
          menu_items: [
            {
              name: 'Taco Supreme',
              price: 12.99,
              description: 'Our signature taco'
            }
          ],
          location: {
            address: '123 Main St, New York, NY',
            coordinates: {
              lat: 40.7128,
              lng: -74.0060
            }
          }
        },
        processing_time_ms: 1500,
      };

      expect(() => PipelineJobResultSchema.parse(successResult)).not.toThrow();
      const parsed = PipelineJobResultSchema.parse(successResult);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.title).toBe('Amazing Food Truck');
    });

    it('should validate failed job result', () => {
      const failedResult = {
        job_id: '550e8400-e29b-41d4-a716-446655440000',
        success: false,
        error: 'Failed to scrape website: Connection timeout',
        processing_time_ms: 30000,
      };

      expect(() => PipelineJobResultSchema.parse(failedResult)).not.toThrow();
      const parsed = PipelineJobResultSchema.parse(failedResult);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toContain('Connection timeout');
    });

    it('should reject result with negative processing time', () => {
      const invalidResult = {
        job_id: '550e8400-e29b-41d4-a716-446655440000',
        success: true,
        processing_time_ms: -100, // Invalid negative time
      };

      expect(() => PipelineJobResultSchema.parse(invalidResult)).toThrow();
    });
  });

  describe('Pipeline Job Processing Workflow', () => {
    // Mock pipeline processor
    const mockPipelineProcessor = {
      async processJob(job: z.infer<typeof ScrapingJobSchema>) {
        // Simulate processing
        const startTime = Date.now();
        
        try {
          // Validate job first
          const validJob = ScrapingJobSchema.parse(job);
          
          // Simulate some processing logic
          if (validJob.url.includes('invalid')) {
            throw new Error('Invalid URL detected');
          }
          
          // Simulate successful processing
          const result = {
            job_id: validJob.id,
            success: true,
            data: {
              title: 'Scraped Food Truck',
              description: 'Successfully scraped data',
              menu_items: [
                { name: 'Test Item', price: 10.99 }
              ]
            },
            processing_time_ms: Date.now() - startTime,
          };
          
          return PipelineJobResultSchema.parse(result);
        } catch (error) {
          const result = {
            job_id: job.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            processing_time_ms: Date.now() - startTime,
          };
          
          return PipelineJobResultSchema.parse(result);
        }
      }
    };

    it('should process valid job successfully', async () => {
      const validJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://example-foodtruck.com',
        source_type: 'website' as const,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      const result = await mockPipelineProcessor.processJob(validJob);
      
      expect(result.success).toBe(true);
      expect(result.job_id).toBe(validJob.id);
      expect(result.data?.title).toBe('Scraped Food Truck');
      expect(result.processing_time_ms).toBeGreaterThan(0);
    });

    it('should handle job processing errors', async () => {
      const invalidJob = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://invalid-foodtruck.com',
        source_type: 'website' as const,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      const result = await mockPipelineProcessor.processJob(invalidJob);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid URL detected');
      expect(result.processing_time_ms).toBeGreaterThan(0);
    });

    it('should validate job before processing', async () => {
      const malformedJob = {
        id: 'not-a-uuid',
        url: 'not-a-url',
        source_type: 'invalid-type' as any,
        status: 'pending' as const,
        created_at: 'not-a-date',
      };

      const result = await mockPipelineProcessor.processJob(malformedJob);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
