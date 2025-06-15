// app/api/pipeline/route.ts
// Unified Pipeline API - Consolidates all pipeline functionality

// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { type NextRequest, NextResponse } from 'next/server';
import { ScrapingJobService } from '@/lib/supabase';
import { pipelineManager, type PipelineConfig } from '@/lib/pipelineManager';

interface PipelineRequestBody {
  action?: 'discovery' | 'processing' | 'full' | 'maintenance';
  target_url?: string;
  config?: {
    maxUrls?: number;
    maxUrlsToProcess?: number;
    targetCities?: string[];
    priority?: number;
    skipDiscovery?: boolean;
    retryFailedJobs?: boolean;
  };
  // Legacy support
  job_type?: string;
  priority?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PipelineRequestBody;

    // Handle legacy single URL scraping
    if (body.target_url != undefined && body.action == undefined) {
      const { target_url, job_type = 'website_scrape', priority = 1 } = body;

      if (target_url == undefined || target_url === '') {
        return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
      }

      // Basic URL validation
      try {
        new URL(target_url);
      } catch {
        return NextResponse.json({ error: 'Invalid target_url format' }, { status: 400 });
      }

      // Create a scraping job using the centralized service
      const job = await ScrapingJobService.createJob({
        target_url,
        job_type,
        priority,
        scheduled_at: new Date().toISOString(),
      });

      if (job == undefined) {
        return NextResponse.json({ error: 'Failed to create scraping job' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Scraping job created (legacy mode)',
        job_id: job.id,
        target_url,
        note: 'Consider using the new unified pipeline API with action parameter',
      });
    }

    // Handle unified pipeline requests
    const { action = 'full', config = {} } = body;

    const pipelineConfig: PipelineConfig = {
      type: action,
      params: {
        maxUrls: config.maxUrls ?? 50,
        maxUrlsToProcess: config.maxUrlsToProcess ?? 20,
        targetCities: config.targetCities ?? ['Charleston', 'Columbia', 'Greenville'],
        priority: config.priority ?? 5,
        skipDiscovery: config.skipDiscovery ?? false,
        retryFailedJobs: config.retryFailedJobs ?? false,
      },
    };

    console.info(`🚀 Pipeline API: Starting ${action} pipeline with config:`, pipelineConfig);

    const result = await pipelineManager.runPipeline(pipelineConfig);

    return NextResponse.json({
      success: result.success,
      action,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Pipeline API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown pipeline error';

    return NextResponse.json(
      {
        success: false,
        error: 'Pipeline processing failed',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
