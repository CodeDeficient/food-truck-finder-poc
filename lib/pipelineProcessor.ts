import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { ScrapingJobService, FoodTruckService } from '@/lib/supabase';
import { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem } from './types';

// Background job processing function
// eslint-disable-next-line sonarjs/cognitive-complexity
export async function processScrapingJob(jobId: string) {
  try {
    // Update job status to running
    const job = await ScrapingJobService.updateJobStatus(jobId, 'running');

    if (!job.target_url) {
      throw new Error('No target URL specified');
    }

    // Scrape the website using Firecrawl
    console.info(`Starting scrape for ${job.target_url}`);
    const scrapeResult = await firecrawl.scrapeFoodTruckWebsite(job.target_url); // Simplified call

    if (!scrapeResult.success || !scrapeResult.data?.markdown) {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        errors: [scrapeResult.error || 'Scraping failed or markdown content not found'],
      });
      throw new Error(scrapeResult.error || 'Scraping failed or markdown content not found');
    }

    console.info(`Scraping successful for ${job.target_url}, proceeding to Gemini extraction.`);

    // Call Gemini to extract structured data
    const geminiResult = await gemini.extractFoodTruckDetailsFromMarkdown(
      scrapeResult.data.markdown,
      scrapeResult.data.source_url || job.target_url,
    );

    if (!geminiResult.success || !geminiResult.data) {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        errors: [geminiResult.error || 'Gemini data extraction failed'],
      });
      throw new Error(geminiResult.error || 'Gemini data extraction failed');
    }

    console.info(`Gemini extraction successful for ${job.target_url}.`);

    // Update job with structured data from Gemini
    await ScrapingJobService.updateJobStatus(jobId, 'completed', {
      data_collected: geminiResult.data as unknown as Record<string, unknown>, // Cast to unknown first, then to Record<string, unknown>
      completed_at: new Date().toISOString(),
    });

    // Create or update FoodTruck entry
    await createOrUpdateFoodTruck(
      jobId,
      geminiResult.data,
      scrapeResult.data.source_url || job.target_url,
    );

    // The call to processScrapedData is removed as Gemini now handles full extraction.
    // The old processScrapedData and processDataQueue can remain for other potential uses or reprocessing.

    console.info(`Scraping job ${jobId} completed successfully and data processed.`);
  } catch (error: unknown) {
    // Explicitly type error as unknown
    console.error(`Scraping job ${jobId} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Attempt to update job status to failed
    try {
      // Check current status to avoid overwriting if already failed in a specific step
      const currentJobData = await ScrapingJobService.getJobsByStatus('all').then((jobs) =>
        jobs.find((j) => j.id === jobId),
      );
      if (currentJobData && currentJobData.status !== 'failed') {
        await ScrapingJobService.updateJobStatus(jobId, 'failed', {
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
      if (
        jobAfterRetryIncrement &&
        typeof jobAfterRetryIncrement.retry_count === 'number' &&
        typeof jobAfterRetryIncrement.max_retries === 'number'
      ) {
        if (jobAfterRetryIncrement.retry_count < jobAfterRetryIncrement.max_retries) {
          console.info(
            `Retrying job ${jobId} (attempt ${jobAfterRetryIncrement.retry_count}/${jobAfterRetryIncrement.max_retries})`,
          );
          setTimeout(() => {
            void processScrapingJob(jobId);
          }, 5000); // Retry after 5 seconds
        } else {
          console.warn(`Job ${jobId} reached max retries (${jobAfterRetryIncrement.max_retries}).`);
        }
      } else {
        console.error(
          `Job ${jobId}: Could not get valid retry_count or max_retries. Won't attempt retry.`,
        );
      }
    } catch (retryIncrementError) {
      console.error(`Error during retry increment logic for job ${jobId}:`, retryIncrementError);
    }
  }
}

// Helper function to validate input data
function validateTruckData(jobId: string, extractedTruckData: ExtractedFoodTruckDetails): boolean {
  if (!extractedTruckData || typeof extractedTruckData !== 'object') {
    console.error(`Job ${jobId}: Invalid extractedTruckData, cannot create/update food truck.`);
    return false;
  }
  return true;
}

// Helper function to build location data
function buildLocationData(extractedTruckData: ExtractedFoodTruckDetails) {
  const locationData = extractedTruckData.current_location || {};
  const fullAddress = [
    locationData.address,
    locationData.city,
    locationData.state,
    locationData.zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    lat: typeof locationData.lat === 'number' ? locationData.lat : 0,
    lng: typeof locationData.lng === 'number' ? locationData.lng : 0,
    address: fullAddress || (locationData.raw_text ?? undefined),
    timestamp: new Date().toISOString(),
  };
}

