'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Chrome, Loader2 } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';

interface AuthOAuthFormProps {
  readonly isLoading: boolean;
  readonly onOAuthSignIn: (provider: Provider) => Promise<void>;
}

export const AuthOAuthForm: React.FC<AuthOAuthFormProps> = ({
  isLoading,
  onOAuthSignIn
}) => {
  const handleGoogleSignIn = () => {
    void onOAuthSignIn('google');
  };

  const handleGithubSignIn = () => {
    void onOAuthSignIn('github');
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Chrome className="size-4" />
        )}
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleGithubSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Github className="size-4" />
        )}
        Continue with GitHub
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
};
