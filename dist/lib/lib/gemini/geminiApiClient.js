import { GoogleGenAI } from '@google/genai';
import { APIUsageService } from '../supabase/client.js';
export class GeminiApiClient {
    genAI;
    modelName;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey == undefined || apiKey === '') {
            throw new Error('GEMINI_API_KEY environment variable is not set or is empty.');
        }
        this.genAI = new GoogleGenAI({ apiKey });
        this.modelName = 'gemini-2.0-flash-lite-001';
    }
    /**
    * Makes an API request to generate content based on the provided prompt and configuration.
    * @example
    * makeRequest('Create a poem about nature', { temperature: 0.7 })
    * Returns a promise that resolves to a GeminiResponse containing the generated text and token usage.
    * @param {string} prompt - The input prompt for content generation.
    * @param {GeminiApiConfig} config - Configuration settings for the API request, such as temperature. Defaults to an empty object.
    * @returns {Promise<GeminiResponse<T>>} A promise that resolves to a GeminiResponse with the generated content or an error message.
    * @description
    *   - The function calculates the number of tokens used for tracking purposes, even in case of an error.
    *   - The `temperature` parameter affects the randomness of the content generation, with higher values resulting in more creative outputs.
    *   - API usage is tracked asynchronously, and warnings are logged if tracking fails.
    *   - Returns an object indicating success status, the generated content or error message, and the number of tokens used.
    */
    async makeRequest(prompt, config = {}) {
        let textOutput = '';
        try {
            const sdkResponse = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: { temperature: config.temperature ?? 0 },
            });
            textOutput = sdkResponse.text ?? '';
            const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount ??
                Math.ceil((prompt.length + textOutput.length) / 4);
            // Track usage asynchronously
            APIUsageService.trackUsage('gemini', 1, tokensUsed).catch((error) => {
                console.warn('Failed to track API usage:', error);
            });
            return {
                success: true,
                data: textOutput,
                tokensUsed,
            };
        }
        catch (error) {
            const tokensUsed = Math.ceil((prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
                4);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                tokensUsed,
            };
        }
    }
    /**
     * Executes a request using a specified prompt and attempts to parse the response using the provided parser function.
     * @example
     * makeRequestWithParsing("example prompt", (text) => JSON.parse(text))
     * { success: true, data: { key: "value" }, tokensUsed: 100 }
     * @param {string} prompt - The prompt used to make the API request.
     * @param {function} parser - A function to parse the response text into the desired format.
     * @param {GeminiApiConfig} config - Optional configuration settings for the Gemini API request.
     * @returns {Promise<GeminiResponse<T>>} A promise resolving to a GeminiResponse object containing either the parsed data or an error description.
     * @description
     *   - The function makes an asynchronous request using a specific prompt string and configuration.
     *   - If the response is unsuccessful, it returns the original response cast to the expected return type.
     *   - Parses the successful response data using the provided parser function.
     *   - Handles parsing errors gracefully, returning a detailed error message and logs the raw problematic response.
     */
    async makeRequestWithParsing(prompt, parser, config = {}) {
        const response = await this.makeRequest(prompt, config);
        if (!response.success) {
            return response;
        }
        try {
            if (!response.data) {
                return {
                    success: false,
                    error: 'No data received from Gemini API',
                    tokensUsed: response.tokensUsed,
                };
            }
            const parsedData = parser(response.data);
            return {
                success: true,
                data: parsedData,
                tokensUsed: response.tokensUsed,
            };
        }
        catch (parseError) {
            console.warn('Gemini json parsing error:', parseError);
            console.warn('Problematic Gemini raw response text:', response.data?.trim() ?? 'No data');
            return {
                success: false,
                error: `Failed to parse Gemini response: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${response.data?.trim().slice(0, 200) ?? 'No data'}...`,
                tokensUsed: response.tokensUsed,
            };
        }
    }
}
