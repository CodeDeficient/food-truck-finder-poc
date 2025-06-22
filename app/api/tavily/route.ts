// app/api/tavily/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  performTavilyCrawl,
  performTavilyMap,
  performTavilySearch,
} from '@/lib/api/tavily/handlers';
import { TavilyRequestBody } from '@/lib/api/tavily/types';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TavilyRequestBody;
    const { operation, params } = body;

    if (operation == undefined || params == undefined) {
      return NextResponse.json({ error: 'Missing operation or params' }, { status: 400 });
    }

    let result;

    switch (operation) {
      case 'search': {
        // Use Tavily MCP search tool through server-side execution
        // This would be called from the discovery engine
        result = await performTavilySearch(params);
        break;
      }

      case 'crawl': {
        result = performTavilyCrawl(params);
        break;
      }

      case 'map': {
        result = performTavilyMap(params);
        break;
      }

      default: {
        return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Tavily API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
