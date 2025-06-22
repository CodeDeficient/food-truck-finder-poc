import { NextRequest, NextResponse } from 'next/server';
import {
  handleStatsAction,
  handleAssessAction,
  handleDefaultGetAction,
  handleUpdateSingle,
  handleBatchUpdate,
  handleRecalculateAll,
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
    const action = searchParams.get('action');
    const truckId = searchParams.get('truckId');

    switch (action) {
      case 'stats': {
        return await handleStatsAction();
      }
      case 'assess': {
        if (truckId == undefined) {
          return NextResponse.json(
            { success: false, error: 'Truck ID required for assessment' },
            { status: 400 }
          );
        }
        return await handleAssessAction(truckId);
      }
      default: {
        return await handleDefaultGetAction();
      }
    }
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
    const body = await request.json() as { action: string; truckId?: string; limit?: number };
    const { action, truckId, limit } = body;

    switch (action) {
      case 'update_single': {
        if (truckId == undefined) {
          return NextResponse.json(
            { success: false, error: 'Truck ID required' },
            { status: 400 }
          );
        }
        return await handleUpdateSingle(truckId);
      }
      case 'batch_update': {
        return await handleBatchUpdate(limit);
      }
      case 'recalculate_all': {
        return await handleRecalculateAll();
      }
      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
      }
    }
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
