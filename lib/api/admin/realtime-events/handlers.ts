import { NextRequest } from 'next/server';
import { supabase, supabaseAdmin, ScrapingJobService, FoodTruckService } from '@/lib/supabase';

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

export async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ') !== true) {
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

export async function fetchRealtimeMetrics(): Promise<RealtimeMetrics> {
  try {
    const recentJobs = await ScrapingJobService.getJobsByStatus('all');
    const typedJobs = recentJobs as Array<{ status?: string }>;
    const scrapingMetrics = {
      active: typedJobs.filter(job => job.status === 'running').length,
      completed: typedJobs.filter(job => job.status === 'completed').length,
      failed: typedJobs.filter(job => job.status === 'failed').length,
      pending: typedJobs.filter(job => job.status === 'pending').length
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

export async function monitorDataChanges(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
): Promise<void> {
  try {
    const recentJobs = await ScrapingJobService.getJobsByStatus('all');

    if (recentJobs.length > 0) {
      const event: AdminEvent = {
        id: generateEventId(),
        type: 'scraping_update',
        timestamp: new Date().toISOString(),
        data: {
          recentJobs: recentJobs.map((job: unknown) => {
            const jobData = job as { id?: string; status?: string; started_at?: string; completed_at?: string };
            return {
              id: jobData.id,
              status: jobData.status,
              started_at: jobData.started_at,
              completed_at: jobData.completed_at
            };
          }),
          count: recentJobs.length
        },
        severity: 'info'
      };

      controller.enqueue(encoder.encode(formatSSEMessage(event)));
    }

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

export function formatSSEMessage(event: AdminEvent): string {
  return `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
