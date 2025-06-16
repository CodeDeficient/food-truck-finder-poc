import { NextRequest, NextResponse } from 'next/server';
import { DataQualityService, FoodTruckService, supabase } from '@/lib/supabase';

// Type definitions for API responses
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

// Security check for admin API endpoints
async function verifyAdminAccess(request: Request): Promise<boolean> {
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

// GET: Retrieve data quality statistics and metrics
export async function GET(request: NextRequest) {
  // Verify admin access
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
        // Get comprehensive quality statistics
        const qualityStatsRaw = await FoodTruckService.getDataQualityStats();
        const thresholdsRaw = DataQualityService.getQualityThresholds();

        // Type-safe casting with proper error handling
        const qualityStats = qualityStatsRaw as Record<string, unknown>;
        const thresholds = thresholdsRaw as QualityThresholds;
        
        return NextResponse.json({
          success: true,
          data: {
            ...qualityStats,
            thresholds,
            timestamp: new Date().toISOString()
          }
        });
      }

      case 'assess': {
        if (truckId == undefined) {
          return NextResponse.json(
            { success: false, error: 'Truck ID required for assessment' },
            { status: 400 }
          );
        }

        // Get truck and assess quality
        const truckRaw = await FoodTruckService.getTruckById(truckId);
        const assessmentRaw = DataQualityService.calculateQualityScore(truckRaw);

        // Type-safe casting
        const truck = truckRaw as TruckData;
        const assessment = assessmentRaw as QualityAssessment;
        
        return NextResponse.json({
          success: true,
          data: {
            truckId,
            truckName: truck.name,
            currentScore: truck.data_quality_score,
            newAssessment: assessment,
            category: DataQualityService.categorizeQualityScore(assessment.score) as QualityCategory,
            timestamp: new Date().toISOString()
          }
        });
      }

      default: {
        // Default: return overview statistics
        const qualityStats = await FoodTruckService.getDataQualityStats();
        return NextResponse.json({
          success: true,
          data: qualityStats
        });
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

// POST: Update quality scores or perform quality operations
export async function POST(request: NextRequest) {
  // Verify admin access
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

        const updatedTruckRaw = await DataQualityService.updateTruckQualityScore(truckId);
        const updatedTruck = updatedTruckRaw as TruckData;
        
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

      case 'batch_update': {
        const batchLimit = limit ?? 100;
        const resultsRaw = await DataQualityService.batchUpdateQualityScores(batchLimit);
        const results = resultsRaw as Record<string, unknown>;
        
        return NextResponse.json({
          success: true,
          message: 'Batch quality score update completed',
          data: {
            ...results,
            limit: batchLimit,
            timestamp: new Date().toISOString()
          }
        });
      }

      case 'recalculate_all': {
        // Recalculate quality scores for all trucks
        const { trucks } = await FoodTruckService.getAllTrucks(1000, 0);
        let updated = 0;
        let errors = 0;

        for (const truck of trucks) {
          try {
            const truckData = truck as TruckData;
            await DataQualityService.updateTruckQualityScore(truckData.id);
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
