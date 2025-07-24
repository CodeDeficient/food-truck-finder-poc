import { NextRequest, NextResponse } from 'next/server';
/**
 * Lightweight CRON handler that creates jobs but doesn't process them
 * This avoids timeout issues on Vercel hobby plan
 */
export declare function handleAutoScrapeImproved(request: NextRequest): Promise<NextResponse>;
