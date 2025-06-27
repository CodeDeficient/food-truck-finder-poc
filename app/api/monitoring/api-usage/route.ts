import { NextRequest, NextResponse } from 'next/server';
import { type APIService } from '@/lib/monitoring/apiMonitor';
import {
  handleClearAlerts,
  handleComprehensiveMonitoring,
  handleGetAlerts,
  handleServiceSpecificMonitoring,
  handleTestAlert,
} from '@/lib/api/monitoring/api-usage/handlers';

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') as APIService | null;

    return service ? handleServiceSpecificMonitoring(request, service) : handleComprehensiveMonitoring();
  } catch (error: unknown) {
    console.error('API monitoring error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get API monitoring data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

async function handlePostAction(
  action: string | undefined,
  service: string | undefined,
  level: string | undefined,
): Promise<NextResponse> {
  if (action === undefined) {
    return NextResponse.json({ success: false, error: 'Invalid request body: missing or invalid action' }, { status: 400 });
  }

  switch (action) {
    case 'clear-alerts': {
      return await handleClearAlerts();
    }
    case 'get-alerts': {
      return await handleGetAlerts();
    }
    case 'test-alert': {
      if (service === undefined || level === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing service or level for test-alert action' },
          { status: 400 },
        );
      }
      return await handleTestAlert({ service, level });
    }
    default: {
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}` },
        { status: 400 },
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();

    if (typeof rawBody !== 'object' || rawBody === null) { // Changed to check for null instead of undefined as typeof null is 'object'
      return NextResponse.json({ success: false, error: 'Invalid request body: not an object' }, { status: 400 });
    }

    const body = rawBody as Record<string, unknown>;
    const action = typeof body.action === 'string' ? body.action : undefined;
    const service = typeof body.service === 'string' ? body.service : undefined;
    const level = typeof body.level === 'string' ? body.level : undefined;

    return handlePostAction(action, service, level);
  } catch (error: unknown) {
    console.error('API monitoring POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monitoring request',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
