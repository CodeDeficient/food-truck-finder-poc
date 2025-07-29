export declare function runTestPipeline(body: {
    url?: string;
    rawText?: string;
    isDryRun?: boolean;
}, logs: string[]): Promise<PipelineRunResult>;
