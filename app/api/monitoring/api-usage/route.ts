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

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();

    if (typeof rawBody !== 'object' || rawBody === null) {
      return NextResponse.json({ success: false, error: 'Invalid request body: not an object' }, { status: 400 });
    }

    // Explicitly type and validate the body
    const body = rawBody as Record<string, unknown>;
    const action = typeof body.action === 'string' ? body.action : undefined;
    const service = typeof body.service === 'string' ? body.service : undefined;
    const level = typeof body.level === 'string' ? body.level : undefined;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Invalid request body: missing or invalid action' }, { status: 400 });
    }

    switch (action) {
      case 'clear-alerts': {
        return handleClearAlerts();
      }
      case 'get-alerts': {
        return handleGetAlerts();
      }
      case 'test-alert': {
        if (!service || !level) {
          return NextResponse.json(
            { success: false, error: 'Missing service or level for test-alert action' },
            { status: 400 },
          );
        }
        return handleTestAlert({ service, level });
      }
      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 },
        );
      }
    }
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
