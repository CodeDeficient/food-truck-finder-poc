// lib/pipelineManager.ts
// Unified Pipeline Manager - Consolidates all pipeline operations
import { ScrapingJobService } from './supabase';
import { discoveryEngine } from './discoveryEngine';
import { processScrapingJob } from './pipelineProcessor';
import { ensureDefaultTrucksAreScraped } from './autoScraper';
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
    async runPipeline(config) {
        const startTime = Date.now();
        try {
            console.info(`🚀 PipelineManager: Starting ${config.type} pipeline...`);
            const result = await this.executePipelineType(config);
            return this.createSuccessResult(config, result, startTime);
        }
        catch (error) {
            return this.createErrorResult(config, error, startTime);
        }
    }
    /**
     * Execute the specific pipeline type
     */
    async executePipelineType(config) {
        var _a, _b, _c, _d, _e;
        switch (config.type) {
            case 'discovery': {
                return await this.runDiscovery({
                    cities: (_a = config.params.targetCities) !== null && _a !== void 0 ? _a : [],
                    maxUrls: (_b = config.params.maxUrls) !== null && _b !== void 0 ? _b : 50,
                    searchTerms: ['food truck', 'food cart', 'mobile food'],
                });
            }
            case 'processing': {
                return await this.processJobs({
                    maxJobs: (_c = config.params.maxUrlsToProcess) !== null && _c !== void 0 ? _c : 20,
                    priority: (_d = config.params.priority) !== null && _d !== void 0 ? _d : 5,
                    retryFailedJobs: (_e = config.params.retryFailedJobs) !== null && _e !== void 0 ? _e : false,
                });
            }
            case 'full': {
                return await this.runFullPipeline(config);
            }
            case 'maintenance': {
                return await this.runMaintenance();
            }
            default: {
                throw new Error(`Unknown pipeline type: ${String(config.type)}`);
            }
        }
    }
    /**
     * Create success result
     */
    createSuccessResult(config, result, startTime) {
        const duration = Date.now() - startTime;
        return {
            success: true,
            type: config.type,
            phase: 'completed',
            summary: Object.assign(Object.assign({}, (typeof result === 'object' && result !== null
                ? result
                : {})), { duration }),
            details: result,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Create error result
     */
    createErrorResult(config, error, startTime) {
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
    /**
     * Run URL discovery using Tavily search
     */
    async runDiscovery(_params) {
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
        }
        catch (error) {
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
    async processJobs(options) {
        const startTime = Date.now();
        try {
            console.info(`⚙️ PipelineManager: Processing up to ${options.maxJobs} jobs...`);
            const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
            if (pendingJobs == undefined || pendingJobs.length === 0) {
                return this.createEmptyProcessingResult(startTime);
            }
            const jobsToProcess = pendingJobs.slice(0, options.maxJobs);
            const results = await this.processJobBatch(jobsToProcess, startTime);
            return results;
        }
        catch (error) {
            return this.createProcessingErrorResult(error, startTime);
        }
    }
    /**
     * Create empty processing result when no jobs available
     */
    createEmptyProcessingResult(startTime) {
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
    /**
     * Process a batch of jobs
     */
    async processJobBatch(jobsToProcess, startTime) {
        var _a;
        const errors = [];
        let jobsSuccessful = 0;
        let jobsFailed = 0;
        let trucksCreated = 0;
        for (const job of jobsToProcess) {
            try {
                console.info(`Processing job ${job.id} for URL: ${job.target_url}`);
                await processScrapingJob(job.id);
                const updatedJob = await ScrapingJobService.getJobsByStatus('completed').then((jobs) => jobs === null || jobs === void 0 ? void 0 : jobs.find((j) => j.id === job.id));
                if (((_a = updatedJob === null || updatedJob === void 0 ? void 0 : updatedJob.data_collected) === null || _a === void 0 ? void 0 : _a.truck_id) != undefined) {
                    trucksCreated += 1;
                }
                jobsSuccessful += 1;
            }
            catch (jobError) {
                const errorMsg = `Job ${job.id} failed: ${jobError instanceof Error ? jobError.message : 'Unknown error'}`;
                console.warn(errorMsg);
                errors.push(errorMsg);
                jobsFailed += 1;
            }
        }
        return {
            success: jobsFailed === 0,
            jobsProcessed: jobsToProcess.length,
            jobsSuccessful,
            jobsFailed,
            trucksCreated,
            errors,
            duration: Date.now() - startTime,
        };
    }
    /**
     * Create processing error result
     */
    createProcessingErrorResult(error, startTime) {
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
    /**
     * Run full pipeline: discovery + processing
     */
    async runFullPipeline(config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        const results = {
            discovery: undefined,
            processing: undefined,
        };
        // Step 1: Discovery (unless skipped)
        if (config.params.skipDiscovery !== true) {
            results.discovery = await this.runDiscovery({
                cities: (_a = config.params.targetCities) !== null && _a !== void 0 ? _a : ['Charleston', 'Columbia', 'Greenville'],
                maxUrls: (_b = config.params.maxUrls) !== null && _b !== void 0 ? _b : 50,
                searchTerms: ['food truck', 'food cart', 'mobile food'],
            });
        }
        // Step 2: Processing
        results.processing = await this.processJobs({
            maxJobs: (_c = config.params.maxUrlsToProcess) !== null && _c !== void 0 ? _c : 20,
            priority: (_d = config.params.priority) !== null && _d !== void 0 ? _d : 5,
            retryFailedJobs: (_e = config.params.retryFailedJobs) !== null && _e !== void 0 ? _e : false,
        });
        // Combine results
        return {
            urlsDiscovered: (_g = (_f = results.discovery) === null || _f === void 0 ? void 0 : _f.urlsDiscovered) !== null && _g !== void 0 ? _g : 0,
            urlsStored: (_j = (_h = results.discovery) === null || _h === void 0 ? void 0 : _h.urlsStored) !== null && _j !== void 0 ? _j : 0,
            urlsDuplicate: (_l = (_k = results.discovery) === null || _k === void 0 ? void 0 : _k.urlsDuplicate) !== null && _l !== void 0 ? _l : 0,
            jobsProcessed: (_o = (_m = results.processing) === null || _m === void 0 ? void 0 : _m.jobsProcessed) !== null && _o !== void 0 ? _o : 0,
            trucksCreated: (_q = (_p = results.processing) === null || _p === void 0 ? void 0 : _p.trucksCreated) !== null && _q !== void 0 ? _q : 0,
            errors: [...((_s = (_r = results.discovery) === null || _r === void 0 ? void 0 : _r.errors) !== null && _s !== void 0 ? _s : []), ...((_u = (_t = results.processing) === null || _t === void 0 ? void 0 : _t.errors) !== null && _u !== void 0 ? _u : [])],
        };
    }
    /**
     * Run maintenance checks on existing trucks
     */
    async runMaintenance() {
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
                errors: result.errors.map((e) => { var _a; return e.url + ': ' + ((_a = e.details) !== null && _a !== void 0 ? _a : 'Unknown error'); }),
                duration,
            };
        }
        catch (error) {
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
