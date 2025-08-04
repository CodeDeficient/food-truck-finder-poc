import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activityLogger';
import { FoodTruckService } from '@/lib/supabase';
import { DataQualityService } from '@/lib/utils/QualityScorer';
import {} from '@/lib/utils/QualityScorer';
function verifyCronSecret(request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret == undefined) {
        console.error('CRON_SECRET not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    if (authHeader == undefined || authHeader !== `Bearer ${cronSecret}`) {
        console.error('Unauthorized cron attempt:', authHeader);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return undefined;
}
function logQualityCheckStart() {
    console.info('Starting daily data quality check...');
    logActivity({
        type: 'cron_job',
        action: 'quality_check_started',
        details: { timestamp: new Date().toISOString() },
    });
}
function logQualityCheckCompletion(qualityResults) {
    logActivity({
        type: 'cron_job',
        action: 'quality_check_completed',
        details: Object.assign({ logTimestamp: new Date().toISOString() }, qualityResults),
    });
    console.info('Data quality check completed successfully');
}
function logQualityCheckFailure(error) {
    console.error('Quality check cron job failed:', error);
    logActivity({
        type: 'cron_job',
        action: 'quality_check_failed',
        details: {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
        },
    });
}
export async function POST(request) {
    try {
        const authResponse = verifyCronSecret(request);
        if (authResponse) {
            return authResponse;
        }
        logQualityCheckStart();
        const qualityResults = await performDataQualityCheck();
        logQualityCheckCompletion(qualityResults);
        return NextResponse.json({
            success: true,
            message: 'Quality check completed successfully',
            data: Object.assign(Object.assign({}, qualityResults), { timestamp: new Date().toISOString() }),
        });
    }
    catch (error) {
        logQualityCheckFailure(error);
        return NextResponse.json({
            success: false,
            error: 'Quality check failed',
            message: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
function assessTrucksQuality(trucks) {
    var _a;
    let trucksWithMissingData = 0;
    let lowQualityTrucks = 0;
    let totalQualityScore = 0;
    let staleDataCount = 0;
    const qualityBreakdown = { high: 0, medium: 0, low: 0 };
    for (const truck of trucks) {
        const assessment = DataQualityService.calculateQualityScore(truck);
        totalQualityScore += assessment.score;
        const category = DataQualityService.categorizeQualityScore(assessment.score);
        qualityBreakdown[category.label.toLowerCase()]++;
        if (assessment.issues.length > 0) {
            trucksWithMissingData++;
        }
        if (assessment.score < 0.6) {
            lowQualityTrucks++;
        }
        if (((_a = truck.current_location) === null || _a === void 0 ? void 0 : _a.timestamp) != undefined) {
            const locationAge = Date.now() - new Date(truck.current_location.timestamp).getTime();
            const daysSinceUpdate = locationAge / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 7) {
                staleDataCount++;
            }
        }
    }
    const averageQualityScore = trucks.length > 0 ? totalQualityScore / trucks.length : 0;
    return {
        trucksWithMissingData,
        lowQualityTrucks,
        staleDataCount,
        averageQualityScore,
        qualityBreakdown,
    };
}
function aggregateQualityCheckResults(totalTrucks, assessmentResults, updateResults, timestamp) {
    return {
        totalTrucks: totalTrucks,
        trucksWithMissingData: assessmentResults.trucksWithMissingData,
        lowQualityTrucks: assessmentResults.lowQualityTrucks,
        staleDataCount: assessmentResults.staleDataCount,
        averageQualityScore: Math.round(assessmentResults.averageQualityScore * 100) / 100,
        qualityBreakdown: assessmentResults.qualityBreakdown,
        updateResults: updateResults,
        timestamp: timestamp,
    };
}
async function performDataQualityCheck() {
    try {
        const { trucks, total } = await FoodTruckService.getAllTrucks(1000, 0);
        const assessmentResults = assessTrucksQuality(trucks);
        const updateResults = await DataQualityService.batchUpdateQualityScores(100);
        return aggregateQualityCheckResults(total, assessmentResults, updateResults, new Date().toISOString());
    }
    catch (error) {
        console.error('Error performing data quality check:', error);
        throw error;
    }
}
// Only allow POST requests for cron jobs
export function GET() {
    return NextResponse.json({ error: 'Method not allowed. Use POST for cron jobs.' }, { status: 405 });
}
