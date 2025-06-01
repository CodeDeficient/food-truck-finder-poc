interface FirecrawlResponse {
  success: boolean
  data?: {
    markdown?: string
    html?: string
    metadata?: {
      title?: string
      description?: string
      language?: string
      sourceURL?: string
    }
    links?: string[]
  }
  error?: string
}

interface CrawlJobResponse {
  success: boolean
  jobId?: string
  error?: string
}

interface CrawlStatusResponse {
  success: boolean
  status?: "scraping" | "completed" | "failed"
  data?: Array<{
    markdown?: string
    html?: string
    metadata?: any
  }>
  error?: string
}

export class FirecrawlService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY!
    this.baseUrl = "https://api.firecrawl.dev/v0"
  }

  async scrapeUrl(
    url: string,
    options: {
      formats?: ("markdown" | "html")[]
      includeTags?: string[]
      excludeTags?: string[]
      onlyMainContent?: boolean
      waitFor?: number
    } = {},
  ): Promise<FirecrawlResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          formats: options.formats || ["markdown"],
          includeTags: options.includeTags,
          excludeTags: options.excludeTags,
          onlyMainContent: options.onlyMainContent ?? true,
          waitFor: options.waitFor || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("Firecrawl scrape error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async crawlWebsite(
    url: string,
    options: {
      crawlerOptions?: {
        includes?: string[]
        excludes?: string[]
        maxDepth?: number
        limit?: number
      }
      pageOptions?: {
        formats?: ("markdown" | "html")[]
        onlyMainContent?: boolean
      }
    } = {},
  ): Promise<CrawlJobResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/crawl`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          crawlerOptions: {
            maxDepth: 2,
            limit: 10,
            ...options.crawlerOptions,
          },
          pageOptions: {
            formats: ["markdown"],
            onlyMainContent: true,
            ...options.pageOptions,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("Firecrawl crawl error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async getCrawlStatus(jobId: string): Promise<CrawlStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/crawl/status/${jobId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("Firecrawl status error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Specialized methods for food truck data
  async scrapeFoodTruckWebsite(
    url: string,
  ): Promise<{
    success: boolean
    data?: { markdown: string; name?: string; source_url?: string }
    error?: string
  }> {
    const result = await this.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 2000,
    })

    if (result.success && result.data?.markdown) {
      return {
        success: true,
        data: {
          markdown: result.data.markdown,
          name: result.data.metadata?.title,
          source_url: result.data.metadata?.sourceURL,
        },
      }
    } else {
      return { success: false, error: result.error || "Markdown content not found" }
    }
  }

  private extractPattern(text: string, pattern: RegExp): string | undefined {
    const match = text.match(pattern)
    return match ? match[1].trim() : undefined
  }

  private extractMenuSection(markdown: string): string | undefined {
    const menuPatterns = [
      /(?:menu|food|items?)\s*:?\s*((?:[^\n]*\n?){1,20})/i,
      /(?:what we serve|our food)\s*:?\s*((?:[^\n]*\n?){1,20})/i,
    ]

    for (const pattern of menuPatterns) {
      const match = markdown.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }

    return undefined
  }

  private extractContactInfo(markdown: string): any {
    const contact: any = {}

    // Phone number
    const phoneMatch = markdown.match(/(?:phone|call|contact)\s*:?\s*([+]?[\d\s\-()]{10,})/i)
    if (phoneMatch) {
      contact.phone = phoneMatch[1].trim()
    }

    // Email
    const emailMatch = markdown.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    if (emailMatch) {
      contact.email = emailMatch[1].trim()
    }

    return Object.keys(contact).length > 0 ? contact : undefined
  }

  private extractSocialMedia(markdown: string): any {
    const social: any = {}

    // Instagram
    const instagramMatch = markdown.match(/(?:instagram|@)[\s:]*([a-zA-Z0-9._]+)/i)
    if (instagramMatch) {
      social.instagram = instagramMatch[1].trim()
    }

    // Facebook
    const facebookMatch = markdown.match(/facebook\.com\/([a-zA-Z0-9.]+)/i)
    if (facebookMatch) {
      social.facebook = facebookMatch[1].trim()
    }

    // Twitter
    const twitterMatch = markdown.match(/(?:twitter|@)[\s:]*([a-zA-Z0-9._]+)/i)
    if (twitterMatch) {
      social.twitter = twitterMatch[1].trim()
    }

    return Object.keys(social).length > 0 ? social : undefined
  }

  async scrapeMultipleUrls(
    urls: string[],
    options: {
      batchSize?: number
      delay?: number
    } = {},
  ): Promise<Array<{ url: string; result: FirecrawlResponse }>> {
    const batchSize = options.batchSize || 5
    const delay = options.delay || 1000
    const results: Array<{ url: string; result: FirecrawlResponse }> = []

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)

      const batchPromises = batch.map(async (url) => {
        const result = await this.scrapeUrl(url)
        return { url, result }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // Add delay between batches to respect rate limits
      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    return results
  }

  // Rate limiting and error handling
  async scrapeWithRetry(url: string, maxRetries = 3, backoffMs = 1000): Promise<FirecrawlResponse> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.scrapeUrl(url)

        if (result.success) {
          return result
        }

        // If it's a rate limit error, wait longer
        if (result.error?.includes("rate limit")) {
          const waitTime = backoffMs * Math.pow(2, attempt)
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
          continue
        }

        throw new Error(result.error)
      } catch (error) {
        lastError = error as Error

        if (attempt === maxRetries) {
          break
        }

        const waitTime = backoffMs * Math.pow(2, attempt)
        console.log(`Attempt ${attempt} failed. Retrying in ${waitTime}ms...`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }
    }

    return {
      success: false,
      error: lastError!.message,
    }
  }
}

// Export singleton instance
export const firecrawl = new FirecrawlService()
