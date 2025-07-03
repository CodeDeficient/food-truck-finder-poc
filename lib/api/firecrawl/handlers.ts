import { NextResponse } from 'next/server';
import { firecrawl } from '@/lib/firecrawl';

// Helper function to handle scrape operation
export async function handleScrapeOperation(url: string, options: Record<string, unknown>) {
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
export async function pollCrawlStatus(jobId: string): Promise<NextResponse> {
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
export async function handleCrawlOperation(url: string, options: Record<string, unknown>) {
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

export function handleSearchOperation() {
  return NextResponse.json(
    {
      success: false,
      error:
        'Search operation not directly supported by Firecrawl API. Use crawl on directory URLs instead.',
    },
    { status: 400 },
  );
}
