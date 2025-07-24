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
export default function LoginPage(): import("react").JSX.Element;
