import { APIUsageService } from './supabase';
import { APIMonitor } from './monitoring/apiMonitor';
import { GeminiApiClient } from './gemini/geminiApiClient';
import { GeminiUsageLimits } from './gemini/usageLimits';
import { PromptTemplates } from './gemini/promptTemplates';
import { GeminiResponseParser } from './gemini/responseParser';

import {
  MenuCategory,
  LocationData,
  OperatingHours,
  SentimentAnalysisResult,
  EnhancedFoodTruckData,
  ExtractedFoodTruckDetails,
  GeminiResponse,
} from './types';

export class GeminiService {
  private apiClient: GeminiApiClient;
  private dailyRequestLimit = 1500;
  private dailyTokenLimit = 32_000;

  constructor() {
    this.apiClient = new GeminiApiClient();
  }

   checkUsageLimits() {
    return GeminiUsageLimits.checkUsageLimits({
      dailyRequestLimit: this.dailyRequestLimit,
      dailyTokenLimit: this.dailyTokenLimit,
    });
  }

  private  makeGeminiRequest<T>(
    prompt: string,
    parser: (text: string) => T,
    errorContext: string
  ): Promise<GeminiResponse<T>> {
    return this.apiClient.makeRequestWithParsing(prompt, parser);
  }

  async processMenuData(rawMenuText: string): Promise<GeminiResponse<MenuCategory[]>> {
    const estimatedTokens = Math.ceil(rawMenuText.length / 4) + 500;
    const usageCheck = await GeminiUsageLimits.checkWithMonitoring(estimatedTokens);

    if (!usageCheck.allowed) {
      console.error('Gemini API usage limit error:', usageCheck.reason);
      return {
        success: false,
        error: 'That didn\'t work, please try again later.',
      };
    }

    const prompt = PromptTemplates.menuProcessing(rawMenuText);
    return this.makeGeminiRequest(
      prompt,
      (text: string) => {
        const parsedData = JSON.parse(text) as { categories: MenuCategory[] };
        return parsedData.categories;
      },
      'menu processing'
    );
  }

  async extractLocationFromText(textInput: string): Promise<GeminiResponse<LocationData>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: 'That didn\'t work, please try again later.',
      };
    }

    const prompt = PromptTemplates.locationExtraction(textInput);
    return this.makeGeminiRequest(
      prompt,
      (text: string) => GeminiResponseParser.parseLocationData(text),
      'location extraction'
    );
  }

  async standardizeOperatingHours(hoursText: string): Promise<GeminiResponse<OperatingHours>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: 'That didn\'t work, please try again later.',
      };
    }

    const prompt = PromptTemplates.operatingHours(hoursText);
    return this.makeGeminiRequest(
      prompt,
      (text: string) => GeminiResponseParser.parseOperatingHours(text),
      'hours standardization'
    );
  }

  async analyzeSentiment(reviewText: string): Promise<GeminiResponse<SentimentAnalysisResult>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: 'That didn\'t work, please try again later.',
      };
    }

    const prompt = PromptTemplates.sentimentAnalysis(reviewText);
    return this.makeGeminiRequest(
      prompt,
      (text: string) => GeminiResponseParser.parseSentimentAnalysis(text),
      'sentiment analysis'
    );
  }

  async enhanceFoodTruckData(rawData: unknown): Promise<GeminiResponse<EnhancedFoodTruckData>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded');
      return {
        success: false,
        error: 'That didn\'t work, please try again later.',
      };
    }

    const prompt = PromptTemplates.dataEnhancement(rawData);
    return this.makeGeminiRequest(
      prompt,
      (text: string) => GeminiResponseParser.parseEnhancedFoodTruckData(text),
      'data enhancement'
    );
  }

  async batchProcess(
    items: Array<{ type: string; data: unknown }>,
  ): Promise<Array<GeminiResponse<unknown>>> {
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
          result = { success: false, error: 'That didn\'t work, please try again later.' };
          break;
        }
      }
      results.push(result);
    }

    return results;
  }

  async getUsageStats(): Promise<{ requests_count: number; tokens_used: number } | undefined> {
    const usage = await APIUsageService.getTodayUsage('gemini');
    return usage ?? undefined;
  }

  async extractFoodTruckDetailsFromMarkdown(
    markdownContent: string,
    sourceUrl?: string,
  ): Promise<GeminiResponse<ExtractedFoodTruckDetails>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      console.error('Gemini API usage limit error: Daily API limits exceeded for Gemini');
      return {
        success: false,
        error: 'That didn\'t work, please try again later.',
      };
    }

    const prompt = PromptTemplates.foodTruckExtraction(markdownContent, sourceUrl);

    const response = await this.makeGeminiRequest(
      prompt,
      (text: string) => {
        const cleanedText = GeminiResponseParser.cleanMarkdownResponse(text);
        return GeminiResponseParser.parseExtractedFoodTruckDetails(cleanedText);
      },
      'food truck extraction'
    );

    // Add promptSent to response for this specific method
    return {
      ...response,
      promptSent: prompt,
    };
  }
}

// Export singleton instance
export const gemini = new GeminiService();

// Centralized Gemini operation dispatcher to eliminate duplication
export async function dispatchGeminiOperation(
  type: 'menu' | 'location' | 'hours' | 'sentiment' | 'enhance',
  data: unknown
): Promise<unknown> {
  switch (type) {
    case 'menu': {
      return await gemini.processMenuData(data as string);
    }
    case 'location': {
      return await gemini.extractLocationFromText(data as string);
    }
    case 'hours': {
      return await gemini.standardizeOperatingHours(data as string);
    }
    case 'sentiment': {
      return await gemini.analyzeSentiment(data as string);
    }
    case 'enhance': {
      return await gemini.enhanceFoodTruckData(data);
    }
    default: {
      console.error('Unknown Gemini operation type in dispatchGeminiOperation:', type);
      throw new Error('That didn\'t work, please try again later.');
    }
  }
}
