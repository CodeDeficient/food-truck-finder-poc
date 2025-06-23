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
    if (typeof rawBody !== 'object' || rawBody === null || !('action' in rawBody) || typeof (rawBody as any).action !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }
    const body: { action: string; service?: string; level?: string } = rawBody as { action: string; service?: string; level?: string };
    const { action } = body;

    switch (action) {
      case 'clear-alerts': {
        return handleClearAlerts();
      }
      case 'get-alerts': {
        return handleGetAlerts();
      }
      case 'test-alert': {
        if (body.service === undefined || body.level === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing service or level for test-alert action' },
            { status: 400 },
          );
        }
        return handleTestAlert({ service: body.service, level: body.level });
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
