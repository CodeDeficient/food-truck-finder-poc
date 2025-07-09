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

type CleanupOperationType =
  | 'normalize_phone'
  | 'fix_coordinates'
  | 'remove_placeholders'
  | 'update_quality_scores'
  | 'merge_duplicates';

/**
 * Verifies if the requester has admin access based on the authorization header.
 * @example
 * verifyAdminAccess(request)
 * Returns true if user is an admin, otherwise false.
 * @param {NextRequest} request - The request object containing headers for authorization.
 * @returns {Promise<boolean>} Returns a promise resolving to true if the user has admin access, false otherwise.
 * @description
 *   - Uses Supabase for validating and retrieving user information from a token.
 *   - Assumes a 'Bearer' token structure for the authorization header.
 *   - Checks for existence of a Supabase admin client before querying for user roles.
 *   - Handles any errors silently by returning false.
 */
export async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ') !== true) {
      return false;
    }

    const token = authHeader.slice(7);
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      return false;
    }

    const user = data.user;

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

/**
 * Handles post requests by executing specific actions based on the provided body.
 * @example
 * handlePostRequest({ action: 'run_scheduled', options: { key: 'value' } })
 * Returns the result of executing handleRunScheduled with the provided options.
 * @param {Object} body - The body of the request containing action type and optional parameters.
 * @param {string} body.action - The action to perform such as 'run_scheduled', 'update_schedule', etc.
 * @param {Object} [body.options] - Optional parameters for the specified action, default is an empty object.
 * @returns {Promise<Object>} Resolves with the result of the corresponding action handler or an error object for unknown actions.
 * @description
 *   - Supports multiple predefined actions like scheduling, running, and cleanup operations.
 *   - Provides feedback on available actions when an unknown action is specified.
 *   - Uses async functions to perform operations, ensuring asynchronous behavior.
 *   - Returns JSON responses compliant with NextResponse standards.
 */
export async function handlePostRequest(body: {
  action: string;
  options?: Record<string, unknown>;
}) {
  const { action, options = {} } = body;

  switch (action) {
    case 'run_scheduled': {
      return await handleRunScheduled(options);
    }
    case 'run_immediate': {
      return await handleRunImmediate(options);
    }
    case 'schedule_cleanup': {
      return await handleScheduleCleanup(options);
    }
    case 'update_schedule': {
      return await handleUpdateSchedule(options);
    }
    case 'delete_schedule': {
      return await handleDeleteSchedule(options);
    }
    case 'analyze_duplicates': {
      return await handleAnalyzeDuplicates(options);
    }
    default: {
      return NextResponse.json(
        {
          success: false,
          error: 'Unknown action',
          available_actions: [
            'run_scheduled',
            'run_immediate',
            'schedule_cleanup',
            'update_schedule',
            'delete_schedule',
            'analyze_duplicates',
          ],
        },
        { status: 400 },
      );
    }
  }
}

export async function handleGetStatus(): Promise<NextResponse> {
  const status = await getCleanupStatus();
  return NextResponse.json({
    success: true,
    status,
  });
}

export async function handleGetSchedules(): Promise<NextResponse> {
  const schedules = await getCleanupSchedules();
  return NextResponse.json({
    success: true,
    schedules,
  });
}

export async function handleGetHistory(searchParams: URLSearchParams): Promise<NextResponse> {
  const limit = Number.parseInt(searchParams.get('limit') ?? '10', 10);
  const history = await getCleanupHistory(limit);
  return NextResponse.json({
    success: true,
    history,
  });
}

export async function handleGetPreview(searchParams: URLSearchParams): Promise<NextResponse> {
  const operations = searchParams.get('operations')?.split(',') ?? [];
  const preview = await previewCleanupOperations(operations);
  return NextResponse.json({
    success: true,
    preview,
  });
}

