import {
  handleFirecrawlStage,
  handleGeminiStage,
  handleSupabaseStage,
} from './stageHandlers';
import { ExtractedFoodTruckDetails, StageResult, PipelineRunResult } from '@/lib/types';

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
} | undefined> {
  const firecrawlStageOutput = await handleFirecrawlStage(url ?? '', rawText, logs);
  const { firecrawlResult, contentToProcess, sourceUrlForProcessing } = firecrawlStageOutput;

  if (firecrawlResult.status === 'Error') {
    return undefined;
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
} | undefined> {
  if (contentToProcess === undefined) {
    logs.push('Content to process is undefined before Gemini stage.');
    return undefined;
  }
  const geminiStageOutput = await handleGeminiStage(
    contentToProcess,
    sourceUrlForProcessing,
    logs,
  );
  const { geminiResult, extractedData } = geminiStageOutput;

  if (geminiResult.status === 'Error' || extractedData === undefined) {
    logs.push(`Gemini stage failed or returned no data. Status: ${geminiResult.status}, Data: ${JSON.stringify(extractedData)}`);
    return undefined;
  }
  return { geminiResult, extractedData };
}

// Helper function to process the Supabase stage
async function processSupabaseStage(
  extractedData: ExtractedFoodTruckDetails,
  sourceUrlForProcessing: string,
  isDryRun: boolean,
  logs: string[],
): Promise<StageResult | undefined> {
  const supabaseResult = await handleSupabaseStage(
    extractedData,
    sourceUrlForProcessing,
    isDryRun,
    logs,
  );

  if (supabaseResult.status === 'Error') {
    return undefined;
  }
  return supabaseResult;
}

// Helper function to handle the result of the Gemini stage
 
function handleGeminiStageResult(
  geminiStage: { geminiResult: StageResult; extractedData: ExtractedFoodTruckDetails | undefined } | undefined,
  firecrawlResult: StageResult,
  logs: string[],
): { status: 'Success'; geminiResult: StageResult; extractedData: ExtractedFoodTruckDetails } | { status: 'Error'; result: PipelineRunResult } {
  if (geminiStage === undefined) {
    return {
      status: 'Error',
      result: handleStageErrorAndReturn(
        firecrawlResult,
        { status: 'Error', error: 'Gemini stage failed' } as StageResult,
        undefined,
        logs,
      ),
    };
  }

  const { geminiResult, extractedData } = geminiStage;

  if (extractedData === undefined) {
    return {
      status: 'Error',
      result: handleStageErrorAndReturn(
        firecrawlResult,
        geminiResult,
        { status: 'Error', error: 'Extracted data is undefined after Gemini stage' } as StageResult,
        logs,
      ),
    };
  }
  return { status: 'Success', geminiResult, extractedData };
}

// Type guard for PipelineRunResult
function isPipelineRunResult(obj: unknown): obj is PipelineRunResult {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'overallStatus' in obj &&
    (obj as { overallStatus: unknown }).overallStatus === 'Error'
  );
}

// Define Gemini and Supabase stage helpers before runTestPipeline and ensure they are async if needed
async function handleGeminiStagePipeline(
  contentToProcess: string | undefined,
  sourceUrlForProcessing: string,
  logs: string[],
  firecrawlResult: StageResult,
): Promise<
  | { geminiResult: StageResult; extractedData: ExtractedFoodTruckDetails }
  | PipelineRunResult
> {
  const geminiStage = await processGeminiStage(
    contentToProcess,
    sourceUrlForProcessing,
    logs,
  );
  const geminiStageHandled = handleGeminiStageResult(
    geminiStage,
    firecrawlResult,
    logs,
  );
  if (geminiStageHandled.status === 'Error') {
    return geminiStageHandled.result;
  }
  return geminiStageHandled;
}

