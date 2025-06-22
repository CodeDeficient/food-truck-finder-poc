import { NextResponse } from 'next/server';
import { verifyAdminAccess, getScrapingMetrics } from '@/lib/api/admin/scraping-metrics/handlers';

export async function GET(request: Request): Promise<NextResponse> {
  const hasAdminAccess = await verifyAdminAccess(request);
  if (!hasAdminAccess) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    const metrics = await getScrapingMetrics();
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: unknown) {
    console.error('Error fetching scraping metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scraping metrics',
        metrics: undefined,
      },
      { status: 500 },
    );
  }
}
