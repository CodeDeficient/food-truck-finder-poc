import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Web Vitals Analytics Endpoint
 * Collects and stores Core Web Vitals metrics for performance monitoring
 */

interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json() as WebVitalMetric;

    // Validate metric data
    if (!metric.name || typeof metric.value !== 'number' || !metric.url) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric data' },
        { status: 400 }
      );
    }

    // Store metric in database (if admin client available)
    if (supabaseAdmin) {
      try {
        const { error } = await supabaseAdmin
          .from('web_vitals_metrics')
          .insert({
            metric_name: metric.name,
            metric_value: metric.value,
            rating: metric.rating,
            page_url: metric.url,
            user_agent: metric.userAgent,
            recorded_at: new Date(metric.timestamp).toISOString()
          });

        if (error) {
          console.warn('Failed to store web vital metric:', error);
          // Don't fail the request - metrics collection should be non-blocking
        }
      } catch (dbError) {
        console.warn('Database error storing web vital:', dbError);
      }
    }

    // Log performance issues for monitoring
    if (metric.rating === 'poor') {
      console.warn(`Poor ${metric.name} performance detected:`, {
        value: metric.value,
        url: metric.url,
        timestamp: new Date(metric.timestamp).toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web vitals endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get Web Vitals Analytics Data
 */
export function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Number.parseInt(searchParams.get('days') ?? '7');
    const page = searchParams.get('page');

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      );
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabaseAdmin
      .from('web_vitals_metrics')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false });

    // Filter by page if specified
    if (page != undefined && page !== '') {
      query = query.ilike('page_url', `%${page}%`);
    }

    const { data: metrics, error } = await query.limit(1000);

    if (error) {
      throw error;
    }

    // Calculate summary statistics
    const summary = calculateMetricsSummary((metrics ?? []) as Array<{ metric_name: string; metric_value: number; rating: string }>);

    return NextResponse.json({
      success: true,
      data: {
        metrics: metrics ?? [],
        summary,
        period: {
          days,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch web vitals analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

/**
 * Calculate summary statistics for metrics
 */
function calculateMetricsSummary(metrics: Array<{ metric_name: string; metric_value: number; rating: string }>) {
  const metricTypes = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'];
  const summary: Record<string, {
    count: number;
    average: number | undefined;
    median: number | undefined;
    p75: number | undefined;
    p95: number | undefined;
    goodCount: number;
    needsImprovementCount: number;
    poorCount: number;
  }> = {};

  for (const metricName of metricTypes) {
    const metricData = metrics.filter(m => m.metric_name === metricName);
    
    if (metricData.length === 0) {
      summary[metricName] = {
        count: 0,
        average: undefined,
        median: undefined,
        p75: undefined,
        p95: undefined,
        goodCount: 0,
        needsImprovementCount: 0,
        poorCount: 0
      };
      continue;
    }

    const values = metricData.map(m => m.metric_value).sort((a, b) => a - b);
    const ratings = metricData.map(m => m.rating);

    summary[metricName] = {
      count: metricData.length,
      average: Math.round(values.reduce((sum: number, val: number) => sum + val, 0) / values.length),
      median: getPercentile(values, 50),
      p75: getPercentile(values, 75),
      p95: getPercentile(values, 95),
      goodCount: ratings.filter(r => r === 'good').length,
      needsImprovementCount: ratings.filter(r => r === 'needs-improvement').length,
      poorCount: ratings.filter(r => r === 'poor').length
    };
  }

  return summary;
}

/**
 * Calculate percentile value from sorted array
 */
function getPercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower === upper) {
    return Math.round(sortedValues[lower]);
  }
  
  const weight = index - lower;
  return Math.round(sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight);
}