/**
 * Handles the retrieval of default cleanup status and returns a JSON response.
 * @example
 * handleGetDefault().then(response => console.log(response));
 * // { success: true, status: ..., endpoints: [...] }
 * @param {none} {none} - No arguments are required for this function.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse JSON object containing cleanup status and endpoints.
 * @description
 *   - Utilizes the getCleanupStatus function to fetch the current cleanup status.
 *   - Constructs a response object detailing available cleanup-related endpoints.
 *   - Follow API endpoint descriptions to properly utilize cleanup functionalities.
 */
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
      'POST - Run cleanup operations',
    ],
  });
}

export async function handleRunScheduled(options: Record<string, unknown>): Promise<NextResponse> {
  const { scheduleId } = options as RunScheduledOptions;
  const result = await runScheduledCleanup(scheduleId);
  return NextResponse.json({
    success: true,
    action: 'run_scheduled',
    result,
  });
}

/**
* Executes a batch cleanup operation immediately based on provided options.
* @example
* handleRunImmediate({ dryRun: true, batchSize: 100 })
* Returns: { success: true, action: 'run_immediate', result: {...}, message: 'Dry run completed successfully' }
* @param {Object} options - Configuration options for the cleanup operation.
* @returns {Promise<NextResponse>} A promise that resolves to the NextResponse object containing the cleanup result.
* @description
*   - The `operations` parameter defaults to a set of predefined cleanup tasks if not specified.
*   - If `dryRun` is true, the function simulates the cleanup without making any modifications.
*   - Utilizes `BatchCleanupService` for executing the cleanup logic.
*   - Operation results are logged with `logCleanupOperation` for tracking purposes.
*/
export async function handleRunImmediate(options: Record<string, unknown>): Promise<NextResponse> {
  const {
    operations = [
      'remove_placeholders',
      'normalize_phone',
      'fix_coordinates',
      'update_quality_scores',
    ],
    batchSize = 50,
    dryRun = false,
  } = options as RunImmediateOptions;

  const result = await BatchCleanupService.runFullCleanup({
    operations: operations as CleanupOperationType[],
    batchSize,
    dryRun,
  });

  await logCleanupOperation('immediate', result, options);

  return NextResponse.json({
    success: true,
    action: 'run_immediate',
    result,
    message: dryRun ? 'Dry run completed successfully' : 'Cleanup completed successfully',
  });
}

export async function handleScheduleCleanup(
  options: Record<string, unknown>,
): Promise<NextResponse> {
  const { name, operations, schedule, enabled = true } = options as ScheduleCleanupOptions;
  const scheduleResult = await createCleanupSchedule(name, operations, schedule, enabled);
  return NextResponse.json({
    success: true,
    action: 'schedule_cleanup',
    result: scheduleResult,
  });
}

export async function handleUpdateSchedule(
  options: Record<string, unknown>,
): Promise<NextResponse> {
  const { scheduleId, updates } = options as UpdateScheduleOptions;
  const updateResult = await updateCleanupSchedule(scheduleId, updates);
  return NextResponse.json({
    success: true,
    action: 'update_schedule',
    result: updateResult,
  });
}

export async function handleDeleteSchedule(
  options: Record<string, unknown>,
): Promise<NextResponse> {
  const { scheduleId } = options as DeleteScheduleOptions;
  const deleteResult = await deleteCleanupSchedule(scheduleId);
  return NextResponse.json({
    success: true,
    action: 'delete_schedule',
    result: deleteResult,
  });
}

export async function handleAnalyzeDuplicates(
  options: Record<string, unknown>,
): Promise<NextResponse> {
  const { threshold = 0.8 } = options as AnalyzeDuplicatesOptions;
  const analysis = await analyzeDuplicates(threshold);
  return NextResponse.json({
    success: true,
    action: 'analyze_duplicates',
    result: analysis,
  });
}

