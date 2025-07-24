export const dynamic = 'force-dynamic'; // Force dynamic rendering for this route

import { type NextRequest, NextResponse } from 'next/server';
import { processSearchRequest } from '@/lib/api/search/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');
    const cuisine = searchParams.get('cuisine');
    const openNow = searchParams.get('openNow') === 'true';
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius');

    const response = await processSearchRequest({ query, cuisine, openNow, lat, lng, radius });
    return response;
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
