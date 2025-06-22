import { type NextRequest, NextResponse } from 'next/server';
import { runIntegrationTestSteps } from '@/lib/api/test-integration/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { testUrl?: string };
    const { testUrl = 'https://example-food-truck.com' } = body;

    const testResult = await runIntegrationTestSteps(testUrl);

    if (!testResult.success) {
      return NextResponse.json(testResult);
    }

    if ('results' in testResult) {
      return NextResponse.json(testResult.results);
    }

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Integration test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Integration test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({
    message: 'Food Truck Integration Test API',
    description: 'Tests the complete integration of Supabase, Firecrawl, and Gemini',
    usage: "POST /api/test-integration with optional { testUrl: 'https://example.com' }",
  });
}
