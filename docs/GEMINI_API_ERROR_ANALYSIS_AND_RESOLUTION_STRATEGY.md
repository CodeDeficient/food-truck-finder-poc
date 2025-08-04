# Gemini API Error Analysis and Resolution Strategy

**Date**: July 29, 2025
**Author**: Cline AI Assistant

## Executive Summary

This document analyzes the current Gemini API issues in the food truck finder pipeline and provides a comprehensive strategy for isolating and resolving these problems. The main issues identified are JSON parsing errors (likely due to rate limiting) and the need for robust retry logic implementation.

## Current Issues Analysis

### 1. JSON Parsing Errors
Based on the GitHub Actions verification results, we're experiencing JSON parsing errors with messages like:
- `Bad escaped character in JSON at position 17156`
- These errors are likely caused by rate limiting or API response formatting issues

### 2. Missing Retry Logic
The current Gemini API client lacks proper retry mechanisms for handling transient errors like rate limits (429) and service unavailability (503).

### 3. Error Handling Gaps
While the system handles errors gracefully, it doesn't distinguish between different types of errors for appropriate handling strategies.

## Research Findings

### Gemini API Error Types (from Context7 documentation)
1. **GoogleGenerativeAIFetchError** - HTTP errors including status codes
2. **GoogleGenerativeAIError** - Basic SDK errors
3. **GoogleGenerativeAIAbortError** - Timeout or user cancellation
4. **GoogleGenerativeAIResponseError** - Response parsing or safety block errors

### Common Error Codes
- **429**: RESOURCE_EXHAUSTED (Rate limit exceeded)
- **500**: INTERNAL (Server error)
- **503**: UNAVAILABLE (Service temporarily unavailable)

### Best Practices for Error Handling
1. **Exponential Backoff**: Essential for 429, 500, and 503 errors
2. **Specific Exception Handling**: Catch SDK-specific errors
3. **Retry Logic**: Implement retry mechanisms for transient errors
4. **Informative User Feedback**: Provide clear error messages

## Current Implementation Analysis

### GeminiApiClient.js Issues
1. **No Retry Logic**: Single attempt per request
2. **Basic Error Handling**: Generic error message capture
3. **No Rate Limit Detection**: Doesn't check for 429 status codes
4. **No Timeout Configuration**: Uses default timeout settings

### Prompt Templates Issues
1. **JSON Formatting Instructions**: Could be more explicit about JSON formatting
2. **Response Validation**: No validation of Gemini's response format

## Resolution Strategy

### Phase 1: Enhanced Error Detection and Classification

