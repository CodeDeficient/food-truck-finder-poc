// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextResponse, NextRequest } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { FoodTruckService } from '@/lib/supabase';
import {
  ExtractedFoodTruckDetails,
  FoodTruckSchema,
  FirecrawlOutputData,
  GeminiResponse,
  StageResult,
  MenuCategory,
  MenuItem,
} from '@/lib/types';

// Helper function to simulate parts of createOrUpdateFoodTruck for dry runs or direct mapping display
// This is a simplified version for testing; actual createOrUpdateFoodTruck handles job IDs etc.
function mapExtractedDataToTruckSchema(
  extractedData: ExtractedFoodTruckDetails,
  sourceUrl: string,
  isDryRun: boolean,
): FoodTruckSchema {
  if (extractedData == undefined || typeof extractedData !== 'object') {
    throw new Error('Invalid extractedData for mapping.');
  }

  const name = extractedData.name ?? 'Unknown Test Truck';
  const locationData = extractedData.current_location ?? {};
  const fullAddress = [
    locationData.address,
    locationData.city,
    locationData.state,
    locationData.zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  const truckData: FoodTruckSchema = {
    name: name,
    description: extractedData.description ?? undefined,
    current_location: {
      lat: locationData.lat ?? 0,
      lng: locationData.lng ?? 0,
      address: fullAddress ?? (locationData.raw_text ?? undefined),
      timestamp: new Date().toISOString(),
    },
    scheduled_locations: extractedData.scheduled_locations ?? undefined,
    operating_hours: extractedData.operating_hours ?? undefined,
    menu: _buildMenuSchema(extractedData.menu),
    contact_info: extractedData.contact_info ?? undefined,
    social_media: extractedData.social_media ?? undefined,
    cuisine_type: extractedData.cuisine_type ?? [],
    price_range: extractedData.price_range ?? undefined,
    specialties: extractedData.specialties ?? [],
    data_quality_score: isDryRun ? 0.5 : 0.6, // Differentiate test/dry run
    verification_status: 'pending',
    source_urls: [sourceUrl].filter(Boolean),
    last_scraped_at: new Date().toISOString(),
    ...(isDryRun && { test_run_flag: true }), // Add a flag for actual test saves if needed
  };
  return truckData;
}

function _buildMenuSchema(extractedMenu: MenuCategory[] | undefined): FoodTruckSchema['menu'] {
  if (!Array.isArray(extractedMenu)) {
    return [];
  }
  return extractedMenu.map((category: MenuCategory) => ({
    name: category.name ?? 'Uncategorized',
    items: (category.items ?? []).map((item: MenuItem) => ({
      name: item.name ?? 'Unknown Item',
      description: item.description ?? undefined,
      price: typeof item.price === 'number' || typeof item.price === 'string' ? item.price : undefined,
      dietary_tags: item.dietary_tags ?? [],
    })),
  }));
}

async function _scrapeUrlWithFirecrawl(url: string, logs: string[]): Promise<{
  success: boolean;
  content?: string;
  sourceUrl?: string;
  firecrawlResult: StageResult;
}> {
  logs.push(`Starting Firecrawl scrape for URL: ${url}`);
  try {
    const fcOutput: GeminiResponse<FirecrawlOutputData> =
      await firecrawl.scrapeFoodTruckWebsite(url);
    if (fcOutput.success && fcOutput.data?.markdown != undefined && fcOutput.data.markdown != '') {
      logs.push('Firecrawl scrape successful.');
      return {
        success: true,
        content: fcOutput.data.markdown,
        sourceUrl: fcOutput.data.source_url ?? url,
        firecrawlResult: {
          status: 'Success',
          rawContent: fcOutput.data.markdown,
          metadata: { name: fcOutput.data.name, source_url: fcOutput.data.source_url },
          details: `Markdown length: ${fcOutput.data.markdown.length}`,
        },
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
    return {
      success: false,
      firecrawlResult: { status: 'Error', error: errorMessage },
    };
  }
}

async function handleFirecrawlStage(
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

  if (url && (!rawText || rawText.trim() === '')) { // Prioritize URL if provided and rawText is empty
    const scrapeOutcome = await _scrapeUrlWithFirecrawl(url, logs);
    firecrawlResult = scrapeOutcome.firecrawlResult;
    if (scrapeOutcome.success) {
      contentToProcess = scrapeOutcome.content;
      sourceUrlForProcessing = scrapeOutcome.sourceUrl ?? url;
    }
  } else if (rawText && rawText.trim() !== '') {
    logs.push('Using raw text input for processing.');
    contentToProcess = rawText;
    firecrawlResult = {
      status: 'Skipped (Raw Text Provided)',
      details: `Raw text length: ${rawText.length}`,
    };
    sourceUrlForProcessing = 'raw_text_input';
  } else {
    logs.push('No URL or raw text provided.');
    firecrawlResult = { status: 'Error', error: 'Either a URL or raw text must be provided.' };
    // contentToProcess remains undefined, which will be caught by the check below
  }

  // If contentToProcess is still undefined and we didn't explicitly skip or error, it's an issue.
  if (!contentToProcess && firecrawlResult.status === 'Success') {
    logs.push('Firecrawl successful but no content extracted.');
    firecrawlResult = { ...firecrawlResult, status: 'Error', error: 'Scrape successful but no content extracted.'};
  } else if (!contentToProcess && firecrawlResult.status !== 'Error' && firecrawlResult.status !== 'Skipped (Raw Text Provided)') {
    // This case handles if something went wrong and content is missing without an error status
    logs.push('Content to process is unexpectedly empty.');
    firecrawlResult = { status: 'Error', error: 'Content to process is unexpectedly empty.' };
  }

  // If after all logic, contentToProcess is empty AND it wasn't a deliberate skip or an already caught error, then throw.
  // This ensures that if a stage "succeeded" but produced no output, it's treated as an error before Gemini.
  if ((contentToProcess == undefined || contentToProcess.trim() === '') && firecrawlResult.status === 'Success') {
    throw new Error('Content to process is empty after a successful Firecrawl stage.');
  }


  return { firecrawlResult, contentToProcess, sourceUrlForProcessing };
}

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
    if (geminiOutput.success && geminiOutput.data) {
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

// Orchestrator function for the test pipeline
async function _runTestPipeline(url?: string, rawText?: string, isDryRun: boolean = true): Promise<{ responseJson: object, status: number }> {
  const logs: string[] = [];
  logs.push('Test pipeline run started.');
  logs.push(`Request params: url=${url ?? 'undefined'}, rawText provided=${!!rawText}, isDryRun=${isDryRun}`);

  let firecrawlResult: StageResult = { status: 'Incomplete' };
  let geminiResult: StageResult = { status: 'Incomplete' };
  let supabaseResult: StageResult = { status: 'Incomplete' };
  let overallStatus = 'Incomplete';
  let extractedData;

  try {
    const firecrawlStageOutput = await handleFirecrawlStage(url ?? '', rawText, logs);
    firecrawlResult = firecrawlStageOutput.firecrawlResult;
    const { contentToProcess, sourceUrlForProcessing } = firecrawlStageOutput;

    if (firecrawlResult.status === 'Error' || !contentToProcess) {
      overallStatus = 'Error';
      logs.push(`Pipeline ended prematurely after Firecrawl stage due to error or no content: ${firecrawlResult.error ?? 'No content from Firecrawl'}`);
      return { responseJson: { results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus } }, status: 200 };
    }

    const geminiStageOutput = await handleGeminiStage(
      contentToProcess,
      sourceUrlForProcessing,
      logs,
    );
    geminiResult = geminiStageOutput.geminiResult;
    extractedData = geminiStageOutput.extractedData;

    if (geminiResult.status === 'Error' || !extractedData) {
      overallStatus = 'Error';
      logs.push(`Pipeline ended prematurely after Gemini stage due to error or no data: ${geminiResult.error ?? 'No data from Gemini'}`);
      return { responseJson: { results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus } }, status: 200 };
    }

    supabaseResult = await handleSupabaseStage(
      extractedData,
      sourceUrlForProcessing,
      isDryRun,
      logs,
    );

    if (supabaseResult.status === 'Error') {
      overallStatus = 'Error';
      logs.push(`Pipeline ended prematurely after Supabase stage due to error: ${supabaseResult.error}`);
      return { responseJson: { results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus } }, status: 200 };
    }

    overallStatus = 'Success';
    logs.push('Test pipeline run completed successfully.');
    return {
      responseJson: { results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus } },
      status: 200
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during overall test pipeline run.';
    logs.push(`Overall test pipeline error: ${errorMessage}`);
    return {
      responseJson: {
        message: 'Test pipeline run failed.',
        error: errorMessage,
        results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus: 'Error' },
      },
      status: 200
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { url?: string; rawText?: string; isDryRun?: boolean };
    const { url, rawText, isDryRun = true } = body;

    const { responseJson, status } = await _runTestPipeline(url, rawText, isDryRun);
    return NextResponse.json(responseJson, { status });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred in POST handler.';
    return NextResponse.json(
      { message: 'Test pipeline run failed critically.', error: errorMessage, results: { logs: ['POST handler critical error'], overallStatus: 'Error' } },
      { status: 500 }
    );
  }
}
