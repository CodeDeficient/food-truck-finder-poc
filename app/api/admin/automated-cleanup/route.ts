// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextRequest, NextResponse } from 'next/server';
import { BatchCleanupService } from '@/lib/data-quality/batchCleanup';
import { supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * SOTA Automated Data Cleanup API
 * 
 * Provides scheduled and on-demand data cleanup operations
 * with comprehensive monitoring and reporting capabilities
 * 
 * GET /api/admin/automated-cleanup - Get cleanup status and schedule
 * POST /api/admin/automated-cleanup - Run cleanup operations
 */

interface CleanupSchedule {
  id: string;
  name: string;
  operations: string[];
  schedule: string; // cron expression
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  successCount: number;
  errorCount: number;
}

interface CleanupResult {
  id: string;
  timestamp: string;
  operation: string;
  success: boolean;
  details: Record<string, unknown>;
}

interface RequestBody {
  action: string;
  options?: Record<string, unknown>;
}

interface RunScheduledOptions {
  scheduleId: string;
}

interface RunImmediateOptions {
  operations?: string[];
  batchSize?: number;
  dryRun?: boolean;
}

interface ScheduleCleanupOptions {
  name: string;
  operations: string[];
  schedule: string;
  enabled?: boolean;
}

interface UpdateScheduleOptions {
  scheduleId: string;
  updates: Record<string, unknown>;
}

interface DeleteScheduleOptions {
  scheduleId: string;
}

interface AnalyzeDuplicatesOptions {
  threshold?: number;
}

interface AutomatedCleanupStatus {
  isRunning: boolean;
  lastRun: string | null;
  nextScheduledRun: string | null;
  schedules: CleanupSchedule[];
  recentResults: CleanupResult[];
  statistics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    trucksImproved: number;
    duplicatesRemoved: number;
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status': {
        const status = await getCleanupStatus();
        return NextResponse.json({
          success: true,
          status
        });
      }

      case 'schedules': {
        const schedules = await getCleanupSchedules();
        return NextResponse.json({
          success: true,
          schedules
        });
      }

      case 'history': {
        const limit = Number.parseInt(searchParams.get('limit') ?? '10');
        const history = await getCleanupHistory(limit);
        return NextResponse.json({
          success: true,
          history
        });
      }

      case 'preview': {
        const operations = searchParams.get('operations')?.split(',') ?? [];
        const preview = await previewCleanupOperations(operations);
        return NextResponse.json({
          success: true,
          preview
        });
      }

      default: {
        const status = await getCleanupStatus();
        return NextResponse.json({
          success: true,
          status,
          endpoints: [
            'GET ?action=status - Get overall cleanup status',
            'GET ?action=schedules - Get cleanup schedules',
            'GET ?action=history&limit=N - Get cleanup history',
            'GET ?action=preview&operations=op1,op2 - Preview cleanup operations',
            'POST - Run cleanup operations'
          ]
        });
      }
    }
  } catch (error) {
    console.error('Automated cleanup GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process cleanup request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin access
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as RequestBody;
    const { action, options = {} } = body;

    switch (action) {
      case 'run_scheduled': {
        // @ts-expect-error TS(2352): Conversion of type 'Record<string, unknown>' to ty... Remove this comment to see the full error message
        const { scheduleId } = options as RunScheduledOptions;
        const result = await runScheduledCleanup(scheduleId);
        return NextResponse.json({
          success: true,
          action: 'run_scheduled',
          result
        });
      }

      case 'run_immediate': {
        const {
          operations = ['remove_placeholders', 'normalize_phone', 'fix_coordinates', 'update_quality_scores'],
          batchSize = 50,
          dryRun = false
        } = options as RunImmediateOptions;

        const result = await BatchCleanupService.runFullCleanup({
          // @ts-expect-error TS(2322): Type 'string[]' is not assignable to type '("remov... Remove this comment to see the full error message
          operations,
          batchSize,
          dryRun
        });

        // Log the cleanup operation
        // @ts-expect-error TS(2345): Argument of type 'BatchCleanupResult' is not assig... Remove this comment to see the full error message
        await logCleanupOperation('immediate', result, options);

        return NextResponse.json({
          success: true,
          action: 'run_immediate',
          result,
          message: dryRun ? 'Dry run completed successfully' : 'Cleanup completed successfully'
        });
      }

      case 'schedule_cleanup': {
        // @ts-expect-error TS(2352): Conversion of type 'Record<string, unknown>' to ty... Remove this comment to see the full error message
        const { name, operations, schedule, enabled = true } = options as ScheduleCleanupOptions;
        const scheduleResult = await createCleanupSchedule(name, operations, schedule, enabled);
        return NextResponse.json({
          success: true,
          action: 'schedule_cleanup',
          result: scheduleResult
        });
      }

      case 'update_schedule': {
        // @ts-expect-error TS(2352): Conversion of type 'Record<string, unknown>' to ty... Remove this comment to see the full error message
        const { scheduleId, updates } = options as UpdateScheduleOptions;
        const updateResult = await updateCleanupSchedule(scheduleId, updates);
        return NextResponse.json({
          success: true,
          action: 'update_schedule',
          result: updateResult
        });
      }

      case 'delete_schedule': {
        // @ts-expect-error TS(2352): Conversion of type 'Record<string, unknown>' to ty... Remove this comment to see the full error message
        const { scheduleId } = options as DeleteScheduleOptions;
        const deleteResult = await deleteCleanupSchedule(scheduleId);
        return NextResponse.json({
          success: true,
          action: 'delete_schedule',
          result: deleteResult
        });
      }

      case 'analyze_duplicates': {
        const { threshold = 0.8 } = options as AnalyzeDuplicatesOptions;
        const analysis = await analyzeDuplicates(threshold);
        return NextResponse.json({
          success: true,
          action: 'analyze_duplicates',
          result: analysis
        });
      }

      default: {
        return NextResponse.json({
          success: false,
          error: 'Unknown action',
          available_actions: [
            'run_scheduled',
            'run_immediate',
            'schedule_cleanup',
            'update_schedule',
            'delete_schedule',
            'analyze_duplicates'
          ]
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Automated cleanup POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process cleanup request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    if (!supabaseAdmin) {
      return false;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

async function getCleanupStatus(): Promise<AutomatedCleanupStatus> {
  // This would typically fetch from a database table
  // For now, return a mock status
  return {
    isRunning: false,
    lastRun: new Date(Date.now() - 3_600_000).toISOString(), // 1 hour ago
    nextScheduledRun: new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
    schedules: await getCleanupSchedules(),
    recentResults: [],
    statistics: {
      totalRuns: 42,
      successfulRuns: 40,
      failedRuns: 2,
      trucksImproved: 156,
      duplicatesRemoved: 23
    }
  };
}

async function getCleanupSchedules(): Promise<CleanupSchedule[]> {
  // Default cleanup schedules
  return [
    {
      id: 'daily-maintenance',
      name: 'Daily Maintenance Cleanup',
      operations: ['remove_placeholders', 'normalize_phone', 'update_quality_scores'],
      schedule: '0 2 * * *', // Daily at 2 AM
      enabled: true,
      lastRun: new Date(Date.now() - 86_400_000).toISOString(), // 24 hours ago
      nextRun: new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
      successCount: 30,
      errorCount: 1
    },
    {
      id: 'weekly-deep-clean',
      name: 'Weekly Deep Cleanup',
      operations: ['remove_placeholders', 'normalize_phone', 'fix_coordinates', 'update_quality_scores', 'merge_duplicates'],
      schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
      enabled: true,
      lastRun: new Date(Date.now() - 604_800_000).toISOString(), // 7 days ago
      nextRun: new Date(Date.now() + 259_200_000).toISOString(), // 3 days from now
      successCount: 4,
      errorCount: 0
    }
  ];
}

async function getCleanupHistory(limit: number): Promise<CleanupResult[]> {
  // This would fetch from a cleanup_history table
  return [];
}

interface PreviewResult {
  estimatedChanges: Record<string, unknown>;
  operationDetails: Record<string, unknown>;
  estimatedDuration: number;
  affectedTrucks: number;
}

async function previewCleanupOperations(operations: string[]): Promise<PreviewResult> {
  try {
    const result = await BatchCleanupService.runFullCleanup({
      // @ts-expect-error TS(2322): Type 'string[]' is not assignable to type '("remov... Remove this comment to see the full error message
      operations,
      batchSize: 10,
      dryRun: true
    });

    return {
      estimatedChanges: result.summary as Record<string, unknown>,
      // @ts-expect-error TS(2352): Conversion of type 'CleanupOperation[]' to type 'R... Remove this comment to see the full error message
      operationDetails: result.operations as Record<string, unknown>,
      estimatedDuration: result.duration,
      affectedTrucks: result.totalProcessed
    };
  } catch (error) {
    throw new Error(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function runScheduledCleanup(scheduleId: string): Promise<Record<string, unknown>> {
  const schedules = await getCleanupSchedules();
  const schedule = schedules.find(s => s.id === scheduleId);

  if (!schedule) {
    throw new Error(`Schedule ${scheduleId} not found`);
  }

  if (!schedule.enabled) {
    throw new Error(`Schedule ${scheduleId} is disabled`);
  }

  const result = await BatchCleanupService.runFullCleanup({
    // @ts-expect-error TS(2322): Type 'string[]' is not assignable to type '("remov... Remove this comment to see the full error message
    operations: schedule.operations,
    batchSize: 50,
    dryRun: false
  });

  // Log the scheduled cleanup
  // @ts-expect-error TS(2345): Argument of type 'BatchCleanupResult' is not assig... Remove this comment to see the full error message
  await logCleanupOperation('scheduled', result, { scheduleId });

  // @ts-expect-error TS(2352): Conversion of type 'BatchCleanupResult' to type 'R... Remove this comment to see the full error message
  return result as Record<string, unknown>;
}

interface ScheduleCreateResult {
  id: string;
  name: string;
  operations: string[];
  schedule: string;
  enabled: boolean;
  created: string;
}

interface ScheduleUpdateResult {
  scheduleId: string;
  updates: Record<string, unknown>;
  updated: string;
}

interface ScheduleDeleteResult {
  scheduleId: string;
  deleted: string;
}

interface DuplicateAnalysisResult {
  threshold: number;
  potentialDuplicates: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  analysisTime: string;
}

async function createCleanupSchedule(
  name: string,
  operations: string[],
  schedule: string,
  enabled: boolean
): Promise<ScheduleCreateResult> {
  // This would create a new schedule in the database
  return {
    id: `schedule-${Date.now()}`,
    name,
    operations,
    schedule,
    enabled,
    created: new Date().toISOString()
  };
}

async function updateCleanupSchedule(scheduleId: string, updates: Record<string, unknown>): Promise<ScheduleUpdateResult> {
  // This would update the schedule in the database
  return {
    scheduleId,
    updates,
    updated: new Date().toISOString()
  };
}

async function deleteCleanupSchedule(scheduleId: string): Promise<ScheduleDeleteResult> {
  // This would delete the schedule from the database
  return {
    scheduleId,
    deleted: new Date().toISOString()
  };
}

async function analyzeDuplicates(threshold: number): Promise<DuplicateAnalysisResult> {
  try {
    // This would run a comprehensive duplicate analysis
    return {
      threshold,
      potentialDuplicates: 0,
      highConfidenceMatches: 0,
      mediumConfidenceMatches: 0,
      lowConfidenceMatches: 0,
      analysisTime: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Duplicate analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function logCleanupOperation(type: string, result: Record<string, unknown>, options: Record<string, unknown>): Promise<void> {
  try {
    // This would log the cleanup operation to a database table
    console.info(`Cleanup operation completed:`, {
      type,
      result: result.summary as Record<string, unknown>,
      options,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to log cleanup operation:', error);
  }
}
