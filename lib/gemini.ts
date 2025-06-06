import { GoogleGenAI } from '@google/genai';
import { APIUsageService } from './supabase';

import {
  MenuCategory,
  LocationData,
  OperatingHours,
  SentimentAnalysisResult,
  EnhancedFoodTruckData,
  ExtractedFoodTruckDetails,
  DirectoryClassificationOutput, // Added import
  GeminiResponse,
} from './types';

export class GeminiService {
  private genAI: GoogleGenAI;
  private modelName: string;
  // Limits for gemini-2.5-flash-preview-05-20 (Free Tier)
  private dailyRequestLimit = 500; // RPD for gemini-2.5-flash-preview-05-20 (Free Tier). Note: RPM is 10.
  private dailyTokenLimit = 125000000; // Placeholder (500 RPD * 250k avg tokens/req). Focus on RPD=500. TPM=250k & RPM=10 are key operational constraints not actively throttled by this daily check.

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set or is empty.');
    }
    console.info(`GEMINI_API_KEY found, starts with: ${apiKey.slice(0, 5)}...`);
    this.genAI = new GoogleGenAI({ apiKey });
    this.modelName = 'gemini-2.5-flash-preview-05-20'; // Corrected model name
  }

  async checkUsageLimits(): Promise<{
    canMakeRequest: boolean;
    usage?: {
      requests: { used: number; limit: number; remaining: number };
      tokens: { used: number; limit: number; remaining: number };
    };
  }> {
    try {
      const usage = await APIUsageService.getTodayUsage('gemini');

      if (!usage) {
        return { canMakeRequest: true };
      }
      const requestsUsed = usage.requests_count ?? 0;
      const tokensUsed = usage.tokens_used ?? 0;

      const requestsRemaining = this.dailyRequestLimit - requestsUsed;
      const tokensRemaining = this.dailyTokenLimit - tokensUsed;

      return {
        canMakeRequest: requestsRemaining > 0 && tokensRemaining > 100, // Keep 100 token buffer
        usage: {
          requests: {
            used: requestsUsed,
            limit: this.dailyRequestLimit,
            remaining: requestsRemaining,
          },
          tokens: {
            used: tokensUsed,
            limit: this.dailyTokenLimit,
            remaining: tokensRemaining,
          },
        },
      };
    } catch (error: unknown) {
      console.warn('Error checking Gemini usage limits:', error);
      return { canMakeRequest: false };
    }
  }

  async processMenuData(rawMenuText: string): Promise<GeminiResponse<MenuCategory[]>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded',
      };
    }

    const prompt = `
Parse the following food truck menu text and return a structured JSON format.
Extract menu items with categories, names, descriptions, prices, and dietary tags.

Menu text:
${rawMenuText}

Return only valid json in this exact format:
{
  "categories": [
    {
      "name": "category_name",
      "items": [
        {
          "name": "item_name",
          "description": "item_description",
          "price": 0.00,
          "dietary_tags": ["vegetarian", "vegan", "gluten-free", "dairy-free", "spicy", "popular"]
        }
      ]
    }
  ]
}

Rules:
- Extract actual prices as numbers (e.g., 12.99, not "$12.99")
- Include dietary restrictions and special tags
- Group items into logical categories
- If no clear categories, use "Main Items"
- Return only the json, no additional text
      `;
    let textOutput: string = '';
    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      textOutput = sdkResponse.text || '';

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ||
        Math.ceil((prompt.length + textOutput.length) / 4);

      void APIUsageService.trackUsage('gemini', 1, tokensUsed);

      try {
        const parsedData = JSON.parse(textOutput.trim()) as { categories: MenuCategory[] };
        return {
          success: true,
          data: parsedData.categories,
          tokensUsed,
        };
      } catch (parseError: unknown) {
        console.warn('Gemini json parsing error:', parseError);
        console.warn('Problematic Gemini raw response text:', textOutput.trim());
        return {
          success: false,
          error: `Failed to parse Gemini response as json: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${textOutput.trim().slice(0, 200)}...`,
          tokensUsed,
        };
      }
    } catch (error: unknown) {
      console.warn('Gemini menu processing error:', error);
      const tokensUsed = Math.ceil(
        (prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
          4,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: tokensUsed,
      };
    }
  }

  async extractLocationFromText(textInput: string): Promise<GeminiResponse<LocationData>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded',
      };
    }

    const prompt = `
Extract location information from the following text and return structured data.
Look for addresses, cross streets, landmarks, or location descriptions.

Text:
${textInput}

Return only valid json in this exact format:
{
  "address": "full_address_if_available",
  "city": "city_name",
  "state": "state_abbreviation",
  "landmarks": ["nearby_landmark1", "nearby_landmark2"],
  "coordinates": {
    "lat": undefined,
    "lng": undefined
  },
  "confidence": 0.95,
  "raw_location_text": "original_location_mention"
}

Rules:
- Set coordinates to undefined if not explicitly provided
- Confidence should be 0.0 to 1.0 based on clarity
- Include any mentioned landmarks or cross streets
- Return only the json, no additional text
      `;
    let textOutput: string = '';
    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      textOutput = sdkResponse.text || '';

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ||
        Math.ceil((prompt.length + textOutput.length) / 4);
      void APIUsageService.trackUsage('gemini', 1, tokensUsed);

      try {
        const parsedData = JSON.parse(textOutput.trim()) as LocationData;
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        };
      } catch (parseError: unknown) {
        console.warn('Gemini json parsing error:', parseError);
        console.warn('Problematic Gemini raw response text:', textOutput.trim());
        return {
          success: false,
          error: `Failed to parse Gemini response as json: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${textOutput.trim().slice(0, 200)}...`,
          tokensUsed,
        };
      }
    } catch (error: unknown) {
      console.warn('Gemini location extraction error:', error);
      const tokensUsed = Math.ceil(
        (prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
          4,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: tokensUsed,
      };
    }
  }

  async standardizeOperatingHours(hoursText: string): Promise<GeminiResponse<OperatingHours>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded',
      };
    }

    const prompt = `
Parse the following operating hours text and return standardized format.
Convert all times to 24-hour format and handle various input formats.

Hours text:
${hoursText}

Return only valid json in this exact format:
{
  "monday": {"open": "hh:mm", "close": "hh:mm", "closed": false},
  "tuesday": {"open": "hh:mm", "close": "hh:mm", "closed": false},
  "wednesday": {"open": "hh:mm", "close": "hh:mm", "closed": false},
  "thursday": {"open": "hh:mm", "close": "hh:mm", "closed": false},
  "friday": {"open": "hh:mm", "close": "hh:mm", "closed": false},
  "saturday": {"open": "hh:mm", "close": "hh:mm", "closed": false},
  "sunday": {"open": "hh:mm", "close": "hh:mm", "closed": false}
}

Rules:
- Use 24-hour format (e.g., "14:30" for 2:30 pm)
- If closed on a day, set "closed": true and omit open/close times
- Handle ranges like "Mon-Fri" by applying to all days in range
- Default to reasonable hours if ambiguous
- Return only the json, no additional text
      `;
    let textOutput: string = '';
    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      textOutput = sdkResponse.text || '';

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ||
        Math.ceil((prompt.length + textOutput.length) / 4);
      void APIUsageService.trackUsage('gemini', 1, tokensUsed);

      try {
        const parsedData = JSON.parse(textOutput.trim()) as OperatingHours;
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        };
      } catch (parseError: unknown) {
        console.warn('Gemini json parsing error:', parseError);
        console.warn('Problematic Gemini raw response text:', textOutput.trim());
        return {
          success: false,
          error: `Failed to parse Gemini response as json: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${textOutput.trim().slice(0, 200)}...`,
          tokensUsed,
        };
      }
    } catch (error: unknown) {
      console.warn('Gemini hours standardization error:', error);
      const tokensUsed = Math.ceil(
        (prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
          4,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: tokensUsed,
      };
    }
  }

  async analyzeSentiment(reviewText: string): Promise<GeminiResponse<SentimentAnalysisResult>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded',
      };
    }

    const prompt = `
Analyze the sentiment of this food truck review and extract key insights.
Focus on food quality, service, value, and overall experience.

Review:
${reviewText}

Return only valid json in this exact format:
{
  "sentiment": "positive|negative|neutral",
  "score": 0.85,
  "confidence": 0.95,
  "key_topics": ["food_quality", "service", "price", "location", "wait_time"],
  "positive_aspects": ["great_food", "friendly_service"],
  "negative_aspects": ["long_wait", "expensive"],
  "summary": "brief_summary_of_review",
  "recommended": true
}

Rules:
- Score should be 0.0 (very negative) to 1.0 (very positive)
- Confidence should be 0.0 to 1.0 based on clarity of sentiment
- Include specific aspects mentioned in the review
- Summary should be 1-2 sentences max
- Return only the json, no additional text
      `;
    let textOutput: string = '';
    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      textOutput = sdkResponse.text || '';

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ||
        Math.ceil((prompt.length + textOutput.length) / 4);
      void APIUsageService.trackUsage('gemini', 1, tokensUsed);

      try {
        const parsedData = JSON.parse(textOutput.trim()) as SentimentAnalysisResult;
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        };
      } catch (parseError: unknown) {
        console.warn('Gemini json parsing error:', parseError);
        console.warn('Problematic Gemini raw response text:', textOutput.trim());
        return {
          success: false,
          error: `Failed to parse Gemini response as json: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${textOutput.trim().slice(0, 200)}...`,
          tokensUsed,
        };
      }
    } catch (error: unknown) {
      console.warn('Gemini sentiment analysis error:', error);
      const tokensUsed = Math.ceil(
        (prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
          4,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: tokensUsed,
      };
    }
  }

  async enhanceFoodTruckData(rawData: unknown): Promise<GeminiResponse<EnhancedFoodTruckData>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded',
      };
    }

    const prompt = `
Enhance and standardize this food truck data. Clean up inconsistencies,
fill in missing information where possible, and improve data quality.

Raw data:
${JSON.stringify(rawData, undefined, 2)}

Return only valid json with enhanced data in this format:
{
  "name": "cleaned_truck_name",
  "description": "enhanced_description",
  "cuisine_type": ["mexican", "american", "fusion"],
  "price_range": "budget|moderate|expensive",
  "specialties": ["signature_dish1", "signature_dish2"],
  "dietary_options": ["vegetarian", "vegan", "gluten_free"],
  "enhanced_menu": {
    "categories": []
  },
  "standardized_hours": {},
  "cleaned_contact": {},
  "data_quality_improvements": [],
  "confidence_score": 0.85
}

Rules:
- Preserve all original data while enhancing it
- Standardize naming conventions
- Infer cuisine type from menu items
- Estimate price range from menu prices
- Return only the json, no additional text
      `;
    let textOutput: string = '';
    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      textOutput = sdkResponse.text || '';

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ||
        Math.ceil((prompt.length + textOutput.length) / 4);
      void APIUsageService.trackUsage('gemini', 1, tokensUsed);

      try {
        const parsedData = JSON.parse(textOutput.trim()) as EnhancedFoodTruckData;
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        };
      } catch (parseError: unknown) {
        console.warn('Gemini json parsing error:', parseError);
        console.warn('Problematic Gemini raw response text:', textOutput.trim());
        return {
          success: false,
          error: `Failed to parse Gemini response as json: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${textOutput.trim().slice(0, 200)}...`,
          tokensUsed,
        };
      }
    } catch (error: unknown) {
      console.warn('Gemini data enhancement error:', error);
      const tokensUsed = Math.ceil(
        (prompt.length + (error instanceof Error ? error.message.length : String(error).length)) /
          4,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensUsed: tokensUsed,
      };
    }
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
          result = { success: false, error: `Unknown processing type: ${item.type}` };
          break;
        }
      }
      results.push(result);
    }

    return results;
  }

  async getUsageStats(): Promise<{ requests_count: number; tokens_used: number } | undefined> {
    const usage = await APIUsageService.getTodayUsage('gemini');
    return usage === undefined ? undefined : usage;
  }

  async extractFoodTruckDetailsFromMarkdown(
    markdownContent: string,
    sourceUrl?: string,
  ): Promise<GeminiResponse<ExtractedFoodTruckDetails>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded for Gemini',
      };
    }

    const prompt = `
You are an ai assistant tasked with extracting structured information about food trucks from their website content (provided in Markdown format). Your goal is to populate a json object with the following schema. Only return the json object, nothing else.

Markdown Content:
---
${markdownContent}
---

Source url (if available): ${sourceUrl || 'Not provided'}

Target json Schema:
{{
  "name": "string | undefined",
  "description": "string | undefined",
  "cuisine_type": ["string", ...], // e.g., ["Mexican", "Tacos", "Fusion"]
  "price_range": "$ | $$ | $$$ | undefined", // Estimate based on menu prices if possible, otherwise undefined
  "specialties": ["string", ...], // e.g., ["Birria Tacos", "Signature Burger"]
  "current_location": {{
    "address": "string | undefined",
    "city": "string | undefined",
    "state": "string | undefined", // Should be state/province abbreviation e.g. SC, NC, GA, CA, TX, ON
    "zip_code": "string | undefined",
    "raw_text": "original location text from page | undefined", // The exact text describing the location from the markdown
    "is_south_carolina_location_confirmed": "boolean" // true if a South Carolina location is confidently identified, false otherwise
  }},
  "operating_hours": {{ // Use 24-hour format "hh:mm". If unable to parse, leave as undefined.
    "monday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined,
    "tuesday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined,
    "wednesday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined,
    "thursday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined,
    "friday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined,
    "saturday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined,
    "sunday": {{ "open": "hh:mm", "close": "hh:mm" }} | {{ "closed": true }} | undefined
  }},
  "menu": [ // If no menu found, this should be an empty array []
    {{
      "category": "string", // e.g., "Appetizers", "Main Courses", "Drinks"
      "items": [
        {{
          "name": "string",
          "description": "string | undefined",
          "price": "number (e.g., 12.99) | string (e.g., 'Market Price') | undefined",
          "dietary_tags": ["string", ...] // e.g., ["vegan", "gluten-free", "spicy"]
        }}
      ]
    }}
  ],
  "contact_info": {{
    "phone": "string | undefined", // e.g., "555-123-4567"
    "email": "string | undefined",
    "website": "string | undefined" // This should be the primary business website, not social media links
  }},
  "social_media": {{ // Extract usernames or full urls if available
    "instagram": "string | undefined",
    "facebook": "string | undefined",
    "twitter": "string | undefined",
    "tiktok": "string | undefined",
    "yelp": "string | undefined"
    // Add other platforms like yelp, tiktok if found
  }},
    "source_url": "${sourceUrl || 'Not provided'}"
}}

Instructions:
- Parse the Markdown content to extract the information for the json fields.
- If specific details are missing for a field, use 'undefined' for string/object/numeric fields or empty arrays '[]' for array fields like 'cuisine_type', 'specialties', 'menu', 'dietary_tags'.
- For the 'description' field:
  - Generate a brief, natural, and owner-written style summary suitable for a food truck directory (target 1-2 sentences, maximum 200 characters).
  - Do not use the phrase "food truck" in the description.
  - Describe the primary cuisine, signature dishes if mentioned, or overall theme.
  - Prefer specific cuisine types (e.g., "Korean bbq", "Neapolitan Pizza") over general ones (e.g., "Asian", "Pizza"). If only general types are available, condense to the most specific possible.
  - Maintain a consistent, fact-based, and neutral tone. Avoid subjective superlatives (e.g., "world's best", "most delicious").
  - If the source text makes specific claims of being "the first" or "the oldest," you may include this factually if it seems central to their identity, but phrase it cautiously (e.g., "States it was established in [year] as one of the first..."). Avoid if it seems like puffery.
  - Prioritize objective information over marketing language.
- For 'operating_hours', if a day is mentioned but hours are unclear, set the day to 'undefined'. If a day is explicitly stated as closed, use '{{"closed": true}}'. If a day is not mentioned at all, also set it to 'undefined'.
- Ensure times are in "hh:mm" 24-hour format. For example, "2 pm" should be "14:00".
- Prices should be extracted as numbers if possible (e.g., 12.99 from "$12.99"). If it's a textual price like "Market Price" or "mp", use the text.
- 'cuisine_type' should be a list of keywords describing the type of food, as specific as possible.
- 'price_range' can be estimated based on typical item prices: $ (most items < $10), $$ ($10-$20), $$$ (most items > $20).
- 'current_location.raw_text' should contain the original text snippet from which location details were extracted.
- For 'current_location.state', ensure it is the two-letter abbreviation (e.g., "SC", "NC", "GA").
- Location Prioritization:
  - If a South Carolina (SC) address is found (e.g., city and state 'SC'), ensure it's the primary one extracted into 'current_location'.
  - If multiple locations are listed and one is in SC, that SC location should take precedence.
  - Set 'current_location.is_south_carolina_location_confirmed' to true if a South Carolina location is confidently identified based on the address or other contextual clues. Otherwise, set it to false.
- Only return the valid json object. Do not include any explanatory text before or after the json.
`;
    let textOutput: string = '';
    try {
      const sdkResponse = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      textOutput = sdkResponse.text || ''; // Clean the response to ensure it's valid json      // Remove potential markdown code block delimiters with safer regex patterns
      const cleanedText = textOutput
        .replace(/^```json[ \t\r\n]{0,10}/, '')
        .replace(/[ \t\r\n]{0,10}```$/, '')
        .trim();

      const tokensUsed =
        sdkResponse.usageMetadata?.totalTokenCount ||
        Math.ceil((prompt.length + cleanedText.length) / 4);
      void APIUsageService.trackUsage('gemini', 1, tokensUsed);

      try {
        const parsedData = JSON.parse(cleanedText) as ExtractedFoodTruckDetails;
        return {
          success: true,
          data: parsedData,
          tokensUsed,
          promptSent: prompt,
        };
      } catch (parseError: unknown) {
        console.warn('Gemini json parsing error:', parseError);
        console.warn('Problematic Gemini raw response text:', cleanedText);
        return {
          success: false,
          error: `Failed to parse Gemini response as json: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text: ${cleanedText.slice(0, 200)}...`,
          tokensUsed,
          promptSent: prompt,
        };
      }
    } catch (error: unknown) {
      console.warn('Gemini content generation error:', error);
      // Fallback token calculation if the api call itself failed before getting usageMetadata
      const tokensUsed = Math.ceil((prompt.length + textOutput.length) / 4);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error during Gemini content generation',
        tokensUsed: tokensUsed,
        promptSent: prompt,
      };
    }
  }
}

