import { NextRequest, NextResponse } from 'next/server';
import { handleGetRequest, handlePostRequest } from '@/lib/api/analytics/web-vitals/handlers';

export async function POST(request: NextRequest) {
  try {
    return await handlePostRequest(request);
  } catch (error) {
    console.error('Web vitals endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    return await handleGetRequest(request);
  } catch (error) {
    console.error('Failed to fetch web vitals analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 },
    );
  }
}
