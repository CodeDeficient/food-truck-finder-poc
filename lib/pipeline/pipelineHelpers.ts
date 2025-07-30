import type { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem } from '../types';
import { ScrapingJobService, FoodTruckService, type FoodTruck } from '../supabase';
import { DuplicatePreventionService } from '../data-quality/duplicatePrevention';

// Helper function to validate input and prepare basic data
/**
 * Validates input data and prepares food truck information.
 * @example
 * validateInputAndPrepare('job123', extractedTruckDataInstance, 'http://sourceurl.com')
 * { isValid: true, name: 'Food Truck Name' }
 * @param {string} jobId - The job identifier used for logging and job status updates.
 * @param {ExtractedFoodTruckDetails} extractedTruckData - Contains details about the food truck such as name and other attributes.
 * @param {string} sourceUrl - URL where the data was originally extracted from.
 * @returns {Promise<{ isValid: boolean; name: string }>} Result of validation with food truck name.
 * @description
 *   - Logs a warning if the source URL is missing, but continues process as it might not be critical.
 *   - Ensures the food truck name has a fallback value if it's missing in the extracted data.
 *   - Updates job status as 'failed' if validation does not pass.
 */
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

  // CRITICAL: If name is null, undefined, empty, or "Unknown Food Truck", discard the truck data
  if (!extractedTruckData.name || extractedTruckData.name.trim() === '' || extractedTruckData.name.trim().toLowerCase() === 'unknown food truck') {
    console.info(`Job ${jobId}: Discarding truck data - invalid name: "${extractedTruckData.name}"`);
    await ScrapingJobService.updateJobStatus(jobId, 'failed', {
      errors: ['Invalid food truck name - data discarded to prevent "Unknown Food Truck" entries'],
    });
    return { isValid: false, name: '' };
  }

  const name = extractedTruckData.name;
  console.info(
    `Job ${jobId}: Preparing to create/update food truck: ${name} from ${sourceUrl ?? 'Unknown Source'}`,
  );

  return { isValid: true, name };
}

// New helper function for operating hours
/**
 * Constructs a weekly operating hours object for a food truck.
 * @example
 * buildOperatingHours({ monday: { open: '8:00', close: '17:00' } })
 * // Returns: { monday: { open: '8:00', close: '17:00' }, tuesday: { closed: true }, ... }
 * @param {ExtractedFoodTruckDetails['operating_hours']} extractedOperatingHours - The raw operating hours extracted for each day of the week.
 * @returns {Object} An object containing operating hours for each day of the week, defaulting to closed if not provided.
 * @description
 *   - Days without specified operating hours default to closed.
 *   - Ensures consistency in data structure by providing default closed status.
 *   - Uses TypeScript's 'const' assertion for type safety on closed status.
 */
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
/**
 * Transforms and sanitizes an array of scheduled food truck locations.
 * @example
 * buildScheduledLocations([{ lat: 34.05, lng: -118.25, address: "123 Main St", start_time: "10:00", end_time: "14:00" }])
 * [{ lat: 34.05, lng: -118.25, address: "123 Main St", start_time: "10:00", end_time: "14:00", timestamp: "2023-10-19T14:00:00.000Z" }]
 * @param {ExtractedFoodTruckDetails['scheduled_locations']} scheduledLocations - Array of scheduled food truck location objects.
 * @returns {Array} Array of sanitized location objects.
 * @description
 *   - Ensures latitude and longitude values are numbers; defaults to 0 if not.
 *   - Adds a current timestamp to each location object in ISO format.
 *   - Uses nullish coalescing to ensure address, start_time, and end_time are either their values or undefined.
 */
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
/**
 * Constructs a FoodTruckSchema object from extracted food truck details.
 * @example
 * buildTruckDataSchema(extractedTruckData, 'http://sourceUrl.com', 'Truck Name')
 * { name: 'Truck Name', ... }
 * @param {ExtractedFoodTruckDetails} extractedTruckData - Object containing raw data extracted from a food truck resource.
 * @param {string} sourceUrl - URL source where the truck data was extracted from.
 * @param {string} name - Name of the food truck.
 * @returns {FoodTruckSchema} Fully constructed food truck schema ready for use.
 * @description
 *   - Ensures `description` and `price_range` are kept undefined if missing or null from extracted data.
 *   - Filters any non-string values from the `cuisine_type` array.
 *   - Ensures the `source_urls` field is always an array, even if empty or undefined.
 *   - Default verification status is 'pending' and a default data quality score is set to 0.5.
 */
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
/**
 * Checks for duplicates before creating a new food truck entry.
 * @example
 * handleDuplicateCheck('12345', truckDataObject, 'Awesome Food Truck')
 * // Returns a promise resolving to the created truck object or result from handling a duplicate.
 * @param {string} jobId - The unique identifier for the job process.
 * @param {FoodTruckSchema} truckData - The data schema representing the food truck details.
 * @param {string} name - The name of the food truck being processed.
 * @returns {Promise<FoodTruck>} Returns a promise that resolves to the created or existing food truck.
 * @description
 *   - Utilizes the DuplicatePreventionService to verify if a similar truck already exists.
 *   - If a duplicate is detected, delegates to a separate function to handle the duplicate scenario.
 *   - Logs errors encountered during the creation process.
 */
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
  } 
    // No duplicates found, create new truck
    const truck = await FoodTruckService.createTruck(truckData);
    if ('error' in truck) {
      console.error(`Job ${jobId}: Error creating new truck: ${truck.error}`);
      throw new Error(`Failed to create truck: ${truck.error}`);
    }
    return truck;
  
}

