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

export function generateRecommendations(status: OAuthStatus): string[] {
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

export function determineOverallStatus(status: OAuthStatus): 'ready' | 'partial' | 'not_configured' | 'error' {
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

export function getStatusMessage(status: string): string {
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
