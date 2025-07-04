'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Mail } from 'lucide-react';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { EmailFormFields } from '@/components/login/EmailFormFields';

// Login header component
function LoginHeader() {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Shield className="size-8 text-primary" />
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
  handleEmailLogin,
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
      <EmailFormFields
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        loading={loading}
      />
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Mail className="mr-2 size-4" />
        )}
        {loading ? 'Signing in...' : 'Sign in with Email'}
      </Button>
    </form>
  );
}

// Google login button component
function GoogleLoginButton({
  loading,
  handleGoogleLogin,
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
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <Mail className="mr-2 size-4" />
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
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectedFrom') ?? '/admin';

  const {
    handleEmailLogin,
    handleGoogleLogin,
    loading,
    error,
    email,
    setEmail,
    password,
    setPassword,
  } = useAuthHandlers(redirectTo);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <CardContent className="space-y-4">
          {error != undefined && error.length > 0 && (
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

          <GoogleLoginButton loading={loading} handleGoogleLogin={handleGoogleLogin} />

          <LoginFooter />
        </CardContent>
      </Card>
    </div>
  );
}
