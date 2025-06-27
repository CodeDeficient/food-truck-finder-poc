import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { FoodTruckService } from '@/lib/supabase';
import {
  ExtractedFoodTruckDetails,
  FirecrawlOutputData,
  GeminiResponse,
  StageResult,
} from '@/lib/types';
import { mapExtractedDataToTruckSchema } from './schema-mapper';

export async function handleFirecrawlStage(
  url: string,
  rawText: string | undefined,
  logs: string[],
): Promise<{
  firecrawlResult: StageResult;
  contentToProcess: string | undefined;
  sourceUrlForProcessing: string;
}> {
  let firecrawlResult: StageResult;
  let contentToProcess: string | undefined;
  let sourceUrlForProcessing: string = url ?? 'raw_text_input';

  if (typeof url === 'string' && url !== '' && (rawText === undefined || rawText === '')) {
    const { result, content, sourceUrl } = await performFirecrawlScrape(url, logs);
    firecrawlResult = result;
    contentToProcess = content;
    if (sourceUrl) sourceUrlForProcessing = sourceUrl;
  } else if (typeof rawText === 'string' && rawText !== '') {
    logs.push('Using raw text input for processing.');
    contentToProcess = rawText;
    firecrawlResult = {
      status: 'Skipped (Raw Text Provided)',
      details: `Raw text length: ${rawText.length}`,
    };
  } else {
    logs.push('No URL or raw text provided.');
    throw new Error('Either a URL or raw text must be provided for testing.');
  }

  if (!contentToProcess) {
    logs.push('Content to process is empty after Firecrawl/raw text stage.');
    throw new Error('Content to process is empty.');
  }

  return { firecrawlResult, contentToProcess, sourceUrlForProcessing };
}

async function performFirecrawlScrape(
  url: string,
  logs: string[],
): Promise<{
  result: StageResult;
  content?: string;
  sourceUrl?: string;
}> {
  logs.push(`Starting Firecrawl scrape for URL: ${url}`);
  try {
    const fcOutput: GeminiResponse<FirecrawlOutputData> =
      await firecrawl.scrapeFoodTruckWebsite(url);
    if (fcOutput.success === true && typeof fcOutput.data?.markdown === 'string' && fcOutput.data.markdown !== '') {
      return {
        result: {
          status: 'Success',
          rawContent: fcOutput.data.markdown,
          metadata: { name: fcOutput.data.name, source_url: fcOutput.data.source_url },
          details: `Markdown length: ${fcOutput.data.markdown.length}`,
        },
        content: fcOutput.data.markdown,
        sourceUrl: fcOutput.data.source_url ?? url,
      };
    } else {
      throw new Error(fcOutput.error ?? 'Firecrawl failed to return markdown.');
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during Firecrawl scrape.';
    logs.push(`Firecrawl error: ${errorMessage}`);
    return { result: { status: 'Error', error: errorMessage } };
  }
}

export async function handleGeminiStage(
  contentToProcess: string,
  sourceUrlForProcessing: string,
  logs: string[],
): Promise<{ geminiResult: StageResult; extractedData: ExtractedFoodTruckDetails | undefined }> {
  let geminiResult: StageResult;
  let extractedData: ExtractedFoodTruckDetails | undefined;

  logs.push('Starting Gemini processing.');
  try {
    const geminiOutput: GeminiResponse<ExtractedFoodTruckDetails> =
      await gemini.extractFoodTruckDetailsFromMarkdown(contentToProcess, sourceUrlForProcessing);
    if (geminiOutput.success === true && geminiOutput.data != undefined) {
      extractedData = geminiOutput.data;
      geminiResult = {
        status: 'Success',
        data: geminiOutput.data,
        tokensUsed: geminiOutput.tokensUsed,
        prompt: geminiOutput.promptSent,
        details: 'Gemini extraction successful.',
      };
      logs.push('Gemini processing successful.');
    } else {
      throw new Error(geminiOutput.error ?? 'Gemini processing failed to return data.');
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during Gemini processing.';
    logs.push(`Gemini error: ${errorMessage}`);
    geminiResult = { status: 'Error', error: errorMessage };
  }
  return { geminiResult, extractedData };
}

export async function handleSupabaseStage(
  extractedData: ExtractedFoodTruckDetails,
  sourceUrlForProcessing: string,
  isDryRun: boolean,
  logs: string[],
): Promise<StageResult> {
  let supabaseResult: StageResult = { status: 'Skipped' };

  logs.push('Preparing for Supabase interaction.');
  try {
    const truckDataToSave = mapExtractedDataToTruckSchema(
      extractedData,
      sourceUrlForProcessing,
      isDryRun,
    );
    supabaseResult = { status: 'Prepared', preparedData: truckDataToSave };

    if (isDryRun) {
      supabaseResult.status = 'Success (Dry Run)';
      supabaseResult.details = 'Dry Run: Data was prepared but not saved.';
      logs.push('Supabase interaction skipped (Dry Run).');
    } else {
      logs.push('Attempting to save to Supabase (Dry Run is FALSE).');
      const createdTruck = await FoodTruckService.createTruck(truckDataToSave);
      if (createdTruck == undefined) {
        throw new Error('Failed to create truck in Supabase.');
      }
      supabaseResult = {
        status: 'Success (Saved)',
        preparedData: truckDataToSave,
        recordId: createdTruck.id,
        details: `Truck data saved with ID: ${createdTruck.id}`,
      };
      logs.push(`Data saved to Supabase. Record ID: ${createdTruck.id}`);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during Supabase interaction.';
    logs.push(`Supabase interaction error: ${errorMessage}`);
    supabaseResult = { ...supabaseResult, status: 'Error', error: errorMessage };
  }
  return supabaseResult;
}