// Refactor handleSupabaseStagePipeline to accept a single config object
interface SupabaseStageConfig {
  extractedData: ExtractedFoodTruckDetails;
  sourceUrlForProcessing: string;
  isDryRun: boolean;
  logs: string[];
  firecrawlResult: StageResult;
  geminiResult: StageResult;
}
// Make handleSupabaseStagePipeline async and ensure it is awaited in runTestPipeline
async function handleSupabaseStagePipeline(config: SupabaseStageConfig): Promise<StageResult | PipelineRunResult> {
  const { extractedData, sourceUrlForProcessing, isDryRun, logs, firecrawlResult, geminiResult } = config;
  const supabaseStage = await processSupabaseStage(
    extractedData,
    sourceUrlForProcessing,
    isDryRun,
    logs,
  );
  if (supabaseStage === undefined) {
    return handleStageErrorAndReturn(
      firecrawlResult,
      geminiResult,
      { status: 'Error', error: 'Supabase stage failed' } as StageResult,
      logs,
    );
  }
  return supabaseStage;
}

// Helper function to handle the Firecrawl stage within the pipeline
async function executeFirecrawlStage(
  url: string,
  rawText: string | undefined,
  logs: string[],
): Promise<{ firecrawlResult: StageResult; contentToProcess: string | undefined; sourceUrlForProcessing: string } | PipelineRunResult> {
  const firecrawlStageOutput = await processFirecrawlStage(url ?? '', rawText, logs);
  if (!firecrawlStageOutput) {
    return handleStageErrorAndReturn(
      { status: 'Error', error: 'Firecrawl stage failed' } as StageResult,
      undefined,
      undefined,
      logs,
    );
  }
  return firecrawlStageOutput;
}

// Helper function to handle the Gemini stage within the pipeline
async function executeGeminiStage(
  contentToProcess: string | undefined,
  sourceUrlForProcessing: string,
  logs: string[],
  firecrawlResult: StageResult,
): Promise<{ geminiResult: StageResult; extractedData: ExtractedFoodTruckDetails } | PipelineRunResult> {
  const geminiStageHandled = await handleGeminiStagePipeline(contentToProcess, sourceUrlForProcessing, logs, firecrawlResult);
  if ('overallStatus' in geminiStageHandled) {
    return geminiStageHandled;
  }
  return geminiStageHandled;
}

// Helper function to handle the Supabase stage within the pipeline
async function executeSupabaseStage(
  config: SupabaseStageConfig,
): Promise<StageResult | PipelineRunResult> {
  const supabaseStage = await handleSupabaseStagePipeline(config);
  return supabaseStage;
}

// Generic helper to execute a pipeline stage and handle its result
async function executePipelineStage<
  T extends
    | {
        firecrawlResult: StageResult;
        contentToProcess: string | undefined;
        sourceUrlForProcessing: string;
      }
    | {
        geminiResult: StageResult;
        extractedData: ExtractedFoodTruckDetails;
      }
    | StageResult,
  Args extends unknown[],
>(
  stageFunction: (...args: Args) => Promise<T | PipelineRunResult>,
  args: Args,
): Promise<T | PipelineRunResult> {
  const output = await stageFunction(...args);
  return output;
}

// Extracted helper function for pipeline execution
export async function executePipeline(
  url: string | undefined,
  rawText: string | undefined,
  isDryRun: boolean,
  logs: string[],
): Promise<PipelineRunResult> {
  const firecrawlOutput = await executePipelineStage(executeFirecrawlStage, [
    url ?? '',
    rawText,
    logs,
  ]);
  if (isPipelineRunResult(firecrawlOutput)) {
    return firecrawlOutput;
  }
  const { firecrawlResult, contentToProcess, sourceUrlForProcessing } =
    firecrawlOutput;

  const geminiResultObject = await executeGeminiStage(
    contentToProcess,
    sourceUrlForProcessing,
    logs,
    firecrawlResult,
  );
  if (isPipelineRunResult(geminiResultObject)) {
    return geminiResultObject;
  }
  const { geminiResult, extractedData } = geminiResultObject;

  const supabaseOutput = await executePipelineStage(executeSupabaseStage, [
    {
      extractedData,
      sourceUrlForProcessing,
      isDryRun,
      logs,
      firecrawlResult,
      geminiResult,
    },
  ]);
  if (isPipelineRunResult(supabaseOutput)) {
    return supabaseOutput;
  }

  return {
    firecrawl: firecrawlResult,
    gemini: geminiResult,
    supabase: supabaseOutput,
    logs: [...logs, 'Test pipeline run completed successfully.'],
    overallStatus: 'Success',
  };
}
