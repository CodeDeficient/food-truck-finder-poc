// lib/gemini.test.ts
import { APIUsageService } from '../../lib/supabase'; // Import ApiUsage type
// Mock @google/genai
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: mockGenerateContent,
        }),
    })),
}));
// Mock APIUsageService
jest.mock('../../lib/supabase', () => ({
    APIUsageService: {
        trackUsage: jest.fn(),
        getTodayUsage: jest.fn().mockResolvedValue({
            requests_count: 0,
            tokens_used: 0,
            id: 'mock-id',
            service_name: 'mock-service',
            usage_date: '2023-01-01',
        }),
    },
}));
// Import after mocks are set up
import { GeminiService } from '../../lib/gemini';
describe('GeminiService', () => {
    const mockApiKey = 'test-gemini-api-key';
    beforeEach(() => {
        process.env.GEMINI_API_KEY = mockApiKey;
        mockGenerateContent.mockClear();
        APIUsageService.trackUsage.mockClear();
        APIUsageService.getTodayUsage.mockClear();
    });
    afterEach(() => {
        delete process.env.GEMINI_API_KEY;
    });
    describe('extractFoodTruckDetailsFromMarkdown', () => {
        it('should instantiate GeminiService correctly', () => {
            const service = new GeminiService();
            expect(service).toBeDefined();
        });
        it('should call Gemini API with the correct prompt and return parsed data on success', () => {
            // Mock successful generateContent response with valid JSON string
            // Call extractFoodTruckDetailsFromMarkdown
            // Assert that generateContent was called with a prompt containing the sampleMarkdown
            // Assert that the method returns success: true, the parsed data, tokensUsed, and the promptSent
            // Assert that APIUsageService.trackUsage was called
        });
        it('should handle Gemini API errors gracefully', () => {
            // Mock generateContent to throw an error or return an error structure
            // Call extractFoodTruckDetailsFromMarkdown
            // Assert that the method returns success: false, an error message, and the promptSent
            // Assert that APIUsageService.trackUsage might still be called if tokens can be estimated or an attempt was made
        });
        it('should handle JSON parsing errors from Gemini response', () => {
            // Mock successful generateContent response but with malformed JSON
            // Call extractFoodTruckDetailsFromMarkdown
            // Assert that the method returns success: false, a parsing error message, and the promptSent
        });
        it('should handle daily API limit exceeded', () => {
            // Mock APIUsageService.getTodayUsage to return limits as exceeded
            // Call extractFoodTruckDetailsFromMarkdown
            // Assert it returns success: false and an error about limits without calling generateContent
        });
    }); // Add similar describe blocks for other public methods of GeminiService like:
    // processMenuData, extractLocationFromText, standardizeOperatingHours, enhanceFoodTruckData
    // focusing on prompt construction, response parsing, and error handling.
});
