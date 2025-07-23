import { NextResponse } from 'next/server';
import { dispatchGeminiOperation, gemini } from '@/lib/gemini';
import { handleErrorResponse } from '@/lib/utils/apiHelpers';
export async function POST(request) {
    try {
        const body = (await request.json());
        const { type, data } = body;
        if (type === undefined ||
            type === '' ||
            data === undefined ||
            typeof type !== 'string' ||
            typeof data !== 'string') {
            return NextResponse.json({ error: 'Type must be a string and data must be a string' }, { status: 400 });
        }
        // Check usage limits
        const usageCheck = await gemini.checkUsageLimits();
        if (!usageCheck.canMakeRequest) {
            return NextResponse.json({
                error: 'Daily API limits exceeded',
                usage: usageCheck.usage,
            }, { status: 429 });
        }
        const result = await dispatchGeminiOperation(type, data);
        return NextResponse.json(result);
    }
    catch (error) {
        return handleErrorResponse(error);
    }
}
export async function GET(request) {
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
    }
    catch (error) {
        return handleErrorResponse(error);
    }
}
