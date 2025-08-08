'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Get the hash from the URL
      const hash = window.location.hash;
      
      if (hash) {
        // Parse the hash to get tokens
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // Import Supabase client
          const { getSupabase } = await import('@/lib/supabase/client');
          const supabase = getSupabase();
          
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (!error) {
            // Get user info to determine redirect
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
              
              // Get the redirect from query params
              const searchParams = new URLSearchParams(window.location.search);
              const redirectTo = searchParams.get('redirectTo') || '/';
              
              // Smart role-based redirects
              if (redirectTo === '/') {
                // For regular login, everyone goes to homepage
                router.push('/');
              } else if (redirectTo.startsWith('/admin')) {
                if (profile?.role === 'admin') {
                  router.push(redirectTo);
                } else {
                  router.push(profile?.role === 'food_truck_owner' ? '/owner-dashboard' : '/profile');
                }
              } else {
                router.push(redirectTo);
              }
              return;
            }
          }
        }
      }
      
      // If we get here, something went wrong
      router.push('/login?error=auth_failed');
    };
    
    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
}
