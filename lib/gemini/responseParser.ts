import {
  type MenuCategory,
  type LocationData,
  type OperatingHours,
  type SentimentAnalysisResult,
  type EnhancedFoodTruckData,
  type ExtractedFoodTruckDetails,
} from '../types';

export const GeminiResponseParser = {
  /**
   * Robust JSON parsing with multiple fallback strategies for malformed JSON
   * Focuses specifically on fixing common Gemini JSON output issues
   */
  parseJson<T>(text: string): T {
    if (!text) {
      throw new Error('No text provided for parsing');
    }

    // Clean up the response text - focus only on JSON cleanup
    let cleanedText = text.trim();

    // Remove JSON code block markers and format indicators
    cleanedText = cleanedText
      .replaceAll(/```json\s*/gi, '')
      .replaceAll(/```\s*$/i, '')
      .replaceAll(/^\s*json:\s*/i, '')
      .trim();

    // Try direct JSON parsing first
    try {
      return JSON.parse(cleanedText) as T;
    } catch (jsonError) {
      console.warn("Direct JSON parse failed. Attempting aggressive JSON extraction and repair.", jsonError);
      
      // Aggressive JSON extraction - try to find JSON objects/arrays in the text
      // Use simple, safe string operations to avoid regex backtracking issues
      const openBraceIndex = cleanedText.indexOf('{');
      const openBracketIndex = cleanedText.indexOf('[');
      
      // Try to extract JSON object first
      if (openBraceIndex !== -1) {
        const objectEnd = this.findMatchingBracket(cleanedText, openBraceIndex, '{', '}');
        if (objectEnd !== -1) {
          try {
            const extractedJson = cleanedText.slice(openBraceIndex, objectEnd + 1);
            const fixedJson = this.fixGeminiJsonIssues(extractedJson);
            return JSON.parse(fixedJson) as T;
          } catch (extractionError) {
            console.warn(`JSON object extraction failed:`, extractionError);
          }
        }
      }
      
      // Try to extract JSON array
      if (openBracketIndex !== -1) {
        const arrayEnd = this.findMatchingBracket(cleanedText, openBracketIndex, '[', ']');
        if (arrayEnd !== -1) {
          try {
            const extractedJson = cleanedText.slice(openBracketIndex, arrayEnd + 1);
            const fixedJson = this.fixGeminiJsonIssues(extractedJson);
            return JSON.parse(fixedJson) as T;
          } catch (extractionError) {
            console.warn(`JSON array extraction failed:`, extractionError);
          }
        }
      }

      // If all else fails, log the problematic text for debugging
      console.error("Problematic text:", cleanedText);
      console.error("Original raw response text:", text);
      throw new Error(`Failed to parse Gemini response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Text length: ${cleanedText.length}`);
    }
  },

  /**
   * Find the matching closing bracket for a given opening bracket
   * Simple implementation to avoid regex backtracking issues
   */
  findMatchingBracket(text: string, startIndex: number, openChar: string, closeChar: string): number {
    let depth = 1;
    for (let i = startIndex + 1; i < text.length; i++) {
      if (text[i] === openChar) {
        depth++;
      } else if (text[i] === closeChar) {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
    return -1; // Not found
  },

  /**
   * Fix common JSON formatting issues specifically from Gemini output
   * Based on the error patterns we've seen: missing commas, malformed braces, etc.
   */
  fixGeminiJsonIssues(text: string): string {
    let fixedText = text.trim();
    
    // Fix 1: Add missing commas between object properties and array elements
    // This handles the "Expected ',' or '}' after property value" error
    fixedText = fixedText.replaceAll(/(\}|\]|\"|\d)(\s+)(\{|\[|\"|\d)/g, '$1,$3');
    
    // Fix 2: Handle missing commas between key-value pairs in objects
    fixedText = fixedText.replaceAll(/(\")(\s+)(\")/g, '$1,$3');
    
    // Fix 3: Handle missing commas between array elements
    fixedText = fixedText.replaceAll(/(\])\s*(\{)/g, '$1,$2');
    fixedText = fixedText.replaceAll(/(\})\s*(\{)/g, '$1,$2');
    fixedText = fixedText.replaceAll(/(\")\s*(\{)/g, '$1,$2');
    fixedText = fixedText.replaceAll(/(\d)\s*(\{)/g, '$1,$2');
    
    // Fix 4: Fix trailing commas before closing braces/brackets
    fixedText = fixedText.replaceAll(/,\s*([\}\]])/g, '$1');
    
    // Fix 5: Handle common quote issues - remove unpaired quotes at the end
    const quoteMatches = fixedText.match(/"/g);
    if (quoteMatches && quoteMatches.length % 2 !== 0) {
      // Odd number of quotes - try to fix by removing trailing unpaired quote
      fixedText = fixedText.replaceAll(/"([^"]*)$/, '$1');
    }
    
    // Fix 6: Ensure proper JSON structure endings
    // Make sure objects and arrays are properly closed
    const openBraces = (fixedText.match(/\{/g) ?? []).length;
    const closeBraces = (fixedText.match(/\}/g) ?? []).length;
    const openBrackets = (fixedText.match(/\[/g) ?? []).length;
    const closeBrackets = (fixedText.match(/\]/g) ?? []).length;
    
    // Add missing closing braces/brackets (simple approach)
    if (openBraces > closeBraces) {
      fixedText += '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      fixedText += ']'.repeat(openBrackets - closeBrackets);
    }
    
    return fixedText;
  },

  parseMenuData(text: string): MenuCategory[] {
    return this.parseJson<MenuCategory[]>(text);
  },

  parseLocationData(text: string): LocationData {
    return this.parseJson<LocationData>(text);
  },

  parseOperatingHours(text: string): OperatingHours {
    return this.parseJson<OperatingHours>(text);
  },

  parseSentimentAnalysis(text: string): SentimentAnalysisResult {
    return this.parseJson<SentimentAnalysisResult>(text);
  },

  parseEnhancedFoodTruckData(text: string): EnhancedFoodTruckData {
    return this.parseJson<EnhancedFoodTruckData>(text);
  },

  parseExtractedFoodTruckDetails(text: string): ExtractedFoodTruckDetails {
    return this.parseJson<ExtractedFoodTruckDetails>(text);
  },

  cleanMarkdownResponse(text: string): string {
    return text
      .replaceAll(/```json\s*/gi, '')
      .replaceAll(/```\s*$/g, '')
      .replaceAll(/^\s*json:\s*/gm, '')
      .trim();
  },
};
