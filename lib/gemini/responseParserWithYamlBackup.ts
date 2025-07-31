import {
  type MenuCategory,
  type LocationData,
  type OperatingHours,
  type SentimentAnalysisResult,
  type EnhancedFoodTruckData,
  type ExtractedFoodTruckDetails,
} from '../types';
import yaml from 'js-yaml';

/**
 * BACKUP FILE: This file contains the YAML parsing functionality as a backup
 * for future enhancements. The main responseParser.ts has been simplified to
 * focus on robust JSON parsing only.
 * 
 * This backup preserves the YAML parsing logic in case we want to implement
 * or test YAML responses from Gemini in the future.
 */

export const GeminiResponseParserWithYamlBackup = {
  /**
   * Robust JSON parsing with multiple fallback strategies including YAML
   */
  parseJsonWithYamlFallback<T>(text: string): T {
    if (!text) {
      throw new Error('No text provided for parsing');
    }

    // Clean up the response text for various formats
    let cleanedText = text.trim();

    // Remove code block markers and format indicators
    cleanedText = cleanedText
      .replace(/```(?:json|yaml)?\s*/gi, '')
      .replace(/```\s*$/i, '')
      .replace(/^\s*(?:json|yaml):\s*/i, '')
      .trim();

    // Try direct JSON parsing first
    try {
      return JSON.parse(cleanedText) as T;
    } catch (jsonError) {
      console.warn("Direct JSON parse failed. Attempting YAML parse.", jsonError);
      
      // Try YAML parsing as fallback
      try {
        const yamlResult = yaml.load(cleanedText);
        return yamlResult as T;
      } catch (yamlError) {
        console.warn("YAML parse failed. Attempting aggressive JSON extraction.", yamlError);
        
        // Aggressive JSON extraction - try to find JSON objects/arrays in the text
        const jsonPatterns = [
          /(\{[\s\S]*\})/,  // Object pattern
          /(\[[\s\S]*\])/,  // Array pattern
          /(\{[^{}]*\})/,   // Simple object pattern
          /(\[[^\[\]]*\])/  // Simple array pattern
        ];

        for (const pattern of jsonPatterns) {
          const match = cleanedText.match(pattern);
          if (match && match[1]) {
            try {
              const extractedJson = match[1];
              // Try to fix common JSON issues
              const fixedJson = this.fixCommonJsonIssues(extractedJson);
              return JSON.parse(fixedJson) as T;
            } catch (extractionError) {
              console.warn(`JSON extraction with pattern failed:`, extractionError);
              continue;
            }
          }
        }

        // If all else fails, log the problematic text for debugging
        console.error("Problematic text:", cleanedText);
        console.error("Original raw response text:", text);
        throw new Error(`Failed to parse Gemini response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}. Text length: ${cleanedText.length}`);
      }
    }
  },

  /**
   * Fix common JSON formatting issues
   */
  fixCommonJsonIssues(text: string): string {
    let fixedText = text.trim();
    
    // Fix missing commas between object properties
    fixedText = fixedText.replace(/(\}|\]|\"|\d)\s*(\{|\[|\"|\d)/g, '$1,$2');
    
    // Fix missing commas between array elements
    fixedText = fixedText.replace(/(\}|\]|\"|\d)\s*(\{|\[|\"|\d)/g, '$1,$2');
    
    // Fix trailing commas
    fixedText = fixedText.replace(/,\s*([\}\]])/g, '$1');
    
    // Fix unescaped quotes (simple approach)
    // This is a very basic fix - in practice you'd want something more sophisticated
    const quoteMatches = fixedText.match(/"/g);
    if (quoteMatches && quoteMatches.length % 2 !== 0) {
      // Odd number of quotes - try to fix by removing the last one
      fixedText = fixedText.replace(/"([^"]*)$/, '$1');
    }
    
    return fixedText;
  },

  parseMenuData(text: string): MenuCategory[] {
    return this.parseJsonWithYamlFallback<MenuCategory[]>(text);
  },

  parseLocationData(text: string): LocationData {
    return this.parseJsonWithYamlFallback<LocationData>(text);
  },

  parseOperatingHours(text: string): OperatingHours {
    return this.parseJsonWithYamlFallback<OperatingHours>(text);
  },

  parseSentimentAnalysis(text: string): SentimentAnalysisResult {
    return this.parseJsonWithYamlFallback<SentimentAnalysisResult>(text);
  },

  parseEnhancedFoodTruckData(text: string): EnhancedFoodTruckData {
    return this.parseJsonWithYamlFallback<EnhancedFoodTruckData>(text);
  },

  parseExtractedFoodTruckDetails(text: string): ExtractedFoodTruckDetails {
    return this.parseJsonWithYamlFallback<ExtractedFoodTruckDetails>(text);
  },

  cleanMarkdownResponse(text: string): string {
    return text
      .replace(/```(?:json|yaml)?\s*/gi, '')
      .replace(/```\s*$/i, '')
      .replace(/^\s*(?:json|yaml):\s*/i, '')
      .trim();
  },
};
