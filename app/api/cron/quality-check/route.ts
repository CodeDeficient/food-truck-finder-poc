import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activityLogger';
import { DataQualityService, FoodTruckService } from '@/lib/supabase';

export function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret == undefined) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron attempt:', authHeader);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.info('Starting daily data quality check...');

    // Log the start of the quality check
    logActivity({
      type: 'cron_job',
      action: 'quality_check_started',
      details: { timestamp: new Date().toISOString() },
    });

    // Perform data quality checks using SOTA algorithm
    const qualityResults = await performDataQualityCheck();

    // Log completion with results
    logActivity({
      type: 'cron_job',
      action: 'quality_check_completed',
      details: {
        logTimestamp: new Date().toISOString(),
        ...qualityResults,
      },
    });

    console.info('Data quality check completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Quality check completed successfully',
      data: {
        ...qualityResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Quality check cron job failed:', error);

    // Log the error
    logActivity({
      type: 'cron_job',
      action: 'quality_check_failed',
      details: {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Quality check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function performDataQualityCheck() {
  try {
    // Get all trucks for quality assessment
    const { trucks, total } = await FoodTruckService.getAllTrucks(1000, 0);

    let trucksWithMissingData = 0;
    let lowQualityTrucks = 0;
    let totalQualityScore = 0;
    let staleDataCount = 0;
    const qualityBreakdown = { high: 0, medium: 0, low: 0 };

    // Assess each truck using SOTA algorithm
    for (const truck of trucks) {
      const assessment = DataQualityService.calculateQualityScore(truck);
      totalQualityScore += assessment.score;

      const category = DataQualityService.categorizeQualityScore(assessment.score);
      (qualityBreakdown as Record<string, number>)[category]++;

      if (assessment.issues.length > 0) {
        trucksWithMissingData++;
      }

      if (assessment.score < 0.6) {
        lowQualityTrucks++;
      }

      // Check for stale data (location timestamp > 7 days old)
      if (truck.current_location?.timestamp) {
        const locationAge = Date.now() - new Date(truck.current_location.timestamp).getTime();
        const daysSinceUpdate = locationAge / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate > 7) {
          staleDataCount++;
        }
      }
    }

    const averageQualityScore = trucks.length > 0 ? totalQualityScore / trucks.length : 0;

    // Update quality scores for trucks that need it (batch update)
    const updateResults = await DataQualityService.batchUpdateQualityScores(100);

    return {
      totalTrucks: total,
      trucksWithMissingData,
      lowQualityTrucks,
      staleDataCount,
      averageQualityScore: Math.round(averageQualityScore * 100) / 100,
      qualityBreakdown,
      updateResults,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error performing data quality check:', error);
    throw error;
  }
}

// Only allow POST requests for cron jobs
export function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for cron jobs.' },
    { status: 405 },
  );
}
