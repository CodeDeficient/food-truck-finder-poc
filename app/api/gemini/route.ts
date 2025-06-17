import { type NextRequest, NextResponse } from 'next/server';
import { dispatchGeminiOperation, gemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { type?: string; data?: unknown };
    const { type, data } = body;

    if (type === undefined || type === '' || data === undefined || typeof type !== 'string' || typeof data !== 'string') {
      return NextResponse.json(
        { error: 'Type must be a string and data must be a string' },
        { status: 400 },
      );
    }

    // Check usage limits
    const usageCheck = await gemini.checkUsageLimits();
    if (!usageCheck.canMakeRequest) {
      return NextResponse.json(
        {
          error: 'Daily API limits exceeded',
          usage: usageCheck.usage,
        },
        { status: 429 },
      );
    }

    const result = await dispatchGeminiOperation(type as 'menu' | 'location' | 'hours' | 'sentiment' | 'enhance', data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'usage') {
      const usageCheck = await gemini.checkUsageLimits();
      const stats = await gemini.getUsageStats();

      return NextResponse.json({
        canMakeRequest: usageCheck.canMakeRequest,
        usage: usageCheck.usage,
        todayStats: stats,
      });
    }

    return NextResponse.json({
      message: 'Gemini API',
      endpoints: [
        'POST /api/gemini - Process data with Gemini',
        'GET /api/gemini?action=usage - Get usage statistics',
      ],
    });
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
