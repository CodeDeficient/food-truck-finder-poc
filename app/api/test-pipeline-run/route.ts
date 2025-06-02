import { NextResponse, NextRequest } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { FoodTruckService, supabaseAdmin } from '@/lib/supabase'; // Assuming FoodTruckService is what createOrUpdateFoodTruck uses
import { createOrUpdateFoodTruck } from '@/lib/pipelineProcessor'; // We need the mapping logic, but maybe not the full job context.

// Helper function to simulate parts of createOrUpdateFoodTruck for dry runs or direct mapping display
// This is a simplified version for testing; actual createOrUpdateFoodTruck handles job IDs etc.
async function mapExtractedDataToTruckSchema(extractedData: any, sourceUrl: string, isDryRun: boolean): Promise<any> {
  if (!extractedData || typeof extractedData !== 'object') {
    throw new Error('Invalid extractedData for mapping.');
  }

  const name = extractedData.name || "Unknown Test Truck";
  const locationData = extractedData.current_location || {};
  const fullAddress = [locationData.address, locationData.city, locationData.state, locationData.zip_code]
    .filter(Boolean)
    .join(", ");

  const truckData = {
    name: name,
    description: extractedData.description || null,
    current_location: {
      lat: locationData.lat || 0,
      lng: locationData.lng || 0,
      address: fullAddress || locationData.raw_text || null,
      timestamp: new Date().toISOString(),
    },
    scheduled_locations: extractedData.scheduled_locations || [],
    operating_hours: extractedData.operating_hours || {},
    menu: (extractedData.menu || []).map((category: any) => ({
      category: category.category || "Uncategorized",
      items: (category.items || []).map((item: any) => ({
        name: item.name || "Unknown Item",
        description: item.description || null,
        price: typeof item.price === 'number' || typeof item.price === 'string' ? item.price : null,
        dietary_tags: item.dietary_tags || [],
      })),
    })),
    contact_info: extractedData.contact_info || {},
    social_media: extractedData.social_media || {},
    cuisine_type: extractedData.cuisine_type || [],
    price_range: extractedData.price_range || null,
    specialties: extractedData.specialties || [],
    data_quality_score: isDryRun ? 0.5 : 0.6, // Differentiate test/dry run
    verification_status: "pending" as "pending" | "verified" | "flagged",
    source_urls: [sourceUrl].filter(Boolean),
    last_scraped_at: new Date().toISOString(),
    ...(isDryRun && { test_run_flag: true }) // Add a flag for actual test saves if needed
  };
  return truckData;
}


