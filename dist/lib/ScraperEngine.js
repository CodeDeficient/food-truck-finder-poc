import { firecrawl } from './firecrawl'; // Import the firecrawl singleton
import * as crypto from 'node:crypto'; // Node.js crypto for secure randomness
// Core scraping engine with anti-detection measures
export class ScraperEngine {
    constructor() {
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        ];
        this.requestDelay = 2000;
        this.maxRetries = 3;
    }
    async performFallbackScrape(url) {
        try {
            const response = await fetch(url, { headers: { 'User-Agent': this.getRandomUserAgent() } });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText} during fallback fetch.`);
            }
            const htmlContent = await response.text();
            return {
                success: true,
                data: {
                    html: htmlContent,
                    is_fallback: true,
                },
                timestamp: new Date().toISOString(),
                source: url,
                note: 'Fetched using basic fetch as Firecrawl failed.',
            };
        }
        catch (fallbackError) {
            const errMsg = fallbackError instanceof Error ? fallbackError.message : 'Unknown fallback fetch error';
            console.warn(`Fallback fetch error for ${url}:`, errMsg);
            return {
                success: false,
                error: "That didn't work, please try again later.",
                timestamp: new Date().toISOString(),
                source: url,
            };
        }
    }
    async scrapeWebsite(url, _selectors) {
        var _a;
        try {
            const firecrawlResult = await firecrawl.scrapeUrl(url, {
                formats: ['markdown', 'html'],
                onlyMainContent: true,
            });
            if (firecrawlResult.success !== true || firecrawlResult.data == undefined) {
                throw new Error((_a = firecrawlResult.error) !== null && _a !== void 0 ? _a : 'Firecrawl scraping failed to return data.');
            }
            const returnedData = {};
            if (firecrawlResult.data && typeof firecrawlResult.data === 'object') {
                const firecrawlData = firecrawlResult.data;
                if (typeof firecrawlData.markdown === 'string' && firecrawlData.markdown !== '') {
                    returnedData.markdown = firecrawlData.markdown;
                }
                if (typeof firecrawlData.html === 'string' && firecrawlData.html !== '') {
                    returnedData.html = firecrawlData.html;
                }
                if (firecrawlData.metadata != undefined && typeof firecrawlData.metadata === 'object') {
                    returnedData.metadata = firecrawlData.metadata;
                }
            }
            if ((returnedData.markdown == undefined || returnedData.markdown === '') &&
                (returnedData.html == undefined || returnedData.html === '')) {
                throw new Error('Firecrawl returned no markdown or HTML content.');
            }
            return {
                success: true,
                data: returnedData,
                timestamp: new Date().toISOString(),
                source: url,
            };
        }
        catch (error) {
            console.warn(`Scraping error for ${url} using Firecrawl:`, error);
            console.info(`Falling back to basic fetch for ${url}`);
            return await this.performFallbackScrape(url);
        }
    }
    async scrapeSocialMedia(platform, handle) {
        try {
            await this.randomDelay();
            switch (platform) {
                case 'instagram': {
                    return await this.scrapeInstagram(handle);
                }
                case 'facebook': {
                    return await this.scrapeFacebook(handle);
                }
                case 'twitter': {
                    return await this.scrapeTwitter(handle);
                }
                default: {
                    throw new Error(`Unsupported platform: ${platform}`);
                }
            }
        }
        catch (error) {
            console.warn(`Social media scraping error for ${platform}/${handle}:`, error);
            return {
                success: false,
                error: "That didn't work, please try again later.",
                timestamp: new Date().toISOString(),
                source: `social_media:${platform}:${handle}`,
            };
        }
    }
    async scrapeInstagram(handle) {
        await this.randomDelay();
        const posts = [
            {
                id: 'post_001',
                caption: 'Fresh tacos available now at Mission St! 🌮 #foodtruck #tacos',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                location: 'Mission St, San Francisco',
                hashtags: ['foodtruck', 'tacos', 'fresh'],
                engagement: { likes: 45, comments: 8 },
            },
        ];
        const profile = {
            followers: 1250,
            following: 340,
            posts_count: 156,
            bio: 'Best tacos in SF 🌮 Follow for daily locations!',
            contact_info: {
                email: 'contact@tacoparadise.com',
                phone: '+1-555-0456',
            },
        };
        const data = { posts, profile };
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            source: `instagram:${handle}`,
        };
    }
    async scrapeFacebook(handle) {
        await this.randomDelay();
        const posts = [
            {
                id: 'fb_post_001',
                content: "Today we'll be at Union Square from 11 AM to 3 PM! Come try our new BBQ burger!",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                reactions: { likes: 23, loves: 5, shares: 3 },
                comments: 12,
            },
        ];
        const page_info = {
            likes: 890,
            followers: 1100,
            check_ins: 450,
            about: 'Gourmet food truck serving the Bay Area',
            hours: {
                monday: '11:00-15:00',
                tuesday: '11:00-15:00',
                wednesday: '11:00-15:00',
                thursday: '11:00-15:00',
                friday: '11:00-20:00',
                saturday: '12:00-20:00',
                sunday: '12:00-16:00',
            },
        };
        const data = { posts, page_info };
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            source: `facebook:${handle}`,
        };
    }
    async scrapeTwitter(handle) {
        await this.randomDelay();
        const tweets = [
            {
                id: 'tweet_001',
                text: 'LIVE at Dolores Park! Fresh burritos and quesadillas available now 🌯',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                retweets: 8,
                likes: 34,
                replies: 5,
                location: 'Dolores Park, San Francisco',
            },
        ];
        const profile = {
            followers: 2340,
            following: 567,
            tweets_count: 1890,
            bio: '🚚 SF Food Truck | Fresh Mexican Food | Follow for locations',
            location: 'San Francisco, CA',
            website: 'https://tacoparadise.com',
        };
        const data = { tweets, profile };
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            source: `twitter:${handle}`,
        };
    }
    getRandomUserAgent() {
        var _a, _b;
        // Use Node.js crypto for stronger randomness if available, fallback to Math.random otherwise.
        let idx;
        if (((_b = (_a = globalThis.window) === null || _a === void 0 ? void 0 : _a.crypto) === null || _b === void 0 ? void 0 : _b.getRandomValues) != undefined) {
            const array = globalThis.window.crypto.getRandomValues(new Uint32Array(1));
            idx = array[0] % this.userAgents.length;
        }
        else if (typeof crypto.randomInt === 'function') {
            idx = crypto.randomInt(0, this.userAgents.length);
        }
        else {
            // Fallback to Math.random for environments where crypto is not available.
            // This is acceptable for non-security-critical random number generation like user agent selection.
            // eslint-disable-next-line sonarjs/pseudo-random -- Math.random is acceptable for non-security-critical user agent selection.
            idx = Math.floor(Math.random() * this.userAgents.length);
        }
        return this.userAgents[idx];
    }
    randomDelay() {
        var _a, _b;
        let randomMs;
        if (((_b = (_a = globalThis.window) === null || _a === void 0 ? void 0 : _a.crypto) === null || _b === void 0 ? void 0 : _b.getRandomValues) != undefined) {
            const array = globalThis.window.crypto.getRandomValues(new Uint32Array(1));
            randomMs = array[0] % 1000;
        }
        else if (typeof crypto.randomInt === 'function') {
            randomMs = crypto.randomInt(0, 1000);
        }
        else {
            // Fallback to Math.random for environments where crypto is not available.
            // This is acceptable for non-security-critical random delays.
            // eslint-disable-next-line sonarjs/pseudo-random -- Math.random is acceptable for non-security-critical random delays.
            randomMs = Math.floor(Math.random() * 1000);
        }
        const delay = this.requestDelay + randomMs;
        return new Promise((resolve) => setTimeout(resolve, delay));
    }
    handleRateLimit(retryAfter) {
        console.info(`Rate limited. Waiting ${retryAfter} seconds before retry...`);
        return new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    }
    async retryWithBackoff(operation, maxRetries = this.maxRetries) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxRetries) {
                    throw lastError instanceof Error ? lastError : new Error(String(lastError));
                }
                const backoffDelay = Math.pow(2, attempt) * 1000;
                console.info(`Attempt ${attempt} failed. Retrying in ${backoffDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, backoffDelay));
            }
        }
        throw lastError instanceof Error ? lastError : new Error('Request failed after all retries');
    }
}
export class DataQualityAssessor {
    assessBasicInfo(truckData, issues, score) {
        if (truckData.name == undefined || truckData.name.trim().length === 0) {
            issues.push('Missing or empty truck name');
            score -= 20;
        }
        return score;
    }
    assessLocationInfo(truckData, issues, score) {
        var _a;
        if (((_a = truckData.location) === null || _a === void 0 ? void 0 : _a.current) == undefined) {
            issues.push('Missing current location data');
            score -= 25;
        }
        else {
            if (truckData.location.current.lat == undefined ||
                truckData.location.current.lng == undefined) {
                issues.push('Missing GPS coordinates');
                score -= 15;
            }
            if (truckData.location.current.address == undefined ||
                truckData.location.current.address === '') {
                issues.push('Missing address information');
                score -= 10;
            }
        }
        return score;
    }
    assessContactInfo(truckData, issues, score) {
        if (truckData.contact) {
            const hasPhone = typeof truckData.contact.phone === 'string' && truckData.contact.phone.trim() !== '';
            const hasEmail = typeof truckData.contact.email === 'string' && truckData.contact.email.trim() !== '';
            if (!hasPhone && !hasEmail) {
                issues.push('No phone or email contact available');
                score -= 15;
            }
            if (hasPhone && !this.isValidPhone(truckData.contact.phone)) {
                issues.push('Invalid phone number format');
                score -= 5;
            }
            if (hasEmail && !this.isValidEmail(truckData.contact.email)) {
                issues.push('Invalid email format');
                score -= 5;
            }
        }
        else {
            issues.push('Missing contact information');
            score -= 20;
        }
        return score;
    }
    assessOperatingHours(truckData, issues, score) {
        if (truckData.operating_hours == undefined ||
            Object.keys(truckData.operating_hours).length === 0) {
            issues.push('Missing operating hours');
            score -= 15;
        }
        return score;
    }
    assessMenuInfo(truckData, issues, score) {
        if (truckData.menu == undefined || truckData.menu.length === 0) {
            issues.push('Missing menu information');
            score -= 10;
        }
        else {
            const menuIssues = this.validateMenuData(truckData.menu);
            issues.push(...menuIssues);
            score -= menuIssues.length * 2;
        }
        return score;
    }
    assessLastUpdated(truckData, issues, score) {
        if (truckData.last_updated != undefined && truckData.last_updated !== '') {
            const lastUpdate = new Date(truckData.last_updated);
            const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 7) {
                issues.push('Data is more than 7 days old');
                score -= 10;
            }
            else if (daysSinceUpdate > 3) {
                issues.push('Data is more than 3 days old');
                score -= 5;
            }
        }
        return score;
    }
    assessTruckData(truckData) {
        const issues = [];
        let score = 100;
        score = this.assessBasicInfo(truckData, issues, score);
        score = this.assessLocationInfo(truckData, issues, score);
        score = this.assessContactInfo(truckData, issues, score);
        score = this.assessOperatingHours(truckData, issues, score);
        score = this.assessMenuInfo(truckData, issues, score);
        score = this.assessLastUpdated(truckData, issues, score);
        return {
            score: Math.max(0, score) / 100,
            issues,
        };
    }
    validateMenuCategory(category, categoryIndex, issues) {
        if (category.category == undefined || category.category.trim().length === 0) {
            issues.push(`Menu category ${categoryIndex + 1} missing name`);
        }
    }
    validateMenuItems(category, issues) {
        var _a, _b, _c;
        if (category.items == undefined || category.items.length === 0) {
            issues.push(`Menu category "${(_a = category.category) !== null && _a !== void 0 ? _a : 'Unknown'}" has no items`);
        }
        else {
            for (const [itemIndex, item] of category.items.entries()) {
                if (item.name == undefined || item.name.trim().length === 0) {
                    issues.push(`Menu item ${itemIndex + 1} in "${(_b = category.category) !== null && _b !== void 0 ? _b : 'Unknown'}" missing name`);
                }
                if (typeof item.price !== 'number' || item.price <= 0) {
                    issues.push(`Menu item "${(_c = item.name) !== null && _c !== void 0 ? _c : 'Unknown'}" has invalid price`);
                }
            }
        }
    }
    validateMenuData(menu) {
        const issues = [];
        for (const [categoryIndex, category] of menu.entries()) {
            this.validateMenuCategory(category, categoryIndex, issues);
            this.validateMenuItems(category, issues);
        }
        return issues;
    }
    isValidPhone(phone) {
        // Regex for phone number validation. Not vulnerable to super-linear runtime due to backtracking.
        // Accepts +, digits, spaces, dashes, and parentheses. At least 10 digits.
        const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
        return phoneRegex.test(phone);
    }
    isValidEmail(email) {
        // Regex for email validation optimized to avoid backtracking
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
}
export class GeminiDataProcessor {
    constructor(apiKey) {
        this._apiKey = apiKey;
        this._baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.requestCount = 0;
        this.tokenCount = 0;
        this.dailyLimit = { requests: 1500, tokens: 32000 };
    }
    async processMenuData(rawMenuText) {
        if (!this.canMakeRequest()) {
            throw new Error('Gemini API rate limit exceeded');
        }
        try {
            const prompt = `
        Parse the following food truck menu text and return a structured JSON format:
        
        ${rawMenuText}
        
        Return format:
        {
          "categories": [
            {
              "name": "category_name",
              "items": [
                {
                  "name": "item_name",
                  "description": "item_description",
                  "price": 0.00,
                  "dietary_tags": ["vegetarian", "vegan", "gluten-free", etc.]
                }
              ]
            }
          ]
        }
        
        Only return valid JSON, no additional text.
      `;
            const response = await this.makeGeminiRequest(prompt);
            this.updateUsageCounters(1, prompt.length + response.length);
            // Ensure type safety for parsed response
            const parsed = JSON.parse(response);
            if (typeof parsed !== 'object' ||
                parsed == undefined ||
                !('categories' in parsed) ||
                !Array.isArray(parsed.categories)) {
                throw new Error('Invalid Gemini menu response: missing or malformed categories array');
            }
            return parsed;
        }
        catch (error) {
            console.error('Error processing menu data with Gemini:', error);
            throw error;
        }
    }
    async extractLocationFromText(text) {
        if (!this.canMakeRequest()) {
            throw new Error('Gemini API rate limit exceeded');
        }
        try {
            const prompt = `
        Extract location information from the following text and return structured data:
        
        "${text}"
        
        Return format:
        {
          "address": "full_address",
          "city": "city_name",
          "state": "state",
          "coordinates": {
            "lat": 0.0,
            "lng": 0.0
          },
          "confidence": 0.95
        }
        
        If coordinates cannot be determined, set them to undefined. Only return valid JSON.
      `;
            const response = await this.makeGeminiRequest(prompt);
            this.updateUsageCounters(1, prompt.length + response.length);
            const parsedResponse = JSON.parse(response);
            const validatedResponse = this.validateGeminiLocationResponse(parsedResponse);
            return validatedResponse;
        }
        catch (error) {
            console.error('Error extracting location with Gemini:', error);
            throw error;
        }
    }
    validateGeminiLocationResponse(parsedResponse) {
        if (parsedResponse == undefined ||
            typeof parsedResponse !== 'object' ||
            !('coordinates' in parsedResponse) ||
            typeof parsedResponse.coordinates !== 'object') {
            throw new Error('Invalid Gemini location response');
        }
        const coordinates = parsedResponse
            .coordinates;
        if (coordinates && typeof coordinates === 'object') {
            if (typeof coordinates.lat !== 'number') {
                coordinates.lat = undefined;
            }
            if (typeof coordinates.lng !== 'number') {
                coordinates.lng = undefined;
            }
        }
        return parsedResponse;
    }
    async standardizeOperatingHours(hoursText) {
        if (!this.canMakeRequest()) {
            throw new Error('Gemini API rate limit exceeded');
        }
        try {
            const prompt = `
        Parse the following operating hours text and return standardized format:
        
        "${hoursText}"
        
        Return format:
        {
          "monday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
          "tuesday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
          "wednesday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
          "thursday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
          "friday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
          "saturday": {"open": "HH:MM", "close": "HH:MM", "closed": false},
          "sunday": {"open": "HH:MM", "close": "HH:MM", "closed": false}
        }
          Use 24-hour format. If closed on a day, set "closed": true and omit open/close times.
        Only return valid JSON.
      `;
            const response = await this.makeGeminiRequest(prompt);
            this.updateUsageCounters(1, prompt.length + response.length);
            const parsed = JSON.parse(response);
            if (parsed == undefined || typeof parsed !== 'object') {
                throw new Error('Invalid Gemini hours response');
            }
            return parsed;
        }
        catch (error) {
            console.error('Error standardizing hours with Gemini:', error);
            throw error;
        }
    }
    async analyzeSentiment(reviewText) {
        if (!this.canMakeRequest()) {
            throw new Error('Gemini API rate limit exceeded');
        }
        try {
            const prompt = `
        Analyze the sentiment of this food truck review and extract key insights:
        
        "${reviewText}"
        
        Return format:
        {
          "sentiment": "positive|negative|neutral",
          "score": 0.85,
          "key_topics": ["food_quality", "service", "price", "location"],
          "summary": "brief_summary_of_review"
        }
          Score should be between 0 (very negative) and 1 (very positive).
        Only return valid JSON.
      `;
            const response = await this.makeGeminiRequest(prompt);
            this.updateUsageCounters(1, prompt.length + response.length);
            const parsed = JSON.parse(response);
            if (parsed == undefined || typeof parsed !== 'object') {
                throw new Error('Invalid Gemini sentiment response');
            }
            return parsed;
        }
        catch (error) {
            console.error('Error analyzing sentiment with Gemini:', error);
            throw error;
        }
    }
    async makeGeminiRequest(prompt) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
        return this.getMockGeminiResponse(prompt);
    }
    getMockGeminiResponse(prompt) {
        if (prompt.includes('menu text')) {
            return JSON.stringify({
                categories: [
                    {
                        name: 'Burgers',
                        items: [
                            {
                                name: 'Classic Cheeseburger',
                                description: 'Beef patty with cheese, lettuce, tomato',
                                price: 12.99,
                                dietary_tags: [],
                            },
                        ],
                    },
                ],
            });
        }
        else if (prompt.includes('location information')) {
            return JSON.stringify({
                address: '123 Market St, San Francisco, CA 94105',
                city: 'San Francisco',
                state: 'CA',
                coordinates: {
                    lat: 37.7749,
                    lng: -122.4194,
                },
                confidence: 0.95,
            });
        }
        else if (prompt.includes('operating hours')) {
            return JSON.stringify({
                monday: { open: '11:00', close: '15:00', closed: false },
                tuesday: { open: '11:00', close: '15:00', closed: false },
                wednesday: { open: '11:00', close: '15:00', closed: false },
                thursday: { open: '11:00', close: '15:00', closed: false },
                friday: { open: '11:00', close: '20:00', closed: false },
                saturday: { open: '12:00', close: '20:00', closed: false },
                sunday: { open: '12:00', close: '16:00', closed: false },
            });
        }
        else if (prompt.includes('sentiment')) {
            return JSON.stringify({
                sentiment: 'positive',
                score: 0.85,
                key_topics: ['food_quality', 'service'],
                summary: 'Customer enjoyed the food and service',
            });
        }
        return '{"processed": true}';
    }
    canMakeRequest() {
        return this.requestCount < this.dailyLimit.requests && this.tokenCount < this.dailyLimit.tokens;
    }
    updateUsageCounters(requests, tokens) {
        this.requestCount += requests;
        this.tokenCount += tokens;
    }
    getUsageStats() {
        return {
            requests: {
                used: this.requestCount,
                limit: this.dailyLimit.requests,
                remaining: this.dailyLimit.requests - this.requestCount,
            },
            tokens: {
                used: this.tokenCount,
                limit: this.dailyLimit.tokens,
                remaining: this.dailyLimit.tokens - this.tokenCount,
            },
        };
    }
}
