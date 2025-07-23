import { gemini } from '../gemini';
import { firecrawl } from '../firecrawl';
import { ScrapingJobService } from '../supabase/services/scrapingJobService';
import { validateInputAndPrepare, buildTruckDataSchema, handleDuplicateCheck, finalizeJobStatus, } from './pipelineHelpers';
/**
 * Initiates web scraping for a specified food truck website.
 * @example
 * handleScraping("https://foodtruck.com", "job123")
 * Returns data object with markdown content
 * @param {string} targetUrl - The URL of the food truck website to scrape.
 * @param {string} jobId - The unique identifier for the scraping job.
 * @returns {Object} An object containing the scraped data, including markdown content.
 * @description
 *   - Utilizes firecrawl library to perform web scraping.
 *   - Calls handleJobFailure if scraping is unsuccessful or markdown content is missing.
 *   - Logs the progress and success of the scraping process in the console.
 */
async function handleScraping(targetUrl, jobId) {
    console.info(`Starting scrape for ${targetUrl}`);
    const scrapeResult = await firecrawl.scrapeFoodTruckWebsite(targetUrl);
    if (!scrapeResult.success || !scrapeResult.data?.markdown) {
        const error = scrapeResult.error ?? 'Scraping failed or markdown content not found';
        await handleJobFailure(jobId, error);
        throw new Error(error);
    }
    console.info(`Scraping successful for ${targetUrl}, proceeding to Gemini extraction.`);
    return scrapeResult.data;
}
/**
 * Handles the extraction of food truck details using Gemini and manages job failures.
 * @example
 * handleGeminiExtraction("sample_markdown", "http://example.com", "12345")
 * { name: "Sample Food Truck", location: "123 Main St." }
 * @param {string} markdown - The Markdown content containing food truck details.
 * @param {string} sourceUrl - The URL of the source from which details are extracted.
 * @param {string} jobId - The identifier for the job being processed.
 * @returns {Object} The extracted food truck details if successful.
 * @description
 *   - Utilizes Gemini to extract data from the provided Markdown content.
 *   - Handles failure scenarios by logging errors and updating job status.
 *   - Throws an error when extraction is unsuccessful.
 */
async function handleGeminiExtraction(markdown, sourceUrl, jobId) {
    const geminiResult = await gemini.extractFoodTruckDetailsFromMarkdown(markdown, sourceUrl);
    if (!geminiResult.success || !geminiResult.data) {
        const error = geminiResult.error ?? 'Gemini data extraction failed';
        await handleJobFailure(jobId, error);
        throw new Error(error);
    }
    console.info(`Gemini extraction successful for ${sourceUrl}.`);
    return geminiResult.data;
}
/**
* Handles the failure of a job by updating its status.
* @example
* handleJobFailure('job1234', 'Timeout error')
* // Output: Logs an error message and updates the job status.
* @param {string} jobId - The unique identifier of the job that failed.
* @param {string} error - The error message describing the reason for failure.
* @returns {Promise<void>} Resolves successfully once the job status is updated.
* @description
*   - Logs the error to the console for debugging purposes.
*   - Checks if the current job status is not already 'failed' before updating.
*   - Updates the job status to 'failed' if applicable, capturing any errors encountered.
*   - Manages any errors that arise during the status update attempt.
*/
async function handleJobFailure(jobId, error) {
    console.error(`Job ${jobId} failed:`, error);
    try {
        const currentJob = await ScrapingJobService.getJobsByStatus('all').then((jobs) => jobs.find((j) => j.id === jobId));
        if (currentJob && currentJob.status !== 'failed') {
            await ScrapingJobService.updateJobStatus(jobId, 'failed', { errors: [error] });
        }
    }
    catch (statusUpdateError) {
        console.error(`Error updating job ${jobId} status to failed:`, statusUpdateError);
    }
}
/**
 * Manages retry logic for a scraping job based on its current retry count.
 * @example
 * handleRetryLogic("job123")
 * undefined
 * @param {string} jobId - The unique identifier for the scraping job.
 * @returns {Promise<void>} Does not return a value but handles retries or logs errors.
 * @description
 *   - Utilizes ScrapingJobService to increment the retry count for the given job.
 *   - Determines whether to retry the job based on retry_count and max_retries properties.
 *   - Logs messages to inform about retry attempts or if max retries have been reached.
 *   - Catches and logs errors encountered during the retry process.
 */
async function handleRetryLogic(jobId) {
    try {
        const job = await ScrapingJobService.incrementRetryCount(jobId);
        if (job && typeof job.retry_count === 'number' && typeof job.max_retries === 'number') {
            if (job.retry_count < job.max_retries) {
                console.info(`Retrying job ${jobId} (attempt ${job.retry_count}/${job.max_retries})`);
                setTimeout(() => {
                    void processScrapingJob(jobId);
                }, 5000);
            }
            else {
                console.warn(`Job ${jobId} reached max retries (${job.max_retries}).`);
            }
        }
        else {
            console.error(`Job ${jobId}: Could not get valid retry_count or max_retries. Won't attempt retry.`);
        }
    }
    catch (retryError) {
        console.error(`Error during retry logic for job ${jobId}:`, retryError);
    }
}
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
export async function processScrapingJob(jobId) {
    try {
        const job = await ScrapingJobService.updateJobStatus(jobId, 'running');
        if (!job.target_url) {
            throw new Error('No target URL specified');
        }
        const scrapeData = await handleScraping(job.target_url, jobId);
        const extractedData = await handleGeminiExtraction(scrapeData.markdown, scrapeData.source_url ?? job.target_url, jobId);
        await ScrapingJobService.updateJobStatus(jobId, 'completed', {
            data_collected: extractedData,
            completed_at: new Date().toISOString(),
        });
        await createOrUpdateFoodTruck(jobId, extractedData, scrapeData.source_url ?? job.target_url);
        console.info(`Scraping job ${jobId} completed successfully and data processed.`);
    }
    catch {
        await handleRetryLogic(jobId);
    }
}
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
export async function createOrUpdateFoodTruck(jobId, extractedTruckData, sourceUrl) {
    try {
        const validation = await validateInputAndPrepare(jobId, extractedTruckData, sourceUrl);
        if (!validation.isValid) {
            return;
        }
        const truckData = buildTruckDataSchema(extractedTruckData, sourceUrl, validation.name);
        const truck = await handleDuplicateCheck(jobId, truckData, validation.name);
        await finalizeJobStatus(jobId, truck, sourceUrl);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Job ${jobId}: Error in createOrUpdateFoodTruck from ${sourceUrl ?? 'Unknown Source'}:`, error);
        await handleJobFailure(jobId, `Food truck data processing/saving failed: ${errorMessage}`);
    }
}
