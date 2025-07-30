import { GoogleGenAI } from '@google/genai';

export class GeminiApiClient {
    constructor() {
        this.modelName = 'gemini-2.0-flash-lite-001';
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey == undefined || apiKey === '') {
            throw new Error('GEMINI_API_KEY environment variable is not set or is empty.');
        }
        this.genAI = new GoogleGenAI(apiKey);
    }

    /**
     * Classify Gemini API errors for appropriate handling
     */
    classifyError(error) {
        // Check if it's an HTTP error with status code
        if (error && typeof error === 'object') {
            if (error.status) {
                return {
                    type: 'HTTP_ERROR',
                    message: error.message || 'HTTP Error',
                    statusCode: error.status,
                    statusText: error.statusText || 'Unknown status'
                };
            }
            
            // Check for response-related errors
            if (error.message && error.message.includes('JSON')) {
                return {
                    type: 'PARSE_ERROR',
                    message: error.message,
                    statusCode: null
                };
            }
        }
        
        return {
            type: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            statusCode: null
        };
    }

    /**
     * Determine if an error should be retried
     */
    shouldRetry(errorInfo) {
        // Retry on rate limits, server errors, and service unavailability
        if (errorInfo.statusCode === 429) return true; // Rate limit
        if (errorInfo.statusCode === 500) return true; // Internal server error
        if (errorInfo.statusCode === 503) return true; // Service unavailable
        if (errorInfo.type === 'PARSE_ERROR') return true; // JSON parsing issues
        return false;
    }

    /**
     * Calculate delay with exponential backoff and jitter
     */
    calculateDelay(baseDelay, attempt, errorInfo) {
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * exponentialDelay;
        
        // For rate limits, use longer delays
        const multiplier = errorInfo.statusCode === 429 ? 2 : 1;
        
        return Math.min(exponentialDelay + jitter, 30000) * multiplier; // Max 30 seconds
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Enhanced API request with retry logic
     */
    async makeRequest(prompt, config = {}) {
        let attempt = 0;
        const maxRetries = config.maxRetries ?? 3;
        const baseDelay = config.baseDelay ?? 1000; // 1 second
        
        while (attempt <= maxRetries) {
            try {
                console.log(`Gemini API Request attempt ${attempt + 1}/${maxRetries + 1}`);
                
                const generationConfig = {
                    temperature: config.temperature ?? 0,
                    ...config.generationConfig
                };
                
                const result = await this.genAI.models.generateContent({
                    model: this.modelName,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: generationConfig,
                });
                
                // Extract text from the response
                let textOutput = '';
                if (result.candidates && result.candidates.length > 0) {
                    const candidate = result.candidates[0];
                    if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                        textOutput = candidate.content.parts[0].text ?? '';
                    }
                }
                
                const tokensUsed = result.usageMetadata?.totalTokenCount ??
                    Math.ceil((prompt.length + textOutput.length) / 4);
                
                // Track usage asynchronously (optional)
                try {
                    const { APIUsageService } = await import('../supabase/services/apiUsageService.js');
                    APIUsageService.trackUsage('gemini', 1, tokensUsed).catch((error) => {
                        console.warn('Failed to track API usage:', error);
                    });
                } catch (importError) {
                    // API usage tracking is optional, continue without it
                    console.debug('API usage tracking not available:', importError.message);
                }
                
                console.log(`Gemini API Request successful after ${attempt + 1} attempt(s)`);
                return {
                    success: true,
                    data: textOutput,
                    tokensUsed,
                };
            }
            catch (error) {
                attempt++;
                const errorInfo = this.classifyError(error);
                
                console.error(`Gemini API Request attempt ${attempt} failed:`, errorInfo);
                
                // Check if retry is appropriate
                if (attempt <= maxRetries && this.shouldRetry(errorInfo)) {
                    const delay = this.calculateDelay(baseDelay, attempt, errorInfo);
                    console.log(`Retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
                    await this.sleep(delay);
                    continue;
                }
                
                // Final error handling
                const tokensUsed = Math.ceil((prompt.length + (error instanceof Error ? error.message.length : String(error).length)) / 4);
                return {
                    success: false,
                    error: errorInfo.message,
                    errorType: errorInfo.type,
                    statusCode: errorInfo.statusCode,
                    tokensUsed,
                };
            }
        }
    }

    /**
     * Clean response data to fix common JSON issues
     */
    cleanResponseData(text) {
        if (!text) return text;
        
        // Remove common problematic patterns
        let cleaned = text
            .trim()
            .replace(/^\s*```(?:json|yaml)?\s*/i, '')
            .replace(/\s*```\s*$/i, '')
            .replace(/^\s*(?:json|yaml):\s*/i, '')
            .trim();
        
        // Fix common JSON escaping issues
        cleaned = cleaned
            .replace(/\\'/g, "'")  // Fix single quote escaping
            .replace(/([^\\])\\"/g, '$1"')  // Fix double quote escaping
            .replace(/\\n/g, '\n')  // Normalize newlines
            .replace(/\\t/g, '\t'); // Normalize tabs
        
        return cleaned;
    }

    /**
     * Enhanced request with parsing and retry logic
     */
    async makeRequestWithParsing(prompt, parser, config = {}) {
        const maxParseRetries = 3;
        let parseAttempt = 0;
        
        while (parseAttempt < maxParseRetries) {
            parseAttempt++;
            
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
                
                // Clean the response data
                const cleanedData = this.cleanResponseData(response.data);
                const parsedData = parser(cleanedData);
                
                return {
                    success: true,
                    data: parsedData,
                    tokensUsed: response.tokensUsed,
                };
            }
            catch (parseError) {
                console.warn(`Gemini JSON parsing attempt ${parseAttempt} failed:`, parseError);
                
                // If this is the last attempt, return the error
                if (parseAttempt >= maxParseRetries) {
                    console.warn('Problematic Gemini raw response text:', response.data?.trim() ?? 'No data');
                    return {
                        success: false,
                        error: `Failed to parse Gemini response after ${maxParseRetries} attempts: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${response.data?.trim().slice(0, 200) ?? 'No data'}...`,
                        tokensUsed: response.tokensUsed,
                    };
                }
                
                // Wait before retry
                await this.sleep(1000 * parseAttempt);
            }
        }
    }
}
