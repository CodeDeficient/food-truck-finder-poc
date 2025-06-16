// app/api/autonomous-discovery/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ⚠️ DEPRECATED: This endpoint has been consolidated into /api/pipeline
// Please use /api/pipeline with action parameters instead
// Migration: /api/autonomous-discovery → /api/pipeline with action: "discovery"

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
          'action: "location"': 'Use /api/pipeline with action: "discovery" and targetCities',
          'action: "maintenance"': 'Use /api/pipeline with action: "maintenance"',
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
