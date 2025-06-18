'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Mail } from 'lucide-react';

// Login header component
function LoginHeader() {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Shield className="h-8 w-8 text-primary" />
      </div>
      <CardTitle className="text-2xl">Admin Login</CardTitle>
      <CardDescription>Sign in to access the admin dashboard</CardDescription>
    </CardHeader>
  );
}

// Email login form component
function EmailLoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleEmailLogin
}: {
  readonly email: string;
  readonly setEmail: (email: string) => void;
  readonly password: string;
  readonly setPassword: (password: string) => void;
  readonly loading: boolean;
  readonly handleEmailLogin: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <form
      onSubmit={(e) => {
        handleEmailLogin(e).catch((error) => {
          console.warn('Failed to handle email login:', error);
        });
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        {loading ? 'Signing in...' : 'Sign in with Email'}
      </Button>
    </form>
  );
}

// Google login button component
function GoogleLoginButton({
  loading,
  handleGoogleLogin
}: {
  readonly loading: boolean;
  readonly handleGoogleLogin: () => Promise<void>;
}) {
  return (
    <Button
      onClick={() => {
        handleGoogleLogin().catch((error) => {
          console.warn('Failed to handle Google login:', error);
        });
      }}
      disabled={loading}
      variant="outline"
      className="w-full"
      size="lg"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      Google
    </Button>
  );
}

// Login footer component
function LoginFooter() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>Admin access only</p>
      <p>Contact your administrator if you need access</p>
    </div>
  );
}

// Divider component
function LoginDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectedFrom') ?? '/admin';

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(undefined);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

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

        if (profile?.role === 'admin') {
          router.push(redirectTo);
        } else {
          // User exists but is not admin - redirect to access denied
          router.push('/access-denied');
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(undefined);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${globalThis.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <CardContent className="space-y-4">
          {error !== undefined && error !== '' && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <EmailLoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            handleEmailLogin={handleEmailLogin}
          />

          <LoginDivider />

          <GoogleLoginButton
            loading={loading}
            handleGoogleLogin={handleGoogleLogin}
          />

          <LoginFooter />
        </CardContent>
      </Card>
    </div>
  );
}
