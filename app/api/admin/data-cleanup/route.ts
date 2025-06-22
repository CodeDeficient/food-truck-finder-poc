import { NextRequest, NextResponse } from 'next/server';
import {
  handlePostRequest,
  handleGetRequest,
} from '@/lib/api/admin/data-cleanup/handlers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return await handlePostRequest(body);
  } catch (error) {
    console.error('Data cleanup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return await handleGetRequest(request);
  } catch (error) {
    console.error('Data cleanup GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
