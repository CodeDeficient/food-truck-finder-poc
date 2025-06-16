import { NextRequest, NextResponse } from 'next/server';
import { DataQualityService, FoodTruckService, supabase } from '@/lib/supabase';

// Security check for admin API endpoints
async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

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
        const qualityStats = await FoodTruckService.getDataQualityStats();
        const thresholds = DataQualityService.getQualityThresholds();
        
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
        if (!truckId) {
          return NextResponse.json(
            { success: false, error: 'Truck ID required for assessment' },
            { status: 400 }
          );
        }

        // Get truck and assess quality
        const truck = await FoodTruckService.getTruckById(truckId);
        const assessment = DataQualityService.calculateQualityScore(truck);
        
        return NextResponse.json({
          success: true,
          data: {
            truckId,
            truckName: truck.name,
            currentScore: truck.data_quality_score,
            newAssessment: assessment,
            category: DataQualityService.categorizeQualityScore(assessment.score),
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
  } catch (error) {
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
        if (!truckId) {
          return NextResponse.json(
            { success: false, error: 'Truck ID required' },
            { status: 400 }
          );
        }

        const updatedTruck = await DataQualityService.updateTruckQualityScore(truckId);
        
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
        const results = await DataQualityService.batchUpdateQualityScores(batchLimit);
        
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
            await DataQualityService.updateTruckQualityScore(truck.id);
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

      default: {
        return NextResponse.json(
          { success: false, error: 'Invalid action specified' },
          { status: 400 }
        );
      }
    }
  } catch (error) {
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