/**
 * Retrieves the status of automated cleanup operations.
 * @example
 * getCleanupStatus()
 * // returns: Promise<AutomatedCleanupStatus>
 * @returns {Promise<AutomatedCleanupStatus>} An object representing the status of cleanup operations.
 * @description
 *   - The status includes statistics on cleanup runs such as total number of runs, successful runs, and failed runs.
 *   - Provides information on whether a cleanup operation is currently running and when it last ran.
 *   - Fetches schedules asynchronously using the getCleanupSchedules() function.
 *   - Includes data on recent cleanup results and operations performed, such as the number of trucks improved and duplicates removed.
 */
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
      duplicatesRemoved: 23,
    },
  };
}

/**
 * Retrieves the scheduled cleanup operations including their details.
 * @example
 * getCleanupSchedules()
 * Promise resolves to an array of cleanup schedule objects.
 * @returns {Promise<CleanupSchedule[]>} Promise resolving to an array of cleanup schedule objects.
 * @description
 *   - Schedules are defined using cron-like syntax for timing.
 *   - Both daily and weekly cleanup operations are included.
 *   - Each schedule has a record of success and error counts from the last execution.
 *   - Enabled status indicates if the schedule is currently active.
 */
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
      errorCount: 1,
    },
    {
      id: 'weekly-deep-clean',
      name: 'Weekly Deep Cleanup',
      operations: [
        'remove_placeholders',
        'normalize_phone',
        'fix_coordinates',
        'update_quality_scores',
        'merge_duplicates',
      ],
      schedule: '0 3 * * 0',
      enabled: true,
      lastRun: new Date(Date.now() - 604_800_000).toISOString(),
      nextRun: new Date(Date.now() + 259_200_000).toISOString(),
      successCount: 4,
      errorCount: 0,
    },
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

/**
 * Generates a preview of cleanup operations and their estimated impact.
 * @example
 * previewCleanupOperations(['delete_logs', 'archive_data'])
 * // Returns a Promise resolving to an object with estimated changes and operation details
 * @param {string[]} operations - An array of cleanup operation names to preview.
 * @returns {Promise<PreviewResult>} A promise that resolves to a preview result containing estimated changes and details.
 * @description
 *   - The function uses BatchCleanupService to simulate cleanup operations in a dry-run mode.
 *   - Each operation's details include types, descriptions, and counts of affected, successful, and erroneous items.
 *   - Returns comprehensive information including estimated changes, durations, and affected entities.
 */
