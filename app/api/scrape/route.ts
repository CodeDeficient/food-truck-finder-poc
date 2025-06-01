import { type NextRequest, NextResponse } from "next/server"
import { firecrawl } from "@/lib/firecrawl"
import { gemini } from "@/lib/gemini"
import { ScrapingJobService, DataProcessingService, FoodTruckService } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, type = "website", priority = 5 } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Create scraping job
    const job = await ScrapingJobService.createJob({
      job_type: type,
      target_url: url,
      priority,
      scheduled_at: new Date().toISOString(),
    })

    // Start scraping process
    processScrapingJob(job.id)

    return NextResponse.json({
      message: "Scraping job created",
      jobId: job.id,
      status: "pending",
    })
  } catch (error) {
    console.error("Error creating scraping job:", error)
    return NextResponse.json({ error: "Failed to create scraping job" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")
  const status = searchParams.get("status")

  try {
    if (jobId) {
      // Get specific job status
      const jobs = await ScrapingJobService.getJobsByStatus("all")
      const job = jobs.find((j) => j.id === jobId)

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 })
      }

      return NextResponse.json({ job })
    }

    // Get jobs by status
    const jobs = await ScrapingJobService.getJobsByStatus(status || "pending")

    return NextResponse.json({
      jobs,
      summary: {
        total: jobs.length,
        pending: jobs.filter((j) => j.status === "pending").length,
        running: jobs.filter((j) => j.status === "running").length,
        completed: jobs.filter((j) => j.status === "completed").length,
        failed: jobs.filter((j) => j.status === "failed").length,
      },
    })
  } catch (error) {
    console.error("Error fetching scraping jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Background job processing function
async function processScrapingJob(jobId: string) {
  try {
    // Update job status to running
    const job = await ScrapingJobService.updateJobStatus(jobId, "running")

    if (!job.target_url) {
      throw new Error("No target URL specified")
    }

    // Scrape the website using Firecrawl
    console.log(`Starting scrape for ${job.target_url}`)
    const scrapeResult = await firecrawl.scrapeFoodTruckWebsite(job.target_url)

    if (!scrapeResult.success) {
      throw new Error(scrapeResult.error || "Scraping failed")
    }

    // Update job with scraped data
    await ScrapingJobService.updateJobStatus(jobId, "completed", {
      data_collected: scrapeResult.data,
      completed_at: new Date().toISOString(),
    })

    // Process the scraped data with Gemini
    if (scrapeResult.data) {
      await processScrapedData(jobId, scrapeResult.data)
    }

    console.log(`Scraping job ${jobId} completed successfully`)
  } catch (error) {
    console.error(`Scraping job ${jobId} failed:`, error)

    // Update job status to failed
    await ScrapingJobService.updateJobStatus(jobId, "failed", {
      errors: [error instanceof Error ? error.message : "Unknown error"],
    })

    // Increment retry count and potentially retry
    const job = await ScrapingJobService.incrementRetryCount(jobId)
    if (job.retry_count < job.max_retries) {
      console.log(`Retrying job ${jobId} (attempt ${job.retry_count + 1}/${job.max_retries})`)
      setTimeout(() => processScrapingJob(jobId), 5000) // Retry after 5 seconds
    }
  }
}

async function processScrapedData(jobId: string, scrapedData: any) {
  try {
    // Create processing queue items for different data types
    const processingTasks = []

    if (scrapedData.menu) {
      processingTasks.push({
        processing_type: "menu_standardization",
        raw_data: { menu: scrapedData.menu },
        priority: 5,
      })
    }

    if (scrapedData.hours) {
      processingTasks.push({
        processing_type: "hours_standardization",
        raw_data: { hours: scrapedData.hours },
        priority: 5,
      })
    }

    if (scrapedData.location) {
      processingTasks.push({
        processing_type: "location_extraction",
        raw_data: { location: scrapedData.location },
        priority: 8,
      })
    }

    // Add enhancement task for all data
    processingTasks.push({
      processing_type: "data_enhancement",
      raw_data: scrapedData,
      priority: 3,
    })

    // Add all tasks to processing queue
    for (const task of processingTasks) {
      await DataProcessingService.addToQueue({
        ...task,
        truck_id: null, // Will be set when truck is created
      })
    }

    // Start processing the queue
    processDataQueue()
  } catch (error) {
    console.error("Error processing scraped data:", error)
  }
}

async function processDataQueue() {
  try {
    const queueItem = await DataProcessingService.getNextQueueItem()

    if (!queueItem) {
      return // No items in queue
    }

    // Update status to processing
    await DataProcessingService.updateQueueItem(queueItem.id, {
      status: "processing",
    })

    let result
    let tokensUsed = 0

    // Process based on type
    switch (queueItem.processing_type) {
      case "menu_standardization":
        result = await gemini.processMenuData(queueItem.raw_data.menu)
        tokensUsed = result.tokensUsed || 0
        break

      case "hours_standardization":
        result = await gemini.standardizeOperatingHours(queueItem.raw_data.hours)
        tokensUsed = result.tokensUsed || 0
        break

      case "location_extraction":
        result = await gemini.extractLocationFromText(queueItem.raw_data.location)
        tokensUsed = result.tokensUsed || 0
        break

      case "data_enhancement":
        result = await gemini.enhanceFoodTruckData(queueItem.raw_data)
        tokensUsed = result.tokensUsed || 0
        break

      default:
        throw new Error(`Unknown processing type: ${queueItem.processing_type}`)
    }

    if (result.success) {
      // Update queue item with processed data
      await DataProcessingService.updateQueueItem(queueItem.id, {
        status: "completed",
        processed_data: result.data,
        gemini_tokens_used: tokensUsed,
      })

      // If this is a data enhancement task, create or update the food truck
      if (queueItem.processing_type === "data_enhancement" && result.data) {
        await createOrUpdateFoodTruck(result.data, queueItem.raw_data)
      }
    } else {
      // Mark as failed
      await DataProcessingService.updateQueueItem(queueItem.id, {
        status: "failed",
        gemini_tokens_used: tokensUsed,
      })
    }

    // Continue processing queue
    setTimeout(processDataQueue, 1000)
  } catch (error) {
    console.error("Error processing data queue:", error)
  }
}

async function createOrUpdateFoodTruck(enhancedData: any, originalData: any) {
  try {
    const truckData = {
      name: enhancedData.name || originalData.name || "Unknown Food Truck",
      description: enhancedData.description || originalData.description,
      current_location: originalData.location
        ? {
            lat: 0, // Will need geocoding
            lng: 0,
            address: originalData.location,
            timestamp: new Date().toISOString(),
          }
        : null,
      scheduled_locations: [],
      operating_hours: enhancedData.standardized_hours || {},
      menu: enhancedData.enhanced_menu?.categories || [],
      contact_info: enhancedData.cleaned_contact || originalData.contact || {},
      social_media: originalData.social || {},
      data_quality_score: enhancedData.confidence_score || 0.5,
      verification_status: "pending",
      source_urls: [originalData.source_url].filter(Boolean),
    }

    const truck = await FoodTruckService.createTruck(truckData)
    console.log(`Created food truck: ${truck.name} (${truck.id})`)
  } catch (error) {
    console.error("Error creating food truck:", error)
  }
}
