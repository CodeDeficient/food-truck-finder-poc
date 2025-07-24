interface InstagramPost {
    id: string;
    caption: string;
    timestamp: string;
    location: string;
    hashtags: string[];
    engagement: {
        likes: number;
        comments: number;
    };
}
interface InstagramProfile {
    followers: number;
    following: number;
    posts_count: number;
    bio: string;
    contact_info: {
        email: string;
        phone: string;
    };
}
interface FacebookPost {
    id: string;
    content: string;
    timestamp: string;
    reactions: {
        likes: number;
        loves: number;
        shares: number;
    };
    comments: number;
}
interface FacebookPageInfo {
    likes: number;
    followers: number;
    check_ins: number;
    about: string;
    hours: Record<string, string>;
}
interface TwitterTweet {
    id: string;
    text: string;
    timestamp: string;
    retweets: number;
    likes: number;
    replies: number;
    location: string;
}
interface TwitterProfile {
    followers: number;
    following: number;
    tweets_count: number;
    bio: string;
    location: string;
    website: string;
}
interface InstagramData {
    posts: InstagramPost[];
    profile: InstagramProfile;
}
interface FacebookData {
    posts: FacebookPost[];
    page_info: FacebookPageInfo;
}
interface TwitterData {
    tweets: TwitterTweet[];
    profile: TwitterProfile;
}
export interface WebsiteScrapeData {
    markdown?: string;
    html?: string;
    metadata?: Record<string, unknown>;
    is_fallback?: boolean;
}
export interface ExtractedHTMLData {
    name?: string;
    location?: string;
    phone?: string;
    hours?: string;
    menu?: {
        item: string;
        price: string;
    }[];
}
interface ScrapeResult {
    success: boolean;
    error?: string;
    data?: InstagramData | FacebookData | TwitterData | WebsiteScrapeData | ExtractedHTMLData;
    timestamp: string;
    source: string;
    note?: string;
}
export declare class ScraperEngine {
    private userAgents;
    private requestDelay;
    private maxRetries;
    constructor();
    private performFallbackScrape;
    scrapeWebsite(url: string, _selectors?: Record<string, string>): Promise<ScrapeResult>;
    scrapeSocialMedia(platform: string, handle: string): Promise<ScrapeResult>;
    private scrapeInstagram;
    private scrapeFacebook;
    private scrapeTwitter;
    private getRandomUserAgent;
    private randomDelay;
    handleRateLimit(retryAfter: number): Promise<void>;
    retryWithBackoff<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
}
interface LocationData {
    current?: {
        lat?: number;
        lng?: number;
        address?: string;
    };
}
interface ContactInfo {
    phone?: string;
    email?: string;
}
interface OperatingHours {
    [key: string]: {
        open: string;
        close: string;
        closed: boolean;
    };
}
interface MenuItem {
    name: string;
    description?: string;
    price: number;
    dietary_tags?: string[];
}
interface MenuCategory {
    category: string;
    items: MenuItem[];
}
interface TruckData {
    name: string;
    location: LocationData;
    contact?: ContactInfo;
    operating_hours?: OperatingHours;
    menu?: MenuCategory[];
    last_updated?: string;
}
export declare class DataQualityAssessor {
    private assessBasicInfo;
    private assessLocationInfo;
    private assessContactInfo;
    private assessOperatingHours;
    private assessMenuInfo;
    private assessLastUpdated;
    assessTruckData(truckData: TruckData): {
        score: number;
        issues: string[];
    };
    private validateMenuCategory;
    private validateMenuItems;
    private validateMenuData;
    private isValidPhone;
    private isValidEmail;
}
interface GeminiLocationData {
    address: string;
    city: string;
    state: string;
    coordinates: {
        lat?: number;
        lng?: number;
    };
    confidence: number;
}
interface GeminiOperatingHours {
    monday: {
        open: string;
        close: string;
        closed: boolean;
    };
    tuesday: {
        open: string;
        close: string;
        closed: boolean;
    };
    wednesday: {
        open: string;
        close: string;
        closed: boolean;
    };
    thursday: {
        open: string;
        close: string;
        closed: boolean;
    };
    friday: {
        open: string;
        close: string;
        closed: boolean;
    };
    saturday: {
        open: string;
        close: string;
        closed: boolean;
    };
    sunday: {
        open: string;
        close: string;
        closed: boolean;
    };
}
interface GeminiSentimentAnalysis {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    key_topics: string[];
    summary: string;
}
export declare class GeminiDataProcessor {
    private _apiKey;
    private _baseUrl;
    private requestCount;
    private tokenCount;
    private dailyLimit;
    constructor(apiKey: string);
    processMenuData(rawMenuText: string): Promise<{
        categories: MenuCategory[];
    }>;
    extractLocationFromText(text: string): Promise<GeminiLocationData>;
    private validateGeminiLocationResponse;
    standardizeOperatingHours(hoursText: string): Promise<GeminiOperatingHours>;
    analyzeSentiment(reviewText: string): Promise<GeminiSentimentAnalysis>;
    private makeGeminiRequest;
    private getMockGeminiResponse;
    private canMakeRequest;
    private updateUsageCounters;
    getUsageStats(): {
        requests: {
            used: number;
            limit: number;
            remaining: number;
        };
        tokens: {
            used: number;
            limit: number;
            remaining: number;
        };
    };
}
export {};
