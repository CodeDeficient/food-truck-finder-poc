import { NextResponse } from 'next/server';

export function GET() {
  try {
    // Mock data for scraping metrics
    // In a real implementation, this would fetch from your database
    const metrics = {
      totalRuns: 24,
      successfulRuns: 22,
      failedRuns: 2,
      averageRunTime: 45, // seconds
      totalTrucksProcessed: 1080,
      newTrucksToday: 7,
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching scraping metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scraping metrics',
        metrics: undefined,
      },
      { status: 500 },
    );
  }
}
