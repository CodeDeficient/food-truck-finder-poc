import { NextRequest, NextResponse } from 'next/server';
import { withValidation } from '@/lib/middleware/withValidation';
import { handlePostRequest, handleGetRequest } from '@/lib/api/admin/data-cleanup/handlers';
import { DataCleanupSchema } from '@/lib/validation/schemas/v1/api';

export const POST = withValidation(DataCleanupSchema, async (_request: NextRequest, _params, validatedData) => {
  return handlePostRequest(validatedData);
});

export async function GET(request: NextRequest) {
  try {
    return await handleGetRequest(request);
  } catch (error: unknown) {
    console.error('Data cleanup GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
