// app/api/auto-scrape-initiate/route.ts
import { NextResponse } from 'next/server';
import { ensureDefaultTrucksAreScraped } from '@/lib/autoScraper';

export const dynamic = 'force-dynamic'; // Ensure this route is not statically optimized if it needs fresh execution

export async function GET() {
  console.info('api Route auto-scrape-initiate: Received GET request.');
  try {
    const results = await ensureDefaultTrucksAreScraped();
    console.info('api Route auto-scrape-initiate: ensureDefaultTrucksAreScraped completed.');
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
