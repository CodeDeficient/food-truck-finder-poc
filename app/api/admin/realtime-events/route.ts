import { NextRequest } from 'next/server';
import {
  handleGetRequest,
  handlePostRequest,
} from '@/lib/api/admin/realtime-events/handlers';
import { verifyAdminAccess } from '@/lib/auth/authHelpers';

export async function GET(request: NextRequest): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const hasAccess = await verifyAdminAccess(request);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    return handleGetRequest(request);
  } catch (error: unknown) {
    console.error('Realtime events GET error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const hasAccess = await verifyAdminAccess(request);
  if (!hasAccess) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    return await handlePostRequest(request);
  } catch (error: unknown) {
    console.error('Realtime events POST error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
