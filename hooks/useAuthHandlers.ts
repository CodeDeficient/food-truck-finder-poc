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

  const handleEmailLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError(undefined);

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          if (profile?.role === 'admin') {
            router.push(redirectTo);
          } else {
            router.push('/access-denied');
          }
        }
      } catch (error_: unknown) {
        console.error('Login error:', error_);
        setError(error_ instanceof Error ? error_.message : 'An error occurred during login');
      } finally {
        setLoading(false);
      }
    },
    [email, password, router, redirectTo],
  );

  const handleGoogleLogin = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (error_: unknown) {
      console.error('Login error:', error_);
      setError(error_ instanceof Error ? error_.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  }, [router, redirectTo]);

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
