import { NextRequest, NextResponse } from 'next/server';
import {} from '@/lib/monitoring/apiMonitor';
import { handleClearAlerts, handleComprehensiveMonitoring, handleGetAlerts, handleServiceSpecificMonitoring, handleTestAlert, } from '@/lib/api/monitoring/api-usage/handlers';
export function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const service = searchParams.get('service');
        return service
            ? handleServiceSpecificMonitoring(request, service)
            : handleComprehensiveMonitoring();
    }
    catch (error) {
        console.error('API monitoring error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get API monitoring data',
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
function handlePostAction(action, service, level) {
    if (action === undefined) {
        return NextResponse.json({ success: false, error: 'Invalid request body: missing or invalid action' }, { status: 400 });
    }
    switch (action) {
        case 'clear-alerts': {
            return handleClearAlerts();
        }
        case 'get-alerts': {
            return handleGetAlerts();
        }
        case 'test-alert': {
            if (service === undefined || level === undefined) {
                return NextResponse.json({ success: false, error: 'Missing service or level for test-alert action' }, { status: 400 });
            }
            return handleTestAlert({ service, level });
        }
        default: {
            return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
        }
    }
}
export async function POST(request) {
    try {
        const rawBody = await request.json();
        if (typeof rawBody !== 'object' || rawBody === null) {
            // Changed to check for null instead of undefined as typeof null is 'object'
            return NextResponse.json({ success: false, error: 'Invalid request body: not an object' }, { status: 400 });
        }
        const body = rawBody;
        const action = typeof body.action === 'string' ? body.action : undefined;
        const service = typeof body.service === 'string' ? body.service : undefined;
        const level = typeof body.level === 'string' ? body.level : undefined;
        return handlePostAction(action, service, level);
    }
    catch (error) {
        console.error('API monitoring POST error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to process monitoring request',
            details: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
