'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AccessDeniedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have administrator privileges to access this area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>This area is restricted to administrators only.</p>
            <p>If you believe you should have access, please contact your system administrator.</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleGoHome} variant="default" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Main Site
            </Button>

            <Button
              onClick={() => {
                handleSignOut().catch((error) => console.warn('Sign out failed:', error));
              }}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
