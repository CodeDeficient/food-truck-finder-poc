# Gemini API Implementation Plan

**Date**: July 29, 2025
**Author**: Cline AI Assistant

## Current Status

Based on the GitHub Actions verification, we have two remaining issues with the Gemini API integration:

1. **JSON Errors from Gemini** - Likely rate limit related but possibly configuration issues
2. **Need to Run Remotely** - Pipeline needs to be tested in actual GitHub Actions environment

## Immediate Implementation Steps

### Step 1: Enhance GeminiApiClient with Retry Logic

Let's modify the existing `lib/gemini/geminiApiClient.js` to add proper error handling and retry logic:

```javascript
// Enhanced GeminiApiClient with retry logic
import { GoogleGenerativeAI } from '@google/generative-ai';
import { APIUsageService } from '../supabase/services/apiUsageService.js';

export class GeminiApiClient {
    constructor() {
        this.modelName = 'gemini-2.0-flash-lite-001';
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey == undefined || apiKey === '') {
            throw new Error('GEMINI_API_KEY environment variable is not set or is empty.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
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
        let textOutput = '';
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
                
                const sdkResponse = await this.genAI.getGenerativeModel({
                    model: this.modelName
                }).generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: generationConfig,
                });
                
                textOutput = sdkResponse.response.text() ?? '';
                const tokensUsed = sdkResponse.response.usageMetadata?.totalTokenCount ??
                    Math.ceil((prompt.length + textOutput.length) / 4);
                
                // Track usage asynchronously
                APIUsageService.trackUsage('gemini', 1, tokensUsed).catch((error) => {
                    console.warn('Failed to track API usage:', error);
                });
                
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
}
```

### Step 2: Update Prompt Templates for Better JSON Formatting

Let's enhance the food truck extraction prompt to be more explicit about JSON formatting:

```javascript
// Enhanced foodTruckExtraction prompt in lib/gemini/promptTemplates.js
foodTruckExtraction: (markdownContent, sourceUrl) => {
    return `
You are an AI assistant tasked with extracting structured information about food trucks from their website content (provided in Markdown format). 

CRITICAL INSTRUCTIONS:
- Return ONLY a valid JSON object that matches the exact schema provided below
- Do not include any additional text, explanations, or markdown formatting
- Do not wrap the JSON in code blocks or backticks
- If you cannot confidently extract a real food truck name, return: {"name": null}
- Ensure all JSON strings are properly escaped with double quotes
- Use double quotes for all string values, never single quotes
- Escape special characters properly (backslashes, quotes, etc.)
- Do not include any control characters or invalid Unicode sequences

