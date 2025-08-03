import { type MenuCategory, type LocationData, type OperatingHours, type SentimentAnalysisResult, type EnhancedFoodTruckData, type ExtractedFoodTruckDetails } from '../types';
/**
 * BACKUP FILE: This file contains the YAML parsing functionality as a backup
 * for future enhancements. The main responseParser.ts has been simplified to
 * focus on robust JSON parsing only.
 *
 * This backup preserves the YAML parsing logic in case we want to implement
 * or test YAML responses from Gemini in the future.
 */
export declare const GeminiResponseParserWithYamlBackup: {
    /**
     * Robust JSON parsing with multiple fallback strategies including YAML
     */
    parseJsonWithYamlFallback<T>(text: string): T;
    /**
     * Fix common JSON formatting issues
     */
    fixCommonJsonIssues(text: string): string;
    parseMenuData(text: string): MenuCategory[];
    parseLocationData(text: string): LocationData;
    parseOperatingHours(text: string): OperatingHours;
    parseSentimentAnalysis(text: string): SentimentAnalysisResult;
    parseEnhancedFoodTruckData(text: string): EnhancedFoodTruckData;
    parseExtractedFoodTruckDetails(text: string): ExtractedFoodTruckDetails;
    cleanMarkdownResponse(text: string): string;
};
