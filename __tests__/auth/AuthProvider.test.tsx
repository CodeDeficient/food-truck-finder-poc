import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth, AuthResult, SignInResult, SignUpResult, OAuthResult } from '@/app/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock globalThis.location  
const mockLocation = {
  origin: 'http://localhost', // jsdom strips the port in tests
};

// Remove existing location and set mock
delete (globalThis as any).location;
(globalThis as any).location = mockLocation;

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Test component that uses the auth context
function TestComponent() {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="user">{auth.user?.email || 'No user'}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loadingAuth">{auth.loadingAuth.toString()}</div>
      <div data-testid="session">{auth.session?.access_token || 'No session'}</div>
      <button
        data-testid="signin-email"
        onClick={() => auth.signInWithEmail('test@example.com', 'password')}
      >
        Sign In Email
      </button>
      <button
        data-testid="signup"
        onClick={() => auth.signUp('test@example.com', 'password')}
      >
        Sign Up
      </button>
      <button
        data-testid="signin-oauth"
        onClick={() => auth.signInWithOAuth('google')}
      >
        Sign In OAuth
      </button>
      <button
        data-testid="signout"
        onClick={() => auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    created_at: '2023-01-01T00:00:00.000Z',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
  };

  const mockSession: Session = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockSubscription = {
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: mockSubscription },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial loading state', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially loading should be true
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      expect(screen.getByTestId('loadingAuth')).toHaveTextContent('true');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('session')).toHaveTextContent('No session');

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });
    });

    it('should load existing session on mount', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('session')).toHaveTextContent('access-token');
      });
    });

    it('should handle session loading error gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Session error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to get initial session:', expect.any(Error));
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Auth State Changes', () => {
    it('should update state when auth state changes', async () => {
      let authStateCallback: (event: unknown, session: unknown) => void;
      
      mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback;
        return { data: { subscription: mockSubscription } };
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Simulate auth state change with login
      authStateCallback!('SIGNED_IN', mockSession);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('session')).toHaveTextContent('access-token');
      });

      // Simulate auth state change with logout
      authStateCallback!('SIGNED_OUT', null);

      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('No user');
        expect(screen.getByTestId('session')).toHaveTextContent('No session');
      });
    });
  });

  describe('signInWithEmail', () => {
    it('should successfully sign in with email and password', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const TestSignIn = () => {
        const { signInWithEmail } = useAuth();
        const [result, setResult] = React.useState<SignInResult | null>(null);

        const handleSignIn = async () => {
          const result = await signInWithEmail('test@example.com', 'password');
          setResult(result);
        };

        return (
          <div>
            <button data-testid="signin" onClick={handleSignIn}>Sign In</button>
            {result && (
              <div>
                <div data-testid="success">{result.success.toString()}</div>
                <div data-testid="user-email">{result.data?.user?.email || 'No user'}</div>
                <div data-testid="error">{result.error?.message || 'No error'}</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestSignIn />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('signin'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('error')).toHaveTextContent('No error');
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('should handle sign in error', async () => {
      const authError: AuthError = {
        name: 'AuthError',
        message: 'Invalid credentials',
        status: 400,
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      const TestSignIn = () => {
        const { signInWithEmail } = useAuth();
        const [result, setResult] = React.useState<SignInResult | null>(null);

        const handleSignIn = async () => {
          const result = await signInWithEmail('test@example.com', 'wrong-password');
          setResult(result);
        };

        return (
          <div>
            <button data-testid="signin" onClick={handleSignIn}>Sign In</button>
            {result && (
              <div>
                <div data-testid="success">{result.success.toString()}</div>
                <div data-testid="error">{result.error?.message || 'No error'}</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestSignIn />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('signin'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      });
    });

    it('should handle unexpected errors', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const TestSignIn = () => {
        const { signInWithEmail } = useAuth();
        const [result, setResult] = React.useState<SignInResult | null>(null);

        const handleSignIn = async () => {
          const result = await signInWithEmail('test@example.com', 'password');
          setResult(result);
        };

        return (
          <div>
            <button data-testid="signin" onClick={handleSignIn}>Sign In</button>
            {result && (
              <div>
                <div data-testid="success">{result.success.toString()}</div>
                <div data-testid="error">{result.error?.message || 'No error'}</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestSignIn />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('signin'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      });
    });
  });

  describe('signUp', () => {
    it('should successfully sign up with email and password', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const TestSignUp = () => {
        const { signUp } = useAuth();
        const [result, setResult] = React.useState<SignUpResult | null>(null);

        const handleSignUp = async () => {
          const result = await signUp('test@example.com', 'password', { redirectTo: '/welcome' });
          setResult(result);
        };

        return (
          <div>
            <button data-testid="signup" onClick={handleSignUp}>Sign Up</button>
            {result && (
              <div>
                <div data-testid="success">{result.success.toString()}</div>
                <div data-testid="user-email">{result.data?.user?.email || 'No user'}</div>
                <div data-testid="error">{result.error?.message || 'No error'}</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestSignUp />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('signup'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('true');
        expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
        expect(screen.getByTestId('error')).toHaveTextContent('No error');
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          emailRedirectTo: '/welcome',
        },
      });
    });

    it('should handle sign up without redirect option', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null }, // Often null for email confirmation
        error: null,
      });

      const TestSignUp = () => {
        const { signUp } = useAuth();
        const [result, setResult] = React.useState<SignUpResult | null>(null);

        const handleSignUp = async () => {
          const result = await signUp('test@example.com', 'password');
          setResult(result);
        };

        return (
          <div>
            <button data-testid="signup" onClick={handleSignUp}>Sign Up</button>
            {result && (
              <div>
                <div data-testid="success">{result.success.toString()}</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestSignUp />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('signup'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('true');
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          emailRedirectTo: undefined,
        },
      });
    });
  });

  describe('signInWithOAuth', () => {
    it('should successfully initiate OAuth sign in', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://oauth-url' },
        error: null,
      });

      const TestOAuth = () => {
        const { signInWithOAuth } = useAuth();
        const [result, setResult] = React.useState<OAuthResult | null>(null);

        const handleOAuth = async () => {
          const result = await signInWithOAuth('google', { redirectTo: '/profile' });
          setResult(result);
        };

        return (
          <div>
            <button data-testid="oauth" onClick={handleOAuth}>OAuth Sign In</button>
            {result && (
              <div>
                <div data-testid="success">{result.success.toString()}</div>
                <div data-testid="error">{result.error?.message || 'No error'}</div>
              </div>
            )}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestOAuth />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('oauth'));

      await waitFor(() => {
        expect(screen.getByTestId('success')).toHaveTextContent('true');
        expect(screen.getByTestId('error')).toHaveTextContent('No error');
      });

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost/auth/callback?redirectTo=%2Fprofile',
        },
      });
    });

    it('should use default redirect if none provided', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://oauth-url' },
        error: null,
      });

      const TestOAuth = () => {
        const { signInWithOAuth } = useAuth();
        const [result, setResult] = React.useState<OAuthResult | null>(null);

        const handleOAuth = async () => {
          const result = await signInWithOAuth('github');
          setResult(result);
        };

        return (
          <div>
            <button data-testid="oauth" onClick={handleOAuth}>OAuth Sign In</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestOAuth />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('oauth'));

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'github',
          options: {
            redirectTo: 'http://localhost/auth/callback?redirectTo=%2Fdashboard',
          },
        });
      });
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('signout'));

      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const TestWithoutProvider = () => {
        useAuth();
        return <div>Test</div>;
      };

      // Suppress console error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => render(<TestWithoutProvider />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from auth state changes on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});
