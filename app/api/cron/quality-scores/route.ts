import { NextRequest, NextResponse } from 'next/server';
import { updateQualityScores } from '@/lib/quality/updateQualityScores';

export async function POST(request: NextRequest) {
  // Verify the request is from a cron job or authorized source
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.info('🚀 Starting quality score update via API...');
    
    const stats = await updateQualityScores();
    
    return NextResponse.json({
      success: true,
      message: 'Quality scores updated successfully',
      stats: {
        processed: stats.processed,
        updated: stats.updated,
        errors: stats.errors,
        duration: stats.endTime ? stats.endTime.getTime() - stats.startTime.getTime() : null
      }
    });
    
  } catch (error) {
    console.error('❌ Error in quality score update API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update quality scores',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({
    service: 'Quality Score Update Service',
    status: 'ready',
    timestamp: new Date().toISOString()
  });
}
