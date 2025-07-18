import { NextRequest, NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';
import {
  handleCrawlOperation,
  handleScrapeOperation,
  handleSearchOperation,
} from '@/lib/api/firecrawl/handlers';
import type { FirecrawlRequestBody } from '@/lib/api/firecrawl/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FirecrawlRequestBody;
    const { operation, url, options = {} } = body;

    switch (operation) {
      case 'search': {
        return handleSearchOperation();
      }
      case 'scrape': {
        if (url == undefined) {
          return NextResponse.json(
            { success: false, error: 'URL is required for scrape operation' },
            { status: 400 },
          );
        }
        return handleScrapeOperation(url, options);
      }
      case 'crawl': {
        if (url == undefined) {
          return NextResponse.json(
            { success: false, error: 'URL is required for crawl operation' },
            { status: 400 },
          );
        }
        return handleCrawlOperation(url, options);
      }
      default: {
        return NextResponse.json(
          { success: false, error: `Unknown operation: ${operation}` },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error('Firecrawl API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

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