/**
 * Handles potential duplicate food truck entries by either merging, updating, or creating new truck data.
 * @example
 * handleDuplicate("job123", truckData, duplicateCheck)
 * // Returns the processed Food Truck object.
 * @param {string} jobId - Unique identifier for the job processing potential duplicates.
 * @param {FoodTruckSchema} truckData - Data representing the food truck to be processed.
 * @param {DuplicateCheckResult} duplicateCheck - Results from a duplicate check operation.
 * @returns {Promise<FoodTruck>} Returns a promise that resolves to a Food Truck object if successful.
 * @description
 *   - Uses duplicate check results to determine whether to merge, update, or create new truck data.
 *   - Logs information about the operation performed and potential duplicates found.
 *   - Contains error handling for each operation, including fallback creations in case of failures.
 *   - Provides warnings when creating new entries despite finding possible duplicates.
 */
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
    } 
      console.info(
        `Job ${jobId}: Merged data with existing truck: ${truck.name} (ID: ${truck.id})`,
      );
      return truck;
    
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
    } 
      console.info(`Job ${jobId}: Updated existing truck: ${truck.name} (ID: ${truck.id})`);
      return truck;
    
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
/**
* Logs the successful creation of a food truck and updates the job status to completed.
* @example
* finalizeJobStatus('12345', { name: 'Best Food Truck', id: 'FT123' }, 'http://example.com')
* // Logs: Job 12345: Successfully created food truck: Best Food Truck (ID: FT123) from http://example.com
* @param {string} jobId - Unique identifier of the scraping job.
* @param {FoodTruck} truck - Object representing the food truck that was created.
* @param {string} sourceUrl - URL from where the data was sourced.
* @returns {Promise<void>} Resolves when the job status is updated.
* @description
*   - Logs the truck creation event using `console.info`.
*   - Ensures the job status is set to 'completed' with the current timestamp.
*   - Uses a default source message if sourceUrl is not provided.
*/
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
/**
 * Constructs location data from extracted truck details.
 * @example
 * buildLocationData({
 *   current_location: {
 *     address: "123 Example St",
 *     city: "Sample City",
 *     state: "SC",
 *     zip_code: "12345",
 *     lat: 34.05,
 *     lng: -118.25,
 *     raw_text: "Raw Location Data"
 *   }
 * }) 
 * // Returns: {
 * //   lat: 34.05,
 * //   lng: -118.25,
 * //   address: "123 Example St, Sample City, SC, 12345",
 * //   timestamp: "2023-09-15T14:38:00.000Z"
 * // }
 * @param {ExtractedFoodTruckDetails} extractedTruckData - Details of the food truck, including its current location.
 * @returns {Object} Location data comprising latitude, longitude, formatted address, and current timestamp.
 * @description
 *   - Constructs a full address by combining address components.
 *   - Defaults latitude and longitude to 0 if not provided as numbers.
 *   - Uses raw text as address if address components are missing.
 *   - Generates an ISO 8601 timestamp for the current date and time.
 */
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
/**
 * Processes extracted food truck data into structured menu categories.
 * @example
 * processMenuData(sample_truck_data)
 * [ { name: 'Uncategorized', items: [{ name: 'Pizza', description: 'Cheese Pizza', price: 9.99, dietary_tags: ['vegetarian'] }] } ]
 * @param {ExtractedFoodTruckDetails} extractedTruckData - The extracted food truck data.
 * @returns {MenuCategory[]} Array of structured menu categories.
 * @description
 *   - Validates categories and items before mapping to a structured format.
 *   - Converts item price to number and handles invalid input gracefully.
 *   - Provides default values for category and item names in the case of invalid data.
 *   - Logs warnings for encountered invalid category or item data.
 */
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
