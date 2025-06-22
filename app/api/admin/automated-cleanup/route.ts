import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminAccess,
  handleGetStatus,
  handleGetSchedules,
  handleGetHistory,
  handleGetPreview,
  handleGetDefault,
  handleRunScheduled,
  handleRunImmediate,
  handleScheduleCleanup,
  handleUpdateSchedule,
  handleDeleteSchedule,
  handleAnalyzeDuplicates,
} from '@/lib/api/admin/automated-cleanup/handlers';

/**
 * SOTA Automated Data Cleanup API
 * 
 * Provides scheduled and on-demand data cleanup operations
 * with comprehensive monitoring and reporting capabilities
 * 
 * GET /api/admin/automated-cleanup - Get cleanup status and schedule
 * POST /api/admin/automated-cleanup - Run cleanup operations
 */

interface RequestBody {
  action: string;
  options?: Record<string, unknown>;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status': {
        return await handleGetStatus();
      }
      case 'schedules': {
        return await handleGetSchedules();
      }
      case 'history': {
        return await handleGetHistory(searchParams);
      }
      case 'preview': {
        return await handleGetPreview(searchParams);
      }
      default: {
        return await handleGetDefault();
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
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as RequestBody;
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
