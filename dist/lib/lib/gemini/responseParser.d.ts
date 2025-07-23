import { type MenuCategory, type LocationData, type OperatingHours, type SentimentAnalysisResult, type EnhancedFoodTruckData, type ExtractedFoodTruckDetails } from '../types';
export declare const GeminiResponseParser: {
    parseJson<T>(text: string): T;
    parseMenuData(text: string): MenuCategory[];
    parseLocationData(text: string): LocationData;
    parseOperatingHours(text: string): OperatingHours;
    parseSentimentAnalysis(text: string): SentimentAnalysisResult;
    parseEnhancedFoodTruckData(text: string): EnhancedFoodTruckData;
    parseExtractedFoodTruckDetails(text: string): ExtractedFoodTruckDetails;
    cleanMarkdownResponse(text: string): string;
};
