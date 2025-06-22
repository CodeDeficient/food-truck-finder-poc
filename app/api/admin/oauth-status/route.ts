import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  generateRecommendations,
  determineOverallStatus,
  getStatusMessage,
  checkSupabaseConnection,
  checkSupabaseAuthSettings,
  testOAuthProvider,
} from '@/lib/api/admin/oauth-status/helpers';

interface OAuthStatus {
  timestamp: string;
  environment: 'development' | 'production';
  supabase: {
    connected: boolean;
    projectId: string;
    authSettings?: {
      googleEnabled: boolean;
      signupEnabled: boolean;
      autoconfirm: boolean;
    };
    error?: string;
  };
  environment_variables: {
    supabaseUrl: boolean;
    supabaseAnonKey: boolean;
    supabaseServiceKey: boolean;
  };
  oauth_flow: {
    loginPageExists: boolean;
    callbackRouteExists: boolean;
    authProviderConfigured: boolean;
  };
  recommendations: string[];
  overall_status: 'ready' | 'partial' | 'not_configured' | 'error';
}

async function getOAuthStatus(): Promise<OAuthStatus> {
  const status: OAuthStatus = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    supabase: {
      connected: false,
      projectId: 'zkwliyjjkdnigizidlln'
    },
    environment_variables: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL != undefined,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY != undefined,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY != undefined
    },
    oauth_flow: {
      loginPageExists: true,
      callbackRouteExists: true,
      authProviderConfigured: false
    },
    recommendations: [],
    overall_status: 'not_configured'
  };

  await checkSupabaseConnection(status, supabase);
  await checkSupabaseAuthSettings(status);
  await testOAuthProvider(status, supabase);

  status.recommendations = generateRecommendations(status);
  status.overall_status = determineOverallStatus(status);

  return status;
}

export async function GET(_request: NextRequest) {
  try {
    const status = await getOAuthStatus();

    return NextResponse.json({
      success: true,
      ...status,
      legacy_format: {
        oauth_status: status.overall_status,
        message: getStatusMessage(status.overall_status),
        configuration_steps: status.overall_status === 'ready' ? undefined : [
          '1. Go to Supabase Dashboard > Authentication > Providers',
          '2. Enable Google provider',
          '3. Add Google OAuth Client ID and Secret',
          '4. Configure redirect URLs',
          '5. Test OAuth flow'
        ]
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'OAuth status check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Test OAuth Flow Endpoint
 * Provides OAuth test URL for manual testing
 */
export function POST() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app'
      : 'http://localhost:3000';

    const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${baseUrl}/auth/callback`)}`;

    return NextResponse.json({
      success: true,
      message: 'OAuth test URL generated',
      test_url: testUrl,
      environment: process.env.NODE_ENV ?? 'development',
      instructions: [
        '1. Open the test_url in a new browser tab',
        '2. Complete Google OAuth flow',
        '3. Verify redirect to admin dashboard',
        '4. Check for proper role assignment'
      ],
      manual_test_steps: [
        'Navigate to /login page',
        'Click Google login button',
        'Complete OAuth flow',
        'Verify admin access'
      ],
      automation_commands: [
        'npm run oauth:verify - Check configuration',
        'npm run oauth:test:dev - Test development flow',
        'npm run oauth:test:prod - Test production flow'
      ]
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to generate OAuth test URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
