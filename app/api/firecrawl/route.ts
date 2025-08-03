import { NextRequest, NextResponse } from 'next/server';
import { withValidation } from '@/lib/middleware/withValidation';
import { FirecrawlRequestSchema } from '@/lib/validation/schemas/v1/api';
import { firecrawl } from '@/lib/firecrawl';
import {
  handleCrawlOperation,
  handleScrapeOperation,
  handleSearchOperation,
} from '@/lib/api/firecrawl/handlers';
import type { FirecrawlRequestBody } from '@/lib/api/firecrawl/types';

export const POST = withValidation(FirecrawlRequestSchema, async (_request: NextRequest, _params, { operation, url, options = {} }) => {
  switch (operation) {
    case 'search': {
      return handleSearchOperation();
    }
    case 'scrape': {
      return handleScrapeOperation(url!, options);
    }
    case 'crawl': {
      return handleCrawlOperation(url!, options);
    }
    default: {
      return NextResponse.json(
        { success: false, error: `Unknown operation: ${operation}` },
        { status: 400 },
      );
    }
  }
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId == undefined) {
    return NextResponse.json({ success: false, error: 'Job ID is required' }, { status: 400 });
  }
  try {
    const status = await firecrawl.getCrawlStatus(jobId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting crawl status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get crawl status',
      },
      { status: 500 },
    );
  }
}
