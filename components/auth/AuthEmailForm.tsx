'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

interface AuthEmailFormProps {
  readonly email: string;
  readonly password: string;
  readonly isLoading: boolean;
  readonly mode: 'signin' | 'signup';
  readonly error?: AuthError;
  readonly showPassword?: boolean;
  readonly passwordStrength?: PasswordStrength;
  readonly onEmailChange: (email: string) => void;
  readonly onPasswordChange: (password: string) => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly onToggleMode: () => void;
  readonly onTogglePasswordVisibility?: () => void;
}

// Email validation - simple pattern to avoid complexity
const isValidEmail = (email: string): boolean => {
  return email.includes('@') && email.includes('.');
};

const PasswordStrengthIndicator: React.FC<{ strength: PasswordStrength }> = ({ strength }) => {
  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Password strength: {getStrengthText(strength.score)}
        </span>
        <Shield className={`size-3 ${strength.isValid ? 'text-green-500' : 'text-gray-400'}`} />
      </div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full ${
              level < strength.score ? getStrengthColor(strength.score) : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      {strength.feedback.length > 0 && (
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          {strength.feedback.map((feedback, index) => (
            <li key={index} className="flex items-center gap-1">
              <AlertCircle className="size-3 text-yellow-500" />
              {feedback}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const AuthEmailForm: React.FC<AuthEmailFormProps> = ({
  email,
  password,
  isLoading,
  mode,
  error,
  showPassword = false,
  passwordStrength,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  onTogglePasswordVisibility
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={isLoading}
          className={error?.field === 'email' ? 'border-red-500' : ''}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={isLoading}
            className={`pr-10 ${error?.field === 'password' ? 'border-red-500' : ''}`}
            required
          />
          {onTogglePasswordVisibility && (
            <button
              type="button"
              onClick={onTogglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          )}
        </div>
        
        {mode === 'signup' && passwordStrength && password && (
          <PasswordStrengthIndicator strength={passwordStrength} />
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={
          isLoading || 
          !email || 
          !password || 
          (mode === 'signup' && passwordStrength && !passwordStrength.isValid)
        }
      >
        {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
        {isLoading 
          ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
          : (mode === 'signin' ? 'Sign In' : 'Create Account')
        }
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          disabled={isLoading}
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'
          }
        </button>
      </div>

      {mode === 'signin' && (
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            Forgot your password?
          </button>
        </div>
      )}
    </form>
  );
};
