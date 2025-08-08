'use client';

import { useState, useEffect } from 'react';
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
      <CardTitle className="text-2xl">Sign In</CardTitle>
      <CardDescription>Access your Food Truck Finder account</CardDescription>
    </CardHeader>
  );
}

// Email login form component
/**
 * Represents a form for logging in using an email and password.
 * @example
 * EmailLoginForm({ email: 'user@example.com', setEmail: fn, password: 'password123', setPassword: fn, loading: false, handleEmailLogin: fn })
 * Returns an HTML form element configured for email login.
 * @param {object} {email, setEmail, password, setPassword, loading, handleEmailLogin} - Object containing email and password properties along with their updater functions, a loading state, and a login handler function.
 * @returns {JSX.Element} The rendered login form component including email fields and submit button.
 * @description
 *   - The submit button's text and state are dynamically updated based on the loading status.
 *   - Uses the EmailFormFields component for input fields to enhance modularity.
 *   - Catches and logs errors during the handleEmailLogin process.
 */
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
      <Button type="submit" disabled={loading} className="w-full">
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
/**
 * Renders a Google login button with a loading state.
 * @example
 * GoogleLoginButton({ loading: true, handleGoogleLogin: asyncFunction })
 * Renders a button either with a spinner if loading or an icon otherwise.
 * @param {Object} props - Properties to configure the Google login button.
 * @param {boolean} props.loading - Indicates whether the button should display a loading spinner.
 * @param {function} props.handleGoogleLogin - Callback function that handles the Google login process.
 * @returns {JSX.Element} A JSX button element configured for Google login interaction.
 * @description
 *   - Uses a loading spinner animation when the login process is ongoing.
 *   - Calls the `handleGoogleLogin` function and manages error handling by logging failures to console.
 *   - Configures the button to be disabled during the loading state to prevent multiple submissions.
 */
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
      className="w-full"
      variant="outline"
    >
      {loading ? (
        <Loader2 className="mr-2 size-4 animate-spin" />
      ) : (
        <svg className="mr-2 size-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      Continue with Google
    </Button>
  );
}

// Login footer component
function LoginFooter() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>New to Food Truck Finder?</p>
      <p>Sign up to start discovering great food trucks!</p>
    </div>
  );
}

// Divider component
/**
* Component that renders a styled divider section for login options
* @example
* LoginDivider()
* <div>...</div>
* @returns {JSX.Element} A JSX element representing the login divider component.
* @description
*   - It uses absolute positioning to overlay a horizontal line across the container.
*   - The text "Or continue with" is styled to appear above the divider with a background.
*   - Ensures the text stays within the confines of the container using flexbox for centering.
*/
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

/**
 * Renders the login page component which provides email or Google login options.
 * @example
 * const element = <LoginPage />
 * // Returns a JSX element rendering the login page.
 * @returns {JSX.Element} JSX content displaying login options, error alerts, and associated handlers.
 * @description
 *   - Utilizes `useSearchParams` to determine redirect behavior after login.
 *   - Incorporates `useAuthHandlers` for managing the login process.
 *   - Displays an alert when authentication errors occur.
 *   - Uses `Card`, `LoginHeader`, `EmailLoginForm`, `LoginDivider`, `GoogleLoginButton`, and `LoginFooter` for structuring the page.
 */
export default function LoginPage() {
  const searchParams = useSearchParams();
  // Support both 'redirectedFrom' (from middleware) and 'next' (from manual redirects)
  // Default to home page instead of admin for regular users
  const redirectTo = searchParams.get('next') ?? searchParams.get('redirectedFrom') ?? '/';

  // Fix hydration issues by ensuring we only run on client side
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <CardContent className="space-y-4">
          {error != undefined && error.length > 0 && (
            <Alert>
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
