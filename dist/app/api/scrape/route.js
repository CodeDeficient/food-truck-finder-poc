import { NextResponse } from 'next/server';
import { ScrapingJobService } from '@/lib/supabase';
import { processScrapingJob } from '@/lib/pipelineProcessor';
export async function POST(request) {
    try {
        const body = (await request.json());
        const { url, type = 'website', priority = 5 } = body;
        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }
        // Create scraping job
        const job = await ScrapingJobService.createJob({
            job_type: type,
            target_url: url,
            priority,
            scheduled_at: new Date().toISOString(),
        });
        if (job == undefined) {
            // This case handles if createJob returns null without throwing.
            console.error('Scraping job creation returned null unexpectedly.');
            return NextResponse.json({ error: 'Failed to create scraping job instance' }, { status: 500 });
        }
        // Start scraping process
        void processScrapingJob(job.id);
        return NextResponse.json({
            message: 'Scraping job created',
            jobId: job.id,
            status: 'pending',
        });
    }
    catch (error) {
        console.error('Error creating scraping job:', error);
        return NextResponse.json({ error: 'Failed to create scraping job' }, { status: 500 });
    }
}
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    try {
        if (jobId !== null && jobId !== '') {
            // Get specific job status
            const jobs = await ScrapingJobService.getJobsByStatus('all');
            const job = jobs?.find((j) => j.id === jobId);
            if (!job) {
                return NextResponse.json({ error: 'Job not found' }, { status: 404 });
            }
            return NextResponse.json({ job });
        }
        // Get jobs by status
        const jobs = await ScrapingJobService.getJobsByStatus(status ?? 'pending');
        return NextResponse.json({
            jobs,
            summary: {
                total: jobs.length,
                pending: jobs.filter((j) => j.status === 'pending').length,
                running: jobs.filter((j) => j.status === 'running').length,
                completed: jobs.filter((j) => j.status === 'completed').length,
                failed: jobs.filter((j) => j.status === 'failed').length,
            },
        });
    }
    catch (error) {
        console.error('Error fetching scraping jobs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
// processScrapingJob and createOrUpdateFoodTruck functions have been moved to lib/pipelineProcessor.ts
// The functions processScrapedData and processDataQueue, along with their specific imports,
// appear to be part of an older, deprecated data processing flow and are currently unused.
// They are being removed to clean up the codebase and resolve linting errors.
// If this functionality is still required, it should be re-evaluated and integrated
// with the current pipelineProcessor logic.
// End of file
