// lib/gemini.test.ts

import { GeminiService } from './gemini';
import { APIUsageService } from './supabase';

// Mock @google/generative-ai
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

// Mock APIUsageService
jest.mock('./supabase', () => ({
  ...jest.requireActual('./supabase'), // Keep other exports
  APIUsageService: {
    trackUsage: jest.fn().mockResolvedValue({}),
    getTodayUsage: jest.fn().mockResolvedValue({ requests_count: 0, tokens_used: 0 }),
  },
}));

describe('GeminiService', () => {
  let geminiService: GeminiService;
  const mockApiKey = 'test-gemini-api-key';

  beforeEach(() => {
    process.env.GEMINI_API_KEY = mockApiKey;
    geminiService = new GeminiService();
    mockGenerateContent.mockClear();
    (APIUsageService.trackUsage as jest.Mock).mockClear();
    (APIUsageService.getTodayUsage as jest.Mock).mockClear();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  describe('extractFoodTruckDetailsFromMarkdown', () => {
    const sampleMarkdown = '# Test Truck\nMenu: Burger - $5';
    const sampleSourceUrl = 'https://example.com/truck';

    it('should call Gemini API with the correct prompt and return parsed data on success', async () => {
      // Mock successful generateContent response with valid JSON string
      // Call extractFoodTruckDetailsFromMarkdown
      // Assert that generateContent was called with a prompt containing the sampleMarkdown
      // Assert that the method returns success: true, the parsed data, tokensUsed, and the promptSent
      // Assert that APIUsageService.trackUsage was called
    });

    it('should handle Gemini API errors gracefully', async () => {
      // Mock generateContent to throw an error or return an error structure
      // Call extractFoodTruckDetailsFromMarkdown
      // Assert that the method returns success: false, an error message, and the promptSent
      // Assert that APIUsageService.trackUsage might still be called if tokens can be estimated or an attempt was made
    });

    it('should handle JSON parsing errors from Gemini response', async () => {
      // Mock successful generateContent response but with malformed JSON
      // Call extractFoodTruckDetailsFromMarkdown
      // Assert that the method returns success: false, a parsing error message, and the promptSent
    });

    it('should handle daily API limit exceeded', async () => {
      // Mock APIUsageService.getTodayUsage to return limits as exceeded
      // Call extractFoodTruckDetailsFromMarkdown
      // Assert it returns success: false and an error about limits without calling generateContent
    });
  });

  // Add similar describe blocks for other public methods of GeminiService like:
  // processMenuData, extractLocationFromText, standardizeOperatingHours, enhanceFoodTruckData
  // focusing on prompt construction, response parsing, and error handling.
});
