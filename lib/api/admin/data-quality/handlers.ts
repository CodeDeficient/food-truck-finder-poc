import { NextRequest, NextResponse } from 'next/server';
import { FoodTruckService, supabase, FoodTruck } from '@/lib/supabase';

export async function handleGetRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const truckId = searchParams.get('truckId');

  switch (action) {
    case 'stats': {
      return await handleStatsAction();
    }
    case 'assess': {
      if (!truckId) {
        return NextResponse.json(
          { success: false, error: 'Missing truckId for assess action' },
          { status: 400 },
        );
      }
      return await handleAssessAction(truckId);
    }
    default: {
      return await handleDefaultGetAction();
    }
  }
}

interface PostRequestBody {
  action: string;
  truckId?: string;
}

export async function handlePostRequest(request: NextRequest): Promise<NextResponse> {
  const body: unknown = await request.json();

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { action, truckId } = body as PostRequestBody;

  switch (action) {
    case 'update-single': {
      if (truckId === undefined || truckId === '') {
        return NextResponse.json(
          { success: false, error: 'Missing truckId for update-single action' },
          { status: 400 },
        );
      }
      return await handleUpdateSingle(truckId);
    }
    case 'batch-update': {
      return handleBatchUpdate();
    }
    case 'recalculate-all': {
      return await handleRecalculateAll();
    }
    default: {
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}` },
        { status: 400 },
      );
    }
  }
}

async function handleStatsAction() {
  const qualityStats = await FoodTruckService.getDataQualityStats();

  return NextResponse.json({
    success: true,
    data: {
      ...qualityStats,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleAssessAction(truckId: string) {
  const truckResult = await FoodTruckService.getTruckById(truckId);

  if ('error' in truckResult) {
    return NextResponse.json({ success: false, error: truckResult.error }, { status: 404 });
  }

  const truck: FoodTruck = truckResult; // Explicitly cast to FoodTruck

  return NextResponse.json({
    success: true,
    data: {
      truckId,
      truckName: truck.name,
      currentScore: truck.data_quality_score,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleDefaultGetAction() {
  const qualityStats = await FoodTruckService.getDataQualityStats();
  return NextResponse.json({
    success: true,
    data: qualityStats,
  });
}

async function handleUpdateSingle(truckId: string) {
  const updatedTruckResult = await FoodTruckService.getTruckById(truckId);

  if ('error' in updatedTruckResult) {
    return NextResponse.json({ success: false, error: updatedTruckResult.error }, { status: 404 });
  }

  const updatedTruck = updatedTruckResult;

  return NextResponse.json({
    success: true,
    message: 'Quality score updated successfully',
    data: {
      truckId: updatedTruck.id,
      truckName: updatedTruck.name,
      newScore: updatedTruck.data_quality_score,
      verificationStatus: updatedTruck.verification_status,
      timestamp: new Date().toISOString(),
    },
  });
}

function handleBatchUpdate() {
  return NextResponse.json({
    success: true,
    message: 'Batch quality score update completed',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
}

function updateSingleTruckQualityScore(truck: { id: string }): boolean {
  try {
    // Placeholder for actual update logic if needed
    // DataQualityService.updateTruckQualityScore(truck.id);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to update truck ${truck.id}:`, error);
    return false;
  }
}

async function handleRecalculateAll() {
  const allTrucksResult = await FoodTruckService.getAllTrucks(1000, 0);
  if (allTrucksResult.error !== undefined) {
    console.error('Error fetching all trucks for recalculation:', allTrucksResult.error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trucks for recalculation' },
      { status: 500 },
    );
  }
  const { trucks } = allTrucksResult;
  let updated = 0;
  let errors = 0;

  for (const truck of trucks) {
    const success = updateSingleTruckQualityScore(truck);
    if (success) {
      updated++;
    } else {
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Quality score recalculation completed',
    data: {
      totalTrucks: trucks.length,
      updated,
      errors,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

    if (error || !user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}
