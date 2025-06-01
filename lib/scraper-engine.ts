// Core scraping engine with anti-detection measures
export class ScraperEngine {
  private userAgents: string[]
  private proxies: string[]
  private requestDelay: number
  private maxRetries: number

  constructor() {
    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    ]
    this.proxies = [] // Would be populated with proxy servers
    this.requestDelay = 2000 // 2 seconds between requests
    this.maxRetries = 3
  }

  async scrapeWebsite(url: string, selectors: Record<string, string>): Promise<any> {
    try {
      // Simulate web scraping with anti-detection measures
      await this.randomDelay()

      const userAgent = this.getRandomUserAgent()
      const headers = {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      }

      // In a real implementation, this would use Puppeteer or Playwright
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Simulate data extraction
      const extractedData = this.extractDataFromHTML(await response.text(), selectors)

      return {
        success: true,
        data: extractedData,
        timestamp: new Date().toISOString(),
        source: url,
      }
    } catch (error) {
      console.error(`Scraping error for ${url}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        source: url,
      }
    }
  }

  async scrapeSocialMedia(platform: string, handle: string): Promise<any> {
    try {
      await this.randomDelay()

      // Platform-specific scraping logic
      switch (platform) {
        case "instagram":
          return await this.scrapeInstagram(handle)
        case "facebook":
          return await this.scrapeFacebook(handle)
        case "twitter":
          return await this.scrapeTwitter(handle)
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
    } catch (error) {
      console.error(`Social media scraping error for ${platform}/${handle}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        platform,
        handle,
      }
    }
  }

  private async scrapeInstagram(handle: string): Promise<any> {
    // Simulate Instagram scraping
    // In real implementation, would use Instagram Basic Display API or web scraping

    return {
      success: true,
      data: {
        posts: [
          {
            id: "post_001",
            caption: "Fresh tacos available now at Mission St! 🌮 #foodtruck #tacos",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            location: "Mission St, San Francisco",
            hashtags: ["foodtruck", "tacos", "fresh"],
            engagement: { likes: 45, comments: 8 },
          },
        ],
        profile: {
          followers: 1250,
          following: 340,
          posts_count: 156,
          bio: "Best tacos in SF 🌮 Follow for daily locations!",
          contact_info: {
            email: "contact@tacoparadise.com",
            phone: "+1-555-0456",
          },
        },
      },
      timestamp: new Date().toISOString(),
      platform: "instagram",
      handle,
    }
  }

  private async scrapeFacebook(handle: string): Promise<any> {
    // Simulate Facebook scraping
    return {
      success: true,
      data: {
        posts: [
          {
            id: "fb_post_001",
            content: "Today we'll be at Union Square from 11 AM to 3 PM! Come try our new BBQ burger!",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            reactions: { likes: 23, loves: 5, shares: 3 },
            comments: 12,
          },
        ],
        page_info: {
          likes: 890,
          followers: 1100,
          check_ins: 450,
          about: "Gourmet food truck serving the Bay Area",
          hours: {
            monday: "11:00-15:00",
            tuesday: "11:00-15:00",
            wednesday: "11:00-15:00",
            thursday: "11:00-15:00",
            friday: "11:00-20:00",
            saturday: "12:00-20:00",
            sunday: "12:00-16:00",
          },
        },
      },
      timestamp: new Date().toISOString(),
      platform: "facebook",
      handle,
    }
  }

  private async scrapeTwitter(handle: string): Promise<any> {
    // Simulate Twitter scraping
    return {
      success: true,
      data: {
        tweets: [
          {
            id: "tweet_001",
            text: "LIVE at Dolores Park! Fresh burritos and quesadillas available now 🌯",
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            retweets: 8,
            likes: 34,
            replies: 5,
            location: "Dolores Park, San Francisco",
          },
        ],
        profile: {
          followers: 2340,
          following: 567,
          tweets_count: 1890,
          bio: "🚚 SF Food Truck | Fresh Mexican Food | Follow for locations",
          location: "San Francisco, CA",
          website: "https://tacoparadise.com",
        },
      },
      timestamp: new Date().toISOString(),
      platform: "twitter",
      handle,
    }
  }

  private extractDataFromHTML(html: string, selectors: Record<string, string>): any {
    // Simulate HTML parsing and data extraction
    // In real implementation, would use Cheerio or similar library

    const extractedData: any = {}

    // Mock extraction based on selectors
    Object.keys(selectors).forEach((key) => {
      switch (key) {
        case "name":
          extractedData.name = "Sample Food Truck Name"
          break
        case "location":
          extractedData.location = "123 Sample St, San Francisco, CA"
          break
        case "phone":
          extractedData.phone = "+1-555-0123"
          break
        case "hours":
          extractedData.hours = "Mon-Fri: 11AM-8PM, Sat-Sun: 12PM-9PM"
          break
        case "menu":
          extractedData.menu = [
            { item: "Burger", price: "$12.99" },
            { item: "Fries", price: "$4.99" },
            { item: "Drink", price: "$2.99" },
          ]
          break
        default:
          extractedData[key] = `Sample ${key} data`
      }
    })

    return extractedData
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  private async randomDelay(): Promise<void> {
    const delay = this.requestDelay + Math.random() * 1000 // Add random variance
    return new Promise((resolve) => setTimeout(resolve, delay))
  }

  async handleRateLimit(retryAfter: number): Promise<void> {
    console.log(`Rate limited. Waiting ${retryAfter} seconds before retry...`)
    return new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
  }

  async retryWithBackoff(operation: () => Promise<any>, maxRetries: number = this.maxRetries): Promise<any> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          throw lastError
        }

        // Exponential backoff
        const backoffDelay = Math.pow(2, attempt) * 1000
        console.log(`Attempt ${attempt} failed. Retrying in ${backoffDelay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))
      }
    }

    throw lastError!
  }
}

// Data quality assessment and validation
export class DataQualityAssessor {
  assessTruckData(truckData: any): { score: number; issues: string[] } {
    const issues: string[] = []
    let score = 100

    // Check required fields
    if (!truckData.name || truckData.name.trim().length === 0) {
      issues.push("Missing or empty truck name")
      score -= 20
    }

    if (!truckData.location || !truckData.location.current) {
      issues.push("Missing current location data")
      score -= 25
    } else {
      if (!truckData.location.current.lat || !truckData.location.current.lng) {
        issues.push("Missing GPS coordinates")
        score -= 15
      }
      if (!truckData.location.current.address) {
        issues.push("Missing address information")
        score -= 10
      }
    }

    // Check contact information
    if (!truckData.contact) {
      issues.push("Missing contact information")
      score -= 20
    } else {
      if (!truckData.contact.phone && !truckData.contact.email) {
        issues.push("No phone or email contact available")
        score -= 15
      }
      if (truckData.contact.phone && !this.isValidPhone(truckData.contact.phone)) {
        issues.push("Invalid phone number format")
        score -= 5
      }
      if (truckData.contact.email && !this.isValidEmail(truckData.contact.email)) {
        issues.push("Invalid email format")
        score -= 5
      }
    }

    // Check operating hours
    if (!truckData.operating_hours || Object.keys(truckData.operating_hours).length === 0) {
      issues.push("Missing operating hours")
      score -= 15
    }

    // Check menu data
    if (!truckData.menu || truckData.menu.length === 0) {
      issues.push("Missing menu information")
      score -= 10
    } else {
      const menuIssues = this.validateMenuData(truckData.menu)
      issues.push(...menuIssues)
      score -= menuIssues.length * 2
    }

    // Check data freshness
    if (truckData.last_updated) {
      const lastUpdate = new Date(truckData.last_updated)
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

      if (daysSinceUpdate > 7) {
        issues.push("Data is more than 7 days old")
        score -= 10
      } else if (daysSinceUpdate > 3) {
        issues.push("Data is more than 3 days old")
        score -= 5
      }
    }

    return {
      score: Math.max(0, score) / 100, // Normalize to 0-1
      issues,
    }
  }

  private validateMenuData(menu: any[]): string[] {
    const issues: string[] = []

    menu.forEach((category, categoryIndex) => {
      if (!category.category || category.category.trim().length === 0) {
        issues.push(`Menu category ${categoryIndex + 1} missing name`)
      }

      if (!category.items || category.items.length === 0) {
        issues.push(`Menu category "${category.category}" has no items`)
      } else {
        category.items.forEach((item: any, itemIndex: number) => {
          if (!item.name || item.name.trim().length === 0) {
            issues.push(`Menu item ${itemIndex + 1} in "${category.category}" missing name`)
          }
          if (typeof item.price !== "number" || item.price <= 0) {
            issues.push(`Menu item "${item.name}" has invalid price`)
          }
        })
      }
    })

    return issues
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
    return phoneRegex.test(phone)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Gemini AI integration for data processing
export class GeminiDataProcessor {
  private apiKey: string
  private baseUrl: string
  private requestCount: number
  private tokenCount: number
  private dailyLimit: { requests: number; tokens: number }

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta"
    this.requestCount = 0
    this.tokenCount = 0
    this.dailyLimit = { requests: 1500, tokens: 32000 }
  }

  async processMenuData(rawMenuText: string): Promise<any> {
    if (!this.canMakeRequest()) {
      throw new Error("Gemini API rate limit exceeded")
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
      `

      const response = await this.makeGeminiRequest(prompt)
      this.updateUsageCounters(1, prompt.length + response.length)

      return JSON.parse(response)
    } catch (error) {
      console.error("Error processing menu data with Gemini:", error)
      throw error
    }
  }

  async extractLocationFromText(text: string): Promise<any> {
    if (!this.canMakeRequest()) {
      throw new Error("Gemini API rate limit exceeded")
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
        
        If coordinates cannot be determined, set them to null. Only return valid JSON.
      `

      const response = await this.makeGeminiRequest(prompt)
      this.updateUsageCounters(1, prompt.length + response.length)

      return JSON.parse(response)
    } catch (error) {
      console.error("Error extracting location with Gemini:", error)
      throw error
    }
  }

  async standardizeOperatingHours(hoursText: string): Promise<any> {
    if (!this.canMakeRequest()) {
      throw new Error("Gemini API rate limit exceeded")
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
      `

      const response = await this.makeGeminiRequest(prompt)
      this.updateUsageCounters(1, prompt.length + response.length)

      return JSON.parse(response)
    } catch (error) {
      console.error("Error standardizing hours with Gemini:", error)
      throw error
    }
  }

  async analyzeSentiment(reviewText: string): Promise<any> {
    if (!this.canMakeRequest()) {
      throw new Error("Gemini API rate limit exceeded")
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
      `

      const response = await this.makeGeminiRequest(prompt)
      this.updateUsageCounters(1, prompt.length + response.length)

      return JSON.parse(response)
    } catch (error) {
      console.error("Error analyzing sentiment with Gemini:", error)
      throw error
    }
  }

  private async makeGeminiRequest(prompt: string): Promise<string> {
    // Simulate Gemini API call
    // In real implementation, would make actual API call to Google Gemini

    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    // Mock responses based on prompt content
    if (prompt.includes("menu text")) {
      return JSON.stringify({
        categories: [
          {
            name: "Burgers",
            items: [
              {
                name: "Classic Cheeseburger",
                description: "Beef patty with cheese, lettuce, tomato",
                price: 12.99,
                dietary_tags: [],
              },
            ],
          },
        ],
      })
    } else if (prompt.includes("location information")) {
      return JSON.stringify({
        address: "123 Market St, San Francisco, CA 94105",
        city: "San Francisco",
        state: "CA",
        coordinates: {
          lat: 37.7749,
          lng: -122.4194,
        },
        confidence: 0.95,
      })
    } else if (prompt.includes("operating hours")) {
      return JSON.stringify({
        monday: { open: "11:00", close: "15:00", closed: false },
        tuesday: { open: "11:00", close: "15:00", closed: false },
        wednesday: { open: "11:00", close: "15:00", closed: false },
        thursday: { open: "11:00", close: "15:00", closed: false },
        friday: { open: "11:00", close: "20:00", closed: false },
        saturday: { open: "12:00", close: "20:00", closed: false },
        sunday: { open: "12:00", close: "16:00", closed: false },
      })
    } else if (prompt.includes("sentiment")) {
      return JSON.stringify({
        sentiment: "positive",
        score: 0.85,
        key_topics: ["food_quality", "service"],
        summary: "Customer enjoyed the food and service",
      })
    }

    return '{"processed": true}'
  }

  private canMakeRequest(): boolean {
    return this.requestCount < this.dailyLimit.requests && this.tokenCount < this.dailyLimit.tokens
  }

  private updateUsageCounters(requests: number, tokens: number): void {
    this.requestCount += requests
    this.tokenCount += tokens
  }

  getUsageStats(): any {
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
    }
  }
}