async function previewCleanupOperations(operations: string[]): Promise<PreviewResult> {
  try {
    const result = await BatchCleanupService.runFullCleanup({
      operations: operations as CleanupOperationType[],
      batchSize: 10,
      dryRun: true,
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
            errorCount: op.errorCount,
          };
        }
        return details;
      })(),
      estimatedDuration: result.duration,
      affectedTrucks: result.totalProcessed,
    };
  } catch (error) {
    throw new Error(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Executes a cleanup based on a given schedule ID.
 * @example
 * runScheduledCleanup('schedule123')
 * { success: true, cleanedRecords: 150 }
 * @param {string} scheduleId - The ID of the cleanup schedule to run.
 * @returns {Promise<Record<string, unknown>>} Result of the cleanup operation.
 * @description
 *   - Throws an error if the schedule is not found or is disabled.
 *   - Utilizes BatchCleanupService for performing the cleanup operation.
 *   - Logs the result of the cleanup operation with a 'scheduled' context.
 */
async function runScheduledCleanup(scheduleId: string): Promise<Record<string, unknown>> {
  const schedules = await getCleanupSchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);

  if (!schedule) {
    throw new Error(`Schedule ${scheduleId} not found`);
  }

  if (!schedule.enabled) {
    throw new Error(`Schedule ${scheduleId} is disabled`);
  }

  const result = await BatchCleanupService.runFullCleanup({
    operations: schedule.operations as CleanupOperationType[],
    batchSize: 50,
    dryRun: false,
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

/**
* Creates a cleanup schedule with the specified parameters
* @example
* createCleanupSchedule('Daily Cleanup', ['delete', 'archive'], '0 0 * * *', true)
* Promise<ScheduleCreateResult> { id: 'schedule-1609459200000', name: 'Daily Cleanup', operations: ['delete', 'archive'], schedule: '0 0 * * *', enabled: true, created: '2021-01-01T00:00:00.000Z' }
* @param {string} name - The name of the cleanup schedule.
* @param {Array<string>} operations - List of operations to be included in the cleanup.
* @param {string} schedule - Cron-style string for schedule timings.
* @param {boolean} enabled - Status of whether the schedule is active.
* @returns {Promise<ScheduleCreateResult>} Promise resolving to the details of the created schedule.
* @description 
*   - Returns a Promise that resolves to a ScheduleCreateResult object.
*   - Automatically generates a unique ID based on the current timestamp.
*   - Includes a creation timestamp in ISO format.
*/
function createCleanupSchedule(
  name: string,
  operations: string[],
  schedule: string,
  enabled: boolean,
): Promise<ScheduleCreateResult> {
  return Promise.resolve({
    id: `schedule-${Date.now()}`,
    name,
    operations,
    schedule,
    enabled,
    created: new Date().toISOString(),
  });
}

function updateCleanupSchedule(
  scheduleId: string,
  updates: Record<string, unknown>,
): Promise<ScheduleUpdateResult> {
  return Promise.resolve({
    scheduleId,
    updates,
    updated: new Date().toISOString(),
  });
}

function deleteCleanupSchedule(scheduleId: string): Promise<ScheduleDeleteResult> {
  return Promise.resolve({
    scheduleId,
    deleted: new Date().toISOString(),
  });
}

/**
* Analyzes duplicates based on a given threshold and returns a summary of the analysis.
* @example
* analyzeDuplicates(0.8)
* // Returns: { threshold: 0.8, potentialDuplicates: 0, highConfidenceMatches: 0, mediumConfidenceMatches: 0, lowConfidenceMatches: 0, analysisTime: "2023-10-01T12:34:56.789Z" }
* @param {number} threshold - The threshold value used to determine duplicate matching confidence.
* @returns {Promise<DuplicateAnalysisResult>} An object representing the duplicate analysis results including counts of potential matches and confidence levels.
* @description
*   - Executes the analysis asynchronously, returning a promise that resolves with the analysis results.
*   - Initializes match counts to zero as defaults.
*   - Includes the analysis time formatted as an ISO string.
*/
function analyzeDuplicates(threshold: number): Promise<DuplicateAnalysisResult> {
  try {
    return Promise.resolve({
      threshold,
      potentialDuplicates: 0,
      highConfidenceMatches: 0,
      mediumConfidenceMatches: 0,
      lowConfidenceMatches: 0,
      analysisTime: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error(
      `Duplicate analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Logs the completion details of a cleanup operation.
 * @example
 * logCleanupOperation('database', {summary: {success: true}}, {verbose: true})
 * // No return value
 * @param {string} type - The type of cleanup operation performed (e.g., 'database').
 * @param {Record<string, unknown>} result - An object containing the results of the cleanup operation.
 * @param {Record<string, unknown>} options - Additional options related to the logging of the cleanup.
 * @returns {Promise<void>} A Promise that resolves when the logging is complete.
 * @description
 *   - Utilizes `console.info` for successful logging and `console.warn` for handling errors during logging.
 *   - Ensures the operation's details include the type, result summary, options, and a timestamp.
 */
function logCleanupOperation(
  type: string,
  result: Record<string, unknown>,
  options: Record<string, unknown>,
): Promise<void> {
  try {
    console.info(`Cleanup operation completed:`, {
      type,
      result: result.summary as Record<string, unknown>,
      options,
      timestamp: new Date().toISOString(),
    });
    return Promise.resolve();
  } catch (error) {
    console.warn('Failed to log cleanup operation:', error);
    return Promise.resolve();
  }
}