#### 1.1 Improve GeminiApiClient Error Handling
```javascript
// Enhanced error classification
async makeRequest(prompt, config = {}) {
    let textOutput = '';
    let attempt = 0;
    const maxRetries = config.maxRetries ?? 3;
    const baseDelay = config.baseDelay ?? 1000; // 1 second
    
    while (attempt <= maxRetries) {
        try {
            // Existing request logic...
            const sdkResponse = await this.genAI.models.generateContent({
                model: this.modelName,
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: generationConfig,
            });
            
            // Success logic...
            return {
                success: true,
                data: textOutput,
                tokensUsed,
            };
        }
        catch (error) {
            attempt++;
            
            // Classify error type
            const errorInfo = this.classifyError(error);
            
            // Check if retry is appropriate
            if (attempt <= maxRetries && this.shouldRetry(errorInfo)) {
                const delay = this.calculateDelay(baseDelay, attempt, errorInfo);
                console.log(`Gemini API error (attempt ${attempt}/${maxRetries + 1}): ${errorInfo.message}. Retrying in ${delay}ms...`);
                await this.sleep(delay);
                continue;
            }
            
            // Final error handling
            return {
                success: false,
                error: errorInfo.message,
                errorType: errorInfo.type,
                statusCode: errorInfo.statusCode,
                tokensUsed: this.estimateTokens(prompt, error),
            };
        }
    }
}

// Error classification method
classifyError(error) {
    if (error instanceof GoogleGenerativeAIFetchError) {
        return {
            type: 'FETCH_ERROR',
            message: error.message,
            statusCode: error.status,
            statusText: error.statusText,
        };
    } else if (error instanceof GoogleGenerativeAIResponseError) {
        return {
            type: 'RESPONSE_ERROR',
            message: error.message,
            response: error.response,
        };
    } else if (error instanceof GoogleGenerativeAIAbortError) {
        return {
            type: 'ABORT_ERROR',
            message: error.message,
        };
    } else {
        return {
            type: 'UNKNOWN_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Retry decision logic
shouldRetry(errorInfo) {
    // Retry on rate limits, server errors, and service unavailability
    if (errorInfo.statusCode === 429) return true; // Rate limit
    if (errorInfo.statusCode >= 500 && errorInfo.statusCode < 600) return true; // Server errors
    if (errorInfo.type === 'ABORT_ERROR') return true; // Timeouts
    return false;
}

// Exponential backoff with jitter
calculateDelay(baseDelay, attempt, errorInfo) {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    
    // For rate limits, use longer delays
    const multiplier = errorInfo.statusCode === 429 ? 2 : 1;
    
    return Math.min(exponentialDelay + jitter, 30000) * multiplier; // Max 30 seconds
}

sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

### Phase 2: Enhanced Prompt Templates

#### 2.1 Improve JSON Formatting Instructions
```javascript
foodTruckExtraction: (markdownContent, sourceUrl) => {
    return `
You are an AI assistant tasked with extracting structured information about food trucks from their website content (provided in Markdown format). 

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object that matches the exact schema provided below
- Do not include any additional text, explanations, or markdown formatting
- Do not wrap the JSON in code blocks or backticks
- If you cannot confidently extract a real food truck name, return: {"name": null}
- Ensure all JSON strings are properly escaped
- Use double quotes for all string values
- Do not use single quotes, backticks, or special characters that might break JSON parsing

Expected JSON format:
{
  "name": "string or null",
  "description": "string or null",
  "cuisine_type": ["string"] or null,
  // ... rest of schema
}

Website content:
${markdownContent}

${sourceUrl ? `Source URL: ${sourceUrl}` : ''}

Extraction Instructions:
1. Extract as much information as possible from the provided content
2. For missing information, use null values (not empty strings or objects)
3. For operating hours, use 24-hour format (e.g., "14:30" for 2:30 PM)
4. If a day is closed, set "closed": true and use null for open/close times
5. For prices, extract numeric values only (e.g., 12.99, not "$12.99")
6. Be thorough in extracting menu items and their details
7. Look for social media links and contact information carefully
8. CRITICAL: If you cannot confidently extract a real food truck name, return {"name": null}
9. CRITICAL: Return ONLY the JSON object, nothing else
10. CRITICAL: Ensure all JSON is properly formatted with correct escaping
`;
}
```

### Phase 3: Enhanced Response Parsing

#### 3.1 Robust JSON Parsing with Retry
```javascript
// Enhanced parsing with cleanup and retry
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

