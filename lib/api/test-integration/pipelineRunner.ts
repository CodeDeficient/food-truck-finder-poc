import { executePipeline } from './pipelineRunnerHelpers.js';
import type { PipelineRunResult } from '@/lib/types';

// Extracted helper function for pipeline execution
export async function runTestPipeline(
  body: { url?: string; rawText?: string; isDryRun?: boolean },
  logs: string[],
): Promise<PipelineRunResult> {
  const { url, rawText, isDryRun = true } = body;

  return executePipeline(url, rawText, isDryRun, logs);
}
