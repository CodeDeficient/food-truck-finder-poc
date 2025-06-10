// app/api/tavily/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface TavilyRequestBody {
  operation: string;
  params: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TavilyRequestBody;
    const { operation, params } = body;

    if (!operation || !params) {
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

// These functions would use the Tavily MCP tools
// For now, they return mock data - in production these would be actual MCP calls

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  raw_content: string;
}

async function performTavilySearch(params: Record<string, unknown>) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn('TAVILY_API_KEY not found, using mock data');
    return {
      results: [
        {
          title: 'South Carolina Food Trucks (Mock)',
          url: 'https://example-foodtruck1.com',
          content:
            'Check out the best food trucks in South Carolina. Visit https://carolinabbq.com for amazing BBQ on wheels.',
          raw_content: 'Carolina BBQ Food Truck serves authentic South Carolina barbecue...',
        },
        {
          title: 'Charleston Mobile Food Directory (Mock)',
          url: 'https://example-directory.com',
          content:
            'Directory of Charleston area food trucks including https://charlestontacos.com and https://lowcountryeats.com',
          raw_content: 'Complete listing of mobile food vendors in the Charleston area...',
        },
      ],
    };
  }
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: (params.query as string) || (params.q as string),
        max_results: (params.limit as number) || 10,
        search_depth: (params.search_depth as string) || 'advanced',
        include_answer: true,
        include_raw_content: true,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavily API error response:', errorText);
      throw new Error(`Tavily API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = (await response.json()) as { results?: TavilyResult[] };
    return {
      results:
        data.results?.map((result: TavilyResult) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          raw_content: result.raw_content,
        })) || [],
    };
  } catch (error) {
    console.error('Tavily API call failed:', error);
    throw error;
  }
}

function performTavilyCrawl(params: Record<string, unknown>) {
  console.info('Mock Tavily crawl with params:', params);

  return {
    results: [
      {
        url: 'https://example-crawled-truck.com',
        title: 'Gourmet Food Truck',
        content: 'Premium mobile dining experience...',
      },
    ],
  };
}

function performTavilyMap(params: Record<string, unknown>) {
  console.info('Mock Tavily map with params:', params);

  return {
    results: ['https://foodtruckdirectory.com/truck1', 'https://foodtruckdirectory.com/truck2'],
  };
}
