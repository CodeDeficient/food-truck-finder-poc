'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorMessageProps {
  readonly message?: string;
  readonly className?: string;
  readonly showIcon?: boolean;
}

/**
 * A reusable component for displaying form validation errors with consistent styling.
 * 
 * @example
 * <FormErrorMessage message="This field is required" />
 * <FormErrorMessage message="Invalid email address" showIcon={false} />
 * 
 * @param message - The error message to display
 * @param className - Additional CSS classes to apply
 * @param showIcon - Whether to show the error icon (default: true)
 */
export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  message,
  className,
  showIcon = true
}) => {
  if (!message) return null;

  return (
    <div className={cn(
      'flex items-center gap-1 text-sm text-destructive',
      className
    )}>
      {showIcon && <AlertCircle className="size-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
};

/**
 * A variant of FormErrorMessage for inline field errors without icon
 */
export const InlineFormError: React.FC<{ message?: string; className?: string }> = ({
  message,
  className
}) => {
  if (!message) return null;

  return (
    <p className={cn('text-sm text-destructive', className)}>
      {message}
    </p>
  );
};
