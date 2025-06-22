// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextRequest, NextResponse } from 'next/server';
import { autoScraper } from '@/lib/autoScraper';
import { scheduler } from '@/lib/scheduler';
import { logActivity } from '@/lib/activityLogger';
import { AutoScrapeResult } from '@/lib/autoScraper';

function verifyCronSecret(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret === undefined || cronSecret === '') {
    console.error('CRON_SECRET not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron attempt:', authHeader);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function logAutoScrapeStart() {
  console.info('Starting automated scraping job...');
  logActivity({
    type: 'cron_job',
    action: 'auto_scrape_started',
    details: { timestamp: new Date().toISOString() },
  });
}

function logAutoScrapeCompletion(result: AutoScrapeResult) {
  logActivity({
    type: 'cron_job',
    action: 'auto_scrape_completed',
    details: {
      timestamp: new Date().toISOString(),
      trucksProcessed: result.trucksProcessed,
      newTrucksFound: result.newTrucksFound,
      errorsCount: result.errors?.length ?? 0,
    },
  });
  console.info('Automated scraping job completed successfully');
}

function logAutoScrapeFailure(error: unknown) {
  console.error('Auto-scraping cron job failed:', error);
  logActivity({
    type: 'cron_job',
    action: 'auto_scrape_failed',
    details: {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const authResponse = verifyCronSecret(request);
    if (authResponse) {
      return authResponse;
    }

    logAutoScrapeStart();

    const result: AutoScrapeResult = await autoScraper.runAutoScraping();
    scheduler.scheduleFollowUpTasks(result);
    logAutoScrapeCompletion(result);

    return NextResponse.json({
      success: true,
      message: 'Auto-scraping completed successfully',
      data: {
        trucksProcessed: result.trucksProcessed,
        newTrucksFound: result.newTrucksFound,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logAutoScrapeFailure(error);
    return NextResponse.json(
      {
        success: false,
        error: 'Auto-scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Only allow POST requests for cron jobs
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for cron jobs.' },
    { status: 405 },
  );
}
