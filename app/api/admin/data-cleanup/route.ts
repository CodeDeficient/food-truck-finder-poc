import { NextRequest, NextResponse } from 'next/server';
import { type DataCleanupRequestBody } from '@/lib/types';
import { handlePostRequest, handleGetRequest } from '@/lib/api/admin/data-cleanup/handlers';

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();

    // Validate rawBody against DataCleanupRequestBody type
    if (typeof rawBody !== 'object' || rawBody == undefined) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body: not an object' },
        { status: 400 },
      );
    }

    const body = rawBody as Partial<DataCleanupRequestBody>; // Use Partial for initial type assertion

    if (typeof body.action !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body: missing or invalid action' },
        { status: 400 },
      );
    }

    // Further validation can be added here for other properties of DataCleanupRequestBody if needed

    return await handlePostRequest(body as DataCleanupRequestBody);
  } catch (error: unknown) {
    console.error('Data cleanup API error:', error);
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

export async function GET(request: NextRequest) {
  try {
    return await handleGetRequest(request);
  } catch (error: unknown) {
    console.error('Data cleanup GET error:', error);
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
