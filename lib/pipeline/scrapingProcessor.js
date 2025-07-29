import { firecrawl } from '../firecrawl.js';
import { gemini } from '../gemini.js';
import { ScrapingJobService } from '../supabase/services/scrapingJobService.js';
import { validateInputAndPrepare, buildTruckDataSchema, handleDuplicateCheck, finalizeJobStatus, } from './pipelineHelpers.js';
import { supabaseAdmin } from '../supabase/client.js';

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
 * Handles job failure by updating the job status in the database.
 * @example
 * handleJobFailure("job123", "Scraping failed")
 * undefined
 * @param {string} jobId - The unique identifier for the scraping job.
 * @param {string} errorMessage - The error message to be recorded.
 * @returns {Promise<void>} Resolves when the job status is updated.
 * @description
 *   - Updates the job status to 'failed' with the provided error message.
 *   - Logs the error for debugging purposes.
 */
async function handleJobFailure(jobId, errorMessage) {
    console.error(`Job ${jobId} failed: ${errorMessage}`);
    await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
    }).catch(error => {
        console.error(`Failed to update job ${jobId} status:`, error);
    });
}

/**
 * Processes extracted data through Gemini AI for food truck information extraction.
 * @example
 * handleGeminiExtraction("# Food Truck Content", "https://example.com", "job123")
 * Returns extracted food truck data object
 * @param {string} markdownContent - The markdown content extracted from the website.
 * @param {string} sourceUrl - The URL of the source website.
 * @param {string} jobId - The unique identifier for the scraping job.
 * @returns {Promise<ExtractedFoodTruckDetails>} The extracted food truck details.
 * @description
 *   - Uses the gemini library to extract structured food truck data from markdown content.
 *   - Handles errors by calling handleJobFailure and throwing the error.
 *   - Logs the progress of the AI extraction process.
 */
