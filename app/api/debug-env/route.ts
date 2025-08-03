import { NextResponse } from 'next/server';

export async function GET() {
  // Temporarily enabled in production for debugging
  // if (process.env.NODE_ENV === 'production') {
  //   return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  // }

  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith('${') ? 'NOT_EXPANDED' : 'EXPANDED') : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
      (process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('${') ? 'NOT_EXPANDED' : 'EXPANDED') : 'MISSING',
    CRON_SECRET: process.env.CRON_SECRET ? 
      (process.env.CRON_SECRET.startsWith('${') ? 'NOT_EXPANDED' : 'EXPANDED') : 'MISSING',
  };

  return NextResponse.json(envVars);
}
