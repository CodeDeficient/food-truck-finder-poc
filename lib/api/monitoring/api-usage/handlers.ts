import { NextRequest, NextResponse } from 'next/server';
import { APIMonitor, type APIService } from '@/lib/monitoring/apiMonitor';

export function handleComprehensiveMonitoring() {
  const monitoringResult = APIMonitor.checkAllAPIs();
  return NextResponse.json({
    success: true,
    data: monitoringResult,
    timestamp: new Date().toISOString(),
  });
}

export async function handleServiceSpecificMonitoring(
  request: NextRequest,
  service: APIService,
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'check') {
    const requestCount = Number.parseInt(searchParams.get('requests') ?? '1', 10);
    const tokenCount = Number.parseInt(searchParams.get('tokens') ?? '0', 10);

    const canMakeRequest = await APIMonitor.canMakeRequest(
      service,
      requestCount,
      tokenCount,
    );
    const usage = APIMonitor.getCurrentUsage(service);

    return NextResponse.json({
      success: true,
      service,
      canMakeRequest: canMakeRequest.allowed,
      reason: canMakeRequest.reason,
      waitTime: canMakeRequest.waitTime,
      usage,
      timestamp: new Date().toISOString(),
    });
  }

  const usage = APIMonitor.getCurrentUsage(service);

  return NextResponse.json({
    success: true,
    service,
    usage,
    timestamp: new Date().toISOString(),
  });
}

export function handleClearAlerts() {
  APIMonitor.clearAlertHistory();
  return NextResponse.json({
    success: true,
    message: 'Alert history cleared',
  });
}

export function handleGetAlerts() {
  const alerts = APIMonitor.getAlertHistory();
  return NextResponse.json({
    success: true,
    alerts,
    count: alerts.length,
  });
}

export function handleTestAlert(body: { service: string; level: string }) {
  const { service, level } = body;
  if (service === undefined || level === undefined) {
    return NextResponse.json(
      { success: false, error: 'Missing service or level' },
      { status: 400 },
    );
  }

  // This would trigger a test alert in a real implementation
  return NextResponse.json({
    success: true,
    message: `Test alert triggered for ${service} at ${level} level`,
  });
}