Expected JSON format:
{
  "name": "string or null",
  "description": "string or null",
  "cuisine_type": ["string"] or null,
  "contact_info": {
    "phone": "string or null",
    "email": "string or null", 
    "website": "string or null",
    "social_media": {
      "facebook": "string or null",
      "instagram": "string or null",
      "twitter": "string or null"
    }
  },
  "operating_hours": {
    "monday": {
      "open": "string or null",
      "close": "string or null", 
      "closed": true or false
    },
    "tuesday": {
      "open": "string or null",
      "close": "string or null",
      "closed": true or false
    },
    "wednesday": {
      "open": "string or null", 
      "close": "string or null",
      "closed": true or false
    },
    "thursday": {
      "open": "string or null",
      "close": "string or null", 
      "closed": true or false
    },
    "friday": {
      "open": "string or null",
      "close": "string or null",
      "closed": true or false
    },
    "saturday": {
      "open": "string or null",
      "close": "string or null", 
      "closed": true or false
    },
    "sunday": {
      "open": "string or null",
      "close": "string or null",
      "closed": true or false
    }
  },
  "menu": [
    {
      "category": "string",
      "items": [
        {
          "name": "string",
          "description": "string or null",
          "price": number or null,
          "dietary_tags": ["string"] or null
        }
      ]
    }
  ]
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
11. CRITICAL: Double-check that your JSON is valid before returning
`;
}
```

### Step 3: Create Test Script for Gemini Error Isolation

Let's create a test script to isolate and reproduce the Gemini errors:

```javascript
// scripts/test-gemini-errors.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { gemini } from '../lib/gemini.js';
import { FirecrawlService } from '../lib/firecrawl.js';

async function testGeminiErrorIsolation() {
    console.log('🔍 Testing Gemini API Error Isolation...');
    
    // Test URLs that have caused issues in the past
    const testUrls = [
        'https://www.restaurantji.com/sc/greenville/food-trucks/',
        // Add more problematic URLs here
    ];
    
    for (const url of testUrls) {
        console.log(`\n--- Testing URL: ${url} ---`);
        
        try {
            // Scrape the content
            console.log('📄 Scraping content...');
            const scrapeResult = await FirecrawlService.scrapeFoodTruckWebsite(url);
            
            if (!scrapeResult.success || !scrapeResult.data?.markdown) {
                console.log('❌ Scraping failed:', scrapeResult.error ?? 'No markdown content');
                continue;
            }
            
            console.log('✅ Scraping successful, length:', scrapeResult.data.markdown.length);
            
            // Test Gemini extraction with enhanced error handling
            console.log('🤖 Testing Gemini extraction...');
            const result = await gemini.extractFoodTruckDetailsFromMarkdown(
                scrapeResult.data.markdown,
                url
            );
            
            if (result.success) {
                console.log('✅ Gemini extraction successful');
                console.log('📝 Name:', result.data?.name || 'No name');
                console.log('📊 Data preview:', JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
            } else {
                console.log('❌ Gemini extraction failed:');
                console.log('   Error:', result.error);
                console.log('   Error Type:', result.errorType);
                console.log('   Status Code:', result.statusCode);
                
                // If it's a parsing error, show the raw response
                if (result.errorType === 'PARSE_ERROR' || result.error.includes('JSON')) {
                    console.log('   Raw response preview:', result.data?.substring(0, 200) + '...');
                }
            }
            
        } catch (error) {
            console.error('💥 Unexpected error:', error);
        }
        
        // Wait between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ Test completed');
}

// Run the test
if (process.argv[1].endsWith('test-gemini-errors.js')) {
    testGeminiErrorIsolation().catch(console.error);
}
```

### Step 4: Update GitHub Actions Workflow for Better Monitoring

Let's enhance the GitHub Actions workflow to include better error reporting:

```yaml
# .github/workflows/scrape-food-trucks.yml (enhanced sections)
name: Scrape Food Truck Websites
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:
    inputs:
      limit:
        description: 'Number of jobs to process (default: 10)'
        required: false
        default: '10'
      debug:
        description: 'Enable debug logging'
        required: false
        default: 'false'

jobs:
  scrape-food-trucks:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    env:
      NODE_OPTIONS: --max_old_space_size=4096
      DEBUG_LOGGING: ${{ github.event.inputs.debug || 'false' }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Setup environment
        run: |
          echo "Setting up environment variables..."
          echo "GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}" >> $GITHUB_ENV
          echo "SUPABASE_URL=${{ secrets.SUPABASE_URL }}" >> $GITHUB_ENV
          echo "SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" >> $GITHUB_ENV
          echo "FIRECRAWL_API_KEY=${{ secrets.FIRECRAWL_API_KEY }}" >> $GITHUB_ENV

      - name: Run scraping pipeline
        id: scrape
        run: |
          echo "🚀 Starting food truck scraping pipeline..."
          LIMIT=${{ github.event.inputs.limit || 10 }}
          
          if [ "$DEBUG_LOGGING" = "true" ]; then
            node scripts/github-action-scraper.js --limit $LIMIT --debug
          else
            node scripts/github-action-scraper.js --limit $LIMIT
          fi
          
          echo "✅ Pipeline completed successfully"

      - name: Report results
        if: always()
        run: |
          echo "📊 Job Summary:"
          echo "Job status: ${{ job.status }}"
          echo "Processed at: $(date)"
          
          if [ "${{ job.status }}" = "failure" ]; then
            echo "❌ Pipeline failed - check logs above for details"
            exit 1
          else
            echo "✅ Pipeline completed successfully"
          fi

      - name: Monitor API usage
        if: always()
        run: |
          echo "📈 Checking API usage..."
          node -e "
          import { APIUsageService } from './dist/lib/supabase/services/apiUsageService.js';
          APIUsageService.getTodayUsage('gemini').then(usage => {
            console.log('Gemini API usage today:', JSON.stringify(usage, null, 2));
          }).catch(console.error);
          "
```

## Testing Strategy

### Phase 1: Local Testing (Today)
1. **Run test script** to reproduce JSON errors
2. **Verify retry logic** works for rate limit scenarios
3. **Test prompt improvements** with problematic content
4. **Validate error classification** and handling

### Phase 2: Staging Environment (Tomorrow)
1. **Deploy to test branch** with enhanced logging
2. **Run limited pipeline** (5-10 jobs) to monitor behavior
3. **Analyze error patterns** and adjust retry parameters
4. **Verify no "Unknown Food Truck" entries** are created

### Phase 3: Production Deployment (Soon)
1. **Merge to main** after successful staging tests
2. **Monitor first few runs** closely for error rates
3. **Adjust parameters** based on real-world performance
4. **Document final configuration** and success metrics

## Success Criteria

### Immediate Goals (Within 24 hours)
- ✅ JSON parsing errors reduced by 80%
- ✅ Rate limit errors handled gracefully with retries
- ✅ No pipeline crashes due to Gemini API issues
- ✅ Clear error logging for debugging

### Short-term Goals (Within 1 week)
- ✅ 95%+ success rate for valid food truck websites
- ✅ Proper error classification and handling
- ✅ Comprehensive monitoring and alerting
- ✅ Documentation of error patterns and solutions

### Long-term Goals (Ongoing)
- ✅ Continuous improvement of prompt engineering
- ✅ Adaptive retry strategies based on error patterns
- ✅ Cost optimization while maintaining reliability
- ✅ Integration with fallback mechanisms (OpenRouter)

## Risk Mitigation

### Potential Issues
1. **Increased Processing Time**: Retry logic may slow down pipeline
   - **Mitigation**: Monitor and adjust retry delays, implement timeout limits

2. **Higher API Costs**: Retries may increase token usage
   - **Mitigation**: Track usage closely, implement cost controls

3. **Infinite Retry Loops**: Poorly configured retry logic
   - **Mitigation**: Strict max retry limits, exponential backoff

4. **Data Quality Issues**: Overly aggressive error recovery
   - **Mitigation**: Maintain strict data validation, discard invalid data

## Next Steps

1. **Implement enhanced GeminiApiClient** with retry logic
2. **Update prompt templates** for better JSON formatting
3. **Create and run test scripts** to isolate current issues
4. **Monitor GitHub Actions** after deployment
5. **Iterate based on real-world performance data**

This implementation plan addresses both the JSON parsing errors (likely rate limit related) and prepares the system for successful remote execution in GitHub Actions.