export async function POST(request: NextRequest) {
  const logs: string[] = [];
  logs.push('Test pipeline run started.');

  let firecrawlResult: any = { status: 'Skipped' };
  let geminiResult: any = { status: 'Skipped' };
  let supabaseResult: any = { status: 'Skipped' };
  let overallStatus = 'Incomplete';

  try {
    const body = await request.json();
    const { url, rawText, isDryRun } = body;
    logs.push(`Request body: ${JSON.stringify(body)}`);

    let contentToProcess: string | null = null;
    let sourceUrlForProcessing: string = url || 'raw_text_input';

    // 1. Firecrawl Stage (if URL provided)
    if (url && !rawText) {
      logs.push(`Starting Firecrawl scrape for URL: ${url}`);
      try {
        const fcOutput = await firecrawl.scrapeFoodTruckWebsite(url); // This returns { success, data, error }
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
          throw new Error(fcOutput.error || 'Firecrawl failed to return markdown.');
        }
      } catch (e: any) {
        logs.push(`Firecrawl error: ${e.message}`);
        firecrawlResult = { status: 'Error', error: e.message };
        // Stop processing if Firecrawl fails
        return NextResponse.json({ results: { firecrawl: firecrawlResult, logs, overallStatus: 'Error' } }, { status: 200 }); // Return 200 so frontend can parse results
      }
    } else if (rawText) {
      logs.push('Using raw text input for processing.');
      contentToProcess = rawText;
      firecrawlResult = { status: 'Skipped (Raw Text Provided)', details: `Raw text length: ${rawText.length}` };
    } else {
      logs.push('No URL or raw text provided.');
      throw new Error('Either a URL or raw text must be provided for testing.');
    }

    if (!contentToProcess) {
       logs.push('Content to process is empty after Firecrawl/raw text stage.');
       throw new Error('Content to process is empty.');
    }

    // 2. Gemini Stage
    logs.push('Starting Gemini processing.');
    try {
      // The extractFoodTruckDetailsFromMarkdown method should ideally also return the prompt used
      // This might require a modification to GeminiService if not already done (as per plan step 4)
      const geminiOutput = await gemini.extractFoodTruckDetailsFromMarkdown(contentToProcess, sourceUrlForProcessing);
      if (geminiOutput.success && geminiOutput.data) {
        geminiResult = {
          status: 'Success',
          data: geminiOutput.data,
          tokensUsed: geminiOutput.tokensUsed,
          // prompt: geminiOutput.promptUsed // Assuming GeminiService is modified to return this
          details: 'Gemini extraction successful.'
        };
        logs.push('Gemini processing successful.');
      } else {
        throw new Error(geminiOutput.error || 'Gemini processing failed to return data.');
      }
    } catch (e: any) {
      logs.push(`Gemini error: ${e.message}`);
      geminiResult = { status: 'Error', error: e.message /* prompt: (e as any).promptUsedIfAvailable */ };
      return NextResponse.json({ results: { firecrawl: firecrawlResult, gemini: geminiResult, logs, overallStatus: 'Error' } }, { status: 200 });
    }

    // 3. Supabase Stage
    logs.push('Preparing for Supabase interaction.');
    const extractedData = geminiResult.data;
    try {
      const truckDataToSave = await mapExtractedDataToTruckSchema(extractedData, sourceUrlForProcessing, isDryRun);
      supabaseResult = { status: 'Prepared', preparedData: truckDataToSave };

      if (!isDryRun) {
        logs.push('Attempting to save to Supabase (Dry Run is FALSE).');
        // Using FoodTruckService.createTruck as createOrUpdateFoodTruck from pipelineProcessor
        // has a different signature and purpose (jobId etc.)
        // For testing, we directly try to create.
        // This assumes FoodTruckService.createTruck takes the mapped truckData.
        const createdTruck = await FoodTruckService.createTruck(truckDataToSave);
        supabaseResult = {
          status: 'Success (Saved)',
          preparedData: truckDataToSave,
          recordId: createdTruck.id,
          details: `Truck data saved with ID: ${createdTruck.id}`,
        };
        logs.push(`Data saved to Supabase. Record ID: ${createdTruck.id}`);
      } else {
        supabaseResult.status = 'Success (Dry Run)';
        supabaseResult.details = 'Dry Run: Data was prepared but not saved.';
        logs.push('Supabase interaction skipped (Dry Run).');
      }
    } catch (e: any) {
      logs.push(`Supabase interaction error: ${e.message}`);
      supabaseResult = { ...supabaseResult, status: 'Error', error: e.message }; // Keep preparedData if available
       return NextResponse.json({ results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus: 'Error' } }, { status: 200 });
    }

    overallStatus = 'Success';
    logs.push('Test pipeline run completed successfully.');
    return NextResponse.json({ results: { firecrawl: firecrawlResult, gemini: geminiResult, supabase: supabaseResult, logs, overallStatus } });

  } catch (error: any) {
    logs.push(`Overall test pipeline error: ${error.message}`);
    return NextResponse.json(
      { message: 'Test pipeline run failed.', error: error.message, results: { firecrawl, gemini, supabase, logs, overallStatus: 'Error' } },
      { status: 200 } // Return 200 so frontend can parse the results structure even on top-level failure
    );
  }
}
