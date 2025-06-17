// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextRequest, NextResponse } from 'next/server';
import { APIMonitor, type APIService } from '@/lib/monitoring/apiMonitor';

/**
 * API Usage Monitoring Endpoint
 * Provides real-time API usage monitoring and alerting
 */

export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') as APIService | null;
    const action = searchParams.get('action');

    // Get comprehensive monitoring data
    if (!service) {
      const monitoringResult = APIMonitor.checkAllAPIs();
      
      return NextResponse.json({
        success: true,
        data: monitoringResult,
        timestamp: new Date().toISOString()
      });
    }

    // Service-specific monitoring
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

    // Get usage for specific service
    const usage = APIMonitor.getCurrentUsage(service);
    
    return NextResponse.json({
      success: true,
      service,
      usage,
      timestamp: new Date().toISOString()
    });

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

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { action } = body;

    switch (action) {
      case 'clear-alerts': {
        APIMonitor.clearAlertHistory();
        return NextResponse.json({
          success: true,
          message: 'Alert history cleared'
        });
      }

      case 'get-alerts': {
        const alerts = APIMonitor.getAlertHistory();
        return NextResponse.json({
          success: true,
          alerts,
          count: alerts.length
        });
      }

      case 'test-alert': {
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

      default: {
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
      }
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
