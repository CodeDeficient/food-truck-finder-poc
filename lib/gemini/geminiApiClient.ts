// @ts-expect-error TS(2792): Cannot find module '@google/genai'. Did you mean t... Remove this comment to see the full error message
import { GoogleGenAI } from '@google/genai';
import { APIUsageService } from '../supabase';
import { GeminiResponse } from '../types';

export interface GeminiApiConfig {
  temperature?: number;
  maxTokens?: number;
}

export class GeminiApiClient {
  private genAI: GoogleGenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey == undefined || apiKey === '') {
      throw new Error('GEMINI_API_KEY environment variable is not set or is empty.');
    }
    this.genAI = new GoogleGenAI({ apiKey });
    this.modelName = 'gemini-2.0-flash-lite-001';
  }

  async makeRequest<T>(prompt: string, config: GeminiApiConfig = {}): Promise<GeminiResponse<T>> {
    let textOutput: string = '';

    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: config.temperature ?? 0 },
      });

      textOutput = sdkResponse.text ?? '';

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ??
        Math.ceil((prompt.length + textOutput.length) / 4);

      // Track usage asynchronously
      APIUsageService.trackUsage('gemini', 1, tokensUsed).catch((error) => {
        console.warn('Failed to track API usage:', error);
      });

      return {
        success: true,
        data: textOutput,
        tokensUsed,
      } as GeminiResponse<T>;
    } catch (error: unknown) {
      const tokensUsed = Math.ceil(
        (prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
          4,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed,
      };
    }
  }

  async makeRequestWithParsing<T>(
    prompt: string,
    parser: (text: string) => T,
    config: GeminiApiConfig = {},
  ): Promise<GeminiResponse<T>> {
    const response = await this.makeRequest<string>(prompt, config);

    if (!response.success) {
      return response as GeminiResponse<T>;
    }

    try {
      const parsedData = parser(response.data);
      return {
        success: true,
        data: parsedData,
        tokensUsed: response.tokensUsed,
      };
    } catch (parseError: unknown) {
      console.warn('Gemini json parsing error:', parseError);
      console.warn('Problematic Gemini raw response text:', response.data.trim());

      return {
        success: false,
        error: `Failed to parse Gemini response: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${response.data.trim().slice(0, 200)}...`,
        tokensUsed: response.tokensUsed,
      };
    }
  }
}
