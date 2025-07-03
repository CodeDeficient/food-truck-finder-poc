import { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem } from '../types';
import { ScrapingJobService, FoodTruckService, FoodTruck } from '../supabase';
import { DuplicatePreventionService } from '../data-quality/duplicatePrevention';

// Helper function to validate input and prepare basic data
export async function validateInputAndPrepare(
  jobId: string,
  extractedTruckData: ExtractedFoodTruckDetails,
  sourceUrl: string,
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

// New helper function for operating hours
function buildOperatingHours(
  extractedOperatingHours: ExtractedFoodTruckDetails['operating_hours'],
) {
  if (extractedOperatingHours == undefined) {
    return {
      monday: { closed: true as const },
      tuesday: { closed: true as const },
      wednesday: { closed: true as const },
      thursday: { closed: true as const },
      friday: { closed: true as const },
      saturday: { closed: true as const },
      sunday: { closed: true as const },
    };
  }
  return {
    monday: extractedOperatingHours.monday ?? { closed: true as const },
    tuesday: extractedOperatingHours.tuesday ?? { closed: true as const },
    wednesday: extractedOperatingHours.wednesday ?? { closed: true as const },
    thursday: extractedOperatingHours.thursday ?? { closed: true as const },
    friday: extractedOperatingHours.friday ?? { closed: true as const },
    saturday: extractedOperatingHours.saturday ?? { closed: true as const },
    sunday: extractedOperatingHours.sunday ?? { closed: true as const },
  };
}

// New helper function for scheduled locations
function buildScheduledLocations(
  scheduledLocations: ExtractedFoodTruckDetails['scheduled_locations'],
) {
  if (!Array.isArray(scheduledLocations)) {
    return;
  }
  return scheduledLocations.map((loc) => ({
    lat: typeof loc.lat === 'number' ? loc.lat : 0,
    lng: typeof loc.lng === 'number' ? loc.lng : 0,
    address: loc.address ?? undefined,
    start_time: loc.start_time ?? undefined,
    end_time: loc.end_time ?? undefined,
    timestamp: new Date().toISOString(),
  }));
}

// Helper function to build truck data schema
export function buildTruckDataSchema(
  extractedTruckData: ExtractedFoodTruckDetails,
  sourceUrl: string,
  name: string,
): FoodTruckSchema {
  const currentLocation = buildLocationData(extractedTruckData);

  return {
    name: name,
    description: extractedTruckData.description ?? undefined, // Keep as undefined if null/missing
    current_location: currentLocation,
    scheduled_locations: buildScheduledLocations(extractedTruckData.scheduled_locations),
    operating_hours: buildOperatingHours(extractedTruckData.operating_hours),
    menu: processMenuData(extractedTruckData),
    contact_info: buildContactInfo(extractedTruckData.contact_info),
    social_media: buildSocialMedia(extractedTruckData.social_media),
    cuisine_type: Array.isArray(extractedTruckData.cuisine_type)
      ? extractedTruckData.cuisine_type.filter((c) => typeof c === 'string')
      : [],
    price_range: extractedTruckData.price_range ?? undefined, // Ensure it's one of the allowed enum values or undefined
    specialties: Array.isArray(extractedTruckData.specialties)
      ? extractedTruckData.specialties
      : [],
    data_quality_score: 0.5, // Default score - confidence_score not available in type
    verification_status: 'pending',
    source_urls: sourceUrl != undefined && sourceUrl !== '' ? [sourceUrl] : [], // Ensure source_urls is always an array
    last_scraped_at: new Date().toISOString(),
  };
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  matches: {
    existingTruck: FoodTruck;
    similarity: number;
    matchedFields: string[];
    confidence: 'high' | 'medium' | 'low';
    recommendation: 'merge' | 'update' | 'skip' | 'manual_review';
  }[];
  bestMatch?: {
    existingTruck: FoodTruck;
    similarity: number;
    confidence: 'high' | 'medium' | 'low';
    recommendation: 'merge' | 'update' | 'skip' | 'manual_review';
  };
  action: 'create' | 'update' | 'merge' | 'manual_review';
  reason: string;
}

// Helper function to handle duplicate checking and resolution
export async function handleDuplicateCheck(
  jobId: string,
  truckData: FoodTruckSchema,
  name: string,
): Promise<FoodTruck> {
  // Check for duplicates before creating
  console.info(`Job ${jobId}: Checking for duplicates before creating truck: ${name}`);
  const duplicateCheck: DuplicateCheckResult =
    await DuplicatePreventionService.checkForDuplicates(truckData);

  if (duplicateCheck.isDuplicate && duplicateCheck.bestMatch) {
    return await handleDuplicate(jobId, truckData, duplicateCheck);
  } else {
    // No duplicates found, create new truck
    const truck = await FoodTruckService.createTruck(truckData);
    if ('error' in truck) {
      console.error(`Job ${jobId}: Error creating new truck: ${truck.error}`);
      throw new Error(`Failed to create truck: ${truck.error}`);
    }
    return truck;
  }
}

async function handleDuplicate(
  jobId: string,
  truckData: FoodTruckSchema,
  duplicateCheck: DuplicateCheckResult,
): Promise<FoodTruck> {
  const { bestMatch } = duplicateCheck;
  if (!bestMatch) {
    // This should not happen if isDuplicate is true, but as a safeguard:
    const truck = await FoodTruckService.createTruck(truckData);
    if ('error' in truck) {
      throw new Error(`Failed to create truck: ${truck.error}`);
    }
    return truck;
  }

  console.info(
    `Job ${jobId}: Found potential duplicate (${Math.round(bestMatch.similarity * 100)}% similarity) with truck: ${bestMatch.existingTruck.name}`,
  );

  if (bestMatch.confidence === 'high' && bestMatch.recommendation === 'merge') {
    const truck = await DuplicatePreventionService.mergeDuplicates(
      bestMatch.existingTruck.id,
      bestMatch.existingTruck.id,
    );
    if ('error' in truck) {
      console.error(`Job ${jobId}: Error merging duplicates: ${truck.error}`);
      const newTruck = await FoodTruckService.createTruck(truckData);
      if ('error' in newTruck) {
        console.error(`Job ${jobId}: Error creating truck after merge failure: ${newTruck.error}`);
        throw new Error(`Failed to merge or create truck: ${newTruck.error}`);
      }
      return newTruck;
    } else {
      console.info(
        `Job ${jobId}: Merged data with existing truck: ${truck.name} (ID: ${truck.id})`,
      );
      return truck;
    }
  } else if (bestMatch.recommendation === 'update') {
    const truck = await FoodTruckService.updateTruck(bestMatch.existingTruck.id, truckData);
    if ('error' in truck) {
      console.error(`Job ${jobId}: Error updating existing truck: ${truck.error}`);
      const newTruck = await FoodTruckService.createTruck(truckData);
      if ('error' in newTruck) {
        console.error(`Job ${jobId}: Error creating truck after update failure: ${newTruck.error}`);
        throw new Error(`Failed to update or create truck: ${newTruck.error}`);
      }
      return newTruck;
    } else {
      console.info(`Job ${jobId}: Updated existing truck: ${truck.name} (ID: ${truck.id})`);
      return truck;
    }
  } else {
    const truck = await FoodTruckService.createTruck(truckData);
    if ('error' in truck) {
      console.error(
        `Job ${jobId}: Error creating truck despite potential duplicate: ${truck.error}`,
      );
      throw new Error(`Failed to create truck: ${truck.error}`);
    }
    console.warn(
      `Job ${jobId}: Created new truck despite potential duplicate (${duplicateCheck.reason ?? 'unknown reason'})`,
    );
    return truck;
  }
}

// Helper function to finalize job status
export async function finalizeJobStatus(
  jobId: string,
  truck: FoodTruck,
  sourceUrl: string,
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
  if (extractedTruckData == undefined || typeof extractedTruckData !== 'object') {
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

// New helper function for contact info
function buildContactInfo(contactInfo: ExtractedFoodTruckDetails['contact_info']) {
  return {
    phone: contactInfo?.phone ?? undefined,
    email: contactInfo?.email ?? undefined,
    website: contactInfo?.website ?? undefined,
  };
}

// New helper function for social media
function buildSocialMedia(socialMedia: ExtractedFoodTruckDetails['social_media']) {
  return {
    instagram: socialMedia?.instagram ?? undefined,
    facebook: socialMedia?.facebook ?? undefined,
    twitter: socialMedia?.twitter ?? undefined,
    tiktok: socialMedia?.tiktok ?? undefined,
    yelp: socialMedia?.yelp ?? undefined,
  };
}

// Define a more precise type for raw menu categories and items
interface RawMenuItem {
  name?: string;
  description?: string;
  price?: string | number;
  dietary_tags?: string[];
}

interface RawMenuCategory {
  items?: unknown[];
  category?: string;
  name?: string;
}

// Type guard for RawMenuCategory
function isRawMenuCategory(obj: unknown): obj is RawMenuCategory {
  return (
    typeof obj === 'object' &&
    obj != undefined &&
    ('category' in obj || 'name' in obj || 'items' in obj)
  );
}

// Type guard for RawMenuItem
function isRawMenuItem(obj: unknown): obj is RawMenuItem {
  return (
    typeof obj === 'object' &&
    obj != undefined &&
    ('name' in obj || 'description' in obj || 'price' in obj || 'dietary_tags' in obj)
  );
}

// Helper function to process menu data
function processMenuData(extractedTruckData: ExtractedFoodTruckDetails): MenuCategory[] {
  if (!Array.isArray(extractedTruckData.menu)) {
    return [];
  }

  return extractedTruckData.menu.map((category: unknown): MenuCategory => {
    if (!isRawMenuCategory(category)) {
      console.warn('Invalid category data encountered:', category);
      return { name: 'Invalid Category', items: [] };
    }

    const items = (Array.isArray(category.items) ? category.items : []).map(
      (item: unknown): MenuItem => {
        if (!isRawMenuItem(item)) {
          console.warn('Invalid item data encountered:', item);
          return {
            name: 'Invalid Item',
            description: undefined,
            price: undefined,
            dietary_tags: [],
          };
        }

        let price: number | undefined = undefined;
        if (typeof item.price === 'number') {
          price = item.price;
        } else if (typeof item.price === 'string') {
          const parsedPrice = Number.parseFloat(item.price.replaceAll(/[^\d.-]/g, ''));
          if (!Number.isNaN(parsedPrice)) {
            price = parsedPrice;
          }
        }
        return {
          name: item.name ?? 'Unknown Item',
          description: item.description ?? undefined,
          price: price,
          dietary_tags: Array.isArray(item.dietary_tags) ? item.dietary_tags : [],
        };
      },
    );
    return {
      name: category.category ?? category.name ?? 'Uncategorized',
      items: items,
    };
  });
}
