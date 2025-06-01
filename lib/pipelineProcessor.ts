import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { ScrapingJobService, FoodTruckService } from '@/lib/supabase';

// Background job processing function
export async function processScrapingJob(jobId: string) {
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

    // Attempt to update job status to failed
    try {
      // Check current status to avoid overwriting if already failed in a specific step
      const currentJobData = await ScrapingJobService.getJobsByStatus("all").then(jobs => jobs.find(j => j.id === jobId));
      if (currentJobData && currentJobData.status !== "failed") {
        await ScrapingJobService.updateJobStatus(jobId, "failed", {
          errors: [errorMessage],
        });
      } else if (!currentJobData) {
        // If job couldn't be fetched, log but proceed to retry logic if appropriate
        console.error(`Could not fetch job ${jobId} to update status to failed.`);
      }
    } catch (statusUpdateError) {
      console.error(`Error updating job ${jobId} status to failed:`, statusUpdateError);
    }

    // Increment retry count and potentially retry
    try {
      const jobAfterRetryIncrement = await ScrapingJobService.incrementRetryCount(jobId);
      // Ensure jobAfterRetryIncrement and its properties are valid before using them
      if (jobAfterRetryIncrement && typeof jobAfterRetryIncrement.retry_count === 'number' && typeof jobAfterRetryIncrement.max_retries === 'number') {
        if (jobAfterRetryIncrement.retry_count < jobAfterRetryIncrement.max_retries) {
          console.log(`Retrying job ${jobId} (attempt ${jobAfterRetryIncrement.retry_count}/${jobAfterRetryIncrement.max_retries})`);
          setTimeout(() => processScrapingJob(jobId), 5000); // Retry after 5 seconds
        } else {
          console.log(`Job ${jobId} reached max retries (${jobAfterRetryIncrement.max_retries}).`);
        }
      } else {
        console.error(`Job ${jobId}: Could not get valid retry_count or max_retries. Won't attempt retry.`);
      }
    } catch (retryIncrementError) {
      console.error(`Error during retry increment logic for job ${jobId}:`, retryIncrementError);
    }
  }
}

export async function createOrUpdateFoodTruck(jobId: string, extractedTruckData: any, sourceUrl: string) {
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
  }
  // Duplicate catch block removed here
}
