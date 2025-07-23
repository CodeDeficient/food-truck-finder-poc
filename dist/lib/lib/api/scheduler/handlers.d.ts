import { NextResponse } from 'next/server';
import type { PutRequestBody } from './types';
/**
 * Retrieves the current status and summary information of scheduler tasks.
 * @example
 * handleSchedulerStatus()
 * {
 *   isRunning: true,
 *   tasks: [...],
 *   summary: {
 *     totalTasks: 5,
 *     enabledTasks: 3,
 *     runningTasks: 2,
 *     totalSuccesses: 12,
 *     totalErrors: 3
 *   }
 * }
 * @returns {Object} An object containing the runtime status and a summary of the scheduler tasks.
 * @description
 *   - Determines if the scheduler is currently running based on the presence of `schedulerInstance`.
 *   - Provides a detailed summary of the tasks, including counts of total, enabled, and running tasks.
 *   - Accumulates total successes and errors from all scheduler tasks for comprehensive reporting.
 */
export declare function handleSchedulerStatus(): NextResponse<{
    isRunning: boolean;
    tasks: import("./types").SchedulerTask[];
    summary: {
        totalTasks: number;
        enabledTasks: number;
        runningTasks: number;
        totalSuccesses: number;
        totalErrors: number;
    };
}>;
/**
* Generates a JSON response containing a list of scheduler logs
* @example
* handleSchedulerLogs()
* { logs: [...] }
* @returns {Object} A JSON object containing an array of log entries with details.
* @description
*   - Each log entry includes a timestamp, task identifier, log level, and a message.
*   - The log levels include 'info', 'error', and 'warning'.
*   - Log timestamps are derived from the current time and adjusted to simulate real-time delays.
*   - Provides insight into scheduler task execution and any issues encountered.
*/
export declare function handleSchedulerLogs(): NextResponse<{
    logs: {
        timestamp: string;
        taskId: string;
        level: string;
        message: string;
    }[];
}>;
export declare function handleSchedulerDefault(): NextResponse<{
    message: string;
    endpoints: string[];
}>;
/**
* Initializes the scheduler if it's not already running
* @example
* handleStartScheduler()
* { "message": "Scheduler started successfully", "status": "running" }
* @param {none}
* @returns {NextResponse} Returns a JSON response indicating the status of the scheduler.
* @description
*   - Checks if a scheduler instance already exists before proceeding.
*   - Sets the current time as the start time for the new scheduler instance.
*   - Returns a 409 status code if the scheduler is already running.
*/
export declare function handleStartScheduler(): NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
    status: string;
}>;
/**
* Stops the scheduler if it is currently running and returns a status message.
* @example
* handleStopScheduler()
* { message: 'Scheduler stopped successfully', status: 'stopped' }
* @param {undefined} schedulerInstance - Represents the current instance of the scheduler.
* @returns {Object} JSON response object containing a message and a status of the operation.
* @description
*   - Returns an error message if the scheduler is not running.
*   - Sets the scheduler instance to undefined to signify it has been stopped.
*/
export declare function handleStopScheduler(): NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
    status: string;
}>;
/**
 * Executes a task by its ID and returns the execution result.
 * @example
 * handleExecuteTask('12345')
 * { message: 'Task 12345 executed', task: { ... } }
 * @param {string} taskId - Unique identifier of the task to be executed.
 * @returns {NextResponse} JSON response containing the execution result and task details.
 * @description
 *   - If the task ID is undefined or an empty string, returns a 400 JSON error response.
 *   - Finds the task associated with the given ID; returns a 404 JSON error if not found.
 *   - Task execution includes simulating success or failure. Math.random is used for simulation.
 *   - Updates task properties like lastRun, lastSuccess, successCount, errorCount based on execution result.
 */
export declare function handleExecuteTask(taskId: string): NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
    task: import("./types").SchedulerTask;
}>;
/**
 * Handles the update of a task configuration by modifying schedulerTasks.
 * @example
 * handleUpdateTask({ taskId: '123', config: { intervalMinutes: 10 } })
 * { message: 'Task configuration updated', task: { ...updatedTaskDetails } }
 * @param {PutRequestBody} body - Contains taskId and config object for updating task.
 * @returns {NextResponse} JSON response with status indicating the result of the operation.
 * @description
 *   - Checks for required taskId and existence of the task within schedulerTasks.
 *   - Modifies the task configuration using provided config object.
 *   - Updates nextRun time if intervalMinutes is specified and task is enabled.
 */
export declare function handleUpdateTask(body: PutRequestBody): NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
    task: import("./types").SchedulerTask;
}>;
