import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { FoodTruckService } from '@/lib/supabase';
import { mapExtractedDataToTruckSchema } from './schemaMapper';
function getErrorMessage(error, fallback) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return fallback;
}
async function handleUrlScrape(url, logs) {
    logs.push(`Starting Firecrawl scrape for URL: ${url}`);
    try {
        const fcOutput = await firecrawl.scrapeFoodTruckWebsite(url);
        if (fcOutput.success === true &&
            fcOutput.data?.markdown !== undefined &&
            fcOutput.data?.markdown !== '') {
            return {
                contentToProcess: fcOutput.data.markdown,
                sourceUrlForProcessing: fcOutput.data.source_url ?? url,
                firecrawlResult: {
                    status: 'Success',
                    rawContent: fcOutput.data.markdown,
                    metadata: { name: fcOutput.data.name, source_url: fcOutput.data.source_url },
                    details: `Markdown length: ${fcOutput.data.markdown.length}`,
                },
            };
        }
        else {
            throw new Error(fcOutput.error ?? 'Firecrawl failed to return markdown.');
        }
    }
    catch (error) {
        const errorMessage = getErrorMessage(error, 'An unknown error occurred during Firecrawl scrape.');
        logs.push(`Firecrawl error: ${errorMessage}`);
        return {
            firecrawlResult: { status: 'Error', error: errorMessage },
            contentToProcess: undefined,
            sourceUrlForProcessing: url,
        };
    }
}
function handleRawTextProcessing(rawText, logs) {
    logs.push('Using raw text input for processing.');
    return {
        contentToProcess: rawText,
        sourceUrlForProcessing: 'raw_text_input',
        firecrawlResult: {
            status: 'Skipped (Raw Text Provided)',
            details: `Raw text length: ${rawText.length}`,
        },
    };
}
function determineFirecrawlStageOutput(url, rawText, logs) {
    if (url && rawText === undefined) {
        return handleUrlScrape(url, logs);
    }
    else if (rawText === undefined) {
        logs.push('No URL or raw text provided.');
        throw new Error('Either a URL or raw text must be provided for testing.');
    }
    else {
        return Promise.resolve(handleRawTextProcessing(rawText, logs));
    }
}
function handleEmptyContent(logs) {
    logs.push('Content to process is empty after Firecrawl/raw text stage.');
    throw new Error('Content to process is empty.');
}
export async function handleFirecrawlStage(url, rawText, logs) {
    const stageOutput = await determineFirecrawlStageOutput(url, rawText, logs);
    if (stageOutput.contentToProcess === undefined) {
        handleEmptyContent(logs);
    }
    return stageOutput;
}
export async function handleGeminiStage(contentToProcess, sourceUrlForProcessing, logs) {
    let geminiResult;
    let extractedData;
    logs.push('Starting Gemini processing.');
    try {
        const geminiOutput = await gemini.extractFoodTruckDetailsFromMarkdown(contentToProcess, sourceUrlForProcessing);
        if (geminiOutput.success === true && geminiOutput.data !== undefined) {
            extractedData = geminiOutput.data;
            geminiResult = {
                status: 'Success',
                data: geminiOutput.data,
                tokensUsed: geminiOutput.tokensUsed,
                prompt: geminiOutput.promptSent,
                details: 'Gemini extraction successful.',
            };
            logs.push('Gemini processing successful.');
        }
        else {
            throw new Error(geminiOutput.error ?? 'Gemini processing failed to return data.');
        }
    }
    catch (error) {
        const errorMessage = getErrorMessage(error, 'An unknown error occurred during Gemini processing.');
        logs.push(`Gemini error: ${errorMessage}`);
        geminiResult = { status: 'Error', error: errorMessage };
    }
    return { geminiResult, extractedData };
}
async function saveToSupabase(truckDataToSave, logs) {
    logs.push('Attempting to save to Supabase (Dry Run is FALSE).');
    const createdTruckResult = await FoodTruckService.createTruck(truckDataToSave);
    if ('error' in createdTruckResult) {
        throw new Error(`Failed to create truck in Supabase: ${createdTruckResult.error}`);
    }
    const createdTruck = createdTruckResult;
    logs.push(`Data saved to Supabase. Record ID: ${createdTruck.id}`);
    return {
        status: 'Success (Saved)',
        preparedData: truckDataToSave,
        recordId: createdTruck.id,
        details: `Truck data saved with ID: ${createdTruck.id}`,
    };
}
export async function handleSupabaseStage(extractedData, sourceUrlForProcessing, isDryRun, logs) {
    logs.push('Preparing for Supabase interaction.');
    try {
        const truckDataToSave = mapExtractedDataToTruckSchema(extractedData, sourceUrlForProcessing, isDryRun);
        if (isDryRun) {
            logs.push('Supabase interaction skipped (Dry Run).');
            return {
                status: 'Success (Dry Run)',
                preparedData: truckDataToSave,
                details: 'Dry Run: Data was prepared but not saved.',
            };
        }
        return await saveToSupabase(truckDataToSave, logs);
    }
    catch (error) {
        const errorMessage = getErrorMessage(error, 'An unknown error occurred during Supabase interaction.');
        logs.push(`Supabase interaction error: ${errorMessage}`);
        return { status: 'Error', error: errorMessage };
    }
}
