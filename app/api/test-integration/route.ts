// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { type NextRequest, NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { FoodTruckService, ScrapingJobService, DataProcessingService, type FoodTruck, type ScrapingJob, type DataProcessingQueue as DataProcessingQueueItem } from '@/lib/supabase'; // Assuming types can be imported
import type { MenuCategory, GeminiResponse } from '@/lib/types'; // Assuming MenuCategory is in types

// Define interfaces for more specific typing
interface FirecrawlScrapeResultData {
  markdown?: string;
  html?: string;
  metadata?: Record<string, unknown>;
  is_fallback?: boolean;
}

interface FirecrawlScrapeResult {
  success: boolean;
  result?: {
    data?: FirecrawlScrapeResultData;
    // Include other properties from firecrawl.scrapeUrl if necessary
  };
  error?: string;
  details?: string;
}

interface GeminiProcessingResultData {
  categories: MenuCategory[];
  // Add other fields if present in actual geminiResult.result.data
}

interface GeminiProcessorFullResult extends GeminiResponse<GeminiProcessingResultData> {
  // success, error, details are part of GeminiResponse
  // data would be GeminiProcessingResultData
  // tokensUsed is also part of GeminiResponse
}


interface SupabaseOperationsResult {
  testTruck: FoodTruck;
  testJob: ScrapingJob;
  queueItem: DataProcessingQueueItem;
  nearbyTrucks: FoodTruck[];
}


// Helper function to test Firecrawl scraping
async function testFirecrawlScraping(testUrl: string): Promise<FirecrawlScrapeResult> {
  console.info('Testing Firecrawl scraping...');
  const scrapeResult = await firecrawl.scrapeUrl(testUrl, {
    formats: ['markdown'],
    onlyMainContent: true,
  });

  if (!scrapeResult.success) {
    return {
      success: false,
      error: 'Firecrawl test failed',
      details: scrapeResult.error,
    };
  }

  return { success: true, result: scrapeResult as any }; // Cast to any for now if scrapeResult type is not fully defined from firecrawl
}

// Helper function to test Gemini processing
async function testGeminiProcessing(): Promise<GeminiProcessorFullResult> {
  console.info('Testing Gemini processing...');
  const testMenuText =
    'Burgers: Classic Burger $12.99, Veggie Burger $11.99. Sides: Fries $4.99, Onion Rings $5.99';

  const geminiResult = await gemini.processMenuData(testMenuText);

  if (!geminiResult.success || !geminiResult.data) {
    return {
      success: false,
      error: geminiResult.error ?? 'Gemini test failed',
      details: geminiResult.details as string | undefined, // Cast if details is not always string
    };
  }
  // Assuming gemini.processMenuData returns compatible structure
  return { success: true, data: { categories: geminiResult.data }, tokensUsed: geminiResult.tokensUsed };
}

// Helper function to test Supabase operations
async function testSupabaseOperations(testUrl: string, geminiData: GeminiProcessingResultData | undefined): Promise<SupabaseOperationsResult> {
  // Create a test food truck
  const testTruck = await FoodTruckService.createTruck({
    name: 'Test Food Truck',
    description: 'Integration test truck',
    current_location: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA',
      timestamp: new Date().toISOString(),
    },
    scheduled_locations: [],
    operating_hours: {
      monday: { closed: true },
      tuesday: { closed: true },
      wednesday: { closed: true },
      thursday: { closed: true },
      friday: { closed: true },
      saturday: { closed: true },
      sunday: { closed: true },
    },
    menu: geminiData?.categories ?? [],
    contact_info: { phone: '+1-555-TEST', email: undefined, website: undefined },
    social_media: {
      instagram: undefined,
      facebook: undefined,
      twitter: undefined,
      tiktok: undefined,
      yelp: undefined,
    },
    source_urls: [testUrl],
    data_quality_score: 0.8,
    verification_status: 'pending',
  });

  // Create a test scraping job
  const testJob = await ScrapingJobService.createJob({
    job_type: 'integration_test',
    target_url: testUrl,
    priority: 10,
    scheduled_at: new Date().toISOString(),
  });

  // Add to processing queue
  const queueItem = await DataProcessingService.addToQueue({
    truck_id: testTruck.id,
    processing_type: 'integration_test',
    raw_data: { test: true },
    priority: 10,
  });

  // Test geospatial query
  const nearbyTrucks = await FoodTruckService.getTrucksByLocation(37.7749, -122.4194, 10);

  return {
    testTruck,
    testJob,
    queueItem,
    nearbyTrucks,
  };
}

// Helper function to format test results
function formatTestResults(
  scrapeResult: FirecrawlScrapeResult,
  geminiResult: GeminiProcessorFullResult,
  supabaseResults: SupabaseOperationsResult
) {
  return {
    success: true,
    message: 'Integration test completed successfully',
    results: {
      firecrawl: {
        success: scrapeResult.success,
        dataLength: scrapeResult.result?.data?.markdown?.length ?? 0,
      },
      gemini: {
        success: geminiResult.success,
        tokensUsed: geminiResult.tokensUsed ?? 0,
        categoriesFound: geminiResult.data?.categories?.length ?? 0,
      },
      supabase: {
        truckCreated: supabaseResults.testTruck.id,
        jobCreated: supabaseResults.testJob.id,
        queueItemCreated: supabaseResults.queueItem.id,
        nearbyTrucksFound: supabaseResults.nearbyTrucks.length,
      },
    },
    testData: {
      truck: supabaseResults.testTruck,
      processedMenu: geminiResult.data?.categories,
      nearbyTrucks: supabaseResults.nearbyTrucks.slice(0, 3),
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { testUrl?: string };
    const { testUrl = 'https://example-food-truck.com' } = body;

    console.info('Starting integration test...');

    // Step 1: Test Firecrawl scraping
    const firecrawlTest = await testFirecrawlScraping(testUrl);
    if (!firecrawlTest.success) {
      return NextResponse.json(firecrawlTest);
    }

    // Step 2: Test Gemini processing
    const geminiTest = await testGeminiProcessing();
    if (!geminiTest.success) {
      return NextResponse.json(geminiTest);
    }

    // Step 3: Test Supabase operations
    console.info('Testing Supabase operations...');
    const supabaseResults = await testSupabaseOperations(testUrl, geminiTest.data);

    // Step 4: Format and return results
    const results = formatTestResults(firecrawlTest, geminiTest, supabaseResults);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Integration test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Integration test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export function GET() {
  return NextResponse.json({
    message: 'Food Truck Integration Test API',
    description: 'Tests the complete integration of Supabase, Firecrawl, and Gemini',
    usage: "POST /api/test-integration with optional { testUrl: 'https://example.com' }",
  });
}
