import { NextResponse, NextRequest } from 'next/server';
import { runTestPipeline } from '@/lib/api/test-integration/pipelineRunner';

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  logs.push('Test pipeline run started.');

  interface TestPipelineRequestBody {
    url?: string;
    rawText?: string;
    isDryRun?: boolean;
  }

  try {
    const rawBody: unknown = await request.json();

    if (typeof rawBody !== 'object' || rawBody === null) {
      logs.push('Invalid request body: expected an object.');
      return NextResponse.json({ error: 'Invalid request body: expected an object.' }, { status: 400 });
    }

    const body: TestPipelineRequestBody = {};
    if ('url' in rawBody && typeof (rawBody as { url?: unknown }).url === 'string') {
      body.url = (rawBody as { url: string }).url;
    }
    if ('rawText' in rawBody && typeof (rawBody as { rawText?: unknown }).rawText === 'string') {
      body.rawText = (rawBody as { rawText: string }).rawText;
    }
    if ('isDryRun' in rawBody && typeof (rawBody as { isDryRun?: unknown }).isDryRun === 'boolean') {
      body.isDryRun = (rawBody as { isDryRun: boolean }).isDryRun;
    }
    // Default isDryRun if not provided, using nullish coalescing
    body.isDryRun ??= true;

    const results = await runTestPipeline(body, logs);

    // Explicitly cast to Record<string, unknown> for NextResponse.json
    // to handle the complex/union types within PipelineRunResult's StageResult.data
    return NextResponse.json({ results: results as Record<string, unknown> }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during overall test pipeline run.';
    logs.push(`Overall test pipeline error: ${errorMessage}`);
    return NextResponse.json(
      {
        message: 'Test pipeline run failed.',
        error: errorMessage,
        results: {
          logs,
          overallStatus: 'Error',
        },
      },
      { status: 200 },
    );
  }
}
