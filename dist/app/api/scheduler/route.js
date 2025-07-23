import { NextResponse } from 'next/server';
import { handleExecuteTask, handleSchedulerDefault, handleSchedulerLogs, handleSchedulerStatus, handleStartScheduler, handleStopScheduler, handleUpdateTask, } from '@/lib/api/scheduler/handlers';
export function GET(request) {
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
    }
    catch (error) {
        console.error('Scheduler API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const body = (await request.json());
        const { action, taskId } = body;
        switch (action) {
            case 'start': {
                return handleStartScheduler();
            }
            case 'stop': {
                return handleStopScheduler();
            }
            case 'execute': {
                return handleExecuteTask(taskId);
            }
            default: {
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
            }
        }
    }
    catch (error) {
        console.error('Error in scheduler POST:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
export async function PUT(request) {
    try {
        const body = (await request.json());
        return handleUpdateTask(body);
    }
    catch (error) {
        console.error('Error updating task configuration:', error);
        return NextResponse.json({ error: 'Failed to update task configuration' }, { status: 500 });
    }
}
