import { type FirecrawlResponse } from '@/lib/firecrawl';
import { type FoodTruck, type ScrapingJob, type DataProcessingQueue } from '@/lib/supabase';
import type { GeminiResponse, MenuCategory } from '@/lib/types';
interface FirecrawlTestResult {
    success: boolean;
    result?: FirecrawlResponse;
    error?: string;
    details?: unknown;
}
export declare function testFirecrawlScraping(testUrl: string): Promise<FirecrawlTestResult>;
export declare function testGeminiProcessing(): Promise<{
    success: boolean;
    error: string;
    details: string | undefined;
    result?: undefined;
} | {
    success: boolean;
    result: GeminiResponse<MenuCategory[]>;
    error?: undefined;
    details?: undefined;
}>;
type GeminiProcessMenuDataResult = MenuCategory[];
interface SupabaseTestResults {
    testTruck: FoodTruck;
    testJob: ScrapingJob;
    queueItem: DataProcessingQueue;
    nearbyTrucks: FoodTruck[];
}
interface FormattedTestResults {
    success: boolean;
    message: string;
    results: {
        firecrawl: {
            success: boolean;
            dataLength: number;
        };
        gemini: {
            success: boolean;
            tokensUsed: number | undefined;
            categoriesFound: number;
        };
        supabase: {
            truckCreated: string;
            jobCreated: string;
            queueItemCreated: string;
            nearbyTrucksFound: number;
        };
    };
    testData: {
        truck: FoodTruck;
        processedMenu: MenuCategory[] | undefined;
        nearbyTrucks: FoodTruck[];
    };
}
export declare function testSupabaseOperations(testUrl: string, geminiResult: GeminiResponse<GeminiProcessMenuDataResult>): Promise<SupabaseTestResults>;
export declare function formatTestResults(scrapeResult: FirecrawlTestResult, geminiResult: GeminiResponse<GeminiProcessMenuDataResult>, supabaseResults: SupabaseTestResults): FormattedTestResults;
export declare function runIntegrationTestSteps(testUrl: string): Promise<FirecrawlTestResult | {
    success: boolean;
    result: GeminiResponse<MenuCategory[]>;
    error?: undefined;
    details?: undefined;
} | {
    success: boolean;
    results: FormattedTestResults;
}>;
export {};
