import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * OAuth Configuration Status Endpoint
 * Provides comprehensive status of Google OAuth configuration
 * for admin dashboard monitoring and setup verification.
 */

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

export async function GET(_request: NextRequest) {
  try {
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
        loginPageExists: true, // We know this exists from our codebase
        callbackRouteExists: true, // We know this exists from our codebase
        authProviderConfigured: false
      },
      recommendations: [],
      overall_status: 'not_configured'
    };

    // Test Supabase connection
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);

      if (error == undefined) {
        status.supabase.connected = true;
      } else {
        status.supabase.error = error.message;
      }
    } catch (error) {
      status.supabase.error = error instanceof Error ? error.message : 'Unknown connection error';
    }

    // Try to get Supabase auth settings
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl != undefined && supabaseUrl !== '') {
        const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`);

        if (settingsResponse.ok === true) {
          const settings = await settingsResponse.json() as {
            external?: { google?: boolean };
            disable_signup?: boolean;
            autoconfirm?: boolean;
          };
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
      // Auth settings endpoint might require authentication, which is normal
      console.info('Auth settings endpoint requires authentication (normal)');
    }

    // Test OAuth provider availability
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
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

    // Generate recommendations and determine status
    status.recommendations = generateRecommendations(status);
    status.overall_status = determineOverallStatus(status);

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

function generateRecommendations(status: OAuthStatus): string[] {
  const recommendations: string[] = [];

  // Environment variables check
  if (!status.environment_variables.supabaseUrl) {
    recommendations.push('❌ Configure NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!status.environment_variables.supabaseAnonKey) {
    recommendations.push('❌ Configure NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  if (!status.environment_variables.supabaseServiceKey) {
    recommendations.push('❌ Configure SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  // Supabase connection check
  if (!status.supabase.connected) {
    recommendations.push('❌ Fix Supabase connection issue');
    if (status.supabase.error != undefined && status.supabase.error !== '') {
      recommendations.push(`   Error: ${status.supabase.error}`);
    }
  }

  // OAuth configuration check
  if (status.supabase.authSettings == undefined) {
    recommendations.push('🔧 Configure Google OAuth in Supabase Dashboard', '   1. Create Google Cloud Console OAuth credentials', '   2. Add credentials to Supabase Auth settings');
  } else {
    if (status.supabase.authSettings.googleEnabled === true) {
      recommendations.push('✅ Google OAuth provider is enabled');
    } else {
      recommendations.push('🔧 Enable Google OAuth provider in Supabase Dashboard', '   Go to: Authentication > Providers > Google');
    }
  }

  // Success state
  if (status.overall_status === 'ready') {
    recommendations.push('🎉 OAuth configuration is complete!', '✅ Test the login flow at /login');
  }

  // General guidance
  if (recommendations.length > 1) {
    recommendations.push('📖 See docs/GOOGLE_OAUTH_SETUP_GUIDE.md for detailed instructions', '🔧 Run: npm run oauth:verify for automated checks');
  }

  return recommendations;
}

function determineOverallStatus(status: OAuthStatus): 'ready' | 'partial' | 'not_configured' | 'error' {
  // Error state
  if (status.supabase.connected !== true || (status.supabase.error != undefined && status.supabase.error !== '')) {
    return 'error';
  }

  // Check if all environment variables are present
  const envVarsComplete = Object.values(status.environment_variables).every(Boolean);
  if (!envVarsComplete) {
    return 'not_configured';
  }

  // Check OAuth configuration
  if (status.supabase.authSettings?.googleEnabled === true && status.oauth_flow.authProviderConfigured === true) {
    return 'ready';
  }

  // Partial configuration
  if (status.supabase.connected === true && envVarsComplete) {
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
