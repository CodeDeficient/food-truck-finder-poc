export interface PipelineRequestBody {
  action?: 'discovery' | 'processing' | 'full' | 'maintenance';
  target_url?: string;
  config?: {
    maxUrls?: number;
    maxUrlsToProcess?: number;
    targetCities?: string[];
    priority?: number;
    skipDiscovery?: boolean;
    retryFailedJobs?: boolean;
  };
  // Legacy support
  job_type?: string;
  priority?: number;
}
