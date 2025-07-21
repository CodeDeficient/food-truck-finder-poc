import { NextRequest, NextResponse } from 'next/server';
import { ScrapingJobService } from '@/lib/supabase';
import { processScrapingJob } from '@/lib/pipelineProcessor';
import { logActivity } from '@/lib/activityLogger';

// Process jobs for up to 9 seconds (Vercel timeout is 10s)
const MAX_PROCESSING_TIME = 9000;

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production, use proper auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startTime = Date.now();
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Get pending jobs
    const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
    const jobsToProcess = pendingJobs
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 5); // Process at most 5 jobs per invocation

    console.log(`Found ${pendingJobs.length} pending jobs, processing ${jobsToProcess.length}`);

    for (const job of jobsToProcess) {
      // Check if we're approaching timeout
      if (Date.now() - startTime > MAX_PROCESSING_TIME) {
        console.log('Approaching timeout, stopping job processing');
        break;
      }

      try {
        results.processed++;
        
        // Process the job with a timeout
        const jobPromise = processScrapingJob(job.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Job processing timeout')), 5000)
        );

        await Promise.race([jobPromise, timeoutPromise]);
        
        results.succeeded++;
        console.log(`Successfully processed job ${job.id}`);
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Job ${job.id}: ${errorMsg}`);
        
        // Mark job as failed
        await ScrapingJobService.updateJobStatus(job.id, 'failed', {
          error_message: errorMsg,
          failed_at: new Date().toISOString()
        });
        
        console.error(`Failed to process job ${job.id}:`, error);
      }
    }

    logActivity({
      type: 'job_processing',
      action: 'batch_process_completed',
      details: {
        timestamp: new Date().toISOString(),
        ...results
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Job processing completed',
      data: {
        ...results,
        remainingJobs: pendingJobs.length - results.processed,
        executionTime: Date.now() - startTime
      }
    });
  } catch (error) {
    console.error('Job processor failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Job processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Job processor endpoint',
      info: 'Use POST with proper authorization to process pending jobs'
    }
  );
}