async function handleGeminiExtraction(markdownContent, sourceUrl, jobId) {
    console.info(`Processing content through Gemini AI for ${sourceUrl}`);
    try {
        const extractedData = await gemini.extractFoodTruckDetails(markdownContent, sourceUrl);
        console.info(`Gemini extraction successful for ${sourceUrl}`);
        return extractedData;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown Gemini extraction error';
        await handleJobFailure(jobId, `Gemini extraction failed: ${errorMessage}`);
        throw error;
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
        // Get job details
        const job = await ScrapingJobService.getJobById(jobId);
        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }
        if (job.status !== 'pending') {
            throw new Error(`Job ${jobId} is not in pending status: ${job.status}`);
        }
        
        // Check URL quality before processing
        const shouldProcess = await checkUrlQuality(job.target_url, jobId);
        if (!shouldProcess) {
            console.log(`⏭️  Skipping job ${jobId} - URL quality check failed: ${job.target_url}`);
            await ScrapingJobService.updateJobStatus(jobId, 'completed', {
                message: 'URL quality check failed - not a food truck related URL',
                completed_at: new Date().toISOString(),
            });
            return;
        }
        
        console.log(`🚀 Starting job ${jobId}: ${job.target_url}`);
        
        // Update job status to running
        await ScrapingJobService.updateJobStatus(jobId, 'running', {
            started_at: new Date().toISOString(),
        });
        
        if (!job.target_url) {
            throw new Error('No target URL specified');
        }
        
        // Perform scraping
        const scrapeData = await handleScraping(job.target_url, jobId);
        
        // Process through Gemini AI
        const extractedData = await handleGeminiExtraction(scrapeData.markdown, scrapeData.source_url ?? job.target_url, jobId);
        
        // Handle null names - discard instead of creating "Unknown Food Truck"
        if (extractedData.name === null || extractedData.name === undefined || extractedData.name.trim() === '') {
            console.warn(`Job ${jobId}: Discarding truck from ${job.target_url} due to null/empty name.`);
            await ScrapingJobService.updateJobStatus(jobId, 'completed', {
                data_collected: extractedData,
                completed_at: new Date().toISOString(),
                notes: 'Discarded due to null/empty name - not a food truck website',
            });
            
            // Update URL quality score for consistent failures
            await updateUrlQualityScore(job.target_url, 'failure');
            return;
        }
        
        // Create or update food truck
        await createOrUpdateFoodTruck(jobId, extractedData, scrapeData.source_url ?? job.target_url);
        
        // Update job status to completed
        await ScrapingJobService.updateJobStatus(jobId, 'completed', {
            data_collected: extractedData,
            completed_at: new Date().toISOString(),
        });
        
        console.info(`Scraping job ${jobId} completed successfully and data processed.`);
        
        // Update URL quality score on success
        await updateUrlQualityScore(job.target_url, 'success');
    }
    catch (error) {
        console.error(`❌ Job ${jobId} failed:`, error);
        await handleRetryLogic(jobId);
        throw error;
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

/**
 * Check URL quality before processing to prevent resource waste on non-food truck URLs
 */
async function checkUrlQuality(url, jobId) {
    try {
        if (!supabaseAdmin) {
            return true; // If no admin access, proceed with processing
        }
        
        // Check if URL exists in discovered_urls table
        const { data: discoveredUrl, error: discoveredError } = await supabaseAdmin
            .from('discovered_urls')
            .select('processing_attempts, quality_score, status')
            .eq('url', url)
            .limit(1);
        
        if (discoveredError) {
            console.warn(`Could not check URL quality for ${url}:`, discoveredError);
            return true; // Proceed if we can't check
        }
        
        if (discoveredUrl && discoveredUrl.length > 0) {
            const urlRecord = discoveredUrl[0];
            
            // Skip if blacklisted
            if (urlRecord.status === 'blacklisted') {
                console.info(`⏭️  Skipping blacklisted URL: ${url}`);
                return false;
            }
            
            // Skip if too many failed attempts
            if (urlRecord.processing_attempts >= 3 && urlRecord.quality_score < 0.3) {
                console.info(`⏭️  Skipping low quality URL (too many failures): ${url}`);
                // Blacklist the URL to prevent future processing
                await supabaseAdmin
                    .from('discovered_urls')
                    .update({ status: 'blacklisted', notes: 'Auto-blacklisted due to repeated failures' })
                    .eq('url', url);
                return false;
            }
        }
        
        return true;
    }
    catch (error) {
        console.warn(`Error checking URL quality for ${url}:`, error);
        return true; // Proceed if there's an error checking quality
    }
}

/**
 * Update URL quality score based on job success/failure
 */
async function updateUrlQualityScore(url, result) {
    try {
        if (!supabaseAdmin) {
            return;
        }
        
        // Get current URL record
        const { data: urlRecord, error: fetchError } = await supabaseAdmin
            .from('discovered_urls')
            .select('processing_attempts, quality_score')
            .eq('url', url)
            .limit(1);
        
        if (fetchError || !urlRecord || urlRecord.length === 0) {
            return;
        }
        
        const current = urlRecord[0];
        const currentAttempts = current.processing_attempts || 0;
        const currentScore = current.quality_score || 0.5;
        
        // Update based on result
        let newScore, newAttempts;
        if (result === 'success') {
            newScore = Math.min(1, currentScore + 0.2); // Increase quality score on success
            newAttempts = currentAttempts;
        } else {
            newScore = Math.max(0, currentScore - 0.3); // Decrease quality score on failure
            newAttempts = currentAttempts + 1;
        }
        
        // Update the record
        await supabaseAdmin
            .from('discovered_urls')
            .update({ 
                quality_score: newScore,
                processing_attempts: newAttempts,
                last_processed_at: new Date().toISOString()
            })
            .eq('url', url);
        
    } catch (error) {
        console.warn(`Could not update URL quality score for ${url}:`, error);
    }
}
