import {
  type MenuCategory,
  type LocationData,
  type OperatingHours,
  type SentimentAnalysisResult,
  type EnhancedFoodTruckData,
  type ExtractedFoodTruckDetails,
} from '../types';

export const GeminiResponseParser = {
  parseJson<T>(text: string): T {
    // Clean up the response text
    const cleanedText = text
      .replaceAll(/```json\s*/g, '')
      .replaceAll(/```\s*/g, '')
      .replaceAll(/^\s*json\s*/g, '')
      .trim();

    return JSON.parse(cleanedText) as T;
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
      .replaceAll(/```json\s*/g, '')
      .replaceAll(/```\s*/g, '')
      .replaceAll(/^\s*json\s*/g, '')
      .trim();
  },
};
