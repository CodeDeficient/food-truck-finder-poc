import { NextRequest, NextResponse } from 'next/server';
import { BatchCleanupService } from '@/lib/data-quality/batchCleanup';
import { DuplicatePreventionService } from '@/lib/data-quality/duplicatePrevention';

/**
 * Data Cleanup API Endpoint
 * Provides automated data quality improvements and cleanup operations
 */

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
      case 'full-cleanup': {
        const result = await BatchCleanupService.runFullCleanup({
          batchSize: options.batchSize ?? 50,
          dryRun: options.dryRun || false,
          // @ts-expect-error TS(2322): Type 'string[] | undefined' is not assignable to t... Remove this comment to see the full error message
          operations: options.operations
        });
        
        return NextResponse.json({
          success: true,
          action: 'full-cleanup',
          result,
          message: `Cleanup completed: ${result.summary.trucksImproved} trucks improved, ${result.summary.duplicatesRemoved} duplicates removed`
        });
      }

      case 'check-duplicates': {
        const { truckData } = options;
        if (!truckData) {
          return NextResponse.json(
            { success: false, error: 'Missing truckData for duplicate check' },
            { status: 400 }
          );
        }

        const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truckData);
        
        return NextResponse.json({
          success: true,
          action: 'check-duplicates',
          result: duplicateCheck
        });
      }

      case 'merge-duplicates': {
        const { targetId, sourceId } = options;
        if (!targetId || !sourceId) {
          return NextResponse.json(
            { success: false, error: 'Missing targetId or sourceId for merge operation' },
            { status: 400 }
          );
        }

        const mergedTruck = await DuplicatePreventionService.mergeDuplicates(targetId, sourceId);
        
        return NextResponse.json({
          success: true,
          action: 'merge-duplicates',
          result: mergedTruck,
          message: `Successfully merged truck ${sourceId} into ${targetId}`
        });
      }

      case 'dry-run': {
        // @ts-expect-error TS(2345): Argument of type '{ dryRun: true; batchSize?: numb... Remove this comment to see the full error message
        const result = await BatchCleanupService.runFullCleanup({
          ...options,
          dryRun: true
        });
        
        return NextResponse.json({
          success: true,
          action: 'dry-run',
          result,
          message: 'Dry run completed - no changes made to database'
        });
      }

      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
      }
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

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status': {
        // Return cleanup system status
        return NextResponse.json({
          success: true,
          status: {
            available_operations: [
              'remove_placeholders',
              'normalize_phone',
              'fix_coordinates',
              'update_quality_scores',
              'merge_duplicates'
            ],
            default_batch_size: 50,
            supports_dry_run: true
          }
        });
      }

      case 'preview': {
        // Run a small dry run to preview changes
        const result = await BatchCleanupService.runFullCleanup({
          batchSize: 10,
          dryRun: true
        });
        
        return NextResponse.json({
          success: true,
          preview: {
            estimated_improvements: result.summary.trucksImproved,
            estimated_duplicates: result.summary.duplicatesRemoved,
            operations: result.operations.map(op => ({
              type: op.type,
              description: op.description,
              affected_count: op.affectedCount
            }))
          }
        });
      }

      default: {
        return NextResponse.json({
          success: true,
          endpoints: [
            'GET /api/admin/data-cleanup?action=status - Get cleanup system status',
            'GET /api/admin/data-cleanup?action=preview - Preview cleanup changes',
            'POST /api/admin/data-cleanup - Run cleanup operations'
          ],
          actions: [
            'full-cleanup - Run all cleanup operations',
            'check-duplicates - Check if truck data is duplicate',
            'merge-duplicates - Merge two duplicate trucks',
            'dry-run - Preview changes without making them'
          ]
        });
      }
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
