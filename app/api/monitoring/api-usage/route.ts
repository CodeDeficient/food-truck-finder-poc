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
  } catch (error) {
    console.error('API monitoring error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get API monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { action } = body;

    switch (action) {
      case 'clear-alerts': {
        return handleClearAlerts();
      }
      case 'get-alerts': {
        return handleGetAlerts();
      }
      case 'test-alert': {
        return handleTestAlert(body);
      }
      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 },
        );
      }
    }
  } catch (error) {
    console.error('API monitoring POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monitoring request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
