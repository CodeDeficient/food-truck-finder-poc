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

export type { OAuthStatus };
