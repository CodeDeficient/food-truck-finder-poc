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
export declare class PipelineManager {
    /**
     * Run the complete pipeline based on configuration
     */
    runPipeline(config: PipelineConfig): Promise<PipelineResult>;
    /**
     * Execute the specific pipeline type
     */
    private executePipelineType;
    /**
     * Create success result
     */
    private createSuccessResult;
    /**
     * Create error result
     */
    private createErrorResult;
    /**
     * Run URL discovery using Tavily search
     */
    runDiscovery(_params: DiscoveryParams): Promise<DiscoveryResult>;
    /**
     * Process existing scraping jobs
     */
    processJobs(options: ProcessingOptions): Promise<ProcessingResult>;
    /**
     * Create empty processing result when no jobs available
     */
    private createEmptyProcessingResult;
    /**
     * Process a batch of jobs
     */
    private processJobBatch;
    /**
     * Create processing error result
     */
    private createProcessingErrorResult;
    /**
     * Run full pipeline: discovery + processing
     */
    private runFullPipeline;
    /**
     * Run maintenance checks on existing trucks
     */
    runMaintenance(): Promise<MaintenanceResult>;
}
export declare const pipelineManager: PipelineManager;
