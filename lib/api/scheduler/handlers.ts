import { NextResponse } from 'next/server';
import { schedulerInstance, schedulerTasks, setSchedulerInstance } from './data';
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
export function handleSchedulerStatus() {
  return NextResponse.json({
    isRunning: schedulerInstance != undefined,
    tasks: schedulerTasks,
    summary: {
      totalTasks: schedulerTasks.length,
      enabledTasks: schedulerTasks.filter((t) => t.enabled).length,
      runningTasks: schedulerTasks.filter((t) => t.enabled && t.nextRun != undefined).length,
      totalSuccesses: schedulerTasks.reduce((acc, t) => acc + t.successCount, 0),
      totalErrors: schedulerTasks.reduce((acc, t) => acc + t.errorCount, 0),
    },
  });
}

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
export function handleSchedulerLogs() {
  return NextResponse.json({
    logs: [
      {
        timestamp: new Date(Date.now() - 300_000).toISOString(),
        taskId: 'location_update',
        level: 'info',
        message: 'Successfully updated locations for 12 food trucks',
      },
      {
        timestamp: new Date(Date.now() - 900_000).toISOString(),
        taskId: 'instagram_scrape',
        level: 'info',
        message: 'Scraped 3 Instagram accounts, found 8 new posts',
      },
      {
        timestamp: new Date(Date.now() - 1_800_000).toISOString(),
        taskId: 'gemini_processing',
        level: 'error',
        message: 'Rate limit exceeded, skipping AI processing',
      },
      {
        timestamp: new Date(Date.now() - 3_600_000).toISOString(),
        taskId: 'website_crawl',
        level: 'warning',
        message: 'Failed to crawl tacoparadise.com - site temporarily unavailable',
      },
    ],
  });
}

export function handleSchedulerDefault() {
  return NextResponse.json({
    message: 'Task Scheduler API',
    endpoints: [
      'GET /api/scheduler?action=status - Get scheduler status',
      'GET /api/scheduler?action=logs - Get execution logs',
      'POST /api/scheduler - Start/stop scheduler or execute task',
      'PUT /api/scheduler - Update task configuration',
    ],
  });
}

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
export function handleStartScheduler() {
  if (schedulerInstance) {
    return NextResponse.json({ error: 'Scheduler is already running' }, { status: 409 });
  }

  setSchedulerInstance({ started: new Date().toISOString() });

  return NextResponse.json({
    message: 'Scheduler started successfully',
    status: 'running',
  });
}

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
export function handleStopScheduler() {
  if (!schedulerInstance) {
    return NextResponse.json({ error: 'Scheduler is not running' }, { status: 409 });
  }

  setSchedulerInstance(undefined);

  return NextResponse.json({
    message: 'Scheduler stopped successfully',
    status: 'stopped',
  });
}

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
export function handleExecuteTask(taskId: string) {
  if (taskId == undefined || taskId === '') {
    return NextResponse.json({ error: 'Task ID is required for execution' }, { status: 400 });
  }

  const task = schedulerTasks.find((t) => t.id === taskId);
  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Simulate task execution
  task.lastRun = new Date().toISOString();

  // Simulate success/failure
  // eslint-disable-next-line sonarjs/pseudo-random -- Math.random is acceptable for simulating task execution.
  if (Math.random() > 0.1) {
    // 90% success rate
    task.lastSuccess = task.lastRun;
    task.successCount += 1;
    task.lastError = undefined;
  } else {
    task.errorCount += 1;
    task.lastError = 'Simulated execution error';
  }

  return NextResponse.json({
    message: `Task ${taskId} executed`,
    task: task,
  });
}

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
export function handleUpdateTask(body: PutRequestBody) {
  const { taskId, config } = body;

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  const taskIndex = schedulerTasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Update task configuration
  schedulerTasks[taskIndex] = {
    ...schedulerTasks[taskIndex],
    ...config,
  };

  // Update next run time if interval changed
  if (
    config.intervalMinutes != undefined &&
    config.intervalMinutes > 0 &&
    schedulerTasks[taskIndex].enabled
  ) {
    const lastRun = new Date(schedulerTasks[taskIndex].lastRun ?? Date.now());
    const nextRun = new Date(lastRun.getTime() + config.intervalMinutes * 60 * 1000);
    schedulerTasks[taskIndex].nextRun = nextRun.toISOString();
  }

  return NextResponse.json({
    message: 'Task configuration updated',
    task: schedulerTasks[taskIndex],
  });
}
