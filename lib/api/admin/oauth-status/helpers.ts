import { NextResponse } from 'next/server';
import { supabase, SupabaseClient } from '@/lib/supabase';
import { OAuthStatus } from './types';

export async function handleGetRequest() {
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

export function handlePostRequest() {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app'
    : 'http://localhost:3000';

  const redirectUrl = encodeURIComponent(`${baseUrl}/auth/callback`);
  const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}`;

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

interface AuthSettings {
  external?: { google?: boolean };
  disable_signup?: boolean;
  autoconfirm?: boolean;
}

async function checkSupabaseConnection(status: OAuthStatus, supabaseClient: SupabaseClient) {
  try {
    const { error } = await supabaseClient.from('profiles').select('count').limit(1);
    if (error == undefined) {
      status.supabase.connected = true;
    } else {
      status.supabase.error = error.message;
    }
  } catch (error) {
    status.supabase.error = error instanceof Error ? error.message : 'Unknown connection error';
  }
}

async function checkSupabaseAuthSettings(status: OAuthStatus) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl != undefined && supabaseUrl !== '') {
      const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`);
      if (settingsResponse.ok === true) {
        const settings = await settingsResponse.json() as AuthSettings;
        status.supabase.authSettings = {
          googleEnabled: settings.external?.google ?? false,
          signupEnabled: settings.disable_signup !== true,
          autoconfirm: settings.autoconfirm ?? false
        };
        if (settings.external?.google != undefined) {
          status.oauth_flow.authProviderConfigured = true;
        }
      }
    }
  } catch {
    console.info('Auth settings endpoint requires authentication (normal)');
  }
}

async function testOAuthProvider(status: OAuthStatus, supabaseClient: SupabaseClient) {
  try {
    const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
        skipBrowserRedirect: true
      }
    });
    if (!oauthError || oauthError.message !== 'Provider not found') {
      status.oauth_flow.authProviderConfigured = true;
    }
  } catch {
    console.info('OAuth provider test failed (may be normal)');
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
    if (status.supabase.error != undefined && status.supabase.error !== '') {
      recommendations.push(`   Error: ${status.supabase.error}`);
    }
  }

  if (status.supabase.authSettings == undefined) {
    recommendations.push('🔧 Configure Google OAuth in Supabase Dashboard', '   1. Create Google Cloud Console OAuth credentials', '   2. Add credentials to Supabase Auth settings');
  } else {
    if (status.supabase.authSettings.googleEnabled === true) {
      recommendations.push('✅ Google OAuth provider is enabled');
    } else {
      recommendations.push('🔧 Enable Google OAuth provider in Supabase Dashboard', '   Go to: Authentication > Providers > Google');
    }
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
  if (status.supabase.connected !== true || (status.supabase.error != undefined && status.supabase.error !== '')) {
    return 'error';
  }

  const envVarsComplete = Object.values(status.environment_variables).every(Boolean);
  if (!envVarsComplete) {
    return 'not_configured';
  }

  if (status.supabase.authSettings?.googleEnabled === true && status.oauth_flow.authProviderConfigured === true) {
    return 'ready';
  }

  if (status.supabase.connected === true && envVarsComplete) {
    return 'partial';
  }

  return 'not_configured';
}

function getStatusMessage(status: OAuthStatus['overall_status']): string {
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
      // This case should ideally be unreachable if the type is strict enough
      // Adding a check to satisfy linters that might not pick up exhaustiveness from types alone.
      const _exhaustiveCheck: never = status;
      return `Unknown configuration status: ${_exhaustiveCheck}`;
    }
  }
}
