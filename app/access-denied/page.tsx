'use client';


import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper component for the access denied header
function AccessDeniedHeader() {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <Shield className="size-8 text-destructive" />
      </div>
      <CardTitle className="text-2xl">Access Denied</CardTitle>
      <CardDescription>You don't have administrator privileges to access this area</CardDescription>
    </CardHeader>
  );
}

// Helper component for the action buttons
/**
 * Renders action buttons for navigating to home and signing out
 * @example
 * ActionButtons({
 *   onGoHome: () => console.log("Going home"),
 *   onSignOut: async () => await signOutService()
 * })
 * Returns JSX containing two buttons for home navigation and sign out
 * @param {Object} props - An object containing action handlers.
 * @param {Function} props.onGoHome - A function that navigates the user to the home page.
 * @param {Promise<Function>} props.onSignOut - An async function that signs the user out, returning a promise.
 * @returns {JSX.Element} A div containing two button elements with respective actions.
 * @description
 *   - The sign-out button handles promise rejection and logs a warning on failure.
 *   - Buttons are styled using Tailwind CSS classes.
 *   - Button actions are defined by the functions passed as props.
 */
function ActionButtons({
  onGoHome,
  onSignOut,
}: {
  readonly onGoHome: () => void;
  readonly onSignOut: () => Promise<void>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onGoHome} className="w-full">
        <Home className="mr-2 size-4" />
        Return to Main Site
      </Button>
      <Button
        onClick={() => {
          onSignOut().catch((error: unknown) => console.warn('Sign out failed:', error));
        }}
        className="w-full"
      >
        <LogOut className="mr-2 size-4" />
        Sign Out
      </Button>
    </div>
  );
}

/**
 * Renders a page indicating access is denied and provides navigation options for the user.
 * @example
 * AccessDeniedPage()
 * Returns a React component for the access denied page.
 * @returns {JSX.Element} A JSX element rendering the access denied page.
 * @description
 *   - Utilizes the router from Next.js to navigate to the home page upon certain actions.
 *   - Integrates with Supabase authentication to manage user sign-out operations.
 *   - Provides guidance to users for restricted access and contacts for further assistance.
 *   - Features customizable components such as Card and AccessDeniedHeader for UI structure.
 */
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
        <AccessDeniedHeader />
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>This area is restricted to administrators only.</p>
            <p>If you believe you should have access, please contact your system administrator.</p>
          </div>
          <ActionButtons onGoHome={handleGoHome} onSignOut={handleSignOut} />
        </CardContent>
      </Card>
    </div>
  );
}
