import { NextRequest, NextResponse } from 'next/server';
import {
  handleFullCleanup,
  handleCheckDuplicates,
  handleMergeDuplicates,
  handleDryRun,
  handleGetStatus,
  handleGetPreview,
  handleGetDefault,
} from '@/lib/api/admin/data-cleanup/handlers';

interface DataCleanupRequestBody {
  action: string;
  options?: {
    batchSize?: number;
    dryRun?: boolean;
    operations?: string[];
    truckData?: Record<string, unknown>;
    targetId?: string;
    sourceId?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DataCleanupRequestBody;
    const { action, options = {} } = body;

    switch (action) {
      case 'full-cleanup':
        return await handleFullCleanup(options);
      case 'check-duplicates':
        return await handleCheckDuplicates(options);
      case 'merge-duplicates':
        return await handleMergeDuplicates(options);
      case 'dry-run':
        return await handleDryRun(options);
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
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
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return await handleGetStatus();
      case 'preview':
        return await handleGetPreview();
      default:
        return await handleGetDefault();
    }
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
