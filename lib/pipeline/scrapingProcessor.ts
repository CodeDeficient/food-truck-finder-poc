import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { ScrapingJobService } from '@/lib/supabase';
import { ExtractedFoodTruckDetails } from '../types';
import {
  validateInputAndPrepare,
  buildTruckDataSchema,
  handleDuplicateCheck,
  finalizeJobStatus,
} from './pipelineHelpers';

async function handleScraping(targetUrl: string, jobId: string) {
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

async function handleGeminiExtraction(markdown: string, sourceUrl: string, jobId: string) {
  const geminiResult = await gemini.extractFoodTruckDetailsFromMarkdown(markdown, sourceUrl);

  if (!geminiResult.success || !geminiResult.data) {
    const error = geminiResult.error ?? 'Gemini data extraction failed';
    await handleJobFailure(jobId, error);
    throw new Error(error);
  }

  console.info(`Gemini extraction successful for ${sourceUrl}.`);
  return geminiResult.data;
}

async function handleJobFailure(jobId: string, error: string) {
  console.error(`Job ${jobId} failed:`, error);
  try {
    const currentJob = await ScrapingJobService.getJobsByStatus('all').then(jobs =>
      jobs.find(j => j.id === jobId)
    );
    if (currentJob && currentJob.status !== 'failed') {
      await ScrapingJobService.updateJobStatus(jobId, 'failed', { errors: [error] });
    }
  } catch (statusUpdateError) {
    console.error(`Error updating job ${jobId} status to failed:`, statusUpdateError);
  }
}

async function handleRetryLogic(jobId: string) {
  try {
    const job = await ScrapingJobService.incrementRetryCount(jobId);
    if (job && typeof job.retry_count === 'number' && typeof job.max_retries === 'number') {
      if (job.retry_count < job.max_retries) {
        console.info(`Retrying job ${jobId} (attempt ${job.retry_count}/${job.max_retries})`);
        setTimeout(() => {
          void processScrapingJob(jobId);
        }, 5000);
      } else {
        console.warn(`Job ${jobId} reached max retries (${job.max_retries}).`);
      }
    } else {
      console.error(`Job ${jobId}: Could not get valid retry_count or max_retries. Won't attempt retry.`);
    }
  } catch (retryError) {
    console.error(`Error during retry logic for job ${jobId}:`, retryError);
  }
}

export async function processScrapingJob(jobId: string): Promise<void> {
  try {
    const job = await ScrapingJobService.updateJobStatus(jobId, 'running');
    if (!job.target_url) {
      throw new Error('No target URL specified');
    }

    const scrapeData = await handleScraping(job.target_url, jobId);
    const extractedData = await handleGeminiExtraction(scrapeData.markdown, scrapeData.source_url ?? job.target_url, jobId);

    await ScrapingJobService.updateJobStatus(jobId, 'completed', {
      data_collected: extractedData as unknown as Record<string, unknown>,
      completed_at: new Date().toISOString(),
    });

    await createOrUpdateFoodTruck(jobId, extractedData, scrapeData.source_url ?? job.target_url);

    console.info(`Scraping job ${jobId} completed successfully and data processed.`);
  } catch (error) {
    await handleRetryLogic(jobId);
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Job ${jobId}: Error in createOrUpdateFoodTruck from ${sourceUrl ?? 'Unknown Source'}:`, error);
    await handleJobFailure(jobId, `Food truck data processing/saving failed: ${errorMessage}`);
  }
}
