import type { PipelineRunResult } from '@/lib/types';
export declare function executePipeline(url: string | undefined, rawText: string | undefined, isDryRun: boolean, logs: string[]): Promise<PipelineRunResult>;
