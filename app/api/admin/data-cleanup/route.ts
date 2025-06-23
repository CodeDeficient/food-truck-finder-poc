import { NextRequest, NextResponse } from 'next/server';
import {
  handlePostRequest,
  handleGetRequest,
  DataCleanupRequestBody,
} from '@/lib/api/admin/data-cleanup/handlers';

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    // Basic validation to ensure it's an object and has an 'action' property
    if (typeof rawBody !== 'object' || rawBody === null || !('action' in rawBody)) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }
    const body: DataCleanupRequestBody = rawBody as DataCleanupRequestBody;
    return await handlePostRequest(body);
  } catch (error: unknown) {
    console.error('Data cleanup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return await handleGetRequest(request);
  } catch (error: unknown) {
    console.error('Data cleanup GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
