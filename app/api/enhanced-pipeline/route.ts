// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { type NextRequest, NextResponse } from 'next/server';

// ⚠️ DEPRECATED: This endpoint has been consolidated into /api/pipeline
// Please use /api/pipeline with action parameters instead
// Migration: /api/enhanced-pipeline → /api/pipeline with action: "full"

export function POST(_request: NextRequest) {
  // Return migration notice
  return NextResponse.json(
    {
      success: false,
      error: 'DEPRECATED: This endpoint has been consolidated',
      migration: {
        message: 'Please use /api/pipeline instead',
        newEndpoint: '/api/pipeline',
        mapping: {
          'action: "full"': 'Use /api/pipeline with action: "full"',
          'action: "discovery-only"': 'Use /api/pipeline with action: "discovery"',
          'action: "processing-only"': 'Use /api/pipeline with action: "processing"',
          'action: "location-specific"':
            'Use /api/pipeline with action: "discovery" and targetCities',
        },
      },
    },
    { status: 410 },
  ); // 410 Gone - Resource no longer available
}

export function GET() {
  return NextResponse.json(
    {
      status: 'DEPRECATED',
      message: 'This endpoint has been consolidated into /api/pipeline',
      migration: {
        newEndpoint: '/api/pipeline',
        documentation: 'See /api/pipeline for current API documentation',
        deprecationDate: '2024-12-09',
        removalDate: '2025-01-01',
      },
    },
    { status: 410 },
  );
}
