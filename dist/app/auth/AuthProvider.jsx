'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
const AuthContext = createContext(undefined);
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
export function AuthProvider({ children }) {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            var _a;
            const { data: { session }, } = await supabase.auth.getSession();
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : undefined);
            setLoading(false);
        };
        void getSession().catch((error) => {
            console.warn('Failed to get initial session:', error);
        });
        // Listen for auth changes
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            var _a;
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : undefined);
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
