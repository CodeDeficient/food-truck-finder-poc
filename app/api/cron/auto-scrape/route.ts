import { NextResponse } from 'next/server';

/**
 * DEPRECATED: Auto-scrape CRON endpoint
 * 
 * This endpoint has been deprecated in favor of GitHub Actions workflows.
 * The scraping pipeline now runs via GitHub Actions every 6 hours with better
 * reliability, cost control, and monitoring capabilities.
 * 
 * See: .github/workflows/scrape-food-trucks.yml
 */

export function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Endpoint deprecated',
      message: 'Auto-scraping has been migrated to GitHub Actions workflows. This endpoint is no longer active.',
      migration_info: {
        new_system: 'GitHub Actions',
        workflow_file: '.github/workflows/scrape-food-trucks.yml',
        schedule: 'Every 6 hours',
        benefits: ['Better reliability', 'Cost control', 'Enhanced monitoring']
      }
    },
    { status: 410 } // 410 Gone - resource permanently removed
  );
}

export function GET() {
  return NextResponse.json(
    {
      error: 'Endpoint deprecated',
      message: 'This CRON endpoint has been migrated to GitHub Actions workflows.'
    },
    { status: 410 }
  );
}
