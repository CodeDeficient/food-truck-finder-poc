import { GoogleGenAI } from "@google/genai"; // Updated import
import { APIUsageService } from "./supabase"

interface GeminiResponse {
  success: boolean
  data?: any
  tokensUsed?: number
  error?: string
  promptSent?: string;
}

export class GeminiService {
  private genAI: GoogleGenAI; // Updated type
  private modelName: string; // New property for model name
  private dailyRequestLimit = 1500
  private dailyTokenLimit = 32000

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    this.genAI = new GoogleGenAI(process.env.GEMINI_API_KEY); // Updated initialization
    this.modelName = "gemini-2.0-flash-001"; // Changed model name as requested
  }

  async checkUsageLimits(): Promise<{ canMakeRequest: boolean; usage?: any }> {
    try {
      const usage = await APIUsageService.getTodayUsage("gemini")

      if (!usage) {
        return { canMakeRequest: true }
      }

      const requestsRemaining = this.dailyRequestLimit - (usage.requests_count || 0)
      const tokensRemaining = this.dailyTokenLimit - (usage.tokens_used || 0)

      return {
        canMakeRequest: requestsRemaining > 0 && tokensRemaining > 100, // Keep 100 token buffer
        usage: {
          requests: {
            used: usage.requests_count || 0,
            limit: this.dailyRequestLimit,
            remaining: requestsRemaining,
          },
          tokens: {
            used: usage.tokens_used || 0,
            limit: this.dailyTokenLimit,
            remaining: tokensRemaining,
          },
        },
      }
    } catch (error) {
      console.error("Error checking Gemini usage limits:", error)
      return { canMakeRequest: false }
    }
  }

  async processMenuData(rawMenuText: string): Promise<GeminiResponse> {
    const usageCheck = await this.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: "Daily API limits exceeded",
      }
    }

    try {
      const prompt = `
Parse the following food truck menu text and return a structured JSON format.
Extract menu items with categories, names, descriptions, prices, and dietary tags.

Menu text:
${rawMenuText}

Return ONLY valid JSON in this exact format:
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
- Return only the JSON, no additional text
      `
      const sdkResponse = await this.genAI.getGenerativeModel({ model: this.modelName }).generateContent(
        [{ role: "user", parts: [{ text: prompt }] }]
      );
      const responseText = sdkResponse.text; // Use sdkResponse.text directly

      const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount || Math.ceil((prompt.length + (responseText || '').length) / 4);

      await APIUsageService.trackUsage("gemini", 1, tokensUsed)

      try {
        const parsedData = JSON.parse(responseText.trim())
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        }
      } catch (parseError) {
        return {
          success: false,
          error: "Failed to parse Gemini response as JSON",
          tokensUsed,
        }
      }
    } catch (error) {
      console.error("Gemini menu processing error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async extractLocationFromText(textInput: string): Promise<GeminiResponse> {
    const usageCheck = await this.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: "Daily API limits exceeded",
      }
    }

    try {
      const prompt = `
Extract location information from the following text and return structured data.
Look for addresses, cross streets, landmarks, or location descriptions.

Text:
${textInput}

Return ONLY valid JSON in this exact format:
{
  "address": "full_address_if_available",
  "city": "city_name",
  "state": "state_abbreviation",
  "landmarks": ["nearby_landmark1", "nearby_landmark2"],
  "coordinates": {
    "lat": null,
    "lng": null
  },
  "confidence": 0.95,
  "raw_location_text": "original_location_mention"
}

Rules:
- Set coordinates to null if not explicitly provided
- Confidence should be 0.0 to 1.0 based on clarity
- Include any mentioned landmarks or cross streets
- Return only the JSON, no additional text
      `
      // Renamed 'text' parameter to 'textInput' to avoid conflict with 'text' variable for response
      const sdkResponse = await this.genAI.getGenerativeModel({ model: this.modelName }).generateContent(
        [{ role: "user", parts: [{ text: textInput }] }]
      );
      const responseText = sdkResponse.text; // Use sdkResponse.text directly

      const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount || Math.ceil((prompt.length + (responseText || '').length) / 4);
      await APIUsageService.trackUsage("gemini", 1, tokensUsed)

      try {
        const parsedData = JSON.parse(responseText.trim())
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        }
      } catch (parseError) {
        return {
          success: false,
          error: "Failed to parse Gemini response as JSON",
          tokensUsed,
        }
      }
    } catch (error) {
      console.error("Gemini location extraction error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async standardizeOperatingHours(hoursText: string): Promise<GeminiResponse> {
    const usageCheck = await this.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: "Daily API limits exceeded",
      }
    }

    try {
      const prompt = `
Parse the following operating hours text and return standardized format.
Convert all times to 24-hour format and handle various input formats.

Hours text:
${hoursText}

Return ONLY valid JSON in this exact format:
{
  "monday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "tuesday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "wednesday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "thursday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "friday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "saturday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
  "sunday": {"open": "HH:MM", "close": "HH:MM", "closed": false}
}

Rules:
- Use 24-hour format (e.g., "14:30" for 2:30 PM)
- If closed on a day, set "closed": true and omit open/close times
- Handle ranges like "Mon-Fri" by applying to all days in range
- Default to reasonable hours if ambiguous
- Return only the JSON, no additional text
      `
      const sdkResponse = await this.genAI.getGenerativeModel({ model: this.modelName }).generateContent(
        [{ role: "user", parts: [{ text: prompt }] }]
      );
      const responseText = sdkResponse.text; // Use sdkResponse.text directly

      const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount || Math.ceil((prompt.length + (responseText || '').length) / 4);
      await APIUsageService.trackUsage("gemini", 1, tokensUsed)

      try {
        const parsedData = JSON.parse(responseText.trim())
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        }
      } catch (parseError) {
        return {
          success: false,
          error: "Failed to parse Gemini response as JSON",
          tokensUsed,
        }
      }
    } catch (error) {
      console.error("Gemini hours standardization error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async analyzeSentiment(reviewText: string): Promise<GeminiResponse> {
    const usageCheck = await this.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: "Daily API limits exceeded",
      }
    }

    try {
      const prompt = `
Analyze the sentiment of this food truck review and extract key insights.
Focus on food quality, service, value, and overall experience.

Review:
${reviewText}

Return ONLY valid JSON in this exact format:
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
- Return only the JSON, no additional text
      `
      const sdkResponse = await this.genAI.getGenerativeModel({ model: this.modelName }).generateContent(
        [{ role: "user", parts: [{ text: prompt }] }]
      );
      const responseText = sdkResponse.text; // Use sdkResponse.text directly

      const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount || Math.ceil((prompt.length + (responseText || '').length) / 4);
      await APIUsageService.trackUsage("gemini", 1, tokensUsed)

      try {
        const parsedData = JSON.parse(responseText.trim())
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        }
      } catch (parseError) {
        return {
          success: false,
          error: "Failed to parse Gemini response as JSON",
          tokensUsed,
        }
      }
    } catch (error) {
      console.error("Gemini sentiment analysis error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async enhanceFoodTruckData(rawData: any): Promise<GeminiResponse> {
    const usageCheck = await this.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: "Daily API limits exceeded",
      }
    }

    try {
      const prompt = `
Enhance and standardize this food truck data. Clean up inconsistencies, 
fill in missing information where possible, and improve data quality.

Raw data:
${JSON.stringify(rawData, null, 2)}

Return ONLY valid JSON with enhanced data in this format:
{
  "name": "cleaned_truck_name",
  "description": "enhanced_description",
  "cuisine_type": ["mexican", "american", "fusion"],
  "price_range": "budget|moderate|expensive",
  "specialties": ["signature_dish1", "signature_dish2"],
  "dietary_options": ["vegetarian", "vegan", "gluten_free"],
  "enhanced_menu": {
    "categories": [...]
  },
  "standardized_hours": {...},
  "cleaned_contact": {...},
  "data_quality_improvements": ["improvement1", "improvement2"],
  "confidence_score": 0.85
}

Rules:
- Preserve all original data while enhancing it
- Standardize naming conventions
- Infer cuisine type from menu items
- Estimate price range from menu prices
- Return only the JSON, no additional text
      `
      const sdkResponse = await this.genAI.getGenerativeModel({ model: this.modelName }).generateContent(
        [{ role: "user", parts: [{ text: prompt }] }]
      );
      const responseText = sdkResponse.text; // Use sdkResponse.text directly

      const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount || Math.ceil((prompt.length + (responseText || '').length) / 4);
      await APIUsageService.trackUsage("gemini", 1, tokensUsed)

      try {
        const parsedData = JSON.parse(responseText.trim())
        return {
          success: true,
          data: parsedData,
          tokensUsed,
        }
      } catch (parseError) {
        return {
          success: false,
          error: "Failed to parse Gemini response as JSON",
          tokensUsed,
        }
      }
    } catch (error) {
      console.error("Gemini data enhancement error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async batchProcess(items: Array<{ type: string; data: any }>, batchSize = 5): Promise<Array<GeminiResponse>> {
    const results: Array<GeminiResponse> = []

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)

      const batchPromises = batch.map(async (item) => {
        switch (item.type) {
          case "menu":
            return await this.processMenuData(item.data)
          case "location":
            return await this.extractLocationFromText(item.data)
          case "hours":
            return await this.standardizeOperatingHours(item.data)
          case "sentiment":
            return await this.analyzeSentiment(item.data)
          case "enhance":
            return await this.enhanceFoodTruckData(item.data)
          default:
            return { success: false, error: `Unknown processing type: ${item.type}` }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Add delay between batches to respect rate limits
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    return results
  }

  async getUsageStats() {
    return await APIUsageService.getTodayUsage("gemini")
  }

  async extractFoodTruckDetailsFromMarkdown(
    markdownContent: string,
    sourceUrl?: string,
  ): Promise<GeminiResponse> {
    const usageCheck = await this.checkUsageLimits()
    if (!usageCheck.canMakeRequest) {
      return {
        success: false,
        error: "Daily API limits exceeded for Gemini",
      }
    }

    const prompt = `
You are an AI assistant tasked with extracting structured information about food trucks from their website content (provided in Markdown format). Your goal is to populate a JSON object with the following schema. Only return the JSON object, nothing else.

Markdown Content:
---
${markdownContent}
---

Source URL (if available): ${sourceUrl || "Not provided"}

Target JSON Schema:
{{
  "name": "string | null",
  "description": "string | null",
  "cuisine_type": ["string", ...], // e.g., ["Mexican", "Tacos", "Fusion"]
  "price_range": "$ | $$ | $$$ | null", // Estimate based on menu prices if possible, otherwise null
  "specialties": ["string", ...], // e.g., ["Birria Tacos", "Signature Burger"]
  "current_location": {{
    "address": "string | null",
    "city": "string | null",
    "state": "string | null", // Should be state/province abbreviation e.g. CA, TX, ON
    "zip_code": "string | null",
    "raw_text": "original location text from page | null" // The exact text describing the location from the markdown
  }},
  "operating_hours": {{ // Use 24-hour format "HH:MM". If unable to parse, leave as null.
    "monday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null,
    "tuesday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null,
    "wednesday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null,
    "thursday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null,
    "friday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null,
    "saturday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null,
    "sunday": {{ "open": "HH:MM", "close": "HH:MM" }} | {{ "closed": true }} | null
  }},
  "menu": [ // If no menu found, this should be an empty array []
    {{
      "category": "string", // e.g., "Appetizers", "Main Courses", "Drinks"
      "items": [
        {{
          "name": "string",
          "description": "string | null",
          "price": "number (e.g., 12.99) | string (e.g., 'Market Price') | null",
          "dietary_tags": ["string", ...] // e.g., ["vegan", "gluten-free", "spicy"]
        }}
      ]
    }}
  ],
  "contact_info": {{
    "phone": "string | null", // e.g., "555-123-4567"
    "email": "string | null",
    "website": "string | null" // This should be the primary business website, not social media links
  }},
  "social_media": {{ // Extract usernames or full URLs if available
    "instagram": "string | null",
    "facebook": "string | null",
    "twitter": "string | null",
    "tiktok": "string | null",
    "yelp": "string | null"
    // Add other platforms like yelp, tiktok if found
  }},
  "source_url": "${sourceUrl || "Not provided"}"
}}

Instructions:
- Parse the Markdown content to extract the information for the JSON fields.
- If specific details are missing for a field, use 'null' for string/object/numeric fields or empty arrays '[]' for array fields like 'cuisine_type', 'specialties', 'menu', 'dietary_tags'.
- For 'operating_hours', if a day is mentioned but hours are unclear, set the day to 'null'. If a day is explicitly stated as closed, use '{{"closed": true}}'. If a day is not mentioned at all, also set it to 'null'.
- Ensure times are in "HH:MM" 24-hour format. For example, "2 PM" should be "14:00".
- Prices should be extracted as numbers if possible (e.g., 12.99 from "$12.99"). If it's a textual price like "Market Price" or "MP", use the text.
- 'cuisine_type' should be a list of keywords describing the type of food.
- 'price_range' can be estimated based on typical item prices: $ (most items < $10), $$ ($10-$20), $$$ (most items > $20).
- 'current_location.raw_text' should contain the original text snippet from which location details were extracted.
- Only return the valid JSON object. Do not include any explanatory text before or after the JSON.
`
    let textOutput = ""; // Define to ensure it's available in catch/finally if needed for token calculation
    try {
      const sdkResponse = await this.genAI.getGenerativeModel({ model: this.modelName }).generateContent(
        [{ role: "user", parts: [{ text: prompt }] }]
      );
      textOutput = sdkResponse.text; // Use sdkResponse.text directly

      // Clean the response to ensure it's valid JSON
      // Remove potential markdown code block delimiters
      const cleanedText = textOutput.replace(/^```json\s*([\s\S]*?)\s*```$/, "$1").trim()

      const tokensUsed = sdkResponse.usageMetadata?.totalTokenCount || Math.ceil((prompt.length + (cleanedText || '').length) / 4);
      await APIUsageService.trackUsage("gemini", 1, tokensUsed)

      try {
        const parsedData = JSON.parse(cleanedText)
        return {
          success: true,
          data: parsedData,
          tokensUsed,
          promptSent: prompt,
        }
      } catch (parseError: any) {
        console.error("Gemini JSON parsing error:", parseError)
        console.error("Problematic Gemini raw response text:", cleanedText)
        return {
          success: false,
          error: `Failed to parse Gemini response as JSON: ${parseError.message}. Response text: ${cleanedText.substring(0, 200)}...`,
          tokensUsed, // This might be from an error response or the fallback if sdkResponse.response.usageMetadata was undefined
          promptSent: prompt,
        }
      }
    } catch (error: any) {
      console.error("Gemini content generation error:", error)
      // Fallback token calculation if the API call itself failed before getting usageMetadata
      const tokensUsed = Math.ceil((prompt.length + textOutput.length) / 4);
      return {
        success: false,
        error: error.message || "Unknown error during Gemini content generation",
        tokensUsed: tokensUsed, // Provide best estimate
        promptSent: prompt,
      }
    }
  }
}

// Export singleton instance
export const gemini = new GeminiService()
