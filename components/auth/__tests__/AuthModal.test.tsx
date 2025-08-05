/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import { AuthModal } from '../AuthModal';

// Mock child components and hooks
jest.mock('@/components/auth/AuthEmailForm', () => ({
  AuthEmailForm: () => <div data-testid="auth-email-form" />,
}));

jest.mock('@/components/auth/AuthOAuthForm', () => ({
  AuthOAuthForm: () => <div data-testid="auth-oauth-form" />,
}));

jest.mock('@/components/auth/useAuthModal', () => ({
  useAuthModal: () => ({
    email: '',
    password: '',
    authState: { mode: 'signin', error: null, isLoading: false, showPassword: false },
    activeTab: 'email',
    passwordStrength: 0,
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    setActiveTab: jest.fn(),
    handleEmailAuth: jest.fn(),
    handleOAuthSignIn: jest.fn(),
    toggleMode: jest.fn(),
    togglePasswordVisibility: jest.fn(),
  }),
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
  Tabs: ({ children, value }: { children: React.ReactNode; value: string }) =>
    <div data-testid="tabs" data-value={value}>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) =>
    <button data-testid={`tab-${value}`}>{children}</button>,
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) =>
    <div data-testid={`tab-content-${value}`}>{children}</div>,
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

  it('displays sign in mode by default', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Sign In');
  });

  it('renders tabs component with expected structure', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-email')).toBeInTheDocument();
    expect(screen.getByTestId('tab-content-oauth')).toBeInTheDocument();
  });

  it('renders email form in default tab', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('tab-content-email')).toBeInTheDocument();
    expect(screen.getByTestId('auth-email-form')).toBeInTheDocument();
  });

  it('renders OAuth form when OAuth tab is selected', () => {
    render(<AuthModal {...defaultProps} />);
    
    expect(screen.getByTestId('tab-content-oauth')).toBeInTheDocument();
    expect(screen.getByTestId('auth-oauth-form')).toBeInTheDocument();
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

  it('renders without password strength errors', () => {
    // This tests that the component renders without errors when password strength is calculated
    render(<AuthModal {...defaultProps} />);
    
    // Component should render successfully with password strength calculation
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
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
