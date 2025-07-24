import type { ScrapingJob } from '../types';
export declare const ScrapingJobService: {
    createJob(jobData: Partial<ScrapingJob>): Promise<ScrapingJob>;
    getJobsByStatus(status: string): Promise<ScrapingJob[]>;
    updateJobStatus(id: string, status: string, updates?: Partial<ScrapingJob>): Promise<ScrapingJob>;
    incrementRetryCount(id: string): Promise<ScrapingJob>;
    getAllJobs(limit?: number, offset?: number): Promise<ScrapingJob[]>;
    getJobsFromDate(date: Date): Promise<ScrapingJob[]>;
};
