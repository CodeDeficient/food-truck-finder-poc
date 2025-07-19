'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | undefined;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const signOut = async () => {
  await supabase.auth.signOut();
};

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? undefined);
      setLoading(false);
    };

    void getSession().catch((error) => {
      console.warn('Failed to get initial session:', error);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      setUser((session as { user?: User })?.user ?? undefined);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signOut,
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
