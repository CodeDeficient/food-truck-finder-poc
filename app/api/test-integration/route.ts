// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { type NextRequest, NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';
import { gemini } from '@/lib/gemini';
import { FoodTruckService, ScrapingJobService, DataProcessingService } from '@/lib/supabase';

// Helper function to test Firecrawl scraping
async function testFirecrawlScraping(testUrl: string) {
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

  return { success: true, result: scrapeResult };
}

// Helper function to test Gemini processing
async function testGeminiProcessing() {
  console.info('Testing Gemini processing...');
  const testMenuText =
    'Burgers: Classic Burger $12.99, Veggie Burger $11.99. Sides: Fries $4.99, Onion Rings $5.99';

  const geminiResult = await gemini.processMenuData(testMenuText);

  if (!geminiResult.success) {
    return {
      success: false,
      error: 'Gemini test failed',
      details: geminiResult.error,
    };
  }

  return { success: true, result: geminiResult };
}

// Helper function to test Supabase operations
async function testSupabaseOperations(testUrl: string, geminiResult: any) {
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
    menu: geminiResult.data ?? [],
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
function formatTestResults(scrapeResult: any, geminiResult: any, supabaseResults: any) {
  return {
    success: true,
    message: 'Integration test completed successfully',
    results: {
      firecrawl: {
        success: scrapeResult.success,
        dataLength: scrapeResult.data?.markdown?.length ?? 0,
      },
      gemini: {
        success: geminiResult.success,
        tokensUsed: geminiResult.tokensUsed,
        categoriesFound: geminiResult.data?.length ?? 0,
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
      processedMenu: geminiResult.data,
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
    const supabaseResults = await testSupabaseOperations(testUrl, geminiTest.result);

    // Step 4: Format and return results
    const results = formatTestResults(firecrawlTest.result, geminiTest.result, supabaseResults);
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
