import { type NextRequest, NextResponse } from "next/server"

// Scraper configuration and status management
interface ScraperConfig {
  id: string
  name: string
  url: string
  type: "website" | "social" | "api"
  frequency: number // minutes
  lastRun: string
  status: "running" | "idle" | "error" | "rate_limited"
  successRate: number
}

interface ScrapingJob {
  id: string
  scraperId: string
  status: "pending" | "running" | "completed" | "failed"
  startTime: string
  endTime?: string
  dataCollected: number
  errors: string[]
}

// Mock data for demonstration
const scraperConfigs: ScraperConfig[] = [
  {
    id: "instagram_scraper",
    name: "Instagram Food Truck Scraper",
    url: "https://instagram.com",
    type: "social",
    frequency: 120, // 2 hours
    lastRun: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    status: "running",
    successRate: 94.2,
  },
  {
    id: "website_crawler",
    name: "Food Truck Website Crawler",
    url: "various",
    type: "website",
    frequency: 360, // 6 hours
    lastRun: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    status: "idle",
    successRate: 87.5,
  },
  {
    id: "yelp_api",
    name: "Yelp Business API",
    url: "https://api.yelp.com",
    type: "api",
    frequency: 720, // 12 hours
    lastRun: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
    status: "rate_limited",
    successRate: 96.8,
  },
]

const activeJobs: ScrapingJob[] = [
  {
    id: "job_001",
    scraperId: "instagram_scraper",
    status: "running",
    startTime: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
    dataCollected: 73,
    errors: [],
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "status":
        return NextResponse.json({
          scrapers: scraperConfigs,
          activeJobs: activeJobs,
          summary: {
            totalScrapers: scraperConfigs.length,
            activeJobs: activeJobs.filter((job) => job.status === "running").length,
            averageSuccessRate: scraperConfigs.reduce((acc, s) => acc + s.successRate, 0) / scraperConfigs.length,
          },
        })

      case "jobs":
        return NextResponse.json({
          jobs: activeJobs,
          pending: activeJobs.filter((job) => job.status === "pending").length,
          running: activeJobs.filter((job) => job.status === "running").length,
          completed: activeJobs.filter((job) => job.status === "completed").length,
        })

      default:
        return NextResponse.json({
          message: "Food Truck Scraper API",
          endpoints: [
            "GET /api/scraper?action=status - Get scraper status",
            "GET /api/scraper?action=jobs - Get job status",
            "POST /api/scraper - Start new scraping job",
            "PUT /api/scraper - Update scraper configuration",
          ],
        })
    }
  } catch (error) {
    console.error("Scraper API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scraperId, priority = "normal" } = body

    // Validate scraper exists
    const scraper = scraperConfigs.find((s) => s.id === scraperId)
    if (!scraper) {
      return NextResponse.json({ error: "Scraper not found" }, { status: 404 })
    }

    // Check if scraper is available
    if (scraper.status === "running") {
      return NextResponse.json({ error: "Scraper is already running" }, { status: 409 })
    }

    // Create new job
    const newJob: ScrapingJob = {
      id: `job_${Date.now()}`,
      scraperId: scraperId,
      status: "pending",
      startTime: new Date().toISOString(),
      dataCollected: 0,
      errors: [],
    }

    // Add to active jobs (in real implementation, this would be queued)
    activeJobs.push(newJob)

    // Update scraper status
    scraper.status = "running"
    scraper.lastRun = new Date().toISOString()

    return NextResponse.json({
      message: "Scraping job started",
      job: newJob,
    })
  } catch (error) {
    console.error("Error starting scraping job:", error)
    return NextResponse.json({ error: "Failed to start scraping job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { scraperId, config } = body

    // Find and update scraper configuration
    const scraperIndex = scraperConfigs.findIndex((s) => s.id === scraperId)
    if (scraperIndex === -1) {
      return NextResponse.json({ error: "Scraper not found" }, { status: 404 })
    }

    // Update configuration
    scraperConfigs[scraperIndex] = {
      ...scraperConfigs[scraperIndex],
      ...config,
    }

    return NextResponse.json({
      message: "Scraper configuration updated",
      scraper: scraperConfigs[scraperIndex],
    })
  } catch (error) {
    console.error("Error updating scraper configuration:", error)
    return NextResponse.json({ error: "Failed to update scraper configuration" }, { status: 500 })
  }
}
