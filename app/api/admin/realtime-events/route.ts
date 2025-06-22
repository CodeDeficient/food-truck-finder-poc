import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminAccess,
  handleGetRequest,
  handlePostRequest,
} from '@/lib/api/admin/realtime-events/handlers';

export async function GET(request: NextRequest): Promise<Response> {
  const hasAccess = await verifyAdminAccess(request);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    return await handleGetRequest(request);
  } catch (error) {
    console.error('Realtime events GET error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const hasAccess = await verifyAdminAccess(request);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    return await handlePostRequest(request);
  } catch (error) {
    console.error('Realtime events POST error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
