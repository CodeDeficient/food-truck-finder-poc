// lib/pipelineManager.ts
// Unified Pipeline Manager - Consolidates all pipeline operations

import { ScrapingJobService } from './supabase';
import { discoveryEngine } from './discoveryEngine';
import { processScrapingJob } from './pipelineProcessor';
import { ensureDefaultTrucksAreScraped } from './autoScraper';

// Configuration interfaces
export interface PipelineConfig {
  type: 'discovery' | 'processing' | 'full' | 'maintenance';
  params: {
    maxUrls?: number;
    maxUrlsToProcess?: number;
    targetCities?: string[];
    priority?: number;
    skipDiscovery?: boolean;
    retryFailedJobs?: boolean;
  };
}

export interface DiscoveryParams {
  cities: string[];
  maxUrls: number;
  searchTerms?: string[];
}

export interface ProcessingOptions {
  maxJobs: number;
  priority: number;
  retryFailedJobs: boolean;
}

// Result interfaces
export interface PipelineResult {
  success: boolean;
  type: string;
  phase: string;
  summary: {
    urlsDiscovered?: number;
    urlsProcessed?: number;
    jobsCreated?: number;
    trucksCreated?: number;
    errors?: number;
    duration: number;
  };
  details: unknown;
  timestamp: string;
}

export interface DiscoveryResult {
  success: boolean;
  urlsDiscovered: number;
  urlsStored: number;
  urlsDuplicate: number;
  errors: string[];
  duration: number;
}

export interface ProcessingResult {
  success: boolean;
  jobsProcessed: number;
  jobsSuccessful: number;
  jobsFailed: number;
  trucksCreated: number;
  errors: string[];
  duration: number;
}

export interface MaintenanceResult {
  success: boolean;
  trucksProcessed: number;
  newTrucksFound: number;
  errors: string[];
  duration: number;
}

/**
 * Unified Pipeline Manager
 *
 * Consolidates all pipeline operations into a single, modular system:
 * - Discovery: Find new food truck URLs using Tavily
 * - Processing: Process URLs through Firecrawl + Gemini pipeline
 * - Full: Combined discovery + processing
 * - Maintenance: Check existing trucks for stale data
 */
