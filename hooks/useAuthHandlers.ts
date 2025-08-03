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

/**
 * Provides authentication handlers for email and Google login.
 * @example
 * useAuthHandlers('/dashboard')
 * {
 *   handleEmailLogin: [Function],
 *   handleGoogleLogin: [Function],
 *   loading: false,
 *   error: undefined,
 *   email: '',
 *   setEmail: [Function],
 *   password: '',
 *   setPassword: [Function],
 * }
 * @param {string} redirectTo - URL to redirect upon successful login.
 * @returns {UseAuthHandlersReturn} Contains handlers and state variables related to authentication.
 * @description
 *   - Employs Supabase for authentication tasks.
 *   - Utilizes React's `useState` hook for managing local component state.
 *   - Customizes redirection based on user role retrieved from the 'profiles' table.
 */
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

          // Role-based redirects
          if (redirectTo.startsWith('/admin')) {
            // Admin routes require admin role
            if (profile?.role === 'admin') {
              router.push(redirectTo);
            } else {
              router.push('/access-denied');
            }
          } else if (redirectTo.startsWith('/profile') || redirectTo.startsWith('/favorites')) {
            // User routes - any authenticated user can access
            router.push(redirectTo);
          } else {
            // Default role-based redirects
            switch (profile?.role) {
              case 'admin':
                router.push('/admin');
                break;
              case 'food_truck_owner':
                router.push('/owner-dashboard');
                break;
              case 'customer':
                router.push('/profile');
                break;
              default:
                router.push('/profile'); // Default to profile for any authenticated user
            }
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
