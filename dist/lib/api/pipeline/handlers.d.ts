import { NextResponse } from 'next/server';
import type { PipelineRequestBody } from './types.js';
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
export declare function handleLegacyScrapingRequest(body: PipelineRequestBody): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    message: string;
    job_id: string;
    target_url: string;
    note: string;
}>>;
