export const GeminiResponseParser = {
    parseJson(text) {
        // Clean up the response text
        let cleanedText = text
            .replaceAll(/```json\s*/g, '')
            .replaceAll(/```\s*/g, '')
            .replaceAll(/^\s*json\s*/g, '')
            .trim();

        try {
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error("Initial JSON parse failed. Attempting aggressive extraction.", error);
            console.error("Problematic text:", cleanedText);

            // Attempt to extract JSON using regex for more robustness
            const jsonMatch = cleanedText.match(/(\{[\s\S]*\})|(\[[\s\S]*\])/);
            if (jsonMatch && jsonMatch[0]) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error("Aggressive JSON extraction also failed.", e);
                    // Fallback to a default empty object or re-throw a more specific error
                    throw new Error("Failed to parse Gemini response even after aggressive extraction.");
                }
            }
            throw new Error("Failed to parse Gemini response: No valid JSON structure found.");
        }
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
