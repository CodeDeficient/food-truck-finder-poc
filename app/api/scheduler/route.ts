import { type NextRequest, NextResponse } from 'next/server';
import {
  handleExecuteTask,
  handleSchedulerDefault,
  handleSchedulerLogs,
  handleSchedulerStatus,
  handleStartScheduler,
  handleStopScheduler,
  handleUpdateTask,
} from '@/lib/api/scheduler/handlers';
import { PostRequestBody, PutRequestBody } from '@/lib/api/scheduler/types';

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'status': {
        return handleSchedulerStatus();
      }
      case 'logs': {
        return handleSchedulerLogs();
      }
      default: {
        return handleSchedulerDefault();
      }
    }
  } catch (error: unknown) {
    console.error('Scheduler API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PostRequestBody;
    const { action, taskId } = body;

    switch (action) {
      case 'start': {
        return handleStartScheduler();
      }
      case 'stop': {
        return handleStopScheduler();
      }
      case 'execute': {
        return handleExecuteTask(taskId as string);
      }
      default: {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }
  } catch (error: unknown) {
    console.error('Error in scheduler POST:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as PutRequestBody;
    return handleUpdateTask(body);
  } catch (error: unknown) {
    console.error('Error updating task configuration:', error);
    return NextResponse.json({ error: 'Failed to update task configuration' }, { status: 500 });
  }
}
