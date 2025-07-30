import { APIUsageService } from './supabase.js';
import { GeminiApiClient } from './gemini/geminiApiClient.js';
import { GeminiUsageLimits } from './gemini/usageLimits.js';
import { PromptTemplates } from './gemini/promptTemplates.js';
import { GeminiResponseParser } from './gemini/responseParser.js';

import {
  type MenuCategory,
  type LocationData,
  type OperatingHours,
  type SentimentAnalysisResult,
  type EnhancedFoodTruckData,
  type ExtractedFoodTruckDetails,
  type GeminiResponse,
} from './types.js';

export class GeminiService {
  private apiClient: GeminiApiClient;
  private dailyRequestLimit = 1500;
  private dailyTokenLimit = 32_000;

  constructor() {
    this.apiClient = new GeminiApiClient();
  }

  checkUsageLimits = () => {
    return GeminiUsageLimits.checkUsageLimits({
      dailyRequestLimit: this.dailyRequestLimit,
      dailyTokenLimit: this.dailyTokenLimit,
    });
  };

  private makeGeminiRequest = async <T>(
    prompt: string,
    parser: (text: string) => T,
  ): Promise<GeminiResponse<T>> => {
    return this.apiClient.makeRequestWithParsing(prompt, parser);
  };

  processMenuData = async (rawMenuText: string): Promise<GeminiResponse<MenuCategory[]>> => {
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
    return this.makeGeminiRequest(prompt, (text: string) => {
      const parsedData = JSON.parse(text) as { categories: MenuCategory[] };
      return parsedData.categories;
    });
  };

  extractLocationFromText = async (textInput: string): Promise<GeminiResponse<LocationData>> => {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: "That didn't work, please try again later.",
      };
    }

    const prompt = PromptTemplates.locationExtraction(textInput);
    return this.makeGeminiRequest(prompt, (text: string) =>
      GeminiResponseParser.parseLocationData(text),
    );
  };

  standardizeOperatingHours = async (
    hoursText: string,
  ): Promise<GeminiResponse<OperatingHours>> => {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: "That didn't work, please try again later.",
      };
    }

    const prompt = PromptTemplates.operatingHours(hoursText);
    return this.makeGeminiRequest(prompt, (text: string) =>
      GeminiResponseParser.parseOperatingHours(text),
    );
  };

  analyzeSentiment = async (
    reviewText: string,
  ): Promise<GeminiResponse<SentimentAnalysisResult>> => {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: "That didn't work, please try again later.",
      };
    }

    const prompt = PromptTemplates.sentimentAnalysis(reviewText);
    return this.makeGeminiRequest(prompt, (text: string) =>
      GeminiResponseParser.parseSentimentAnalysis(text),
    );
  };

  enhanceFoodTruckData = async (
    rawData: unknown,
  ): Promise<GeminiResponse<EnhancedFoodTruckData>> => {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: "That didn't work, please try again later.",
      };
    }

    const prompt = PromptTemplates.dataEnhancement(rawData);
    return this.makeGeminiRequest(prompt, (text: string) =>
      GeminiResponseParser.parseEnhancedFoodTruckData(text),
    );
  };

  batchProcess = async (
    items: Array<{ type: string; data: unknown }>,
  ): Promise<Array<GeminiResponse<unknown>>> => {
    const results: Array<GeminiResponse<unknown>> = [];

    for (const item of items) {
      let result: GeminiResponse<unknown>;
      switch (item.type) {
        case 'menu': {
          result = await this.processMenuData(item.data as string);
          break;
        }
        case 'location': {
          result = await this.extractLocationFromText(item.data as string);
          break;
        }
        case 'hours': {
          result = await this.standardizeOperatingHours(item.data as string);
          break;
        }
        case 'sentiment': {
          result = await this.analyzeSentiment(item.data as string);
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

  getUsageStats = async (): Promise<
    { requests_count: number; tokens_used: number } | undefined
  > => {
    const usage = await APIUsageService.getTodayUsage('gemini');
    return usage ?? undefined;
  };

  extractFoodTruckDetailsFromMarkdown = async (
    markdownContent: string,
    sourceUrl?: string,
  ): Promise<GeminiResponse<ExtractedFoodTruckDetails>> => {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded for Gemini');
      return {
        success: false,
        error: "That didn't work, please try again later.",
      };
    }

    const prompt = PromptTemplates.foodTruckExtraction(markdownContent, sourceUrl);

    const response = await this.makeGeminiRequest(prompt, (text: string) => {
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
export async function dispatchGeminiOperation(
  type: 'menu' | 'location' | 'hours' | 'sentiment' | 'enhance' | 'foodTruckExtraction',
  data: unknown,
): Promise<GeminiResponse<unknown>> {
  switch (type) {
    case 'menu': {
      return gemini.processMenuData(data as string);
    }
    case 'location': {
      return gemini.extractLocationFromText(data as string);
    }
    case 'hours': {
      return gemini.standardizeOperatingHours(data as string);
    }
    case 'sentiment': {
      return gemini.analyzeSentiment(data as string);
    }
    case 'enhance': {
      return gemini.enhanceFoodTruckData(data);
    }
    case 'foodTruckExtraction': {
      const { markdownContent, sourceUrl } = data as {
        markdownContent: string;
        sourceUrl?: string;
      };
      return gemini.extractFoodTruckDetailsFromMarkdown(markdownContent, sourceUrl);
    }
    default: {
      return { success: false, error: `Unknown Gemini operation type: ${String(type)}` };
    }
  }
}

// Export singleton instance
export const gemini = new GeminiService();
