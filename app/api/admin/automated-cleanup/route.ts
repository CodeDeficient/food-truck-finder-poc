import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminAccess,
  handlePostRequest,
  handleGetStatus,
  handleGetSchedules,
  handleGetHistory,
  handleGetPreview,
  handleGetDefault,
} from '@/lib/api/admin/automated-cleanup/handlers';
import { RequestBody } from '@/lib/api/admin/automated-cleanup/types';

/**
 * SOTA Automated Data Cleanup API
 * 
 * Provides scheduled and on-demand data cleanup operations
 * with comprehensive monitoring and reporting capabilities
 * 
 * GET /api/admin/automated-cleanup - Get cleanup status and schedule
 * POST /api/admin/automated-cleanup - Run cleanup operations
 */

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

    const body: RequestBody = await request.json();
    return await handlePostRequest(body);
  } catch (error) {
    console.error('Automated cleanup POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process cleanup request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
