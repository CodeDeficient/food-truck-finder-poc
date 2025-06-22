// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextRequest, NextResponse } from 'next/server';
import { APIMonitor, type APIService } from '@/lib/monitoring/apiMonitor';

/**
 * API Usage Monitoring Endpoint
 * Provides real-time API usage monitoring and alerting
 */

function handleComprehensiveMonitoring() {
  const monitoringResult = APIMonitor.checkAllAPIs();
  return NextResponse.json({
    success: true,
    data: monitoringResult,
    timestamp: new Date().toISOString()
  });
}

function handleServiceSpecificMonitoring(request: NextRequest, service: APIService) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'check') {
    const requestCount = Number.parseInt(searchParams.get('requests') ?? '1', 10);
    const tokenCount = Number.parseInt(searchParams.get('tokens') ?? '0', 10);
    
    const canMakeRequest = APIMonitor.canMakeRequest(service, requestCount, tokenCount);
    const usage = APIMonitor.getCurrentUsage(service);
    
    return NextResponse.json({
      success: true,
      service,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      canMakeRequest: canMakeRequest.allowed,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      reason: canMakeRequest.reason,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      waitTime: canMakeRequest.waitTime,
      usage,
      timestamp: new Date().toISOString()
    });
  }

  const usage = APIMonitor.getCurrentUsage(service);
  
  return NextResponse.json({
    success: true,
    service,
    usage,
    timestamp: new Date().toISOString()
  });
}

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') as APIService | null;

    if (!service) {
      return handleComprehensiveMonitoring();
    } else {
      return handleServiceSpecificMonitoring(request, service);
    }
  } catch (error) {
     
    console.error('API monitoring error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get API monitoring data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function handleClearAlerts() {
  APIMonitor.clearAlertHistory();
  return NextResponse.json({
    success: true,
    message: 'Alert history cleared'
  });
}

function handleGetAlerts() {
  const alerts = APIMonitor.getAlertHistory();
  return NextResponse.json({
    success: true,
    alerts,
    count: alerts.length
  });
}

function handleTestAlert(body: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { service, level } = body;
  if (service == undefined || level == undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing service or level' },
      { status: 400 }
    );
  }

  // This would trigger a test alert in a real implementation
  return NextResponse.json({
    success: true,
    message: `Test alert triggered for ${service} at ${level} level`
  });
}

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { action } = body;

    switch (action) {
      case 'clear-alerts':
        return handleClearAlerts();
      case 'get-alerts':
        return handleGetAlerts();
      case 'test-alert':
        return handleTestAlert(body);
      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
     
    console.error('API monitoring POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process monitoring request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
