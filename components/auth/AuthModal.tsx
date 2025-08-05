'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Mail, Chrome, AlertCircle } from 'lucide-react';
import { AuthEmailForm } from './AuthEmailForm';
import { AuthOAuthForm } from './AuthOAuthForm';
import { useAuthModal } from './useAuthModal';

interface AuthModalProps {
  readonly mounted: boolean;
  readonly resolvedTheme?: string;
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
  readonly onAuthSuccess?: () => void;
  readonly enableCaptcha?: boolean;
  readonly rateLimitConfig?: {
    maxAttempts: number;
    windowMs: number;
  };
}


export const AuthModal: React.FC<AuthModalProps> = (props) => {
  const {
    mounted,
    isOpen = false,
    onClose,
    onAuthSuccess
  } = props;

  const {
    email,
    password,
    authState,
    activeTab,
    passwordStrength,
    setEmail,
    setPassword,
    setActiveTab,
    handleEmailAuth,
    handleOAuthSignIn,
    toggleMode,
    togglePasswordVisibility
  } = useAuthModal({ mounted, isOpen, onClose, onAuthSuccess });

  // Variables available for future use in the props: resolvedTheme, enableCaptcha, rateLimitConfig

  return (
    <Dialog open={isOpen && mounted} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {authState.mode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        {authState.error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            <AlertCircle className="size-4 shrink-0" />
            <span>{authState.error.message}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="size-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="oauth" className="flex items-center gap-2">
              <Chrome className="size-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <AuthEmailForm
              email={email}
              password={password}
              isLoading={authState.isLoading}
              mode={authState.mode}
              error={authState.error}
              showPassword={authState.showPassword}
              passwordStrength={passwordStrength}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={(e: React.FormEvent) => { void handleEmailAuth(e); }}
              onToggleMode={toggleMode}
              onTogglePasswordVisibility={togglePasswordVisibility}
            />
          </TabsContent>

          <TabsContent value="oauth">
            <AuthOAuthForm
              isLoading={authState.isLoading}
              onOAuthSignIn={handleOAuthSignIn}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