// Export singleton instance
export const gemini = new GeminiService();

  async getDirectoryClassificationForContent(pageContent: string): Promise<GeminiResponse<DirectoryClassificationOutput>> {
    const usageCheck = await this.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: 'Daily API limits exceeded for Gemini',
      };
    }

    const prompt = `
You are an AI assistant tasked with classifying webpage content to determine if it represents a food truck directory or a relevant listing of multiple businesses, with a special focus on South Carolina. Analyze the provided text content and return a JSON object with the specified schema.

Webpage Text Content:
---
${pageContent.substring(0, 15000)} // Truncate content to a reasonable length for the prompt
---

Target JSON Schema and Instructions:
{{
  "is_directory": boolean, // True if the page lists multiple businesses/food trucks, false if it's about a single entity or irrelevant.
  "is_sc_focused": boolean, // True if the content strongly indicates a focus on South Carolina (e.g., mentions SC cities, regions, or explicitly states SC focus).
  "directory_name": "string | undefined", // The prominent name of the website or directory if identifiable.
  "directory_description": "string | undefined", // A concise 1-2 sentence summary of what the page lists or its primary purpose.
  "relevance_score": number, // Your confidence (0.0 to 1.0) that this page is a useful source for finding food truck leads or other food-related business listings.
  "sc_focus_score": number // Your confidence (0.0 to 1.0) that this page's content is specifically and primarily about South Carolina.
}}

Few-shot Examples:

Example 1 (Good SC Directory):
Input Text Snippet: "Welcome to Charleston's Best Food Trucks! Find local mobile eats from BBQ to Tacos. Our listed vendors serve Charleston, Mount Pleasant, and Summerville, SC. Check event calendars."
Expected JSON Output: {{ "is_directory": true, "is_sc_focused": true, "directory_name": "Charleston's Best Food Trucks", "directory_description": "A directory listing food trucks in Charleston, Mount Pleasant, and Summerville, SC, covering various cuisines and events.", "relevance_score": 0.9, "sc_focus_score": 1.0 }}

Example 2 (Individual Food Truck, Not a Directory):
Input Text Snippet: "About Mobile Joe's Coffee - We're proud to serve the freshest coffee in Greenville, SC. Find our daily location on Twitter @MobileJoes!"
Expected JSON Output: {{ "is_directory": false, "is_sc_focused": true, "directory_name": "Mobile Joe's Coffee", "directory_description": "The official website or page for Mobile Joe's Coffee, an individual coffee truck operating in Greenville, SC.", "relevance_score": 0.2, "sc_focus_score": 1.0 }}

Example 3 (Generic US Directory, Low SC Focus):
Input Text Snippet: "FoodTruckFinder USA lists thousands of trucks nationwide. From New York to California, find a Foursquare or Yelp alternative for mobile food."
Expected JSON Output: {{ "is_directory": true, "is_sc_focused": false, "directory_name": "FoodTruckFinder USA", "directory_description": "A national directory of food trucks across the USA, not specific to any single state.", "relevance_score": 0.7, "sc_focus_score": 0.1 }}

Example 4 (Irrelevant Page):
Input Text Snippet: "The history of the automobile and its impact on American society. Chapter 3: The Rise of Roadside Diners."
Expected JSON Output: {{ "is_directory": false, "is_sc_focused": false, "directory_name": "History of the Automobile", "directory_description": "An article about automotive history and roadside diners, not a directory of current food businesses.", "relevance_score": 0.0, "sc_focus_score": 0.0 }}

Only return the valid JSON object based on your analysis of the Webpage Text Content. Do not include any explanatory text before or after the JSON.
          `; // End of prompt string

          let textOutput: string = '';
          try {
            const sdkResponse = await this.genAI.models.generateContent({
              model: this.modelName, // Uses the modelName set in constructor (e.g., gemini-1.5-flash-preview-0514)
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }, // Request JSON output
            });
            // textOutput = sdkResponse.text || ''; // Deprecated with responseMimeType
             if (sdkResponse.response && typeof sdkResponse.response.text === 'function') {
                 textOutput = sdkResponse.response.text();
             } else {
                 // Fallback or error handling if .text() is not available or response is not as expected
                 console.warn('Gemini response format unexpected or .text() function not available.');
                 textOutput = JSON.stringify(sdkResponse.response); // Attempt to stringify the whole response if .text() is missing.
             }


            const tokensUsed =
              sdkResponse.response.usageMetadata?.totalTokenCount ||
              Math.ceil((prompt.length + textOutput.length) / 4); // Estimate if not available

            void APIUsageService.trackUsage('gemini', 1, tokensUsed);

            try {
              // The response should already be JSON if responseMimeType worked.
              const parsedData = JSON.parse(textOutput.trim()) as DirectoryClassificationOutput;
              return {
                success: true,
                data: parsedData,
                tokensUsed,
                promptSent: prompt, // For debugging
              };
            } catch (parseError: unknown) {
              console.warn('Gemini (getDirectoryClassificationForContent) JSON parsing error:', parseError);
              console.warn('Problematic Gemini raw response text:', textOutput.trim());
              return {
                success: false,
                error: `Failed to parse Gemini response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}. Response text (first 200 chars): ${textOutput.trim().slice(0, 200)}...`,
                tokensUsed,
                promptSent: prompt,
              };
            }
          } catch (error: unknown) {
            console.warn('Gemini (getDirectoryClassificationForContent) content generation error:', error);
            const tokensUsed = Math.ceil((prompt.length + textOutput.length) / 4); // Estimate
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error during Gemini content generation',
              tokensUsed: tokensUsed,
              promptSent: prompt,
            };
          }
        }
