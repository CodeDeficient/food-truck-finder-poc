'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session, AuthError, Provider } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';

// Auth result types for typed returns
export interface AuthResult<T = void> {
  data: T | null;
  error: AuthError | Error | null;
  success: boolean;
}

export interface SignInResult extends AuthResult<{
  user: User | null;
  session: Session | null;
}> {
  // Inherits properly typed data property
}

export interface SignUpResult extends AuthResult<{
  user: User | null;
  session: Session | null;
}> {
  // Inherits properly typed data property
}

export interface OAuthResult extends AuthResult<void> {
  // OAuth returns void as it redirects
}

interface AuthContextType {
  // User state
  user: User | undefined;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  loadingAuth: boolean; // Alias for loading for backwards compatibility
  
  // Auth methods with typed returns
  signInWithEmail: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, options?: { redirectTo?: string }) => Promise<SignUpResult>;
  signInWithOAuth: (provider: Provider, options?: { redirectTo?: string }) => Promise<OAuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication context for React application.
 * @example
 * AuthProvider({ children: <SomeComponent /> })
 * Returns an AuthContext.Provider wrapping the children.
 * @param {Object} { children: React.ReactNode } - React nodes to be wrapped by the provider.
 * @returns {JSX.Element} Returns a JSX element which provides authentication context.
 * @description
 *   - Uses Supabase for authentication management.
 *   - Initializes user state from current session and listens for authentication state changes.
 *   - Unsubscribes from authentication state change listeners on unmount.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Derived state
  const isAuthenticated = Boolean(user);
  const loadingAuth = loading; // Alias for backwards compatibility

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    // Get initial session
    const getSession = async () => {
      try {
        const supabase = getSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? undefined);
        setSession(session);
        setLoading(false);
      } catch (error) {
        console.warn('Failed to get initial session:', error);
        setLoading(false);
      }
    };

    void getSession();

    // Listen for auth changes
    try {
      const supabase = getSupabase();
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
        const typedSession = session as Session | null;
        setUser(typedSession?.user ?? undefined);
        setSession(typedSession);
        setLoading(false);
      });
      subscription = authSubscription;
    } catch (error) {
      console.warn('Failed to set up auth state listener:', error);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Public auth flow methods
  const signInWithEmail = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return {
        data: data ? { user: data.user, session: data.session } : null,
        error,
        success: !error,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        success: false,
      };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    options?: { redirectTo?: string }
  ): Promise<SignUpResult> => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: options?.redirectTo,
        },
      });
      
      return {
        data: data ? { user: data.user, session: data.session } : null,
        error,
        success: !error,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        success: false,
      };
    }
  };

  const signInWithOAuth = async (
    provider: Provider, 
    options?: { redirectTo?: string }
  ): Promise<OAuthResult> => {
    try {
      const supabase = getSupabase();
      const redirectTo = options?.redirectTo ?? '/dashboard';
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${globalThis.location?.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });
      
      return {
        data: null, // OAuth redirects, no immediate data
        error,
        success: !error,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
        success: false,
      };
    }
  };

  const handleSignOut = async (): Promise<void> => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  };

  const value = {
    // State
    user,
    session,
    loading,
    isAuthenticated,
    loadingAuth,
    
    // Methods
    signInWithEmail,
    signUp,
    signInWithOAuth,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
