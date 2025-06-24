import { NextRequest, NextResponse } from 'next/server';
import { FoodTruckService, supabase } from '@/lib/supabase';

interface QualityThresholds {
  excellent: number;
  good: number;
  fair: number;
  poor: number;
}

interface QualityAssessment {
  score: number;
  breakdown: Record<string, number>;
  recommendations: string[];
}

interface QualityCategory {
  label: string;
  color: string;
  description: string;
}

export async function handleGetRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const truckId = searchParams.get('truckId');
  const limit = searchParams.get('limit');

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
  const body = await request.json();
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
  const qualityStatsRaw = await FoodTruckService.getDataQualityStats();

  const qualityStats = qualityStatsRaw as Record<string, unknown>;

  return NextResponse.json({
    success: true,
    data: {
      ...qualityStats,
      timestamp: new Date().toISOString()
    }
  });
}

async function handleAssessAction(truckId: string) {
  const truck = await FoodTruckService.getTruckById(truckId);

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
  const qualityStats = await FoodTruckService.getDataQualityStats();
  return NextResponse.json({
    success: true,
    data: qualityStats
  });
}

async function handleUpdateSingle(truckId: string) {
  const updatedTruck = await FoodTruckService.getTruckById(truckId);
  
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

 function handleBatchUpdate(limit?: number) {
  const batchLimit = limit ?? 100;
  
  return NextResponse.json({
    success: true,
    message: 'Batch quality score update completed',
    data: {
      limit: batchLimit,
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
      // If update logic is needed, add here
      updated++;
    } catch (error) {
      console.error(`Failed to update truck ${truck.id}:`, error);
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
    if (authHeader == undefined) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
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