// Enhanced response cleaning
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
```

### Phase 4: Monitoring and Logging

#### 4.1 Enhanced Error Tracking
```javascript
// Enhanced error tracking with detailed logging
async makeRequest(prompt, config = {}) {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    console.log(`Gemini API Request ${requestId}: Starting request`);
    
    try {
        // ... existing request logic ...
        
        const duration = Date.now() - startTime;
        console.log(`Gemini API Request ${requestId}: Success in ${duration}ms`);
        
        // Track successful usage
        APIUsageService.trackUsage('gemini', 1, tokensUsed).catch((error) => {
            console.warn('Failed to track API usage:', error);
        });
        
        return {
            success: true,
            data: textOutput,
            tokensUsed,
            requestId,
            duration,
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorInfo = this.classifyError(error);
        
        console.error(`Gemini API Request ${requestId}: Failed after ${duration}ms`, {
            error: errorInfo,
            promptLength: prompt.length,
            config,
        });
        
        // Track failed usage for monitoring
        APIUsageService.trackUsage('gemini', 1, this.estimateTokens(prompt, error)).catch((error) => {
            console.warn('Failed to track API usage:', error);
        });
        
        return {
            success: false,
            error: errorInfo.message,
            errorType: errorInfo.type,
            statusCode: errorInfo.statusCode,
            tokensUsed: this.estimateTokens(prompt, error),
            requestId,
            duration,
        };
    }
}

generateRequestId() {
    return Math.random().toString(36).substr(2, 9);
}
```

## Testing and Isolation Strategy

### 1. Local Testing Environment
Create a controlled testing environment to isolate Gemini API issues:

```javascript
// test-gemini-errors.js
import { gemini } from '../lib/gemini.js';

async function testGeminiErrorHandling() {
    console.log('Testing Gemini API error handling...');
    
    // Test cases for different error scenarios
    const testCases = [
        {
            name: 'Rate Limit Simulation',
            prompt: 'Generate a very long response to potentially trigger rate limits',
            config: { temperature: 0.9, maxOutputTokens: 8192 }
        },
        {
            name: 'JSON Parsing Edge Cases',
            prompt: 'Return JSON with special characters: "He said \'Hello\'" and backticks `code`',
            config: { temperature: 0.1 }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n--- Testing: ${testCase.name} ---`);
        try {
            const result = await gemini.makeGeminiRequest(testCase.prompt, (text) => JSON.parse(text), testCase.config);
            console.log('Result:', result.success ? 'SUCCESS' : 'FAILED', result.error || 'No error');
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    }
}

testGeminiErrorHandling().catch(console.error);
```

### 2. Mock Testing for Error Scenarios
```javascript
// mock-gemini-client.js
export class MockGeminiClient {
    constructor() {
        this.callCount = 0;
        this.errorScenario = null; // 'rate_limit', 'server_error', 'parse_error', null
    }
    
    async makeRequest(prompt, config = {}) {
        this.callCount++;
        
        switch (this.errorScenario) {
            case 'rate_limit':
                if (this.callCount <= 2) {
                    throw new Error('429: RESOURCE_EXHAUSTED');
                }
                break;
            case 'server_error':
                if (this.callCount <= 1) {
                    throw new Error('500: INTERNAL SERVER ERROR');
                }
                break;
            case 'parse_error':
                return {
                    success: true,
                    data: '{"name": "Test Truck", "invalid_json: true}', // Malformed JSON
                    tokensUsed: 100
                };
        }
        
        // Return successful response
        return {
            success: true,
            data: '{"name": "Test Truck", "description": "A test food truck"}',
            tokensUsed: 100
        };
    }
}
```

## Implementation Roadmap

### Phase 1: Immediate Fixes (1-2 days)
1. **Enhance Error Classification** - Add proper error type detection
2. **Implement Basic Retry Logic** - Add exponential backoff for rate limits
3. **Improve Response Cleaning** - Add better JSON response sanitization
4. **Enhance Logging** - Add detailed error tracking and monitoring

### Phase 2: Advanced Features (3-5 days)
1. **Sophisticated Retry Logic** - Implement adaptive retry strategies
2. **Enhanced Prompt Templates** - Improve JSON formatting instructions
3. **Comprehensive Testing** - Create test suites for error scenarios
4. **Monitoring Dashboard** - Add metrics tracking for error rates

### Phase 3: Production Deployment (1-2 days)
1. **Gradual Rollout** - Deploy to staging environment first
2. **Monitor Performance** - Track error rates and success metrics
3. **Fine-tune Parameters** - Adjust retry delays and thresholds
4. **Full Production Deployment** - Deploy to production environment

## Success Metrics

### Key Performance Indicators
1. **Error Rate Reduction**: Target 80% reduction in JSON parsing errors
2. **Success Rate Improvement**: Target 95%+ success rate for valid requests
3. **Retry Effectiveness**: Target <5% of requests requiring maximum retries
4. **Response Time**: Maintain <30 second average response time

### Monitoring Dashboard
- **Error Type Distribution**: Track different error types over time
- **Retry Statistics**: Monitor retry attempts and success rates
- **Rate Limit Incidents**: Track 429 errors and their resolution
- **API Usage Patterns**: Monitor token consumption and request patterns

## Risk Mitigation

### Potential Risks
1. **Increased Latency**: Retry logic may increase processing time
   - **Mitigation**: Implement reasonable timeout limits and max retry counts

2. **Cost Overruns**: Retries may increase API usage costs
   - **Mitigation**: Monitor usage closely and implement cost controls

3. **Infinite Retry Loops**: Poorly configured retry logic
   - **Mitigation**: Strict max retry limits and exponential backoff

4. **Data Quality Issues**: Overly aggressive error recovery
   - **Mitigation**: Maintain strict data validation and quality checks

## Conclusion

The Gemini API error issues can be effectively resolved through a systematic approach that includes enhanced error handling, robust retry logic, improved prompt engineering, and comprehensive monitoring. The implementation should be done in phases to ensure stability and allow for proper testing.

The key to success is distinguishing between transient errors (rate limits, server issues) that should be retried and permanent errors (invalid data, parsing issues) that should be handled differently. With proper implementation, we can significantly improve the reliability and robustness of the food truck data pipeline.
