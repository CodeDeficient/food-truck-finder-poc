import { NextRequest, NextResponse } from 'next/server';
import {
  handleGetRequest,
  handlePostRequest,
} from '@/lib/api/admin/oauth-status/helpers';
import { OAuthStatus } from '@/lib/api/admin/oauth-status/types';

export async function GET(request: NextRequest) {
  try {
    return await handleGetRequest(request);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'OAuth status check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handlePostRequest(request);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate OAuth test URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
