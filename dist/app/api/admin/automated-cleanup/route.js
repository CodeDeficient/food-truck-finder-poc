import { NextRequest, NextResponse } from 'next/server';
import { handlePostRequest, handleGetStatus, handleGetSchedules, handleGetHistory, handleGetPreview, handleGetDefault, } from '@/lib/api/admin/automated-cleanup/handlers';
import { verifyAdminAccess } from '@/lib/auth/authHelpers';
/**
 * SOTA Automated Data Cleanup API
 *
 * Provides scheduled and on-demand data cleanup operations
 * with comprehensive monitoring and reporting capabilities
 *
 * GET /api/admin/automated-cleanup - Get cleanup status and schedule
 * POST /api/admin/automated-cleanup - Run cleanup operations
 */
export async function GET(request) {
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
    }
    catch (error) {
        console.error('Automated cleanup GET error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process cleanup request',
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const hasAccess = await verifyAdminAccess(request);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const rawBody = await request.json();
        // Validate rawBody against RequestBody type
        if (!isRequestBody(rawBody)) {
            return NextResponse.json({ success: false, error: 'Invalid request body: does not conform to RequestBody type' }, { status: 400 });
        }
        const body = rawBody;
        return await handlePostRequest(body);
    }
    catch (error) {
        console.error('Automated cleanup POST error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process cleanup request',
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
// Type guard for RequestBody
function isRequestBody(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'action' in obj &&
        typeof obj.action === 'string');
}
