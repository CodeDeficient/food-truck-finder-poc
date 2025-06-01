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
    const scrapeResult = await firecrawl.scrapeFoodTruckWebsite(job.target_url) // Simplified call

    if (!scrapeResult.success || !scrapeResult.data?.markdown) {
      await ScrapingJobService.updateJobStatus(jobId, "failed", {
        errors: [scrapeResult.error || "Scraping failed or markdown content not found"],
      })
      throw new Error(scrapeResult.error || "Scraping failed or markdown content not found")
    }

    console.log(`Scraping successful for ${job.target_url}, proceeding to Gemini extraction.`)

    // Call Gemini to extract structured data
    const geminiResult = await gemini.extractFoodTruckDetailsFromMarkdown(
      scrapeResult.data.markdown,
      scrapeResult.data.source_url || job.target_url,
    )

    if (!geminiResult.success || !geminiResult.data) {
      await ScrapingJobService.updateJobStatus(jobId, "failed", {
        errors: [geminiResult.error || "Gemini data extraction failed"],
      })
      throw new Error(geminiResult.error || "Gemini data extraction failed")
    }

    console.log(`Gemini extraction successful for ${job.target_url}.`)

    // Update job with structured data from Gemini
    await ScrapingJobService.updateJobStatus(jobId, "completed", {
      data_collected: geminiResult.data, // This is the structured JSON
      completed_at: new Date().toISOString(),
    })

    // Create or update FoodTruck entry
    await createOrUpdateFoodTruck(jobId, geminiResult.data, scrapeResult.data.source_url || job.target_url)

    // The call to processScrapedData is removed as Gemini now handles full extraction.
    // The old processScrapedData and processDataQueue can remain for other potential uses or reprocessing.

    console.log(`Scraping job ${jobId} completed successfully and data processed.`)
  } catch (error) {
    console.error(`Scraping job ${jobId} failed:`, error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    // Ensure job status is updated to failed if not already handled by specific error blocks
    const currentJob = await ScrapingJobService.getJobsByStatus("all").then(jobs => jobs.find(j => j.id === jobId));
    if (currentJob && currentJob.status !== "failed") {
      await ScrapingJobService.updateJobStatus(jobId, "failed", {
        errors: [errorMessage],
      });
    }
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

async function createOrUpdateFoodTruck(jobId: string, extractedTruckData: any, sourceUrl: string) {
  try {
    // Basic input validation
    if (!extractedTruckData || typeof extractedTruckData !== "object") {
      console.error(`Job ${jobId}: Invalid extractedTruckData, cannot create/update food truck.`)
      return
    }
    if (!sourceUrl) {
      console.warn(`Job ${jobId}: Missing sourceUrl for food truck, proceeding without it.`)
    }

    const name = extractedTruckData.name || "Unknown Food Truck"
    console.log(`Job ${jobId}: Preparing to create/update food truck: ${name} from ${sourceUrl}`)

    // Map Gemini output to FoodTruck schema
    const locationData = extractedTruckData.current_location || {}
    const fullAddress = [locationData.address, locationData.city, locationData.state, locationData.zip_code]
      .filter(Boolean)
      .join(", ")

    const truckData = {
      name: name,
      description: extractedTruckData.description || null,
      current_location: {
        // Placeholder lat/lng, geocoding would be a separate step
        lat: locationData.lat || 0,
        lng: locationData.lng || 0,
        address: fullAddress || locationData.raw_text || null,
        timestamp: new Date().toISOString(),
      },
      scheduled_locations: extractedTruckData.scheduled_locations || [],
      operating_hours: extractedTruckData.operating_hours || {},
      menu: (extractedTruckData.menu || []).map((category: any) => ({
        category: category.category || "Uncategorized",
        items: (category.items || []).map((item: any) => ({
          name: item.name || "Unknown Item",
          description: item.description || null,
          // Ensure price is a number or string, default to null if undefined
          price: typeof item.price === 'number' || typeof item.price === 'string' ? item.price : null,
          dietary_tags: item.dietary_tags || [],
        })),
      })),
      contact_info: extractedTruckData.contact_info || {},
      social_media: extractedTruckData.social_media || {},
      cuisine_type: extractedTruckData.cuisine_type || [],
      price_range: extractedTruckData.price_range || null,
      specialties: extractedTruckData.specialties || [],
      data_quality_score: 0.6, // Placeholder score
      verification_status: "pending" as "pending" | "verified" | "flagged",
      source_urls: [sourceUrl].filter(Boolean),
      last_scraped_at: new Date().toISOString(),
      // created_at and updated_at are handled by Supabase
    }

    // For now, we focus on creation.
    // TODO: Implement update logic if a truck from this source_url already exists.
    const truck = await FoodTruckService.createTruck(truckData)
    console.log(`Job ${jobId}: Successfully created food truck: ${truck.name} (ID: ${truck.id}) from ${sourceUrl}`)

    // Potentially link the truck_id back to the data_processing_queue items if needed,
    // though the current flow bypasses that queue for initial creation.
  } catch (error) {
    console.error(`Job ${jobId}: Error creating food truck from ${sourceUrl}:`, error)
    // Optionally, update the scraping job with this error information if it's critical
    // await ScrapingJobService.updateJobStatus(jobId, "failed", {
    //   errors: [`Food truck creation failed: ${error instanceof Error ? error.message : "Unknown error"}`],
    // });
  } catch (error) {
    console.error("Error creating food truck:", error)
  }
}
