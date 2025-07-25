import { NextResponse } from 'next/server';
import { handleGetRequest } from '@/lib/api/admin/scraping-metrics/handlers';
import { verifyAdminAccess } from '@/lib/auth/authHelpers';
export async function GET(request) {
    const hasAdminAccess = await verifyAdminAccess(request);
    if (!hasAdminAccess) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }
    try {
        return await handleGetRequest();
    }
    catch (error) {
        console.error('Error fetching scraping metrics:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch scraping metrics',
            metrics: undefined,
        }, { status: 500 });
    }
}
