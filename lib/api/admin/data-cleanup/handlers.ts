import { NextRequest, NextResponse } from 'next/server';
import { BatchCleanupService, CleanupOperation } from '@/lib/data-quality/batchCleanup';
import { DuplicatePreventionService } from '@/lib/data-quality/duplicatePrevention';

export interface DataCleanupRequestBody {
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

export async function handlePostRequest(body: DataCleanupRequestBody): Promise<NextResponse> {
  const { action, options = {} } = body;

  switch (action) {
    case 'full-cleanup': {
      return await handleFullCleanup(options);
    }
    case 'check-duplicates': {
      return await handleCheckDuplicates(options);
    }
    case 'merge-duplicates': {
      return await handleMergeDuplicates(options);
    }
    case 'dry-run': {
      return await handleDryRun(options);
    }
    default: {
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}` },
        { status: 400 },
      );
    }
  }
}

export async function handleGetRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'status': {
      return handleGetStatus();
    }
    case 'preview': {
      return await handleGetPreview();
    }
    default: {
      return handleGetDefault();
    }
  }
}

export async function handleFullCleanup(
  options: DataCleanupRequestBody['options'],
): Promise<NextResponse> {
  const result = await BatchCleanupService.runFullCleanup({
    batchSize: options?.batchSize ?? 50,
    dryRun: options?.dryRun ?? false,
    operations: options?.operations as CleanupOperation['type'][],
  });

  return NextResponse.json({
    success: true,
    action: 'full-cleanup',
    result,
    message: `Cleanup completed: ${result.summary.trucksImproved} trucks improved, ${result.summary.duplicatesRemoved} duplicates removed`,
  });
}

export async function handleCheckDuplicates(
  options: DataCleanupRequestBody['options'],
): Promise<NextResponse> {
  const { truckData } = options ?? {};
  if (!truckData) {
    return NextResponse.json(
      { success: false, error: 'Missing truckData for duplicate check' },
      { status: 400 },
    );
  }

  const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truckData);

  return NextResponse.json({
    success: true,
    action: 'check-duplicates',
    result: duplicateCheck,
  });
}

export async function handleMergeDuplicates(
  options: DataCleanupRequestBody['options'],
): Promise<NextResponse> {
  const { targetId, sourceId } = options ?? {};
  if (targetId === undefined || sourceId === undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing targetId or sourceId for merge operation' },
      { status: 400 },
    );
  }

  const mergedTruck = await DuplicatePreventionService.mergeDuplicates(targetId, sourceId);

  return NextResponse.json({
    success: true,
    action: 'merge-duplicates',
    result: mergedTruck,
    message: `Successfully merged truck ${sourceId} into ${targetId}`,
  });
}

export async function handleDryRun(
  options: DataCleanupRequestBody['options'],
): Promise<NextResponse> {
  const result = await BatchCleanupService.runFullCleanup({
    ...options,
    operations: options?.operations as CleanupOperation['type'][],
    dryRun: true,
  });

  return NextResponse.json({
    success: true,
    action: 'dry-run',
    result,
    message: 'Dry run completed - no changes made to database',
  });
}

export function handleGetStatus(): NextResponse {
  return NextResponse.json({
    success: true,
    status: {
      available_operations: [
        'remove_placeholders',
        'normalize_phone',
        'fix_coordinates',
        'update_quality_scores',
        'merge_duplicates',
      ],
      default_batch_size: 50,
      supports_dry_run: true,
    },
  });
}

export async function handleGetPreview(): Promise<NextResponse> {
  const result = await BatchCleanupService.runFullCleanup({
    batchSize: 10,
    dryRun: true,
  });

  return NextResponse.json({
    success: true,
    preview: {
      estimated_improvements: result.summary.trucksImproved,
      estimated_duplicates: result.summary.duplicatesRemoved,
      operations: result.operations.map((op) => ({
        type: op.type,
        description: op.description,
        affected_count: op.affectedCount,
      })),
    },
  });
}

export function handleGetDefault(): NextResponse {
  return NextResponse.json({
    success: true,
    endpoints: [
      'GET /api/admin/data-cleanup?action=status - Get cleanup system status',
      'GET /api/admin/data-cleanup?action=preview - Preview cleanup changes',
      'POST /api/admin/data-cleanup - Run cleanup operations',
    ],
    actions: [
      'full-cleanup - Run all cleanup operations',
      'check-duplicates - Check if truck data is duplicate',
      'merge-duplicates - Merge two duplicate trucks',
      'dry-run - Preview changes without making them',
    ],
  });
}
