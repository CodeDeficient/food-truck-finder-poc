// app/api/auto-scrape-initiate/route.ts
import { NextResponse } from 'next/server';
import { initiateFoodTruckProcessing } from '@/lib/autoScraper'; // Updated import

export const dynamic = 'force-dynamic'; // Ensure this route is not statically optimized if it needs fresh execution

export async function get() {
  console.info('api Route auto-scrape-initiate: Received get request.');
  try {
    const results = await initiateFoodTruckProcessing(); // Updated function call
    console.info('api Route auto-scrape-initiate: initiateFoodTruckProcessing completed.'); // Updated log
    return NextResponse.json({
      message: 'Auto-scraping process initiated and checked.',
      results,
    });
  } catch (error) {
    console.error('api Route auto-scrape-initiate: Error during auto-scraping process:', error);
    return NextResponse.json(
      {
        message: 'Error initiating auto-scraping process.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
