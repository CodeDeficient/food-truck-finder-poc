import { NextResponse } from 'next/server';

/**
 * DEPRECATED: Quality Check CRON endpoint
 * 
 * This endpoint has been deprecated. Quality checks are now handled as part of
 * the GitHub Actions workflow or can be triggered manually via the admin dashboard.
 * 
 * Future quality checking will be integrated into the GitHub Actions pipeline
 * or implemented as separate workflows for better control and monitoring.
 */

export function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Endpoint deprecated',
      message: 'Quality checking has been migrated to GitHub Actions workflows or admin dashboard.',
      migration_info: {
        alternatives: [
          'Use the admin dashboard for manual quality checks',
          'Quality checks will be integrated into GitHub Actions workflows',
          'Future dedicated quality check workflows planned'
        ],
        current_workflow: '.github/workflows/scrape-food-trucks.yml'
      }
    },
    { status: 410 } // 410 Gone - resource permanently removed
  );
}

export function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint deprecated',
      message: 'This CRON endpoint has been deprecated. Use admin dashboard or GitHub Actions.'
    },
    { status: 410 }
  );
}
