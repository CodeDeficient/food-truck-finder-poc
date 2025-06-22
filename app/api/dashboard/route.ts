import { type NextRequest, NextResponse } from 'next/server';
import {
  FoodTruckService,
  ScrapingJobService,
  DataProcessingService,
  APIUsageService,
} from '@/lib/supabase';

async function handleDashboardSectionRequest(section: string | null) {
  switch (section) {
    case 'overview':
      return NextResponse.json(await getDashboardOverview());
    case 'scraping':
      return NextResponse.json(await getScrapingStatus());
    case 'processing':
      return NextResponse.json(await getProcessingStatus());
    case 'quality':
      return NextResponse.json(await getDataQualityStatus());
    case 'usage':
      return NextResponse.json(await getAPIUsageStatus());
    default: {
      const [overview, scraping, processing, quality, usage] = await Promise.allSettled([
        getDashboardOverview(),
        getScrapingStatus(),
        getProcessingStatus(),
        getDataQualityStatus(),
        getAPIUsageStatus(),
      ]);

      return NextResponse.json({
        overview: overview.status === 'fulfilled' ? overview.value : getDefaultOverview(),
        scraping: scraping.status === 'fulfilled' ? scraping.value : getDefaultScraping(),
        processing: processing.status === 'fulfilled' ? processing.value : getDefaultProcessing(),
        quality: quality.status === 'fulfilled' ? quality.value : getDefaultQuality(),
        usage: usage.status === 'fulfilled' ? usage.value : getDefaultUsage(),
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  try {
    return await handleDashboardSectionRequest(section);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({
      overview: getDefaultOverview(),
      scraping: getDefaultScraping(),
      processing: getDefaultProcessing(),
      quality: getDefaultQuality(),
      usage: getDefaultUsage(),
      timestamp: new Date().toISOString(),
      error: 'Some data may be unavailable',
    });
  }
}

async function getDashboardOverview() {
  try {
    const { trucks, total } = await FoodTruckService.getAllTrucks(10, 0);
    const qualityStats = await FoodTruckService.getDataQualityStats();

    return {
      totalTrucks: total,
      recentTrucks: trucks.slice(0, 5).map((truck) => ({
        id: truck.id,
        name: truck.name,
        location: truck.current_location ?? { address: 'Unknown location' },
        operating_hours: truck.operating_hours ?? {},
        menu: truck.menu ?? [],
        contact: truck.contact_info ?? {},
        last_updated: truck.updated_at,
        data_quality_score: truck.data_quality_score ?? 0,
      })),
      averageQuality: qualityStats.avg_quality_score,
      verifiedTrucks: qualityStats.verified_count,
      pendingTrucks: qualityStats.pending_count,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting dashboard overview:', error);
    return getDefaultOverview();
  }
}

async function getScrapingStatus() {
  try {
    const [pendingJobs, runningJobs, completedJobs, failedJobs] = await Promise.all([
      ScrapingJobService.getJobsByStatus('pending'),
      ScrapingJobService.getJobsByStatus('running'),
      ScrapingJobService.getJobsByStatus('completed'),
      ScrapingJobService.getJobsByStatus('failed'),
    ]);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentCompleted = completedJobs.filter(
      (job) => job.completed_at != undefined && job.completed_at > yesterday,
    );
    const recentFailed = failedJobs.filter((job) => job.created_at > yesterday);
    const totalRecent = recentCompleted.length + recentFailed.length;

    return {
      pending: pendingJobs.length,
      running: runningJobs.length,
      completedToday: recentCompleted.length,
      failedToday: recentFailed.length,
      recentJobs: [...recentCompleted, ...recentFailed].slice(0, 10),
      successRate: totalRecent > 0 ? (recentCompleted.length / totalRecent) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting scraping status:', error);
    return getDefaultScraping();
  }
}

async function getProcessingStatus() {
  try {
    const [pendingQueue, processingQueue, completedQueue, failedQueue] = await Promise.all([
      DataProcessingService.getQueueByStatus('pending'),
      DataProcessingService.getQueueByStatus('processing'),
      DataProcessingService.getQueueByStatus('completed'),
      DataProcessingService.getQueueByStatus('failed'),
    ]);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    return {
      pending: pendingQueue.length,
      processing: processingQueue.length,
      completedToday: completedQueue.filter(
        (item) => item.processed_at != undefined && item.processed_at > yesterday,
      ).length,
      failedToday: failedQueue.filter((item) => item.created_at > yesterday).length,
      totalTokensUsed: completedQueue.reduce(
        (sum, item) => sum + (item.gemini_tokens_used ?? 0),
        0,
      ),
    };
  } catch (error) {
    console.error('Error getting processing status:', error);
    return getDefaultProcessing();
  }
}

async function getDataQualityStatus() {
  try {
    const qualityStats = await FoodTruckService.getDataQualityStats();
    return qualityStats;
  } catch (error) {
    console.error('Error getting data quality status:', error);
    return getDefaultQuality();
  }
}

async function getAPIUsageStatus() {
  try {
    const [geminiUsage, firecrawlUsage, allUsage] = await Promise.all([
      APIUsageService.getTodayUsage('gemini'),
      APIUsageService.getTodayUsage('firecrawl'),
      APIUsageService.getAllUsageStats(),
    ]);

    const geminiLimits = { requests: 1500, tokens: 32_000 };
    const firecrawlLimits = { requests: 500, tokens: 0 };

    return {
      gemini: {
        requests: {
          used: geminiUsage?.requests_count ?? 0,
          limit: geminiLimits.requests,
          remaining: geminiLimits.requests - (geminiUsage?.requests_count ?? 0),
          percentage: ((geminiUsage?.requests_count ?? 0) / geminiLimits.requests) * 100,
        },
        tokens: {
          used: geminiUsage?.tokens_used ?? 0,
          limit: geminiLimits.tokens,
          remaining: geminiLimits.tokens - (geminiUsage?.tokens_used ?? 0),
          percentage: ((geminiUsage?.tokens_used ?? 0) / geminiLimits.tokens) * 100,
        },
      },
      firecrawl: {
        requests: {
          used: firecrawlUsage?.requests_count ?? 0,
          limit: firecrawlLimits.requests,
          remaining: firecrawlLimits.requests - (firecrawlUsage?.requests_count ?? 0),
          percentage: ((firecrawlUsage?.requests_count ?? 0) / firecrawlLimits.requests) * 100,
        },
      },
      history: allUsage.slice(0, 7),
    };
  } catch (error) {
    console.error('Error getting API usage status:', error);
    return getDefaultUsage();
  }
}

// Default fallback data
function getDefaultOverview() {
  return {
    totalTrucks: 0,
    recentTrucks: [],
    averageQuality: 0,
    verifiedTrucks: 0,
    pendingTrucks: 0,
    lastUpdated: new Date().toISOString(),
  };
}

function getDefaultScraping() {
  return {
    pending: 0,
    running: 0,
    completedToday: 0,
    failedToday: 0,
    recentJobs: [],
    successRate: 0,
  };
}

function getDefaultProcessing() {
  return {
    pending: 0,
    processing: 0,
    completedToday: 0,
    failedToday: 0,
    totalTokensUsed: 0,
  };
}

function getDefaultQuality() {
  return {
    total_trucks: 0,
    avg_quality_score: 0,
    high_quality_count: 0,
    medium_quality_count: 0,
    low_quality_count: 0,
    verified_count: 0,
    pending_count: 0,
    flagged_count: 0,
  };
}

function getDefaultUsage() {
  return {
    gemini: {
      requests: { used: 0, limit: 1500, remaining: 1500, percentage: 0 },
      tokens: { used: 0, limit: 32_000, remaining: 32_000, percentage: 0 },
    },
    firecrawl: {
      requests: { used: 0, limit: 500, remaining: 500, percentage: 0 },
    },
    history: [],
  };
}
