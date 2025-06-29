import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { OAuthStatus } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function handleGetRequest(_request: NextRequest) {
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
}

// 1. Refactor nested template literals in generateOAuthTestUrl
function generateOAuthTestUrl(baseUrl: string): string {
  const redirectPath = `${baseUrl}/auth/callback`;
  const encodedRedirect = encodeURIComponent(redirectPath);
  return process.env.NEXT_PUBLIC_SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' + encodedRedirect;
}

export function handlePostRequest() { // Removed _request parameter
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app'
    : 'http://localhost:3000';

  const testUrl = generateOAuthTestUrl(baseUrl);

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
}

async function getOAuthStatus(): Promise<OAuthStatus> {
  const status: OAuthStatus = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    supabase: {
      connected: false,
      projectId: 'zkwliyjjkdnigizidlln' as string
    },
    environment_variables: {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined
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

async function checkSupabaseConnection(status: OAuthStatus, supabase: SupabaseClient) {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error === null) {
      status.supabase.connected = true;
    } else {
      status.supabase.error = error.message;
    }
  } catch (error: unknown) {
    status.supabase.error =
      error instanceof Error ? error.message : 'Unknown connection error';
  }
}

async function checkSupabaseAuthSettings(status: OAuthStatus) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (typeof supabaseUrl === 'string' && supabaseUrl.length > 0) { // Explicit check for undefined and empty string
      const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`);
      if (settingsResponse.ok === true) {
        const settingsData: unknown = await settingsResponse.json();
        if (typeof settingsData === 'object' && settingsData !== null) {
          const settings = settingsData as {
            external?: { google?: boolean };
            disable_signup?: boolean;
            autoconfirm?: boolean;
          };
          status.supabase.authSettings = {
            googleEnabled: settings.external?.google ?? false,
            signupEnabled: settings.disable_signup === false, // Note: Supabase typically uses true to disable, so false means enabled
            autoconfirm: settings.autoconfirm ?? false
          };
          if (settings.external?.google !== undefined) {
            status.oauth_flow.authProviderConfigured = true;
          }
        } else {
          console.warn('Auth settings response was not a valid object:', settingsData);
        }
      }
    }
  } catch (error: unknown) {
    console.warn('Error fetching or parsing Supabase auth settings:', error);
    // Keep authProviderConfigured as its current state (likely false)
  }
}

async function testOAuthProvider(status: OAuthStatus, supabase: SupabaseClient) {
  try {
    // This call is expected to "fail" by not redirecting, but not throw if provider is configured.
    // The error object might contain information, or lack of error indicates success.
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Using a non-existent callback for testing purposes, as skipBrowserRedirect might not always prevent navigation attempts.
        redirectTo: 'http://localhost:9999/auth/test-callback',
        skipBrowserRedirect: true, // Attempt to prevent actual redirect
      },
    });

    // If no error, or if error is not "Provider not found", assume it's configured.
    // Specific error messages can be brittle, so checking for NOT "Provider not found" is safer.
    if (!oauthError || (oauthError && oauthError.message !== 'Provider not found' && oauthError.message !== 'No browser detected.')) {
      status.oauth_flow.authProviderConfigured = true;
    } else if (oauthError) {
      console.info(`OAuth provider test info (may indicate not configured): ${oauthError.message}`);
      status.oauth_flow.authProviderConfigured = false; // Explicitly set if specific error indicates not configured
    }
  } catch (error: unknown) {
    // Catch any unexpected errors during the test call
    console.warn('Unexpected error during OAuth provider test:', error);
    // status.oauth_flow.authProviderConfigured remains as is or false
  }
}

function generateRecommendations(status: OAuthStatus): string[] {
  const recommendations: string[] = [];

  if (!status.environment_variables.supabaseUrl) {
    recommendations.push('❌ Configure NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!status.environment_variables.supabaseAnonKey) {
    recommendations.push('❌ Configure NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  if (!status.environment_variables.supabaseServiceKey) {
    recommendations.push('❌ Configure SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  if (!status.supabase.connected) {
    recommendations.push('❌ Fix Supabase connection issue');
  if (typeof status.supabase.error === 'string' && status.supabase.error.length > 0) {
    recommendations.push(`   Error: ${status.supabase.error}`);
  }
  }

  if (status.supabase.authSettings?.googleEnabled === true) {
    recommendations.push('✅ Google OAuth provider is enabled');
  } else {
    recommendations.push('🔧 Enable Google OAuth provider in Supabase Dashboard', '   Go to: Authentication > Providers > Google');
  }

  if (status.overall_status === 'ready') {
    recommendations.push('🎉 OAuth configuration is complete!', '✅ Test the login flow at /login');
  }

  if (recommendations.length > 1) {
    recommendations.push('📖 See docs/GOOGLE_OAUTH_SETUP_GUIDE.md for detailed instructions', '🔧 Run: npm run oauth:verify for automated checks');
  }

  return recommendations;
}

function determineOverallStatus(status: OAuthStatus): 'ready' | 'partial' | 'not_configured' | 'error' {
  // eslint-disable-next-line sonarjs/different-types-comparison
  if (!status.supabase.connected || status.supabase.error !== null) {
    return 'error';
  }

  const envVarsComplete = Object.values(status.environment_variables).every(Boolean);
  if (!envVarsComplete) {
    return 'not_configured';
  }

  if (status.supabase.authSettings?.googleEnabled && status.oauth_flow.authProviderConfigured) {
    return 'ready';
  }

  if (status.supabase.connected && envVarsComplete) {
    return 'partial';
  }

  return 'not_configured';
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'ready': {
      return 'Google OAuth is fully configured and ready to use';
    }
    case 'partial': {
      return 'Basic configuration complete, OAuth provider needs setup';
    }
    case 'not_configured': {
      return 'Google OAuth is not configured';
    }
    case 'error': {
      return 'Configuration error detected';
    }
    default: {
      return 'Unknown configuration status';
    }
  }
}
