import { NextRequest } from 'next/server';
import {
  verifyAdminAccess,
  fetchRealtimeMetrics,
  monitorDataChanges,
  formatSSEMessage,
  generateEventId,
} from '@/lib/api/admin/realtime-events/handlers';

interface AdminEvent {
  id: string;
  type: 'scraping_update' | 'data_quality_change' | 'system_alert' | 'user_activity' | 'heartbeat';
  timestamp: string;
  data: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

function handleSSEStream(request: NextRequest, controller: ReadableStreamDefaultController<Uint8Array>) {
  const encoder = new TextEncoder();

  const connectionEvent: AdminEvent = {
    id: generateEventId(),
    type: 'heartbeat',
    timestamp: new Date().toISOString(),
    data: {
      message: 'Real-time admin dashboard connected',
      connectionId: generateEventId()
    }
  };
  
  controller.enqueue(encoder.encode(formatSSEMessage(connectionEvent)));

  const handleHeartbeatEvent = async () => {
    try {
      const metrics = await fetchRealtimeMetrics();
      const event: AdminEvent = {
        id: generateEventId(),
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
        data: { ...metrics }
      };

      controller.enqueue(encoder.encode(formatSSEMessage(event)));
    } catch (error) {
      console.error('Error fetching realtime metrics:', error);

      const errorEvent: AdminEvent = {
        id: generateEventId(),
        type: 'system_alert',
        timestamp: new Date().toISOString(),
        data: {
          error: 'Failed to fetch metrics',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        severity: 'error'
      };

      controller.enqueue(encoder.encode(formatSSEMessage(errorEvent)));
    }
  };

  const intervalId = setInterval(() => {
    void handleHeartbeatEvent();
  }, 5000);

  const changeMonitorId = setInterval(async () => {
    try {
      await monitorDataChanges(controller, encoder);
    } catch (error) {
      console.error('Error monitoring data changes:', error);
    }
  }, 10_000);

  request.signal.addEventListener('abort', () => {
    clearInterval(intervalId);
    clearInterval(changeMonitorId);
    controller.close();
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const hasAccess = await verifyAdminAccess(request);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      handleSSEStream(request, controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
  });
}

async function handleHealthCheck(): Promise<Response> {
  const metrics = await fetchRealtimeMetrics();
  return new Response(JSON.stringify({
    success: true,
    status: 'healthy',
    metrics,
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function handleTriggerTestEvent(): Response {
  return new Response(JSON.stringify({
    success: true,
    message: 'Test event triggered',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { action } = body as { action: string };

    switch (action) {
      case 'health_check': {
        return await handleHealthCheck();
      }

      case 'trigger_test_event': {
        return handleTriggerTestEvent();
      }

      default: {
        return new Response(JSON.stringify({
          success: false,
          error: 'Unknown action',
          available_actions: ['health_check', 'trigger_test_event']
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  } catch (error) {
    console.error('Realtime events POST error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
