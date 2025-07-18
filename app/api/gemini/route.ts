import { type NextRequest, NextResponse } from 'next/server';
import { dispatchGeminiOperation, gemini } from '@/lib/gemini';
import { handleErrorResponse } from '@/lib/utils/apiHelpers';

import type { GeminiResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { type?: string; data?: unknown };
    const { type, data } = body;

    if (
      type === undefined ||
      type === '' ||
      data === undefined ||
      typeof type !== 'string' ||
      typeof data !== 'string'
    ) {
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

    const result: GeminiResponse<unknown> = await dispatchGeminiOperation(
      type as 'menu' | 'location' | 'hours' | 'sentiment' | 'enhance',
      data,
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    return handleErrorResponse(error);
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
    return handleErrorResponse(error);
  }
}
