import { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem } from '../types';
import { ScrapingJobService, FoodTruckService } from '../supabase';
import { DuplicatePreventionService } from '../data-quality/duplicatePrevention';
import { PostgrestError } from '@supabase/supabase-js';

// Helper function to validate input and prepare basic data
export async function validateInputAndPrepare(
  jobId: string,
  extractedTruckData: ExtractedFoodTruckDetails,
  sourceUrl: string
): Promise<{ isValid: boolean; name: string }> {
  // Basic input validation
  if (!validateTruckData(jobId, extractedTruckData)) {
    await ScrapingJobService.updateJobStatus(jobId, 'failed', {
      errors: ['Invalid extracted data received from AI processing step.'],
    });
    return { isValid: false, name: '' };
  }

  if (!sourceUrl) {
    // Log a warning but proceed if sourceUrl is missing, as it might not be critical for all data.
    console.warn(`Job ${jobId}: Missing sourceUrl for food truck data, proceeding without it.`);
  }

  const name = extractedTruckData.name ?? 'Unknown Food Truck'; // Ensure name has a fallback
  console.info(
    `Job ${jobId}: Preparing to create/update food truck: ${name} from ${sourceUrl ?? 'Unknown Source'}`,
  );

  return { isValid: true, name };
}

// Helper function to build truck data schema
export function buildTruckDataSchema(
  extractedTruckData: ExtractedFoodTruckDetails,
  sourceUrl: string,
  name: string
): FoodTruckSchema {
  const currentLocation = buildLocationData(extractedTruckData);

  return {
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
    operating_hours: extractedTruckData.operating_hours == null
      ? {
          monday: { closed: true },
          tuesday: { closed: true },
          wednesday: { closed: true },
          thursday: { closed: true },
          friday: { closed: true },
          saturday: { closed: true },
          sunday: { closed: true },
        }
      : {
          monday: extractedTruckData.operating_hours.monday ?? { closed: true },
          tuesday: extractedTruckData.operating_hours.tuesday ?? { closed: true },
          wednesday: extractedTruckData.operating_hours.wednesday ?? { closed: true },
          thursday: extractedTruckData.operating_hours.thursday ?? { closed: true },
          friday: extractedTruckData.operating_hours.friday ?? { closed: true },
          saturday: extractedTruckData.operating_hours.saturday ?? { closed: true },
          sunday: extractedTruckData.operating_hours.sunday ?? { closed: true },
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
    source_urls: sourceUrl != null && sourceUrl !== '' ? [sourceUrl] : [], // Ensure source_urls is always an array
    last_scraped_at: new Date().toISOString(),
  };
}

// Helper function to handle duplicate checking and resolution
export async function handleDuplicateCheck(
  jobId: string,
  truckData: FoodTruckSchema,
  name: string
): Promise<any> {
  // Check for duplicates before creating
  console.info(`Job ${jobId}: Checking for duplicates before creating truck: ${name}`);
  const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truckData);

  let truck;
  if (duplicateCheck.isDuplicate && duplicateCheck.bestMatch) {
    const { bestMatch } = duplicateCheck;
    console.info(`Job ${jobId}: Found potential duplicate (${Math.round(bestMatch.similarity * 100)}% similarity) with truck: ${bestMatch.existingTruck.name}`);

    if (bestMatch.confidence === 'high' && bestMatch.recommendation === 'merge') {
      // Merge with existing truck
      truck = await DuplicatePreventionService.mergeDuplicates(bestMatch.existingTruck.id, bestMatch.existingTruck.id);
      console.info(`Job ${jobId}: Merged data with existing truck: ${truck.name} (ID: ${truck.id})`);
    } else if (bestMatch.recommendation === 'update') {
      // Update existing truck with new data
      truck = await FoodTruckService.updateTruck(bestMatch.existingTruck.id, truckData);
      console.info(`Job ${jobId}: Updated existing truck: ${truck.name} (ID: ${truck.id})`);
    } else {
      // Create new truck but log the potential duplicate
      truck = await FoodTruckService.createTruck(truckData);
      console.warn(`Job ${jobId}: Created new truck despite potential duplicate (${duplicateCheck.reason})`);
    }
  } else {
    // No duplicates found, create new truck
    truck = await FoodTruckService.createTruck(truckData);
  }

  return truck;
}

// Helper function to finalize job status
export async function finalizeJobStatus(
  jobId: string,
  truck: any,
  sourceUrl: string
): Promise<void> {
  console.info(
    `Job ${jobId}: Successfully created food truck: ${truck.name} (ID: ${truck.id}) from ${sourceUrl ?? 'Unknown Source'}`,
  );

  // Link truck_id back to the scraping job
  await ScrapingJobService.updateJobStatus(jobId, 'completed', {
    completed_at: new Date().toISOString(),
  });
}

// Helper function to validate input data
function validateTruckData(jobId: string, extractedTruckData: ExtractedFoodTruckDetails): boolean {
  if (extractedTruckData == null || typeof extractedTruckData !== 'object') {
    console.error(`Job ${jobId}: Invalid extractedTruckData, cannot create/update food truck.`);
    return false;
  }
  return true;
}

// Helper function to build location data
function buildLocationData(extractedTruckData: ExtractedFoodTruckDetails) {
  const locationData = extractedTruckData.current_location ?? {};
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
          name: itemData.name ?? 'Unknown Item',
          description: itemData.description ?? undefined,
          price: price,
          dietary_tags: Array.isArray(itemData.dietary_tags) ? itemData.dietary_tags : [],
        };
      },
    );
    return {
      name: categoryData.category ?? categoryData.name ?? 'Uncategorized',
      items: items,
    };
  });
}
