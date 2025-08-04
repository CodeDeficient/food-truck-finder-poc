import type { ExtractedFoodTruckDetails } from '../types.js';
/**
 * Processes a scraping job by managing its lifecycle and data extraction.
 * @example
 * processScrapingJob('12345')
 * // Scraping job 12345 completed successfully and data processed.
 * @param {string} jobId - The unique identifier for the scraping job.
 * @returns {Promise<void>} Resolves when the job is completed or retried.
 * @description
 *   - Updates the scraping job status to 'running' at the beginning and 'completed' at the end of the process.
 *   - Performs data scraping and extraction using job's target URL.
 *   - Handles scenarios where a target URL is not specified, resulting in an error.
 *   - Implements retry logic in case of failure during the job processing.
 */
export declare function processScrapingJob(jobId: string): Promise<void>;
/**
* Creates or updates a food truck entry based on extracted data and handles job processing.
* @example
* createOrUpdateFoodTruck('123abc', extractedTruckData, 'http://example.com')
* undefined
* @param {string} jobId - Unique identifier for the job being processed.
* @param {ExtractedFoodTruckDetails} extractedTruckData - Object containing details about the food truck extracted from a source.
* @param {string} sourceUrl - The URL from which the food truck data was extracted.
* @returns {Promise<void>} Resolves when processing is complete; returns nothing explicitly.
* @description
*   - Validates the input data before proceeding with creation or update.
*   - Applies a duplicate check mechanism to avoid redundant entries.
*   - Finalizes the job status, ensuring proper completion or failure handling.
*   - Logs error details for troubleshooting job processing issues.
*/
export declare function createOrUpdateFoodTruck(jobId: string, extractedTruckData: ExtractedFoodTruckDetails, sourceUrl: string): Promise<void>;
