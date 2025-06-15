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
  if (!extractedData || typeof extractedData !== 'object') {
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
    menu: (extractedData.menu ?? []).map((category: MenuCategory) => ({
      name: category.name ?? 'Uncategorized',
      items: (category.items ?? []).map((item: MenuItem) => ({
        name: item.name ?? 'Unknown Item',
        description: item.description ?? undefined,
        price:
          typeof item.price === 'number' || typeof item.price === 'string' ? item.price : undefined,
        dietary_tags: item.dietary_tags ?? [],
      })),
    })),
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

  if (url && !rawText) {
    logs.push(`Starting Firecrawl scrape for URL: ${url}`);
    try {
      const fcOutput: GeminiResponse<FirecrawlOutputData> =
        await firecrawl.scrapeFoodTruckWebsite(url);
      if (fcOutput.success && fcOutput.data?.markdown) {
        contentToProcess = fcOutput.data.markdown;
        sourceUrlForProcessing = fcOutput.data.source_url || url;
        firecrawlResult = {
          status: 'Success',
          rawContent: fcOutput.data.markdown,
          metadata: { name: fcOutput.data.name, source_url: fcOutput.data.source_url },
          details: `Markdown length: ${fcOutput.data.markdown.length}`,
        };
        logs.push('Firecrawl scrape successful.');
      } else {
        throw new Error(fcOutput.error ?? 'Firecrawl failed to return markdown.');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unknown error occurred during Firecrawl scrape.';
      logs.push(`Firecrawl error: ${errorMessage}`);
      firecrawlResult = { status: 'Error', error: errorMessage };
    }
  } else if (rawText) {
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

async function handleGeminiStage(
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

async function handleSupabaseStage(
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
      if (!createdTruck) {
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

export function POST(request: NextRequest) {
  const logs: string[] = [];
  logs.push('Test pipeline run started.');

  let firecrawlResult: StageResult = { status: 'Incomplete' };
  let geminiResult: StageResult = { status: 'Incomplete' };
  let supabaseResult: StageResult = { status: 'Incomplete' };
  let overallStatus = 'Incomplete';

  try {
    const body = (await request.json()) as { url?: string; rawText?: string; isDryRun?: boolean };
    const { url, rawText, isDryRun = true } = body;
    logs.push(`Request body: ${JSON.stringify(body)}`);

    const firecrawlStageOutput = await handleFirecrawlStage(url ?? '', rawText, logs);
    firecrawlResult = firecrawlStageOutput.firecrawlResult;
    const { contentToProcess, sourceUrlForProcessing } = firecrawlStageOutput;

    if (firecrawlResult.status === 'Error') {
      overallStatus = 'Error';
      return NextResponse.json(
        { results: { firecrawl: firecrawlResult, logs, overallStatus } },
        { status: 200 },
      );
    }

    const geminiStageOutput = await handleGeminiStage(
      contentToProcess!,
      sourceUrlForProcessing,
      logs,
    );
    geminiResult = geminiStageOutput.geminiResult;
    const { extractedData } = geminiStageOutput;

    if (geminiResult.status === 'Error' || !extractedData) {
      overallStatus = 'Error';
      return NextResponse.json(
        { results: { firecrawl: firecrawlResult, gemini: geminiResult, logs, overallStatus } },
        { status: 200 },
      );
    }

    supabaseResult = await handleSupabaseStage(
      extractedData,
      sourceUrlForProcessing,
      isDryRun,
      logs,
    );

    if (supabaseResult.status === 'Error') {
      overallStatus = 'Error';
      return NextResponse.json(
        {
          results: {
            firecrawl: firecrawlResult,
            gemini: geminiResult,
            supabase: supabaseResult,
            logs,
            overallStatus,
          },
        },
        { status: 200 },
      );
    }

    overallStatus = 'Success';
    logs.push('Test pipeline run completed successfully.');
    return NextResponse.json({
      results: {
        firecrawl: firecrawlResult,
        gemini: geminiResult,
        supabase: supabaseResult,
        logs,
        overallStatus,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during overall test pipeline run.';
    logs.push(`Overall test pipeline error: ${errorMessage}`);
    return NextResponse.json(
      {
        message: 'Test pipeline run failed.',
        error: errorMessage,
        results: {
          firecrawl: firecrawlResult,
          gemini: geminiResult,
          supabase: supabaseResult,
          logs,
          overallStatus: 'Error',
        },
      },
      { status: 200 },
    );
  }
}
