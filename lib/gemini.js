import { APIUsageService } from './supabase/services/apiUsageService.js';
import { GeminiApiClient } from './gemini/geminiApiClient.js';
import { GeminiUsageLimits } from './gemini/usageLimits.js';
import { PromptTemplates } from './gemini/promptTemplates.js';
import { GeminiResponseParser } from './gemini/responseParser.js';
export class GeminiService {
    constructor() {
        this.apiClient = new GeminiApiClient();
        this.dailyRequestLimit = 1500;
        this.dailyTokenLimit = 32_000;
    }
    checkUsageLimits() {
        return GeminiUsageLimits.checkUsageLimits({
            dailyRequestLimit: this.dailyRequestLimit,
            dailyTokenLimit: this.dailyTokenLimit,
        });
    }
    async makeGeminiRequest(prompt, parser) {
        return this.apiClient.makeRequestWithParsing(prompt, parser);
    }
    async processMenuData(rawMenuText) {
        const estimatedTokens = Math.ceil(rawMenuText.length / 4) + 500;
        const usageCheck = await GeminiUsageLimits.checkWithMonitoring(estimatedTokens);
        if (!usageCheck.allowed) {
            console.error('Gemini API usage limit error:', usageCheck.reason);
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.menuProcessing(rawMenuText);
        return this.makeGeminiRequest(prompt, (text) => {
            const parsedData = JSON.parse(text);
            return parsedData.categories;
        });
    }
    async extractLocationFromText(textInput) {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.locationExtraction(textInput);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseLocationData(text));
    }
    async standardizeOperatingHours(hoursText) {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.operatingHours(hoursText);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseOperatingHours(text));
    }
    async analyzeSentiment(reviewText) {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.sentimentAnalysis(reviewText);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseSentimentAnalysis(text));
    }
    async enhanceFoodTruckData(rawData) {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        const prompt = PromptTemplates.dataEnhancement(rawData);
        return this.makeGeminiRequest(prompt, (text) => GeminiResponseParser.parseEnhancedFoodTruckData(text));
    }
    async batchProcess(items) {
        const results = [];
        for (const item of items) {
            let result;
            switch (item.type) {
                case 'menu': {
                    result = await this.processMenuData(item.data);
                    break;
                }
                case 'location': {
                    result = await this.extractLocationFromText(item.data);
                    break;
                }
                case 'hours': {
                    result = await this.standardizeOperatingHours(item.data);
                    break;
                }
                case 'sentiment': {
                    result = await this.analyzeSentiment(item.data);
                    break;
                }
                case 'enhance': {
                    result = await this.enhanceFoodTruckData(item.data); // item.data is already unknown
                    break;
                }
                default: {
                    console.error('Unknown processing type in Gemini batchProcess:', item.type);
                    result = { success: false, error: "That didn't work, please try again later." };
                    break;
                }
            }
            results.push(result);
        }
        return results;
    }
    async getUsageStats() {
        const usage = await APIUsageService.getTodayUsage('gemini');
        return usage ?? undefined;
    }
    async extractFoodTruckDetailsFromMarkdown(markdownContent, sourceUrl) {
        const usageCheck = await this.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            console.error('Gemini API usage limit error: Daily API limits exceeded for Gemini');
            return {
                success: false,
                error: "That didn't work, please try again later.",
            };
        }
        
        const prompt = PromptTemplates.foodTruckExtraction(markdownContent, sourceUrl);
        
        // Define JSON schema for structured output
        const foodTruckSchema = {
            type: 'object',
            properties: {
                name: {
                    type: ['string', 'null'],
                    description: 'Food truck name or null if not confidently extractable'
                },
                description: {
                    type: ['string', 'null'],
                    description: 'Brief description of the food truck'
                },
                cuisine_type: {
                    type: ['array', 'null'],
                    items: {
                        type: 'string'
                    },
                    description: 'Types of cuisine served'
                },
                contact_info: {
                    type: ['object', 'null'],
                    properties: {
                        phone: {
                            type: ['string', 'null']
                        },
                        email: {
                            type: ['string', 'null']
                        },
                        website: {
                            type: ['string', 'null']
                        },
                        social_media: {
                            type: ['object', 'null'],
                            properties: {
                                facebook: {
                                    type: ['string', 'null']
                                },
                                instagram: {
                                    type: ['string', 'null']
                                },
                                twitter: {
                                    type: ['string', 'null']
                                }
                            }
                        }
                    }
                },
                operating_hours: {
                    type: ['object', 'null'],
                    properties: {
                        monday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        },
                        tuesday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        },
                        wednesday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        },
                        thursday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        },
                        friday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        },
                        saturday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        },
                        sunday: {
                            type: ['object', 'null'],
                            properties: {
                                open: {
                                    type: ['string', 'null']
                                },
                                close: {
                                    type: ['string', 'null']
                                },
                                closed: {
                                    type: 'boolean'
                                }
                            },
                            required: ['closed']
                        }
                    }
                },
                menu: {
                    type: ['array', 'null'],
                    items: {
                        type: 'object',
                        properties: {
                            category: {
                                type: 'string'
                            },
                            items: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string'
                                        },
                                        description: {
                                            type: ['string', 'null']
                                        },
                                        price: {
                                            type: ['number', 'null']
                                        },
                                        dietary_tags: {
                                            type: ['array', 'null'],
                                            items: {
                                                type: 'string'
                                            }
                                        }
                                    },
                                    required: ['name']
                                }
                            }
                        },
                        required: ['category', 'items']
                    }
                }
            },
            required: ['name']
        };

        const response = await this.apiClient.makeRequestWithParsing(
            prompt,
            (text) => {
                const cleanedText = text.trim();
                // Handle the case where name is null (should discard the truck)
                if (cleanedText === '{"name":null}' || cleanedText === '{"name": null}') {
                    return { name: null };
                }
                // Try to parse as JSON
                try {
                    return JSON.parse(cleanedText);
                } catch {
                    // If JSON parsing fails, try the response parser
                    return GeminiResponseParser.parseExtractedFoodTruckDetails(cleanedText);
                }
            },
            {
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseJsonSchema: foodTruckSchema
                }
            }
        );

        // Add promptSent to response for this specific method
        return {
            ...response,
            promptSent: prompt,
        };
    }
}
/**
* Dispatches the appropriate Gemini operation based on the provided type.
* @example
* dispatchGeminiOperation('menu', 'data')
* Returns a promise with processed menu data response
* @param {'menu' | 'location' | 'hours' | 'sentiment' | 'enhance' | 'foodTruckExtraction'} type - The type of Gemini operation to dispatch.
* @param {unknown} data - Data relevant to the specified Gemini operation type.
* @returns {Promise<GeminiResponse<unknown>>} Returns a promise that resolves to the Gemini operation's response.
* @description
*   - Operates asynchronously, ensuring the flexibility and responsiveness of Gemini processing.
*   - Utilizes type assertion to correctly handle various data types pertinent to the operation.
*   - If the operation type is unrecognized, the function returns an error response.
*/
export async function dispatchGeminiOperation(type, data) {
    switch (type) {
        case 'menu': {
            return gemini.processMenuData(data);
        }
        case 'location': {
            return gemini.extractLocationFromText(data);
        }
        case 'hours': {
            return gemini.standardizeOperatingHours(data);
        }
        case 'sentiment': {
            return gemini.analyzeSentiment(data);
        }
        case 'enhance': {
            return gemini.enhanceFoodTruckData(data);
        }
        case 'foodTruckExtraction': {
            const { markdownContent, sourceUrl } = data;
            return gemini.extractFoodTruckDetailsFromMarkdown(markdownContent, sourceUrl);
        }
        default: {
            return { success: false, error: `Unknown Gemini operation type: ${String(type)}` };
        }
    }
}
// Export singleton instance
export const gemini = new GeminiService();
