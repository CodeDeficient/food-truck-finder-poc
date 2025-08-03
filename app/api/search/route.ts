export const dynamic = 'force-dynamic'; // Force dynamic rendering for this route

import { type NextRequest, NextResponse } from 'next/server';
import { withGetValidation, validateQueryParams } from '@/lib/middleware/withValidation';
import { processSearchRequest } from '@/lib/api/search/helpers';
import { SearchQuerySchema } from '@/lib/validation/schemas/v1/api';

export const GET = withGetValidation(async (request: NextRequest) => {
  // Validate query parameters
  const validation = validateQueryParams(request, SearchQuerySchema);
  
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid query parameters',
        validationErrors: validation.errors
      },
      { status: 400 }
    );
  }

  const { q: query, cuisine, openNow, lat, lng, radius } = validation.data;
  return processSearchRequest({ query, cuisine, openNow, lat, lng, radius });
});
