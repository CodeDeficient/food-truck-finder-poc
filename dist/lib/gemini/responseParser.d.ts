import { type MenuCategory, type LocationData, type OperatingHours, type SentimentAnalysisResult, type EnhancedFoodTruckData, type ExtractedFoodTruckDetails } from '../types';
export declare const GeminiResponseParser: {
    /**
     * Robust JSON parsing with multiple fallback strategies for malformed JSON
     * Focuses specifically on fixing common Gemini JSON output issues
     */
    parseJson<T>(text: string): T;
    /**
     * Find the matching closing bracket for a given opening bracket
     * Simple implementation to avoid regex backtracking issues
     */
    findMatchingBracket(text: string, startIndex: number, openChar: string, closeChar: string): number;
    /**
     * Fix common JSON formatting issues specifically from Gemini output
     * Based on the error patterns we've seen: missing commas, malformed braces, etc.
     */
    fixGeminiJsonIssues(text: string): string;
    parseMenuData(text: string): MenuCategory[];
    parseLocationData(text: string): LocationData;
    parseOperatingHours(text: string): OperatingHours;
    parseSentimentAnalysis(text: string): SentimentAnalysisResult;
    parseEnhancedFoodTruckData(text: string): EnhancedFoodTruckData;
    parseExtractedFoodTruckDetails(text: string): ExtractedFoodTruckDetails;
    cleanMarkdownResponse(text: string): string;
};
