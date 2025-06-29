import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface UseAuthHandlersReturn {
  handleEmailLogin: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  loading: boolean;
  error: string | undefined;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

export function useAuthHandlers(redirectTo: string): UseAuthHandlersReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const performEmailLogin = async (currentEmail: string, currentPassword: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });
    if (signInError) throw signInError;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      if (profile?.role === 'admin') {
        router.push(redirectTo);
      } else {
        router.push('/access-denied');
      }
    }
  };

  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await performEmailLogin(email, password);
    } catch (error_: unknown) {
      console.error('Email login error:', error_);
      setError(error_ instanceof Error ? error_.message : 'An error occurred during email login');
    } finally {
      setLoading(false);
    }
  }, [email, password, router, redirectTo]); // eslint-disable-line react-hooks/exhaustive-deps
  // router, redirectTo are stable, email/password are dependencies for performEmailLogin call.

  const performGoogleLogin = async () => {
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${globalThis.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (signInError) throw signInError;
  };

  const handleGoogleLogin = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      await performGoogleLogin();
    } catch (error_: unknown) {
      console.error('Google login error:', error_);
      setError(error_ instanceof Error ? error_.message : 'An error occurred during Google login');
    } finally {
      setLoading(false);
    }
  }, [router, redirectTo]); // eslint-disable-line react-hooks/exhaustive-deps
  // router, redirectTo are stable.

  return {
    handleEmailLogin,
    handleGoogleLogin,
    loading,
    error,
    email,
    setEmail,
    password,
    setPassword,
  };
}
