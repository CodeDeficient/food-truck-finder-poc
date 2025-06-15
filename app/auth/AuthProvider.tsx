'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
// @ts-expect-error TS(2792): Cannot find module '@supabase/supabase-js'. Did yo... Remove this comment to see the full error message
import { User } from '@supabase/supabase-js';
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

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? undefined);
      setLoading(false);
    };

    getSession().catch((error) => {
      console.warn('Failed to get initial session:', error);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? undefined);
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
