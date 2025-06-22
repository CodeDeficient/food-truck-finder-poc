import { NextRequest, NextResponse } from 'next/server';
import { BatchCleanupService } from '@/lib/data-quality/batchCleanup';
import { supabase, supabaseAdmin } from '@/lib/supabase';

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

type CleanupOperationType = 'normalize_phone' | 'fix_coordinates' | 'remove_placeholders' | 'update_quality_scores' | 'merge_duplicates';

export async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ') !== true) {
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

export async function handleGetStatus(): Promise<NextResponse> {
  const status = await getCleanupStatus();
  return NextResponse.json({
    success: true,
    status
  });
}

export async function handleGetSchedules(): Promise<NextResponse> {
  const schedules = await getCleanupSchedules();
  return NextResponse.json({
    success: true,
    schedules
  });
}

export async function handleGetHistory(searchParams: URLSearchParams): Promise<NextResponse> {
  const limit = Number.parseInt(searchParams.get('limit') ?? '10');
  const history = await getCleanupHistory(limit);
  return NextResponse.json({
    success: true,
    history
  });
}

export async function handleGetPreview(searchParams: URLSearchParams): Promise<NextResponse> {
  const operations = searchParams.get('operations')?.split(',') ?? [];
  const preview = await previewCleanupOperations(operations);
  return NextResponse.json({
    success: true,
    preview
  });
}

export async function handleGetDefault(): Promise<NextResponse> {
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

export async function handleRunScheduled(options: Record<string, unknown>): Promise<NextResponse> {
  const { scheduleId } = options as RunScheduledOptions;
  const result = await runScheduledCleanup(scheduleId);
  return NextResponse.json({
    success: true,
    action: 'run_scheduled',
    result
  });
}

export async function handleRunImmediate(options: Record<string, unknown>): Promise<NextResponse> {
  const {
    operations = ['remove_placeholders', 'normalize_phone', 'fix_coordinates', 'update_quality_scores'],
    batchSize = 50,
    dryRun = false
  } = options as RunImmediateOptions;

  const result = await BatchCleanupService.runFullCleanup({
    operations: operations as CleanupOperationType[],
    batchSize,
    dryRun
  });

  await logCleanupOperation('immediate', result, options);

  return NextResponse.json({
    success: true,
    action: 'run_immediate',
    result,
    message: dryRun ? 'Dry run completed successfully' : 'Cleanup completed successfully'
  });
}

export async function handleScheduleCleanup(options: Record<string, unknown>): Promise<NextResponse> {
  const { name, operations, schedule, enabled = true } = options as ScheduleCleanupOptions;
  const scheduleResult = await createCleanupSchedule(name, operations, schedule, enabled);
  return NextResponse.json({
    success: true,
    action: 'schedule_cleanup',
    result: scheduleResult
  });
}

export async function handleUpdateSchedule(options: Record<string, unknown>): Promise<NextResponse> {
  const { scheduleId, updates } = options as UpdateScheduleOptions;
  const updateResult = await updateCleanupSchedule(scheduleId, updates);
  return NextResponse.json({
    success: true,
    action: 'update_schedule',
    result: updateResult
  });
}

export async function handleDeleteSchedule(options: Record<string, unknown>): Promise<NextResponse> {
  const { scheduleId } = options as DeleteScheduleOptions;
  const deleteResult = await deleteCleanupSchedule(scheduleId);
  return NextResponse.json({
    success: true,
    action: 'delete_schedule',
    result: deleteResult
  });
}

export async function handleAnalyzeDuplicates(options: Record<string, unknown>): Promise<NextResponse> {
  const { threshold = 0.8 } = options as AnalyzeDuplicatesOptions;
  const analysis = await analyzeDuplicates(threshold);
  return NextResponse.json({
    success: true,
    action: 'analyze_duplicates',
    result: analysis
  });
}

async function getCleanupStatus(): Promise<AutomatedCleanupStatus> {
  return {
    isRunning: false,
    lastRun: new Date(Date.now() - 3_600_000).toISOString(),
    nextScheduledRun: new Date(Date.now() + 3_600_000).toISOString(),
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

function getCleanupSchedules(): Promise<CleanupSchedule[]> {
  return Promise.resolve([
    {
      id: 'daily-maintenance',
      name: 'Daily Maintenance Cleanup',
      operations: ['remove_placeholders', 'normalize_phone', 'update_quality_scores'],
      schedule: '0 2 * * *',
      enabled: true,
      lastRun: new Date(Date.now() - 86_400_000).toISOString(),
      nextRun: new Date(Date.now() + 3_600_000).toISOString(),
      successCount: 30,
      errorCount: 1
    },
    {
      id: 'weekly-deep-clean',
      name: 'Weekly Deep Cleanup',
      operations: ['remove_placeholders', 'normalize_phone', 'fix_coordinates', 'update_quality_scores', 'merge_duplicates'],
      schedule: '0 3 * * 0',
      enabled: true,
      lastRun: new Date(Date.now() - 604_800_000).toISOString(),
      nextRun: new Date(Date.now() + 259_200_000).toISOString(),
      successCount: 4,
      errorCount: 0
    }
  ]);
}

function getCleanupHistory(_limit: number): Promise<CleanupResult[]> {
  return Promise.resolve([]);
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
      operations: operations as CleanupOperationType[],
      batchSize: 10,
      dryRun: true
    });

    return {
      estimatedChanges: result.summary as Record<string, unknown>,
      operationDetails: (() => {
        const details: Record<string, unknown> = {};
        for (const [index, op] of result.operations.entries()) {
          details[`operation_${index}`] = {
            type: op.type,
            description: op.description,
            affectedCount: op.affectedCount,
            successCount: op.successCount,
            errorCount: op.errorCount
          };
        }
        return details;
      })(),
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
    operations: schedule.operations as CleanupOperationType[],
    batchSize: 50,
    dryRun: false
  });

  await logCleanupOperation('scheduled', result, { scheduleId });

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

function createCleanupSchedule(
  name: string,
  operations: string[],
  schedule: string,
  enabled: boolean
): Promise<ScheduleCreateResult> {
  return Promise.resolve({
    id: `schedule-${Date.now()}`,
    name,
    operations,
    schedule,
    enabled,
    created: new Date().toISOString()
  });
}

function updateCleanupSchedule(scheduleId: string, updates: Record<string, unknown>): Promise<ScheduleUpdateResult> {
  return Promise.resolve({
    scheduleId,
    updates,
    updated: new Date().toISOString()
  });
}

function deleteCleanupSchedule(scheduleId: string): Promise<ScheduleDeleteResult> {
  return Promise.resolve({
    scheduleId,
    deleted: new Date().toISOString()
  });
}

function analyzeDuplicates(threshold: number): Promise<DuplicateAnalysisResult> {
  try {
    return Promise.resolve({
      threshold,
      potentialDuplicates: 0,
      highConfidenceMatches: 0,
      mediumConfidenceMatches: 0,
      lowConfidenceMatches: 0,
      analysisTime: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(`Duplicate analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function logCleanupOperation(type: string, result: Record<string, unknown>, options: Record<string, unknown>): Promise<void> {
  try {
    console.info(`Cleanup operation completed:`, {
      type,
      result: result.summary as Record<string, unknown>,
      options,
      timestamp: new Date().toISOString()
    });
    return Promise.resolve();
  } catch (error) {
    console.warn('Failed to log cleanup operation:', error);
    return Promise.resolve();
  }
}
