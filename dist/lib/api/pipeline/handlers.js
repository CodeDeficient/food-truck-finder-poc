import { NextResponse } from 'next/server';
import { ScrapingJobService } from '@/lib/supabase';
/**
 * Handles a legacy scraping request and creates a scraping job.
 * @example
 * handleLegacyScrapingRequest({ target_url: 'https://example.com', job_type: 'website_scrape', priority: 2 })
 * { message: 'Scraping job created (legacy mode)', job_id: '123', target_url: 'https://example.com', note: 'Consider using the new unified pipeline API with action parameter' }
 * @param {PipelineRequestBody} body - The request body containing scraping job details.
 * @returns {NextResponse} Response indicating the outcome of creating the scraping job.
 * @description
 *   - Validates the `target_url` and returns errors for missing or invalid URLs.
 *   - Defaults `job_type` to 'website_scrape' and `priority` to 1 if not provided.
 *   - Includes a suggestion note about using the new unified pipeline API.
 */
export async function handleLegacyScrapingRequest(body) {
    const { target_url, job_type = 'website_scrape', priority = 1 } = body;
    if (target_url == undefined || target_url === '') {
        return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
    }
    try {
        new URL(target_url);
    }
    catch {
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