export class PipelineManager {
  /**
   * Run the complete pipeline based on configuration
   */
  async runPipeline(config: PipelineConfig): Promise<PipelineResult> {
    const startTime = Date.now();

    try {
      console.info(`🚀 PipelineManager: Starting ${config.type} pipeline...`);

      let result: unknown;

      switch (config.type) {
        case 'discovery': {
          result = await this.runDiscovery({
            cities: config.params.targetCities || [],
            maxUrls: config.params.maxUrls || 50,
            searchTerms: ['food truck', 'food cart', 'mobile food'],
          });
          break;
        }

        case 'processing': {
          result = await this.processJobs({
            maxJobs: config.params.maxUrlsToProcess || 20,
            priority: config.params.priority || 5,
            retryFailedJobs: config.params.retryFailedJobs || false,
          });
          break;
        }

        case 'full': {
          result = await this.runFullPipeline(config);
          break;
        }

        case 'maintenance': {
          result = await this.runMaintenance();
          break;
        }

        default: {
          throw new Error(`Unknown pipeline type: ${String(config.type)}`);
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: true,
        type: config.type,
        phase: 'completed',
        summary: {
          ...(typeof result === 'object' && result !== null
            ? (result as Record<string, unknown>)
            : {}),
          duration,
        },
        details: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ PipelineManager: ${config.type} pipeline failed:`, error);

      return {
        success: false,
        type: config.type,
        phase: 'failed',
        summary: {
          errors: 1,
          duration,
        },
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
  /**
   * Run URL discovery using Tavily search
   */
  async runDiscovery(_params: DiscoveryParams): Promise<DiscoveryResult> {
    const startTime = Date.now();

    try {
      console.info(`🔍 PipelineManager: Starting discovery process...`);

      // Use the existing discovery engine's method
      const discoveryResult = await discoveryEngine.discoverNewFoodTrucks();

      const duration = Date.now() - startTime;

      return {
        success: discoveryResult.errors.length === 0,
        urlsDiscovered: discoveryResult.urls_discovered,
        urlsStored: discoveryResult.urls_stored,
        urlsDuplicate: discoveryResult.urls_duplicates,
        errors: discoveryResult.errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown discovery error';
      console.error('❌ PipelineManager: Discovery failed:', error);

      return {
        success: false,
        urlsDiscovered: 0,
        urlsStored: 0,
        urlsDuplicate: 0,
        errors: [errorMsg],
        duration,
      };
    }
  }

  /**
   * Process existing scraping jobs
   */
  async processJobs(options: ProcessingOptions): Promise<ProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      console.info(`⚙️ PipelineManager: Processing up to ${options.maxJobs} jobs...`);

      // Get pending jobs
      const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
      if (!pendingJobs || pendingJobs.length === 0) {
        console.info('No pending jobs to process');
        return {
          success: true,
          jobsProcessed: 0,
          jobsSuccessful: 0,
          jobsFailed: 0,
          trucksCreated: 0,
          errors: [],
          duration: Date.now() - startTime,
        };
      }

      // Process jobs up to maxJobs limit
      const jobsToProcess = pendingJobs.slice(0, options.maxJobs);
      let jobsSuccessful = 0;
      let jobsFailed = 0;
      let trucksCreated = 0;

      for (const job of jobsToProcess) {
        try {
          console.info(`Processing job ${job.id} for URL: ${job.target_url}`);

          // Process the job
          await processScrapingJob(job.id);

          // Check if job resulted in truck creation
          const updatedJob = await ScrapingJobService.getJobsByStatus('completed').then((jobs) =>
            jobs?.find((j) => j.id === job.id),
          );

          if (updatedJob?.data_collected?.truck_id) {
            trucksCreated++;
          }

          jobsSuccessful++;
        } catch (jobError) {
          const errorMsg = `Job ${job.id} failed: ${jobError instanceof Error ? jobError.message : 'Unknown error'}`;
          console.warn(errorMsg);
          errors.push(errorMsg);
          jobsFailed++;
        }
      }

      const duration = Date.now() - startTime;

      return {
        success: jobsFailed === 0,
        jobsProcessed: jobsToProcess.length,
        jobsSuccessful,
        jobsFailed,
        trucksCreated,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown processing error';
      console.error('❌ PipelineManager: Job processing failed:', error);

      return {
        success: false,
        jobsProcessed: 0,
        jobsSuccessful: 0,
        jobsFailed: 0,
        trucksCreated: 0,
        errors: [errorMsg],
        duration,
      };
    }
  }

  /**
   * Run full pipeline: discovery + processing
   */
  private async runFullPipeline(config: PipelineConfig): Promise<Record<string, unknown>> {
    const results: {
      discovery: DiscoveryResult | undefined;
      processing: ProcessingResult | undefined;
    } = {
      discovery: undefined,
      processing: undefined,
    };

    // Step 1: Discovery (unless skipped)
    if (!config.params.skipDiscovery) {
      results.discovery = await this.runDiscovery({
        cities: config.params.targetCities || ['Charleston', 'Columbia', 'Greenville'],
        maxUrls: config.params.maxUrls || 50,
        searchTerms: ['food truck', 'food cart', 'mobile food'],
      });
    }

    // Step 2: Processing
    results.processing = await this.processJobs({
      maxJobs: config.params.maxUrlsToProcess || 20,
      priority: config.params.priority || 5,
      retryFailedJobs: config.params.retryFailedJobs || false,
    });

    // Combine results
    return {
      urlsDiscovered: results.discovery?.urlsDiscovered || 0,
      urlsStored: results.discovery?.urlsStored || 0,
      urlsDuplicate: results.discovery?.urlsDuplicate || 0,
      jobsProcessed: results.processing?.jobsProcessed || 0,
      trucksCreated: results.processing?.trucksCreated || 0,
      errors: [...(results.discovery?.errors || []), ...(results.processing?.errors || [])],
    };
  }

  /**
   * Run maintenance checks on existing trucks
   */
  async runMaintenance(): Promise<MaintenanceResult> {
    const startTime = Date.now();

    try {
      console.info('🔧 PipelineManager: Running maintenance checks...');

      // Use the existing autoScraper functionality
      const result = await ensureDefaultTrucksAreScraped();

      const duration = Date.now() - startTime;

      return {
        success: result.errors.length === 0,
        trucksProcessed: result.trucksProcessed,
        newTrucksFound: result.newTrucksFound,
        errors: result.errors.map((e) => e.url + ': ' + (e.details || 'Unknown error')),
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown maintenance error';
      console.error('❌ PipelineManager: Maintenance failed:', error);

      return {
        success: false,
        trucksProcessed: 0,
        newTrucksFound: 0,
        errors: [errorMsg],
        duration,
      };
    }
  }
}

// Export singleton instance
export const pipelineManager = new PipelineManager();
