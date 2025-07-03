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
  } catch (error: unknown) {
    console.error('Automated cleanup GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody: unknown = await request.json();

    // Validate rawBody against RequestBody type
    if (typeof rawBody !== 'object' || rawBody == undefined) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body: not an object' },
        { status: 400 },
      );
    }

    const body = rawBody as Partial<RequestBody>; // Use Partial for initial type assertion

    if (typeof body.action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body: missing or invalid action' },
        { status: 400 },
      );
    }

    // Further validation can be added here for other properties of RequestBody if needed
    // For now, we assume if action is present and string, it's sufficient for initial handling

    return await handlePostRequest(body as RequestBody);
  } catch (error: unknown) {
    console.error('Automated cleanup POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
