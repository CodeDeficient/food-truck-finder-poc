import { NextRequest, NextResponse } from 'next/server';
import {
  handleGetRequest,
  handlePostRequest,
  verifyAdminAccess,
} from '@/lib/api/admin/data-quality/handlers';

export async function GET(request: NextRequest) {
  const hasAdminAccess = await verifyAdminAccess(request);
  if (!hasAdminAccess) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    return await handleGetRequest(request);
  } catch (error: unknown) {
    console.error('Error fetching data quality information:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data quality information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const hasAdminAccess = await verifyAdminAccess(request);
  if (!hasAdminAccess) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    return await handlePostRequest(request);
  } catch (error: unknown) {
    console.error('Error updating data quality:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update data quality',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
