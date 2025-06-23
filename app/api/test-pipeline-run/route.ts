import { NextResponse, NextRequest } from 'next/server';
import { runTestPipeline } from '@/lib/api/test-integration/pipeline-runner';

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  logs.push('Test pipeline run started.');

  try {
    const body = (await request.json()) as { url?: string; rawText?: string; isDryRun?: boolean };
    const results = await runTestPipeline(body, logs);

    return NextResponse.json({ results }, { status: 200 });
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
