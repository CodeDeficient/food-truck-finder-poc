import { NextRequest, NextResponse } from 'next/server';
import { handlePostRequest, handleGetRequest } from '@/lib/api/cron/auto-scrape/handlers';
export async function POST(request) {
    try {
        return await handlePostRequest(request);
    }
    catch (error) {
        console.error('Auto-scraping cron job failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Auto-scraping failed',
            message: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
export function GET() {
    return handleGetRequest();
}
