/* eslint-disable @typescript-eslint/no-misused-promises */
import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin, ScrapingJobService, FoodTruckService, type ScrapingJob, type FoodTruck } from '@/lib/supabase';
import { AdminEvent } from './types';

interface RealtimeMetrics {
  scrapingJobs: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  };
  dataQuality: {
    averageScore: number;
    totalTrucks: number;
    recentChanges: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastUpdate: string;
  };
}

export async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || data.user === null) {
      return false;
    }
    const user = data.user;

    if (!supabaseAdmin) {
      return false;
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

export function handleGetRequest(request: NextRequest): Response {
  const stream = new ReadableStream({
    start(controller: ReadableStreamDefaultController<Uint8Array>) {
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

      const intervalId = setInterval(async () => {
        await sendHeartbeatEvent(controller, encoder);
      }, 5000);

      const changeMonitorId = setupDataChangeMonitor(controller, encoder);

      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
        clearInterval(changeMonitorId);
        controller.close();
      });
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

async function sendHeartbeatEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
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
}

function setupDataChangeMonitor(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      await monitorDataChanges(controller, encoder);
    } catch (error) {
      console.error('Error monitoring data changes:', error);
    }
  }, 10_000);
}

export async function handlePostRequest(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json(); // Explicitly type body as unknown
    let action: string;

    // Type guard to ensure 'body' has 'action' property and is a string
    if (typeof body === 'object' && body !== null && 'action' in body && typeof (body as { action: string }).action === 'string') {
      action = (body as { action: string }).action;
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid request body: 'action' property is missing or not a string."
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

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
          error: "That didn't work, please try again later."
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
      error: "That didn't work, please try again later."
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function fetchRealtimeMetrics(): Promise<RealtimeMetrics> {
  try {
    const recentJobs = await ScrapingJobService.getJobsByStatus('all');
    const scrapingMetrics = {
      active: recentJobs.filter((job: ScrapingJob) => job.status === 'running').length,
      completed: recentJobs.filter((job: ScrapingJob) => job.status === 'completed').length,
      failed: recentJobs.filter((job: ScrapingJob) => job.status === 'failed').length,
      pending: recentJobs.filter((job: ScrapingJob) => job.status === 'pending').length
    };

    const qualityStats = await FoodTruckService.getDataQualityStats();
    const dataQualityMetrics = {
      averageScore: qualityStats.avg_quality_score ?? 0,
      totalTrucks: qualityStats.total_trucks ?? 0,
      recentChanges: 0
    };

    const systemHealth = {
      status: 'healthy' as const,
      uptime: process.uptime(),
      lastUpdate: new Date().toISOString()
    };

    return {
      scrapingJobs: scrapingMetrics,
      dataQuality: dataQualityMetrics,
      systemHealth
    };
  } catch (error) {
    console.error('Error fetching realtime metrics:', error);
    return {
      scrapingJobs: { active: 0, completed: 0, failed: 0, pending: 0 },
      dataQuality: { averageScore: 0, totalTrucks: 0, recentChanges: 0 },
      systemHealth: {
        status: 'error',
        uptime: 0,
        lastUpdate: new Date().toISOString()
      }
    };
  }
}

function isScrapingJob(obj: unknown): obj is ScrapingJob {
  return typeof obj === 'object' && obj !== null && 'id' in obj && 'status' in obj;
}

// Removed isFoodTruck function as it is unused.
// function isFoodTruck(obj: unknown): obj is FoodTruck {
//   return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
// }

async function sendScrapingUpdateEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  const recentJobs = await ScrapingJobService.getJobsByStatus('all');

  if (Array.isArray(recentJobs) && recentJobs.length > 0) {
    const event: AdminEvent = {
      id: generateEventId(),
      type: 'scraping_update',
      timestamp: new Date().toISOString(),
      data: {
        recentJobs: recentJobs.filter((job) => isScrapingJob(job)).map((job) => ({ // Fixed unicorn/no-array-callback-reference
          id: job.id,
          status: job.status,
          started_at: job.started_at,
          completed_at: job.completed_at
        })),
        count: recentJobs.length
      },
      severity: 'info'
    };

    controller.enqueue(encoder.encode(formatSSEMessage(event)));
  }
}

async function sendDataQualityChangeEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  const recentTrucksResult = await FoodTruckService.getAllTrucks(10, 0);
  const recentlyUpdated = recentTrucksResult.trucks.filter((truck: FoodTruck) => {
    if (!truck.updated_at) return false;
    const updatedAt = new Date(truck.updated_at);
    const oneMinuteAgo = new Date(Date.now() - 60_000);
    return updatedAt > oneMinuteAgo;
  });

  if (recentlyUpdated.length > 0) {
    const event: AdminEvent = {
      id: generateEventId(),
      type: 'data_quality_change',
      timestamp: new Date().toISOString(),
      data: {
        updatedTrucks: recentlyUpdated.map(truck => ({
          id: truck.id,
          name: truck.name,
          data_quality_score: truck.data_quality_score,
          updated_at: truck.updated_at
        })),
        count: recentlyUpdated.length
      },
      severity: 'info'
    };

    controller.enqueue(encoder.encode(formatSSEMessage(event)));
  }
}

async function monitorDataChanges(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  try {
    await sendScrapingUpdateEvent(controller, encoder);
    await sendDataQualityChangeEvent(controller, encoder);
  } catch (error) {
    console.error('Error monitoring data changes:', error);
  }
}

function formatSSEMessage(event: AdminEvent): string {
  return `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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
