export declare function handleFirecrawlStage(url: string, rawText: string | undefined, logs: string[]): Promise<{
    firecrawlResult: StageResult;
    contentToProcess: string | undefined;
    sourceUrlForProcessing: string;
}>;
export declare function handleGeminiStage(contentToProcess: string, sourceUrlForProcessing: string, logs: string[]): Promise<{
    geminiResult: StageResult;
    extractedData: ExtractedFoodTruckDetails | undefined;
}>;
export declare function handleSupabaseStage(extractedData: ExtractedFoodTruckDetails, sourceUrlForProcessing: string, isDryRun: boolean, logs: string[]): Promise<StageResult>;
