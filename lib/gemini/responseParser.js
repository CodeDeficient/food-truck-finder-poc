import yaml from 'js-yaml';

export const GeminiResponseParser = {
    parseStructuredData(text) {
        // Clean up the response text for YAML
        let cleanedText = text
            .replaceAll(/```yaml\s*/g, '')
            .replaceAll(/```\s*/g, '')
            .replaceAll(/^\s*yaml\s*/g, '')
            .trim();

        try {
            return yaml.load(cleanedText);
        } catch (yamlError) {
            console.warn("YAML parse failed. Attempting JSON parse.", yamlError);
            // Fallback to JSON parsing if YAML fails
            cleanedText = text
                .replaceAll(/```json\s*/g, '')
                .replaceAll(/```\s*/g, '')
                .replaceAll(/^\s*json\s*/g, '')
                .trim();
            try {
                return JSON.parse(cleanedText);
            } catch (jsonError) {
                console.error("Initial JSON parse failed. Attempting aggressive extraction.", jsonError);
                console.error("Problematic text:", cleanedText);
                console.error("Original raw response text:", text);

                // Attempt to extract JSON using regex for more robustness
                const jsonMatch = cleanedText.match(/(\{[\s\S]*\})|(\[[\s\S]*\])/);
                if (jsonMatch && jsonMatch[0]) {
                    try {
                        return JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error("Aggressive JSON extraction also failed.", e);
                        throw new Error("Failed to parse Gemini response even after aggressive extraction.");
                    }
                }
                throw new Error("Failed to parse Gemini response: No valid YAML or JSON structure found.");
            }
        }
    },
    parseMenuData(text) {
        return this.parseStructuredData(text);
    },
    parseLocationData(text) {
        return this.parseStructuredData(text);
    },
    parseOperatingHours(text) {
        return this.parseStructuredData(text);
    },
    parseSentimentAnalysis(text) {
        return this.parseStructuredData(text);
    },
    parseEnhancedFoodTruckData(text) {
        return this.parseStructuredData(text);
    },
    parseExtractedFoodTruckDetails(text) {
        return this.parseStructuredData(text);
    },
    cleanMarkdownResponse(text) {
        // This function is now less critical as parseStructuredData handles cleaning
        // but keeping it for consistency if other parts of the code use it.
        return text
            .replaceAll(/```yaml\s*/g, '')
            .replaceAll(/```json\s*/g, '')
            .replaceAll(/```\s*/g, '')
            .replaceAll(/^\s*yaml\s*/g, '')
            .replaceAll(/^\s*json\s*/g, '')
            .trim();
    },
};
