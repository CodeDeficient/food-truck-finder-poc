// app/api/pipeline/route.ts
// Unified Pipeline API - Consolidates all pipeline functionality

import { type NextRequest, NextResponse } from 'next/server';
import { pipelineManager, type PipelineConfig } from '@/lib/pipelineManager';
import { handleLegacyScrapingRequest } from '@/lib/api/pipeline/handlers';
import { PipelineRequestBody } from '@/lib/api/pipeline/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PipelineRequestBody;

    if (body.target_url != undefined && body.action == undefined) {
      return handleLegacyScrapingRequest(body);
    }

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
