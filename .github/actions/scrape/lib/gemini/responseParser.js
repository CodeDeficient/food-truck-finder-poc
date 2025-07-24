export const GeminiResponseParser = {
    parseJson(text) {
        // Clean up the response text
        const cleanedText = text
            .replaceAll(/```json\s*/g, '')
            .replaceAll(/```\s*/g, '')
            .replaceAll(/^\s*json\s*/g, '')
            .trim();
        return JSON.parse(cleanedText);
    },
    parseMenuData(text) {
        return this.parseJson(text);
    },
    parseLocationData(text) {
        return this.parseJson(text);
    },
    parseOperatingHours(text) {
        return this.parseJson(text);
    },
    parseSentimentAnalysis(text) {
        return this.parseJson(text);
    },
    parseEnhancedFoodTruckData(text) {
        return this.parseJson(text);
    },
    parseExtractedFoodTruckDetails(text) {
        return this.parseJson(text);
    },
    cleanMarkdownResponse(text) {
        return text
            .replaceAll(/```json\s*/g, '')
            .replaceAll(/```\s*/g, '')
            .replaceAll(/^\s*json\s*/g, '')
            .trim();
    },
};
