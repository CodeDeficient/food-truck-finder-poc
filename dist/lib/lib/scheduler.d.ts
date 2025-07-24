export declare class TaskScheduler {
    private tasks;
    private intervals;
    private isRunning;
    constructor();
    start(): void;
    stop(): void;
    addTask(task: ScheduledTask): void;
    removeTask(taskId: string): void;
    enableTask(taskId: string): void;
    disableTask(taskId: string): void;
    private scheduleTask;
    getTaskStatus(): TaskStatus[];
    private calculateNextRun;
    scheduleFollowUpTasks(result: unknown): void;
}
interface ScheduledTask {
    id: string;
    name: string;
    description: string;
    intervalMinutes: number;
    enabled: boolean;
    execute: () => Promise<void>;
    lastRun?: string;
    lastSuccess?: string;
    successCount: number;
    errorCount: number;
    lastError?: string;
}
interface TaskStatus {
    id: string;
    name: string;
    enabled: boolean;
    intervalMinutes: number;
    lastRun?: string;
    lastSuccess?: string;
    successCount: number;
    errorCount: number;
    lastError?: string;
    nextRun?: string;
}
interface ScraperEngine {
    scrapeSocialMedia: (platform: string, handle: string) => Promise<{
        success: boolean;
        error?: string;
        data?: unknown;
    }>;
    scrapeWebsite: (url: string, selectors: Record<string, string>) => Promise<{
        success: boolean;
        error?: string;
        data?: unknown;
    }>;
}
interface GeminiProcessor {
    getUsageStats: () => {
        requests: {
            remaining: number;
        };
    };
    processMenuData: (content: string) => Promise<unknown>;
    extractLocationFromText: (content: string) => Promise<unknown>;
    standardizeOperatingHours: (content: string) => Promise<unknown>;
    analyzeSentiment: (content: string) => Promise<unknown>;
    enhanceFoodTruckData: (data: unknown) => Promise<unknown>;
}
interface DataQualityAssessor {
    assessTruckData: (truck: FoodTruck) => {
        score: number;
        issues: string[];
    };
}
interface FoodTruck {
    id: string;
    name: string;
    contact_info: {
        phone?: string;
        email?: string;
        website?: string;
    };
    social_media: {
        instagram_handle?: string;
        facebook_handle?: string;
        twitter_handle?: string;
    };
    cuisine_type: string;
    price_range?: string;
    specialties: string[];
    menu: unknown;
    current_location: {
        lat?: number;
        lng?: number;
        address?: string;
    };
}
export declare function createDefaultTasks(scraperEngine: ScraperEngine, geminiProcessor: GeminiProcessor, dataQualityAssessor: DataQualityAssessor): ScheduledTask[];
export declare const scheduler: TaskScheduler;
export {};
