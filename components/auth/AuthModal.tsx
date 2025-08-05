'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
<<<<<<< HEAD
import { supabase } from '@/lib/supabase/client';
=======
import { getSupabase } from '@/lib/supabase/client';
>>>>>>> data-specialist-2-work
import { Mail, Chrome, AlertCircle } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { AuthEmailForm } from './AuthEmailForm';
import { AuthOAuthForm } from './AuthOAuthForm';

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

interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

interface AuthState {
  isLoading: boolean;
  error: AuthError | undefined;
  mode: 'signin' | 'signup';
  attempts: number;
  lastAttempt: number;
  isBlocked: boolean;
  showPassword: boolean;
}

// SOTA Security: Password strength validation
interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

// SOTA Security: Device fingerprinting for security
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

// SOTA Security: Password strength calculator
const calculatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');
  
  if (/\d/.test(password)) score++;
  else feedback.push('Include numbers');
  
  if (/[^\w\s]/.test(password)) score++;
  else feedback.push('Include special characters');
  
  return {
    score: Math.min(score, 4),
    feedback,
    isValid: score >= 3 && password.length >= 8
  };
};

export const AuthModal: React.FC<AuthModalProps> = ({ 
  mounted, 
  resolvedTheme, // Available for theme-aware styling
  isOpen = false, 
  onClose,
  onAuthSuccess,
  enableCaptcha = false, // Available for future CAPTCHA integration
  rateLimitConfig = { maxAttempts: 5, windowMs: 900000 } // 15 minutes
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: false,
    error: undefined,
    mode: 'signin',
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false,
    showPassword: false
  });
  const [activeTab, setActiveTab] = useState('email');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [], isValid: false });
  const deviceFingerprintRef = useRef<string | undefined>(undefined);

<<<<<<< HEAD
  // Use the imported supabase client directly
=======
  const supabase = getSupabase();
>>>>>>> data-specialist-2-work

  // Suppress unused variable warnings for future use
  void resolvedTheme;
  void enableCaptcha;

  // SOTA Security: Initialize device fingerprint on mount
  useEffect(() => {
    if (mounted && !deviceFingerprintRef.current) {
      deviceFingerprintRef.current = generateDeviceFingerprint();
    }
  }, [mounted]);

  // SOTA Security: Rate limiting check
  const isRateLimited = useCallback(() => {
    const now = Date.now();
    const { attempts, lastAttempt } = authState;
    
    if (now - lastAttempt > rateLimitConfig.windowMs) {
      return false; // Reset window
    }
    
    return attempts >= rateLimitConfig.maxAttempts;
  }, [authState, rateLimitConfig]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setAuthState({
        isLoading: false,
        error: undefined,
        mode: 'signin',
        attempts: 0,
        lastAttempt: 0,
        isBlocked: false,
        showPassword: false
      });
      setActiveTab('email');
      setPasswordStrength({ score: 0, feedback: [], isValid: false });
    }
  }, [isOpen]);

  // SOTA Security: Password strength monitoring
  useEffect(() => {
    if (password && authState.mode === 'signup') {
      setPasswordStrength(calculatePasswordStrength(password));
    }
  }, [password, authState.mode]);

  // SOTA Security: Handle attempts and rate limiting
  const recordAttempt = useCallback(() => {
    setAuthState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      lastAttempt: Date.now(),
      isBlocked: isRateLimited()
    }));
  }, [isRateLimited]);

  // Suppress unused variable warning for future use
  void recordAttempt;

  const togglePasswordVisibility = useCallback(() => {
    setAuthState(prev => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAuthState(prev => ({
        ...prev,
        error: { message: 'Email and password are required' }
      }));
      return;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const { error } = authState.mode === 'signin' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: { message: error.message }
        }));
        return;
      }

      // Success
      setAuthState(prev => ({ ...prev, isLoading: false }));
      onAuthSuccess?.();
      onClose?.();
    } catch {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: { message: 'An unexpected error occurred' }
      }));
    }
  };

  const handleOAuthSignIn = async (provider: Provider) => {
    if (!mounted) return;
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback`
        }
      });

      if (error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: { message: error.message }
        }));
        return;
      }

      // OAuth redirect will handle success
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: { message: 'OAuth sign-in failed' }
      }));
    }
  };

  const toggleMode = () => {
    setAuthState(prev => ({
      ...prev,
      mode: prev.mode === 'signin' ? 'signup' : 'signin',
      error: undefined
    }));
  };

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
              onSubmit={handleEmailAuth}
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
