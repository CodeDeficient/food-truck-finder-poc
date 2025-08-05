import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import type { Provider } from '@supabase/supabase-js';

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

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

interface UseAuthModalProps {
  mounted: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onAuthSuccess?: () => void;
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
    const char = fingerprint.codePointAt(i) ?? 0;
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

export const useAuthModal = ({ 
  mounted, 
  isOpen = false, 
  onClose, 
  onAuthSuccess 
}: UseAuthModalProps) => {
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
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ 
    score: 0, 
    feedback: [], 
    isValid: false 
  });
  const deviceFingerprintRef = useRef<string | undefined>(undefined);

  const supabase = getSupabase();

  // SOTA Security: Initialize device fingerprint on mount
  useEffect(() => {
    if (mounted && deviceFingerprintRef.current === undefined) {
      deviceFingerprintRef.current = generateDeviceFingerprint();
    }
  }, [mounted]);

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

  return {
    // State
    email,
    password,
    authState,
    activeTab,
    passwordStrength,
    
    // Actions
    setEmail,
    setPassword,
    setActiveTab,
    handleEmailAuth,
    handleOAuthSignIn,
    toggleMode,
    togglePasswordVisibility
  };
};
