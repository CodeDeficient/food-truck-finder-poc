import type { GeminiResponse } from '../types';
export interface GeminiApiConfig {
    temperature?: number;
    maxTokens?: number;
}
export declare class GeminiApiClient {
    private genAI;
    private modelName;
    constructor();
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
    makeRequest<T>(prompt: string, config?: GeminiApiConfig): Promise<GeminiResponse<T>>;
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
    makeRequestWithParsing<T>(prompt: string, parser: (text: string) => T, config?: GeminiApiConfig): Promise<GeminiResponse<T>>;
}
