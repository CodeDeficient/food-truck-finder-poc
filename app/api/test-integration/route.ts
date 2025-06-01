import { type NextRequest, NextResponse } from "next/server"
import { firecrawl } from "@/lib/firecrawl"
import { gemini } from "@/lib/gemini"
import { FoodTruckService, ScrapingJobService, DataProcessingService } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { testUrl = "https://example-food-truck.com" } = body

    console.log("Starting integration test...")

    // Step 1: Test Firecrawl scraping
    console.log("Testing Firecrawl scraping...")
    const scrapeResult = await firecrawl.scrapeUrl(testUrl, {
      formats: ["markdown"],
      onlyMainContent: true,
    })

    if (!scrapeResult.success) {
      return NextResponse.json({
        success: false,
        error: "Firecrawl test failed",
        details: scrapeResult.error,
      })
    }

    // Step 2: Test Gemini processing
    console.log("Testing Gemini processing...")
    const testMenuText = "Burgers: Classic Burger $12.99, Veggie Burger $11.99. Sides: Fries $4.99, Onion Rings $5.99"

    const geminiResult = await gemini.processMenuData(testMenuText)

    if (!geminiResult.success) {
      return NextResponse.json({
        success: false,
        error: "Gemini test failed",
        details: geminiResult.error,
      })
    }

    // Step 3: Test Supabase operations
    console.log("Testing Supabase operations...")

    // Create a test food truck
    const testTruck = await FoodTruckService.createTruck({
      name: "Test Food Truck",
      description: "Integration test truck",
      current_location: {
        lat: 37.7749,
        lng: -122.4194,
        address: "San Francisco, CA",
        timestamp: new Date().toISOString(),
      },
      scheduled_locations: [],
      operating_hours: {},
      menu: geminiResult.data?.categories || [],
      contact_info: { phone: "+1-555-TEST" },
      social_media: {},
      source_urls: [testUrl],
      data_quality_score: 0.8,
      verification_status: "pending",
    })

    // Create a test scraping job
    const testJob = await ScrapingJobService.createJob({
      job_type: "integration_test",
      target_url: testUrl,
      priority: 10,
    })

    // Add to processing queue
    const queueItem = await DataProcessingService.addToQueue({
      truck_id: testTruck.id,
      processing_type: "integration_test",
      raw_data: { test: true },
      priority: 10,
    })

    // Step 4: Test geospatial query
    const nearbyTrucks = await FoodTruckService.getTrucksByLocation(37.7749, -122.4194, 10)

    return NextResponse.json({
      success: true,
      message: "Integration test completed successfully",
      results: {
        firecrawl: {
          success: scrapeResult.success,
          dataLength: scrapeResult.data?.markdown?.length || 0,
        },
        gemini: {
          success: geminiResult.success,
          tokensUsed: geminiResult.tokensUsed,
          categoriesFound: geminiResult.data?.categories?.length || 0,
        },
        supabase: {
          truckCreated: testTruck.id,
          jobCreated: testJob.id,
          queueItemCreated: queueItem.id,
          nearbyTrucksFound: nearbyTrucks.length,
        },
      },
      testData: {
        truck: testTruck,
        processedMenu: geminiResult.data,
        nearbyTrucks: nearbyTrucks.slice(0, 3),
      },
    })
  } catch (error) {
    console.error("Integration test failed:", error)
    return NextResponse.json({
      success: false,
      error: "Integration test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Food Truck Integration Test API",
    description: "Tests the complete integration of Supabase, Firecrawl, and Gemini",
    usage: "POST /api/test-integration with optional { testUrl: 'https://example.com' }",
  })
}
