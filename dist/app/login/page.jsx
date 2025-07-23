'use client';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Mail } from 'lucide-react';
import { useAuthHandlers } from '@/hooks/useAuthHandlers';
import { EmailFormFields } from '@/components/login/EmailFormFields';
// Login header component
function LoginHeader() {
    return (<CardHeader className="text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <Shield className="size-8 text-primary"/>
      </div>
      <CardTitle className="text-2xl">Admin Login</CardTitle>
      <CardDescription>Sign in to access the admin dashboard</CardDescription>
    </CardHeader>);
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
function EmailLoginForm({ email, setEmail, password, setPassword, loading, handleEmailLogin, }) {
    return (<form onSubmit={(e) => {
            handleEmailLogin(e).catch((error) => {
                console.warn('Failed to handle email login:', error);
            });
        }} className="space-y-4">
      <EmailFormFields email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading}/>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (<Loader2 className="mr-2 size-4 animate-spin"/>) : (<Mail className="mr-2 size-4"/>)}
        {loading ? 'Signing in...' : 'Sign in with Email'}
      </Button>
    </form>);
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
function GoogleLoginButton({ loading, handleGoogleLogin, }) {
    return (<Button onClick={() => {
            handleGoogleLogin().catch((error) => {
                console.warn('Failed to handle Google login:', error);
            });
        }} disabled={loading} className="w-full">
      {loading ? (<Loader2 className="mr-2 size-4 animate-spin"/>) : (<Mail className="mr-2 size-4"/>)}
      Google
    </Button>);
}
// Login footer component
function LoginFooter() {
    return (<div className="text-center text-sm text-muted-foreground">
      <p>Admin access only</p>
      <p>Contact your administrator if you need access</p>
    </div>);
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
    return (<div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t"/>
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
    </div>);
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
    const redirectTo = searchParams.get('redirectedFrom') ?? '/admin';
    const { handleEmailLogin, handleGoogleLogin, loading, error, email, setEmail, password, setPassword, } = useAuthHandlers(redirectTo);
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <LoginHeader />
        <CardContent className="space-y-4">
          {error != undefined && error.length > 0 && (<Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}

          <EmailLoginForm email={email} setEmail={setEmail} password={password} setPassword={setPassword} loading={loading} handleEmailLogin={handleEmailLogin}/>

          <LoginDivider />

          <GoogleLoginButton loading={loading} handleGoogleLogin={handleGoogleLogin}/>

          <LoginFooter />
        </CardContent>
      </Card>
    </div>);
}