// Helper function to process menu data
function processMenuData(extractedTruckData: ExtractedFoodTruckDetails): MenuCategory[] {
  if (!Array.isArray(extractedTruckData.menu)) {
    return [];
  }

  return extractedTruckData.menu.map((category: unknown): MenuCategory => {
    const categoryData = category as { items?: unknown[]; category?: string; name?: string };
    const items = (Array.isArray(categoryData.items) ? categoryData.items : []).map(
      (item: unknown): MenuItem => {
        const itemData = item as {
          name?: string;
          description?: string;
          price?: string | number;
          dietary_tags?: string[];
        };
        let price: number | undefined = undefined;
        if (typeof itemData.price === 'number') {
          price = itemData.price;
        } else if (typeof itemData.price === 'string') {
          const parsedPrice = Number.parseFloat(itemData.price.replaceAll(/[^\d.-]/g, ''));
          if (!Number.isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }
        return {
          name: itemData.name || 'Unknown Item',
          description: itemData.description ?? undefined,
          price: price,
          dietary_tags: Array.isArray(itemData.dietary_tags) ? itemData.dietary_tags : [],
        };
      },
    );
    return {
      name: categoryData.category || categoryData.name || 'Uncategorized',
      items: items,
    };
  });
}

export async function createOrUpdateFoodTruck(
  jobId: string,
  extractedTruckData: ExtractedFoodTruckDetails,
  sourceUrl: string,
) {
  try {
    // Basic input validation
    if (!validateTruckData(jobId, extractedTruckData)) {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        errors: ['Invalid extracted data received from AI processing step.'],
      });
      return;
    }

    if (!sourceUrl) {
      // Log a warning but proceed if sourceUrl is missing, as it might not be critical for all data.
      console.warn(`Job ${jobId}: Missing sourceUrl for food truck data, proceeding without it.`);
    }

    const name = extractedTruckData.name || 'Unknown Food Truck'; // Ensure name has a fallback
    console.info(
      `Job ${jobId}: Preparing to create/update food truck: ${name} from ${sourceUrl || 'Unknown Source'}`,
    );

    // Map Gemini output to FoodTruck schema with stricter type checking and defaults
    const currentLocation = buildLocationData(extractedTruckData);

    const truckData: FoodTruckSchema = {
      name: name,
      description: extractedTruckData.description ?? undefined, // Keep as undefined if null/missing
      current_location: currentLocation,
      scheduled_locations: Array.isArray(extractedTruckData.scheduled_locations)
        ? extractedTruckData.scheduled_locations.map((loc) => ({
            lat: typeof loc.lat === 'number' ? loc.lat : 0,
            lng: typeof loc.lng === 'number' ? loc.lng : 0,
            address: loc.address ?? undefined,
            start_time: loc.start_time ?? undefined,
            end_time: loc.end_time ?? undefined,
            timestamp: new Date().toISOString(),
          }))
        : undefined,
      operating_hours: extractedTruckData.operating_hours
        ? {
            monday: extractedTruckData.operating_hours.monday ?? { closed: true },
            tuesday: extractedTruckData.operating_hours.tuesday ?? { closed: true },
            wednesday: extractedTruckData.operating_hours.wednesday ?? { closed: true },
            thursday: extractedTruckData.operating_hours.thursday ?? { closed: true },
            friday: extractedTruckData.operating_hours.friday ?? { closed: true },
            saturday: extractedTruckData.operating_hours.saturday ?? { closed: true },
            sunday: extractedTruckData.operating_hours.sunday ?? { closed: true },
          }
        : {
            monday: { closed: true },
            tuesday: { closed: true },
            wednesday: { closed: true },
            thursday: { closed: true },
            friday: { closed: true },
            saturday: { closed: true },
            sunday: { closed: true },
          },
      menu: processMenuData(extractedTruckData),
      contact_info: {
        phone: extractedTruckData.contact_info?.phone ?? undefined,
        email: extractedTruckData.contact_info?.email ?? undefined,
        website: extractedTruckData.contact_info?.website ?? undefined,
      },
      social_media: {
        instagram: extractedTruckData.social_media?.instagram ?? undefined,
        facebook: extractedTruckData.social_media?.facebook ?? undefined,
        twitter: extractedTruckData.social_media?.twitter ?? undefined,
        tiktok: extractedTruckData.social_media?.tiktok ?? undefined,
        yelp: extractedTruckData.social_media?.yelp ?? undefined,
      },
      cuisine_type: Array.isArray(extractedTruckData.cuisine_type)
        ? extractedTruckData.cuisine_type
        : [],
      price_range: extractedTruckData.price_range ?? undefined, // Ensure it's one of the allowed enum values or undefined
      specialties: Array.isArray(extractedTruckData.specialties)
        ? extractedTruckData.specialties
        : [],
      data_quality_score: 0.5, // Default score - confidence_score not available in type
      verification_status: 'pending',
      source_urls: sourceUrl ? [sourceUrl] : [], // Ensure source_urls is always an array
      last_scraped_at: new Date().toISOString(),
    };

    // Attempt to create/update the truck in Supabase
    // For now, we focus on creation. Update/Upsert logic would be more complex.
    // Consider checking if a truck with a similar name or sourceUrl already exists if upserting.
    const truck = await FoodTruckService.createTruck(truckData);
    console.info(
      `Job ${jobId}: Successfully created food truck: ${truck.name} (ID: ${truck.id}) from ${sourceUrl || 'Unknown Source'}`,
    );

    // Link truck_id back to the scraping job
    await ScrapingJobService.updateJobStatus(jobId, 'completed', {
      completed_at: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error(
      `Job ${jobId}: Error in createOrUpdateFoodTruck from ${sourceUrl || 'Unknown Source'}:`,
      error,
    );
    // Update the scraping job with this error information
    try {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        errors: [
          `Food truck data processing/saving failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      });
    } catch (jobUpdateError) {
      console.error(
        `Job ${jobId}: Critical error - failed to update job status after data processing failure:`,
        jobUpdateError,
      );
    }
  }
}

// Fix type assignment and compatibility errors, replace any with unknown or specific types, and remove unused variables/imports.
