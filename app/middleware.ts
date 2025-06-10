import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabaseMiddleware';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (userError || !user) {
      // Redirect unauthenticated users to login
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check for admin role (assuming 'profiles' table with 'role' column)
    const { data: profile, error: profileQueryError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileQueryError || profile?.role !== 'admin') {
      // Redirect non-admin users to access denied page
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/access-denied';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
