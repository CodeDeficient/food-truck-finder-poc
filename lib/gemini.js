import { APIUsageService } from './supabase';
import { GeminiApiClient } from './gemini/geminiApiClient';
import { GeminiUsageLimits } from './gemini/usageLimits';
import { PromptTemplates } from './gemini/promptTemplates';
import { GeminiResponseParser } from './gemini/responseParser';
export class GeminiService {
    apiClient;
    dailyRequestLimit = 1500;
    dailyTokenLimit = 32_000;
    constructor() {
        this.apiClient = new GeminiApiClient();
    }
    checkUsageLimits = () => {
        return GeminiUsageLimits.checkUsageLimits({
            dailyRequestLimit: this.dailyRequestLimit,
            dailyTokenLimit: this.dailyTokenLimit,
        });
    };
    makeGeminiRequest = async (prompt, parser) => {
        return this.apiClient.makeRequestWithParsing(prompt, parser);
    };
    processMenuData = async (rawMenuText) => {
        const estimatedTokens = Math.ceil(rawMenuText.length / 4) + 500;
        const usageCheck = await GeminiUsageLimits.checkWithMonitoring(estimatedTokens);
        if (!usageCheck.allowed) {
            console.error('Gemini API usage limit error:', usageCheck.reason);
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.menuProcessing(rawMenuText);
        return this.makeGeminiRequest(prompt, (text) => {
            const parsedData = JSON.parse(text);
            return parsedData.categories;
        });
    };
    extractLocationFromText = async (textInput) => {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.locationExtraction(textInput);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseLocationData(text));
    };
    standardizeOperatingHours = async (hoursText) => {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.operatingHours(hoursText);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseOperatingHours(text));
    };
    analyzeSentiment = async (reviewText) => {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.sentimentAnalysis(reviewText);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseSentimentAnalysis(text));
    };
    enhanceFoodTruckData = async (rawData) => {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.dataEnhancement(rawData);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseEnhancedFoodTruckData(text));
    };
    batchProcess = async (items) => {
        const results = [];
        for (const item of items) {
            let result;
            switch (item.type) {
                case 'menu': {
                    result = await this.processMenuData(item.data);
                    break;
                }
                case 'location': {
                    result = await this.extractLocationFromText(item.data);
                    break;
                }
                case 'hours': {
                    result = await this.standardizeOperatingHours(item.data);
                    break;
                }
                case 'sentiment': {
                    result = await this.analyzeSentiment(item.data);
                    break;
                }
                case 'enhance': {
                    result = await this.enhanceFoodTruckData(item.data); // item.data is already unknown
                    break;
                }
                default: {
                    console.error('Unknown processing type in Gemini batchProcess:', item.type);
                    result = { success: false, error: "That didn't work, please try again later." };
                    break;
                }
            }
            results.push(result);
        }
        return results;
    };
    getUsageStats = async () => {
        const usage = await APIUsageService.getTodayUsage('gemini');
        return usage ?? undefined;
    };
    extractFoodTruckDetailsFromMarkdown = async (markdownContent, sourceUrl) => {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded for Gemini');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.foodTruckExtraction(markdownContent, sourceUrl);
        const response = await this.makeGeminiRequest(prompt, (text) => {
            const cleanedText = GeminiResponseParser.cleanMarkdownResponse(text);
            return GeminiResponseParser.parseExtractedFoodTruckDetails(cleanedText);
        });
        // Add promptSent to response for this specific method
        return {
            ...response,
            promptSent: prompt,
        };
    };
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
export async function dispatchGeminiOperation(type, data) {
    switch (type) {
        case 'menu': {
            return gemini.processMenuData(data);
        }
        case 'location': {
            return gemini.extractLocationFromText(data);
        }
        case 'hours': {
            return gemini.standardizeOperatingHours(data);
        }
        case 'sentiment': {
            return gemini.analyzeSentiment(data);
        }
        case 'enhance': {
            return gemini.enhanceFoodTruckData(data);
        }
        case 'foodTruckExtraction': {
            const { markdownContent, sourceUrl } = data;
            return gemini.extractFoodTruckDetailsFromMarkdown(markdownContent, sourceUrl);
        }
        default: {
            return { success: false, error: `Unknown Gemini operation type: ${String(type)}` };
        }
    }
}
// Export singleton instance
export const gemini = new GeminiService();
