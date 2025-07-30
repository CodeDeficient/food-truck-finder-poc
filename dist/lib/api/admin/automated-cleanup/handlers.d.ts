import { NextResponse } from 'next/server';
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
export declare function handlePostRequest(body: {
    action: string;
    options?: Record<string, unknown>;
}): Promise<NextResponse<unknown>>;
export declare function handleGetStatus(): Promise<NextResponse>;
export declare function handleGetSchedules(): Promise<NextResponse>;
export declare function handleGetHistory(searchParams: URLSearchParams): Promise<NextResponse>;
export declare function handleGetPreview(searchParams: URLSearchParams): Promise<NextResponse>;
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
export declare function handleGetDefault(): Promise<NextResponse>;
export declare function handleRunScheduled(options: RunScheduledOptions): Promise<NextResponse>;
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
export declare function handleRunImmediate(options: RunImmediateOptions): Promise<NextResponse>;
export declare function handleScheduleCleanup(options: ScheduleCleanupOptions): Promise<NextResponse>;
export declare function handleUpdateSchedule(options: UpdateScheduleOptions): Promise<NextResponse>;
export declare function handleDeleteSchedule(options: DeleteScheduleOptions): Promise<NextResponse>;
export declare function handleAnalyzeDuplicates(options: Record<string, unknown>): Promise<NextResponse>;
export {};
