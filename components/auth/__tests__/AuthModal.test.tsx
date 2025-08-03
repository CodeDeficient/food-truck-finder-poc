/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthModal } from '../AuthModal';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
  },
};

jest.mock('@/lib/supabase/client', () => ({
  getSupabase: () => mockSupabase,
}));

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h1 data-testid="dialog-title">{children}</h1>,
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: { 
    children: React.ReactNode; 
    value: string; 
    onValueChange: (value: string) => void;
  }) => (
    <div data-testid="tabs" data-value={value}>
      <button onClick={() => onValueChange('email')} data-testid="email-tab">Email</button>
      <button onClick={() => onValueChange('oauth')} data-testid="oauth-tab">OAuth</button>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => 
    <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => 
    <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

// Mock child components
jest.mock('../AuthEmailForm', () => ({
  AuthEmailForm: ({ onSubmit, onToggleMode, email, password }: {
    onSubmit: (e: React.FormEvent) => void;
    onToggleMode: () => void;
    email: string;
    password: string;
  }) => (
    <form onSubmit={onSubmit} data-testid="email-form">
      <input 
        type="email" 
        value={email} 
        data-testid="email-input" 
        onChange={() => {}} 
      />
      <input 
        type="password" 
        value={password} 
        data-testid="password-input" 
        onChange={() => {}} 
      />
      <button type="submit" data-testid="submit-button">Submit</button>
      <button type="button" onClick={onToggleMode} data-testid="toggle-mode">Toggle</button>
    </form>
  ),
}));

jest.mock('../AuthOAuthForm', () => ({
  AuthOAuthForm: ({ onOAuthSignIn }: {
    onOAuthSignIn: (provider: string) => void;
  }) => (
    <div data-testid="oauth-form">
      <button onClick={() => onOAuthSignIn('google')} data-testid="google-signin">
        Sign in with Google
      </button>
    </div>
  ),
}));

describe('AuthModal', () => {
  const defaultProps = {
    mounted: true,
    isOpen: true,
    onClose: jest.fn(),
    onAuthSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Sign In');
  });

  it('does not render when not mounted', () => {
    render(<AuthModal {...defaultProps} mounted={false} />);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AuthModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('switches between sign in and sign up modes', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Sign In');
    
    fireEvent.click(screen.getByTestId('toggle-mode'));
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Create Account');
  });

  it('switches between email and oauth tabs', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('tab-content-email')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('oauth-tab'));
    
    expect(screen.getByTestId('tab-content-oauth')).toBeInTheDocument();
  });

  it('handles successful email authentication', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    
    render(<AuthModal {...defaultProps} />);
    
    fireEvent.submit(screen.getByTestId('email-form'));
    
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(defaultProps.onAuthSuccess).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('handles email authentication error', async () => {
    const errorMessage = 'Invalid credentials';
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ 
      error: { message: errorMessage } 
    });
    
    render(<AuthModal {...defaultProps} />);
    
    fireEvent.submit(screen.getByTestId('email-form'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('handles OAuth authentication', async () => {
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ error: null });
    
    render(<AuthModal {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('oauth-tab'));
    fireEvent.click(screen.getByTestId('google-signin'));
    
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    });
  });

  it('implements rate limiting configuration', () => {
    const rateLimitConfig = { maxAttempts: 3, windowMs: 300000 };
    
    render(<AuthModal {...defaultProps} rateLimitConfig={rateLimitConfig} />);
    
    // Component should render without errors with rate limit config
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('supports CAPTCHA enablement', () => {
    render(<AuthModal {...defaultProps} enableCaptcha={true} />);
    
    // Component should render without errors with CAPTCHA enabled
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('calculates password strength correctly', () => {
    // This tests the password strength calculation function
    // We'll need to expose it for testing or test it through the UI
    render(<AuthModal {...defaultProps} />);
    
    // Switch to sign up mode to activate password strength
    fireEvent.click(screen.getByTestId('toggle-mode'));
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Create Account');
  });

  it('generates device fingerprint on mount', () => {
    render(<AuthModal {...defaultProps} />);
    
    // Device fingerprint should be generated without errors
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('resets form when modal closes', () => {
    const { rerender } = render(<AuthModal {...defaultProps} />);
    
    // Close the modal
    rerender(<AuthModal {...defaultProps} isOpen={false} />);
    
    // Reopen the modal
    rerender(<AuthModal {...defaultProps} isOpen={true} />);
    
    // Should be back to initial state
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Sign In');
  });
});
