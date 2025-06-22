import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { ScrapingJobService } from '@/lib/supabase';
import { ExtractedFoodTruckDetails } from './types';
import {
  validateInputAndPrepare,
  buildTruckDataSchema,
  handleDuplicateCheck,
  finalizeJobStatus,
} from './pipeline/pipelineHelpers';

export async function processScrapingJob(jobId: string) {
  try {
    const job = await ScrapingJobService.updateJobStatus(jobId, 'running');

    if (job.target_url === undefined) {
      throw new Error('No target URL specified');
    }

    console.info(`Starting scrape for ${job.target_url}`);
    const scrapeResult = await firecrawl.scrapeFoodTruckWebsite(job.target_url);

    if (scrapeResult.success !== true || scrapeResult.data?.markdown === undefined) {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        errors: [scrapeResult.error ?? 'Scraping failed or markdown content not found'],
      });
      throw new Error(scrapeResult.error ?? 'Scraping failed or markdown content not found');
    }

    console.info(`Scraping successful for ${job.target_url}, proceeding to Gemini extraction.`);

    const geminiResult = await gemini.extractFoodTruckDetailsFromMarkdown(
      scrapeResult.data.markdown,
      scrapeResult.data.source_url ?? job.target_url,
    );

    if (geminiResult.success !== true || geminiResult.data === undefined) {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', {
        errors: [geminiResult.error ?? 'Gemini data extraction failed'],
      });
      throw new Error(geminiResult.error ?? 'Gemini data extraction failed');
    }

    console.info(`Gemini extraction successful for ${job.target_url}.`);

    await ScrapingJobService.updateJobStatus(jobId, 'completed', {
      data_collected: geminiResult.data as unknown as Record<string, unknown>,
      completed_at: new Date().toISOString(),
    });

    await createOrUpdateFoodTruck(
      jobId,
      geminiResult.data,
      scrapeResult.data.source_url ?? job.target_url,
    );

    console.info(`Scraping job ${jobId} completed successfully and data processed.`);
  } catch (error: unknown) {
    console.error(`Scraping job ${jobId} failed:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    try {
      const currentJobData = await ScrapingJobService.getJobsByStatus('all').then((jobs) =>
        jobs.find((j) => j.id === jobId),
      );
      if (currentJobData && currentJobData.status !== 'failed') {
        await ScrapingJobService.updateJobStatus(jobId, 'failed', {
          errors: [errorMessage],
        });
      } else if (!currentJobData) {
        console.error(`Could not fetch job ${jobId} to update status to failed.`);
      }
    } catch (statusUpdateError) {
      console.error(`Error updating job ${jobId} status to failed:`, statusUpdateError);
    }

    try {
      const jobAfterRetryIncrement = await ScrapingJobService.incrementRetryCount(jobId);
      if (
        jobAfterRetryIncrement !== undefined &&
        typeof jobAfterRetryIncrement.retry_count === 'number' &&
        typeof jobAfterRetryIncrement.max_retries === 'number'
      ) {
        if (jobAfterRetryIncrement.retry_count < jobAfterRetryIncrement.max_retries) {
          console.info(
            `Retrying job ${jobId} (attempt ${jobAfterRetryIncrement.retry_count}/${jobAfterRetryIncrement.max_retries})`,
          );
          setTimeout(() => {
            void processScrapingJob(jobId);
          }, 5000);
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

export async function createOrUpdateFoodTruck(
  jobId: string,
  extractedTruckData: ExtractedFoodTruckDetails,
  sourceUrl: string,
) {
  try {
    const validation = await validateInputAndPrepare(jobId, extractedTruckData, sourceUrl);
    if (!validation.isValid) {
      return;
    }

    const truckData = buildTruckDataSchema(extractedTruckData, sourceUrl, validation.name);

    const truck = await handleDuplicateCheck(jobId, truckData, validation.name);

    await finalizeJobStatus(jobId, truck, sourceUrl);
  } catch (error: unknown) {
    console.error(
      `Job ${jobId}: Error in createOrUpdateFoodTruck from ${sourceUrl ?? 'Unknown Source'}:`,
      error,
    );
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
