import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has admin role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        return profile?.role === 'admin'
          ? NextResponse.redirect(`${origin}${redirectTo}`)
          : NextResponse.redirect(`${origin}/access-denied`);
      }
    }
  }

  // If there was an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
