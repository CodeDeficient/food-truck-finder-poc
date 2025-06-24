import {
  handleFirecrawlStage,
  handleGeminiStage,
  handleSupabaseStage,
} from './stageHandlers';
import { StageResult, ExtractedFoodTruckDetails } from '@/lib/types';

interface PipelineRunResult {
  firecrawl?: StageResult;
  gemini?: StageResult;
  supabase?: StageResult;
  logs: string[];
  overallStatus: 'Success' | 'Error';
}

// Helper function to handle stage errors and return a consistent error object
function handleStageErrorAndReturn(
  firecrawlResult: StageResult,
  geminiResult: StageResult | undefined,
  supabaseResult: StageResult | undefined,
  logs: string[],
): PipelineRunResult {
  return {
    firecrawl: firecrawlResult,
    gemini: geminiResult,
    supabase: supabaseResult,
    logs,
    overallStatus: 'Error',
  };
}

// Helper function to process the Firecrawl stage
async function processFirecrawlStage(
  url: string,
  rawText: string | undefined,
  logs: string[],
): Promise<{
  firecrawlResult: StageResult;
  contentToProcess: string | undefined;
  sourceUrlForProcessing: string;
} | null> {
  const firecrawlStageOutput = await handleFirecrawlStage(url ?? '', rawText, logs);
  const { firecrawlResult, contentToProcess, sourceUrlForProcessing } = firecrawlStageOutput;

  if (firecrawlResult.status === 'Error') {
    return null;
  }
  return { firecrawlResult, contentToProcess, sourceUrlForProcessing };
}

// Helper function to process the Gemini stage
async function processGeminiStage(
  contentToProcess: string | undefined,
  sourceUrlForProcessing: string,
  logs: string[],
): Promise<{
  geminiResult: StageResult;
  extractedData: ExtractedFoodTruckDetails | undefined;
} | null> {
  if (!contentToProcess) {
    logs.push('Content to process is undefined before Gemini stage.');
    return null;
  }
  const geminiStageOutput = await handleGeminiStage(
    contentToProcess,
    sourceUrlForProcessing,
    logs,
  );
  const { geminiResult, extractedData } = geminiStageOutput;

  if (geminiResult.status === 'Error' || extractedData === undefined) {
    logs.push(`Gemini stage failed or returned no data. Status: ${geminiResult.status}, Data: ${extractedData}`);
    return null;
  }
  return { geminiResult, extractedData };
}

// Helper function to process the Supabase stage
async function processSupabaseStage(
  extractedData: ExtractedFoodTruckDetails,
  sourceUrlForProcessing: string,
  isDryRun: boolean,
  logs: string[],
): Promise<StageResult | null> {
  const supabaseResult = await handleSupabaseStage(
    extractedData,
    sourceUrlForProcessing,
    isDryRun,
    logs,
  );

  if (supabaseResult.status === 'Error') {
    return null;
  }
  return supabaseResult;
}

export async function runTestPipeline(
  body: { url?: string; rawText?: string; isDryRun?: boolean },
  logs: string[],
): Promise<PipelineRunResult> {
  const { url, rawText, isDryRun = true } = body;
  logs.push(`Request body: ${JSON.stringify(body)}`);

  const firecrawlStage = await processFirecrawlStage(url ?? '', rawText, logs);
  if (firecrawlStage === null) {
    return handleStageErrorAndReturn(
      { status: 'Error', error: 'Firecrawl stage failed' },
      undefined,
      undefined,
      logs,
    );
  }
  const { firecrawlResult, contentToProcess, sourceUrlForProcessing } = firecrawlStage;

  const geminiStage = await processGeminiStage(
    contentToProcess,
    sourceUrlForProcessing,
    logs,
  );
  // Destructure immediately to make them available for subsequent checks
  const { geminiResult, extractedData } = geminiStage || {}; // Provide default empty object if geminiStage is null

  if (geminiStage === null) {
    return handleStageErrorAndReturn(
      firecrawlResult,
      { status: 'Error', error: 'Gemini stage failed' },
      undefined,
      logs,
    );
  }

  if (extractedData === undefined) {
    return handleStageErrorAndReturn(
      firecrawlResult,
      geminiResult,
      { status: 'Error', error: 'Extracted data is undefined after Gemini stage' },
      logs,
    );
  }

  const supabaseStage = await processSupabaseStage(
    extractedData,
    sourceUrlForProcessing,
    isDryRun,
    logs,
  );
  if (supabaseStage === null) {
    return handleStageErrorAndReturn(
      firecrawlResult,
      geminiResult,
      { status: 'Error', error: 'Supabase stage failed' },
      logs,
    );
  }
  const supabaseResult = supabaseStage;

  logs.push('Test pipeline run completed successfully.');
  return {
    firecrawl: firecrawlResult,
    gemini: geminiResult,
    supabase: supabaseResult,
    logs,
    overallStatus: 'Success',
  };
}
