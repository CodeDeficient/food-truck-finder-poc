import { firecrawl } from './firecrawl'; // Import the firecrawl singleton
import * as crypto from 'node:crypto'; // Node.js crypto for secure randomness

interface InstagramPost {
  id: string;
  caption: string;
  timestamp: string;
  location: string;
  hashtags: string[];
  engagement: { likes: number; comments: number };
}

interface InstagramProfile {
  followers: number;
  following: number;
  posts_count: number;
  bio: string;
  contact_info: { email: string; phone: string };
}

interface FacebookPost {
  id: string;
  content: string;
  timestamp: string;
  reactions: { likes: number; loves: number; shares: number };
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
  menu?: { item: string; price: string }[];
}

interface ScrapeResult {
  success: boolean;
  error?: string;
  data?: InstagramData | FacebookData | TwitterData | WebsiteScrapeData | ExtractedHTMLData;
  timestamp: string;
  source: string;
  note?: string;
}

// Core scraping engine with anti-detection measures
export class ScraperEngine {
  private userAgents: string[];
  private requestDelay: number;
  private maxRetries: number;

  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    ];
    this.requestDelay = 2000;
    this.maxRetries = 3;
  }

  private async performFallbackScrape(url: string): Promise<ScrapeResult> {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': this.getRandomUserAgent() } });
      if (!response.ok) {
        throw new Error(
          `HTTP error ${response.status}: ${response.statusText} during fallback fetch.`,
        );
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
    } catch (fallbackError) {
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

  async scrapeWebsite(url: string, _selectors?: Record<string, string>): Promise<ScrapeResult> {
    try {
      const firecrawlResult = await firecrawl.scrapeUrl(url, {
        formats: ['markdown', 'html'],
        onlyMainContent: true,
      });

      if (firecrawlResult.success !== true || firecrawlResult.data == undefined) {
        throw new Error(firecrawlResult.error ?? 'Firecrawl scraping failed to return data.');
      }

      const returnedData: WebsiteScrapeData = {};
      if (typeof firecrawlResult.data.markdown === 'string' && firecrawlResult.data.markdown !== '') {
        returnedData.markdown = firecrawlResult.data.markdown;
      }
      if (typeof firecrawlResult.data.html === 'string' && firecrawlResult.data.html !== '') {
        returnedData.html = firecrawlResult.data.html;
      }
      if (firecrawlResult.data.metadata != undefined && typeof firecrawlResult.data.metadata === 'object') {
        returnedData.metadata = firecrawlResult.data.metadata as Record<string, unknown>;
      }

      if (
        (returnedData.markdown == undefined || returnedData.markdown === '') &&
        (returnedData.html == undefined || returnedData.html === '')
      ) {
        throw new Error('Firecrawl returned no markdown or HTML content.');
      }

      return {
        success: true,
        data: returnedData,
        timestamp: new Date().toISOString(),
        source: url,
      };
    } catch (error: unknown) {
      console.warn(`Scraping error for ${url} using Firecrawl:`, error);
      console.info(`Falling back to basic fetch for ${url}`);
      return await this.performFallbackScrape(url);
    }
  }

  async scrapeSocialMedia(platform: string, handle: string): Promise<ScrapeResult> {
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
    } catch (error) {
      console.warn(`Social media scraping error for ${platform}/${handle}:`, error);
      return {
        success: false,
        error: "That didn't work, please try again later.",
        timestamp: new Date().toISOString(),
        source: `social_media:${platform}:${handle}`,
      };
    }
  }

  private async scrapeInstagram(handle: string): Promise<ScrapeResult> {
    await this.randomDelay();
    const posts: InstagramPost[] = [
      {
        id: 'post_001',
        caption: 'Fresh tacos available now at Mission St! 🌮 #foodtruck #tacos',
        timestamp: new Date(Date.now() - 3_600_000).toISOString(),
        location: 'Mission St, San Francisco',
        hashtags: ['foodtruck', 'tacos', 'fresh'],
        engagement: { likes: 45, comments: 8 },
      },
    ];
    const profile: InstagramProfile = {
      followers: 1250,
      following: 340,
      posts_count: 156,
      bio: 'Best tacos in SF 🌮 Follow for daily locations!',
      contact_info: {
        email: 'contact@tacoparadise.com',
        phone: '+1-555-0456',
      },
    };
    return {
      success: true,
      data: { posts, profile },
      timestamp: new Date().toISOString(),
      source: `instagram:${handle}`,
    };
  }

  private async scrapeFacebook(handle: string): Promise<ScrapeResult> {
    await this.randomDelay();
    const posts: FacebookPost[] = [
      {
        id: 'fb_post_001',
        content:
          "Today we'll be at Union Square from 11 AM to 3 PM! Come try our new BBQ burger!",
        timestamp: new Date(Date.now() - 7_200_000).toISOString(),
        reactions: { likes: 23, loves: 5, shares: 3 },
        comments: 12,
      },
    ];
    const page_info: FacebookPageInfo = {
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
    return {
      success: true,
      data: { posts, page_info },
      timestamp: new Date().toISOString(),
      source: `facebook:${handle}`,
    };
  }

  private async scrapeTwitter(handle: string): Promise<ScrapeResult> {
    await this.randomDelay();
    const tweets: TwitterTweet[] = [
      {
        id: 'tweet_001',
        text: 'LIVE at Dolores Park! Fresh burritos and quesadillas available now 🌯',
        timestamp: new Date(Date.now() - 1_800_000).toISOString(),
        retweets: 8,
        likes: 34,
        replies: 5,
        location: 'Dolores Park, San Francisco',
      },
    ];
    const profile: TwitterProfile = {
      followers: 2340,
      following: 567,
      tweets_count: 1890,
      bio: '🚚 SF Food Truck | Fresh Mexican Food | Follow for locations',
      location: 'San Francisco, CA',
      website: 'https://tacoparadise.com',
    };
    return {
      success: true,
      data: { tweets, profile },
      timestamp: new Date().toISOString(),
      source: `twitter:${handle}`,
    };
  }

  private getRandomUserAgent(): string {
    // Use Node.js crypto for stronger randomness if available, fallback to Math.random otherwise.
    let idx: number;
    if (globalThis.window?.crypto?.getRandomValues != undefined) {
      const array = globalThis.window.crypto.getRandomValues(new Uint32Array(1));
      idx = array[0] % this.userAgents.length;
    } else if (typeof crypto.randomInt === 'function') {
      idx = crypto.randomInt(0, this.userAgents.length);
    } else {
      // Fallback to Math.random for environments where crypto is not available.
      // This is acceptable for non-security-critical random number generation like user agent selection.
      // eslint-disable-next-line sonarjs/pseudo-random -- Math.random is acceptable for non-security-critical user agent selection.
      idx = Math.floor(Math.random() * this.userAgents.length);
    }
    return this.userAgents[idx];
  }

  private randomDelay(): Promise<void> {
    let randomMs: number;
    if (globalThis.window?.crypto?.getRandomValues != undefined) {
      const array = globalThis.window.crypto.getRandomValues(new Uint32Array(1));
      randomMs = array[0] % 1000;
    } else if (typeof crypto.randomInt === 'function') {
      randomMs = crypto.randomInt(0, 1000);
    } else {
      // Fallback to Math.random for environments where crypto is not available.
      // This is acceptable for non-security-critical random delays.
      // eslint-disable-next-line sonarjs/pseudo-random -- Math.random is acceptable for non-security-critical random delays.
      randomMs = Math.floor(Math.random() * 1000);
    }
    const delay = this.requestDelay + randomMs;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

   handleRateLimit(retryAfter: number): Promise<void> {
    console.info(`Rate limited. Waiting ${retryAfter} seconds before retry...`);
    return new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
  }

  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
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

export class DataQualityAssessor {
  private assessBasicInfo(truckData: TruckData, issues: string[], score: number): number {
    if (truckData.name == undefined || truckData.name.trim().length === 0) {
      issues.push('Missing or empty truck name');
      score -= 20;
    }
    return score;
  }

  private assessLocationInfo(truckData: TruckData, issues: string[], score: number): number {
    if (truckData.location?.current == undefined) {
      issues.push('Missing current location data');
      score -= 25;
    } else {
      if (
        truckData.location.current.lat == undefined || 
        truckData.location.current.lng == undefined
      ) {
        issues.push('Missing GPS coordinates');
        score -= 15;
      }
      if (truckData.location.current.address == undefined || truckData.location.current.address === '') {
        issues.push('Missing address information');
        score -= 10;
      }
    }
    return score;
  }

  private assessContactInfo(truckData: TruckData, issues: string[], score: number): number {
    if (truckData.contact) {
      const hasPhone = typeof truckData.contact.phone === 'string' && truckData.contact.phone.trim() !== '';
      const hasEmail = typeof truckData.contact.email === 'string' && truckData.contact.email.trim() !== '';

      if (!hasPhone && !hasEmail) {
        issues.push('No phone or email contact available');
        score -= 15;
      }
      if (hasPhone && !this.isValidPhone(truckData.contact.phone as string)) {
        issues.push('Invalid phone number format');
        score -= 5;
      }
      if (hasEmail && !this.isValidEmail(truckData.contact.email as string)) {
        issues.push('Invalid email format');
        score -= 5;
      }
    } else {
      issues.push('Missing contact information');
      score -= 20;
    }
    return score;
  }

  private assessOperatingHours(truckData: TruckData, issues: string[], score: number): number {
    if (truckData.operating_hours == undefined || Object.keys(truckData.operating_hours).length === 0) {
      issues.push('Missing operating hours');
      score -= 15;
    }
    return score;
  }

  private assessMenuInfo(truckData: TruckData, issues: string[], score: number): number {
    if (truckData.menu == undefined || truckData.menu.length === 0) {
      issues.push('Missing menu information');
      score -= 10;
    } else {
      const menuIssues = this.validateMenuData(truckData.menu);
      issues.push(...menuIssues);
      score -= menuIssues.length * 2;
    }
    return score;
  }

  private assessLastUpdated(truckData: TruckData, issues: string[], score: number): number {
    if (truckData.last_updated != undefined && truckData.last_updated !== '') {
      const lastUpdate = new Date(truckData.last_updated);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate > 7) {
        issues.push('Data is more than 7 days old');
        score -= 10;
      } else if (daysSinceUpdate > 3) {
        issues.push('Data is more than 3 days old');
        score -= 5;
      }
    }
    return score;
  }

  assessTruckData(truckData: TruckData): { score: number; issues: string[] } {
    const issues: string[] = [];
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

  private validateMenuCategory(category: MenuCategory, categoryIndex: number, issues: string[]): void {
    if (category.category == undefined || category.category.trim().length === 0) {
      issues.push(`Menu category ${categoryIndex + 1} missing name`);
    }
  }

  private validateMenuItems(category: MenuCategory, issues: string[]): void {
    if (category.items == undefined || category.items.length === 0) {
      issues.push(`Menu category "${category.category ?? 'Unknown'}" has no items`);
    } else {
      for (const [itemIndex, item] of category.items.entries()) {
        if (item.name == undefined || item.name.trim().length === 0) {
          issues.push(`Menu item ${itemIndex + 1} in "${category.category ?? 'Unknown'}" missing name`);
        }
        if (typeof item.price !== 'number' || item.price <= 0) {
          issues.push(`Menu item "${item.name ?? 'Unknown'}" has invalid price`);
        }
      }
    }
  }

  private validateMenuData(menu: MenuCategory[]): string[] {
    const issues: string[] = [];

    for (const [categoryIndex, category] of menu.entries()) {
      this.validateMenuCategory(category, categoryIndex, issues);
      this.validateMenuItems(category, issues);
    }

    return issues;
  }
  private isValidPhone(phone: string): boolean {
    // Regex for phone number validation. Not vulnerable to super-linear runtime due to backtracking.
    // Accepts +, digits, spaces, dashes, and parentheses. At least 10 digits.
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  }
  private isValidEmail(email: string): boolean {
    // Regex for email validation optimized to avoid backtracking
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
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
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
}

interface GeminiSentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  key_topics: string[];
  summary: string;
}

export class GeminiDataProcessor {
  private _apiKey: string;
  private _baseUrl: string;
  private requestCount: number;
  private tokenCount: number;
  private dailyLimit: { requests: number; tokens: number };

  constructor(apiKey: string) {
    this._apiKey = apiKey;
    this._baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.requestCount = 0;
    this.tokenCount = 0;
    this.dailyLimit = { requests: 1500, tokens: 32_000 };
  }
  async processMenuData(rawMenuText: string): Promise<{ categories: MenuCategory[] }> {
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
      const parsed: unknown = JSON.parse(response);
      if (typeof parsed !== 'object' || parsed == undefined || !('categories' in parsed) || !Array.isArray((parsed as { categories: unknown[] }).categories)) {
        throw new Error('Invalid Gemini menu response: missing or malformed categories array');
      }
      return parsed as { categories: MenuCategory[] };
    } catch (error) {
      console.error('Error processing menu data with Gemini:', error);
      throw error;
    }
  }

  async extractLocationFromText(text: string): Promise<GeminiLocationData> {
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
      const parsedResponse: unknown = JSON.parse(response);
      const validatedResponse = this.validateGeminiLocationResponse(parsedResponse);
      return validatedResponse;
    } catch (error) {
      console.error('Error extracting location with Gemini:', error);
      throw error;
    }
  }

  private validateGeminiLocationResponse(parsedResponse: unknown): GeminiLocationData {
    if (
      parsedResponse == undefined ||
      typeof parsedResponse !== 'object' ||
      !('coordinates' in parsedResponse) ||
      typeof (parsedResponse as Record<string, unknown>).coordinates !== 'object'
    ) {
      throw new Error('Invalid Gemini location response');
    }
    const coordinates = (parsedResponse as { coordinates?: { lat?: unknown; lng?: unknown } }).coordinates;
    if (coordinates && typeof coordinates === 'object') {
      if (typeof coordinates.lat !== 'number') {
        (coordinates as { lat?: number }).lat = undefined;
      }
      if (typeof coordinates.lng !== 'number') {
        (coordinates as { lng?: number }).lng = undefined;
      }
    }
    return parsedResponse as GeminiLocationData;
  }

  async standardizeOperatingHours(hoursText: string): Promise<GeminiOperatingHours> {
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
      const parsed: unknown = JSON.parse(response);
      if (parsed == undefined || typeof parsed !== 'object') {
        throw new Error('Invalid Gemini hours response');
      }
      return parsed as GeminiOperatingHours;
    } catch (error) {
      console.error('Error standardizing hours with Gemini:', error);
      throw error;
    }
  }

  async analyzeSentiment(reviewText: string): Promise<GeminiSentimentAnalysis> {
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
      const parsed: unknown = JSON.parse(response);
      if (parsed == undefined || typeof parsed !== 'object') {
        throw new Error('Invalid Gemini sentiment response');
      }
      return parsed as GeminiSentimentAnalysis;
    } catch (error) {
      console.error('Error analyzing sentiment with Gemini:', error);
      throw error;
    }
  }

  private async makeGeminiRequest(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
    return this.getMockGeminiResponse(prompt);
  }

  private getMockGeminiResponse(prompt: string): string {
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
    } else if (prompt.includes('location information')) {
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
    } else if (prompt.includes('operating hours')) {
      return JSON.stringify({
        monday: { open: '11:00', close: '15:00', closed: false },
        tuesday: { open: '11:00', close: '15:00', closed: false },
        wednesday: { open: '11:00', close: '15:00', closed: false },
        thursday: { open: '11:00', close: '15:00', closed: false },
        friday: { open: '11:00', close: '20:00', closed: false },
        saturday: { open: '12:00', close: '20:00', closed: false },
        sunday: { open: '12:00', close: '16:00', closed: false },
      });
    } else if (prompt.includes('sentiment')) {
      return JSON.stringify({
        sentiment: 'positive',
        score: 0.85,
        key_topics: ['food_quality', 'service'],
        summary: 'Customer enjoyed the food and service',
      });
    }
    return '{"processed": true}';
  }

  private canMakeRequest(): boolean {
    return this.requestCount < this.dailyLimit.requests && this.tokenCount < this.dailyLimit.tokens;
  }

  private updateUsageCounters(requests: number, tokens: number): void {
    this.requestCount += requests;
    this.tokenCount += tokens;
  }

  getUsageStats(): {
    requests: { used: number; limit: number; remaining: number };
    tokens: { used: number; limit: number; remaining: number };
  } {
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
