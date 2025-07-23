export type { FoodTruck, FoodTruckSchema, ScrapingJob, DataProcessingQueue, MenuItem, MenuCategory, OperatingHours, DailyOperatingHours, PriceRange, ApiUsage, GeminiResponse, StageResult, PipelineRunResult, ExtractedFoodTruckDetails, FirecrawlOutputData, TestPipelineResults, RealtimeMetrics, TruckRating, PipelineEvent, SentimentAnalysisResult, EnhancedFoodTruckData, LocationData, UserCoordinates } from '../../types';
export interface FoodTruckLocation {
    lat: number;
    lng: number;
    address?: string;
    timestamp: string;
}
export interface RawMenuItemFromDB {
    name: string;
    description?: string;
    price?: number;
    dietary_tags?: string[];
    category?: string;
    [key: string]: unknown;
}
