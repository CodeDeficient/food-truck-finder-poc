import { NextResponse } from 'next/server';

export function GET() {
  try {
    // Mock data for cron job statuses
    // In a real implementation, this would fetch from your database or monitoring service
    const jobs = [
      {
        id: 'auto-scrape',
        name: 'Auto Food Truck Scraping',
        schedule: '0 6 * * *',
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        nextRun: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // 18 hours from now
        status: 'idle' as const,
        lastResult: {
          success: true,
          message: 'Successfully processed food trucks',
          trucksProcessed: 45,
          newTrucksFound: 3,
          errors: 0,
        },
      },
      {
        id: 'quality-check',
        name: 'Daily Data Quality Check',
        schedule: '0 8 * * *',
        lastRun: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), // 16 hours ago
        nextRun: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours from now
        status: 'idle' as const,
        lastResult: {
          success: true,
          message: 'Quality check completed successfully',
          trucksProcessed: 45,
          newTrucksFound: 0,
          errors: 0,
        },
      },
    ];

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching cron status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cron status',
        jobs: [],
      },
      { status: 500 },
    );
  }
}
