import { NextResponse } from 'next/server';
import { schedulerInstance, schedulerTasks, setSchedulerInstance } from './data';
import { PutRequestBody } from './types';

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
    task.successCount++;
    task.lastError = undefined;
  } else {
    task.errorCount++;
    task.lastError = 'Simulated execution error';
  }

  return NextResponse.json({
    message: `Task ${taskId} executed`,
    task: task,
  });
}

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
