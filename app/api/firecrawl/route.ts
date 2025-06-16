// app/api/firecrawl/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';

interface FirecrawlRequestBody {
  operation: string;
  url?: string;
  query?: string;
  options?: Record<string, unknown>;
}

// Helper function to handle scrape operation
async function handleScrapeOperation(url: string, options: Record<string, unknown>) {
  const scrapeResult = await firecrawl.scrapeUrl(url, {
    formats: ['markdown', 'html'],
    onlyMainContent: true,
    ...options,
  });

  return NextResponse.json({
    success: scrapeResult.success,
    data: scrapeResult.success ? [scrapeResult.data] : undefined,
    error: scrapeResult.error,
  });
}

// Helper function to poll crawl status
async function pollCrawlStatus(jobId: string): Promise<NextResponse> {
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  const pollInterval = 10_000; // 10 seconds

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const status = await firecrawl.getCrawlStatus(jobId);
    if (status.success && status.status === 'completed' && status.data) {
      return NextResponse.json({
        success: true,
        data: status.data,
      });
    } else if (status.success && status.status === 'failed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Crawl job failed',
        },
        { status: 500 },
      );
    }

    attempts++;
  }

  // Timeout
  return NextResponse.json(
    {
      success: false,
      error: 'Crawl job timed out',
    },
    { status: 408 },
  );
}

// Helper function to handle crawl operation
async function handleCrawlOperation(url: string, options: Record<string, unknown>) {
  const crawlJob = await firecrawl.crawlWebsite(url, {
    crawlerOptions: {
      maxDepth: (options.maxDepth as number) || 2,
      limit: (options.limit as number) || 20,
      includes: options.includes as string[] | undefined,
      excludes: options.excludes as string[] | undefined,
    },
    pageOptions: {
      formats: ['markdown'],
      onlyMainContent: true,
    },
  });

  if (!crawlJob.success || crawlJob.jobId == undefined) {
    return NextResponse.json(
      {
        success: false,
        error: crawlJob.error ?? 'Failed to start crawl job',
      },
      { status: 500 },
    );
  }

  return pollCrawlStatus(crawlJob.jobId);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FirecrawlRequestBody;
    const { operation, url, options = {} } = body;

    switch (operation) {
      case 'search': {
        // Note: Firecrawl doesn't have a direct search API, but we can simulate it
        // by scraping search engine results or known directories
        return NextResponse.json(
          {
            success: false,
            error:
              'Search operation not directly supported by Firecrawl API. Use crawl on directory URLs instead.',
          },
          { status: 400 },
        );
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
