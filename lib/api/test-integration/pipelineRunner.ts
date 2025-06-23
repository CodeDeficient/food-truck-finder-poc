import { NextResponse } from 'next/server';
import {
  handleFirecrawlStage,
  handleGeminiStage,
  handleSupabaseStage,
} from './stage-handlers';
import { StageResult } from '@/lib/types';

export async function runTestPipeline(
  body: { url?: string; rawText?: string; isDryRun?: boolean },
  logs: string[],
) {
  const { url, rawText, isDryRun = true } = body;
  logs.push(`Request body: ${JSON.stringify(body)}`);

  const firecrawlStageOutput = await handleFirecrawlStage(url ?? '', rawText, logs);
  const { firecrawlResult, contentToProcess, sourceUrlForProcessing } = firecrawlStageOutput;

  if (firecrawlResult.status === 'Error') {
    return {
      firecrawl: firecrawlResult,
      logs,
      overallStatus: 'Error',
    };
  }

  const geminiStageOutput = await handleGeminiStage(
    contentToProcess!,
    sourceUrlForProcessing,
    logs,
  );
  const { geminiResult, extractedData } = geminiStageOutput;

  if (geminiResult.status === 'Error' || !extractedData) {
    return {
      firecrawl: firecrawlResult,
      gemini: geminiResult,
      logs,
      overallStatus: 'Error',
    };
  }

  const supabaseResult = await handleSupabaseStage(
    extractedData,
    sourceUrlForProcessing,
    isDryRun,
    logs,
  );

  if (supabaseResult.status === 'Error') {
    return {
      firecrawl: firecrawlResult,
      gemini: geminiResult,
      supabase: supabaseResult,
      logs,
      overallStatus: 'Error',
    };
  }

  logs.push('Test pipeline run completed successfully.');
  return {
    firecrawl: firecrawlResult,
    gemini: geminiResult,
    supabase: supabaseResult,
    logs,
    overallStatus: 'Success',
  };
}
