import { useState, useCallback } from 'react';
import { supabase } from '../../supabase/client.js';
import { useRouter } from 'next/navigation';
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
export function useAuthHandlers(redirectTo) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const handleEmailLogin = useCallback(async (e) => {
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
            const { data: { user }, error: userError, } = await supabase.auth.getUser();
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
                }
                else {
                    router.push('/access-denied');
                }
            }
        }
        catch (error_) {
            console.error('Login error:', error_);
            setError(error_ instanceof Error ? error_.message : 'An error occurred during login');
        }
        finally {
            setLoading(false);
        }
    }, [email, password, router, redirectTo]);
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
        }
        catch (error_) {
            console.error('Login error:', error_);
            setError(error_ instanceof Error ? error_.message : 'An error occurred during login');
        }
        finally {
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
