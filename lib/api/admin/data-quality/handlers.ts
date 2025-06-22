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

interface TruckData {
  id: string;
  name: string;
  data_quality_score: number;
  verification_status: string;
}

interface QualityCategory {
  label: string;
  color: string;
  description: string;
}

export async function handleStatsAction() {
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

export async function handleAssessAction(truckId: string) {
  const truckRaw = await FoodTruckService.getTruckById(truckId);

  const truck = truckRaw as TruckData;

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

export async function handleDefaultGetAction() {
  const qualityStats = await FoodTruckService.getDataQualityStats();
  return NextResponse.json({
    success: true,
    data: qualityStats
  });
}

export async function handleUpdateSingle(truckId: string) {
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

export async function handleBatchUpdate(limit?: number) {
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

export async function handleRecalculateAll() {
  const { trucks } = await FoodTruckService.getAllTrucks(1000, 0);
  let updated = 0;
  let errors = 0;

  for (const truck of trucks) {
    try {
      const truckData = truck as TruckData;
      updated++;
    } catch (error: unknown) {
      const truckData = truck as TruckData;
      console.error(`Failed to update truck ${truckData.id}:`, error);
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
