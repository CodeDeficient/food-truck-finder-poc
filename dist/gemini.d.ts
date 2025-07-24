import { type MenuCategory, type LocationData, type OperatingHours, type SentimentAnalysisResult, type EnhancedFoodTruckData, type ExtractedFoodTruckDetails, type GeminiResponse } from './types';
export declare class GeminiService {
    private apiClient;
    private dailyRequestLimit;
    private dailyTokenLimit;
    constructor();
    checkUsageLimits: () => any;
    private makeGeminiRequest;
    processMenuData: (rawMenuText: string) => Promise<GeminiResponse<MenuCategory[]>>;
    extractLocationFromText: (textInput: string) => Promise<GeminiResponse<LocationData>>;
    standardizeOperatingHours: (hoursText: string) => Promise<GeminiResponse<OperatingHours>>;
    analyzeSentiment: (reviewText: string) => Promise<GeminiResponse<SentimentAnalysisResult>>;
    enhanceFoodTruckData: (rawData: unknown) => Promise<GeminiResponse<EnhancedFoodTruckData>>;
    batchProcess: (items: Array<{
        type: string;
        data: unknown;
    }>) => Promise<Array<GeminiResponse<unknown>>>;
    getUsageStats: () => Promise<{
        requests_count: number;
        tokens_used: number;
    } | undefined>;
    extractFoodTruckDetailsFromMarkdown: (markdownContent: string, sourceUrl?: string) => Promise<GeminiResponse<ExtractedFoodTruckDetails>>;
}
/**
* Dispatches the appropriate Gemini operation based on the provided type.
* @example
* dispatchGeminiOperation('menu', 'data')
* Returns a promise with processed menu data response
* @param {'menu' | 'location' | 'hours' | 'sentiment' | 'enhance' | 'foodTruckExtraction'} type - The type of Gemini operation to dispatch.
* @param {unknown} data - Data relevant to the specified Gemini operation type.
* @returns {Promise<GeminiResponse<unknown>>} Returns a promise that resolves to the Gemini operation's response.
* @description
*   - Operates asynchronously, ensuring the flexibility and responsiveness of Gemini processing.
*   - Utilizes type assertion to correctly handle various data types pertinent to the operation.
*   - If the operation type is unrecognized, the function returns an error response.
*/
export declare function dispatchGeminiOperation(type: 'menu' | 'location' | 'hours' | 'sentiment' | 'enhance' | 'foodTruckExtraction', data: unknown): Promise<GeminiResponse<unknown>>;
export declare const gemini: GeminiService;
