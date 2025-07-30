import type { ExtractedFoodTruckDetails, FoodTruckSchema } from '../types.js';
import { type FoodTruck } from '../supabase.js';
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
export declare function validateInputAndPrepare(jobId: string, extractedTruckData: ExtractedFoodTruckDetails, sourceUrl: string): Promise<{
    isValid: boolean;
    name: string;
}>;
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
export declare function buildTruckDataSchema(extractedTruckData: ExtractedFoodTruckDetails, sourceUrl: string, name: string): FoodTruckSchema;
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
export declare function handleDuplicateCheck(jobId: string, truckData: FoodTruckSchema, name: string): Promise<FoodTruck>;
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
export declare function finalizeJobStatus(jobId: string, truck: FoodTruck, sourceUrl: string): Promise<void>;
