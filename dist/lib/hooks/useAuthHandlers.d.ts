interface UseAuthHandlersReturn {
    handleEmailLogin: (e: React.FormEvent) => Promise<void>;
    handleGoogleLogin: () => Promise<void>;
    loading: boolean;
    error: string | undefined;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
}
/**
 * Provides authentication handlers for email and Google login.
 * @example
 * useAuthHandlers('/dashboard')
 * {
 *   handleEmailLogin: [Function],
 *   handleGoogleLogin: [Function],
 *   loading: false,
 *   error: undefined,
 *   email: '',
 *   setEmail: [Function],
 *   password: '',
 *   setPassword: [Function],
 * }
 * @param {string} redirectTo - URL to redirect upon successful login.
 * @returns {UseAuthHandlersReturn} Contains handlers and state variables related to authentication.
 * @description
 *   - Employs Supabase for authentication tasks.
 *   - Utilizes React's `useState` hook for managing local component state.
 *   - Customizes redirection based on user role retrieved from the 'profiles' table.
 */
export declare function useAuthHandlers(redirectTo: string): UseAuthHandlersReturn;
export {};
