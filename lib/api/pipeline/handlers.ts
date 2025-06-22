import { NextResponse } from 'next/server';
import { ScrapingJobService } from '@/lib/supabase';
import { PipelineRequestBody } from './types';

export async function handleLegacyScrapingRequest(body: PipelineRequestBody) {
  const { target_url, job_type = 'website_scrape', priority = 1 } = body;

  if (target_url == undefined || target_url === '') {
    return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
  }

  try {
    new URL(target_url);
  } catch {
    return NextResponse.json({ error: 'Invalid target_url format' }, { status: 400 });
  }

  const job = await ScrapingJobService.createJob({
    target_url,
    job_type,
    priority,
    scheduled_at: new Date().toISOString(),
  });

  if (job == undefined) {
    return NextResponse.json({ error: 'Failed to create scraping job' }, { status: 500 });
  }

  return NextResponse.json({
    message: 'Scraping job created (legacy mode)',
    job_id: job.id,
    target_url,
    note: 'Consider using the new unified pipeline API with action parameter',
  });
}
