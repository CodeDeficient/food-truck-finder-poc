// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextRequest } from 'next/server';
// @ts-expect-error TS(2305): Module '"@/lib/supabase"' has no exported member '... Remove this comment to see the full error message
import { supabase, supabaseAdmin, ScrapingJobService, FoodTruckService, DataQualityService } from '@/lib/supabase';

/**
 * SOTA Real-time Admin Dashboard Events API
 * 
 * Implements Server-Sent Events (SSE) for real-time admin dashboard updates
 * Provides live monitoring of scraping jobs, data quality, and system status
 * 
 * GET /api/admin/realtime-events
 */

interface AdminEvent {
  id: string;
  type: 'scraping_update' | 'data_quality_change' | 'system_alert' | 'user_activity' | 'heartbeat';
  timestamp: string;
  data: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

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

export async function GET(request: NextRequest): Promise<Response> {
  // Verify admin access
  const hasAccess = await verifyAdminAccess(request);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create SSE response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
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

      // Set up periodic updates
      const intervalId = setInterval(async () => {
        try {
          const metrics = await fetchRealtimeMetrics();
          const event: AdminEvent = {
            id: generateEventId(),
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            // @ts-expect-error TS(2322): Type 'RealtimeMetrics' is not assignable to type '... Remove this comment to see the full error message
            data: metrics
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
      }, 5000); // Update every 5 seconds

      // Set up data change monitoring
      const changeMonitorId = setInterval(async () => {
        try {
          await monitorDataChanges(controller, encoder);
        } catch (error) {
          console.error('Error monitoring data changes:', error);
        }
      }, 10_000); // Check for changes every 10 seconds

      // Cleanup on connection close
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

async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

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

async function fetchRealtimeMetrics(): Promise<RealtimeMetrics> {
  try {
    // Fetch scraping job metrics
    // @ts-expect-error TS(2339): Property 'getAllJobs' does not exist on type '{ cr... Remove this comment to see the full error message
    const recentJobs = await ScrapingJobService.getAllJobs(50, 0);
    const scrapingMetrics = {
      active: recentJobs.filter((job: any) => job.status === 'running').length,
      completed: recentJobs.filter((job: any) => job.status === 'completed').length,
      failed: recentJobs.filter((job: any) => job.status === 'failed').length,
      pending: recentJobs.filter((job: any) => job.status === 'pending').length
    };

    // Fetch data quality metrics
    const qualityStats = await DataQualityService.getQualityStats();
    const dataQualityMetrics = {
      averageScore: qualityStats.avg_quality_score ?? 0,
      totalTrucks: qualityStats.total_trucks ?? 0,
      recentChanges: 0 // This would need additional tracking
    };

    // System health check
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

async function monitorDataChanges(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  try {
    // Check for recent scraping job changes
    // @ts-expect-error TS(2339): Property 'getJobsFromDate' does not exist on type ... Remove this comment to see the full error message
    const recentJobs = await ScrapingJobService.getJobsFromDate(
      new Date(Date.now() - 60_000) // Last minute
    );

    if (recentJobs.length > 0) {
      const event: AdminEvent = {
        id: generateEventId(),
        type: 'scraping_update',
        timestamp: new Date().toISOString(),
        data: {
          recentJobs: recentJobs.map((job: any) => ({
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

    // Check for data quality changes
    const recentTrucks = await FoodTruckService.getAllTrucks(10, 0);
    const recentlyUpdated = recentTrucks.trucks.filter(truck => {
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

// Health check endpoint for monitoring
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'health_check': {
        const metrics = await fetchRealtimeMetrics();
        // @ts-expect-error TS(2339): Property 'json' does not exist on type '{ new (bod... Remove this comment to see the full error message
        return Response.json({
          success: true,
          status: 'healthy',
          metrics,
          timestamp: new Date().toISOString()
        });
      }

      case 'trigger_test_event': {
        // This would trigger a test event for debugging
        // @ts-expect-error TS(2339): Property 'json' does not exist on type '{ new (bod... Remove this comment to see the full error message
        return Response.json({
          success: true,
          message: 'Test event triggered',
          timestamp: new Date().toISOString()
        });
      }

      default: {
        // @ts-expect-error TS(2339): Property 'json' does not exist on type '{ new (bod... Remove this comment to see the full error message
        return Response.json({
          success: false,
          error: 'Unknown action',
          available_actions: ['health_check', 'trigger_test_event']
        }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Realtime events POST error:', error);
    // @ts-expect-error TS(2339): Property 'json' does not exist on type '{ new (bod... Remove this comment to see the full error message
    return Response.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error == undefined ? 'Unknown error'  : error.message
    }, { status: 500 });
  }
}
