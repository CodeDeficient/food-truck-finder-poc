import { executePipeline } from './pipelineRunnerHelpers';
// Extracted helper function for pipeline execution
export async function runTestPipeline(body, logs) {
    const { url, rawText, isDryRun = true } = body;
    return executePipeline(url, rawText, isDryRun, logs);
}
