import {
  MenuCategory,
  LocationData,
  OperatingHours,
  SentimentAnalysisResult,
  EnhancedFoodTruckData,
  ExtractedFoodTruckDetails,
} from '../types';

export class GeminiResponseParser {
  static parseJson<T>(text: string): T {
    // Clean up the response text
    const cleanedText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*json\s*/g, '')
      .trim();

    return JSON.parse(cleanedText) as T;
  }

  static parseMenuData(text: string): MenuCategory[] {
    return this.parseJson<MenuCategory[]>(text);
  }

  static parseLocationData(text: string): LocationData {
    return this.parseJson<LocationData>(text);
  }

  static parseOperatingHours(text: string): OperatingHours {
    return this.parseJson<OperatingHours>(text);
  }

  static parseSentimentAnalysis(text: string): SentimentAnalysisResult {
    return this.parseJson<SentimentAnalysisResult>(text);
  }

  static parseEnhancedFoodTruckData(text: string): EnhancedFoodTruckData {
    return this.parseJson<EnhancedFoodTruckData>(text);
  }

  static parseExtractedFoodTruckDetails(text: string): ExtractedFoodTruckDetails {
    return this.parseJson<ExtractedFoodTruckDetails>(text);
  }

  static cleanMarkdownResponse(text: string): string {
    return text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*json\s*/g, '')
      .trim();
  }
}
