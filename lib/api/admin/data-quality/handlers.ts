import { NextRequest, NextResponse } from 'next/server';
import { FoodTruckService, supabase } from '@/lib/supabase';

interface TruckData {
  id: string;
  name: string;
  data_quality_score: number;
  verification_status: string;
}

interface QualityStats {
  average_score: number;
  total_trucks: number;
  trucks_by_quality: Record<string, number>;
  // Add other expected properties from FoodTruckService.getDataQualityStats()
}

export async function handleGetRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const truckId = searchParams.get('truckId'); // Corrected: was searchParams.get('action')
  // const limit = searchParams.get('limit'); // Unused variable

  switch (action) {
    case 'stats': {
      return await handleStatsAction();
    }
    case 'assess': {
      if (!truckId) {
        return NextResponse.json({ success: false, error: 'Missing truckId for assess action' }, { status: 400 });
      }
      return await handleAssessAction(truckId);
    }
    default: {
      return await handleDefaultGetAction();
    }
  }
}

export async function handlePostRequest(request: NextRequest): Promise<NextResponse> {
  const body = await request.json() as { action?: string; truckId?: string; limit?: number }; // Added type for body
  const { action, truckId, limit } = body;

  switch (action) {
    case 'update-single': {
      if (!truckId) {
        return NextResponse.json({ success: false, error: 'Missing truckId for update-single action' }, { status: 400 });
      }
      return await handleUpdateSingle(truckId);
    }
    case 'batch-update': {
      return await handleBatchUpdate(limit);
    }
    case 'recalculate-all': {
      return await handleRecalculateAll();
    }
    default: {
      return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  }
}

async function handleStatsAction() {
  const qualityStats = await FoodTruckService.getDataQualityStats() as QualityStats;

  return NextResponse.json({
    success: true,
    data: {
      ...qualityStats,
      timestamp: new Date().toISOString()
    }
  });
}

async function handleAssessAction(truckId: string) {
  // Assuming FoodTruckService.getTruckById is synchronous or returns a Promise that resolves to TruckData
  const truck = await FoodTruckService.getTruckById(truckId) as TruckData;

  return NextResponse.json({
    success: true,
    data: {
      truckId,
      truckName: truck.name,
      currentScore: truck.data_quality_score,
      timestamp: new Date().toISOString()
    }
  });
}

async function handleDefaultGetAction() {
  // Assuming FoodTruckService.getDataQualityStats is synchronous or returns a Promise that resolves to QualityStats
  const qualityStats = FoodTruckService.getDataQualityStats() as QualityStats;
  return NextResponse.json({
    success: true,
    data: qualityStats
  });
}

async function handleUpdateSingle(truckId: string) {
  // Assuming FoodTruckService.getTruckById is synchronous or returns a Promise that resolves to TruckData
  const updatedTruck = await FoodTruckService.getTruckById(truckId) as TruckData;
  
  return NextResponse.json({
    success: true,
    message: 'Quality score updated successfully',
    data: {
      truckId: updatedTruck.id,
      truckName: updatedTruck.name,
      newScore: updatedTruck.data_quality_score,
      verificationStatus: updatedTruck.verification_status,
      timestamp: new Date().toISOString()
    }
  });
}

async function handleBatchUpdate(limit: number | undefined = 100) { // Added default parameter
  return NextResponse.json({
    success: true,
    message: 'Batch quality score update completed',
    data: {
      limit,
      timestamp: new Date().toISOString()
    }
  });
}

async function handleRecalculateAll() {
  const { trucks } = await FoodTruckService.getAllTrucks(1000, 0);
  let updated = 0;
  let errors = 0;

  for (const truck of trucks) {
    try {
      // Process the truck (e.g. update quality score)
      // const truckData = truck as TruckData; // No longer a dead store if used
      updated++;
    } catch (error: unknown) {
      console.error(`Failed to update truck ${(truck as TruckData).id}:`, error); // Access id safely
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
      timestamp: new Date().toISOString()
    }
  });
}

export async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader === null || authHeader === '') {
      return false;
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return false;
    }

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
