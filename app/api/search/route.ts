import { type NextRequest, NextResponse } from 'next/server';
import { processSearchRequest } from '@/lib/api/search/helpers';

export async function GET(request: NextRequest) {
  try {
    const response = await processSearchRequest(request);
    return response;
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
