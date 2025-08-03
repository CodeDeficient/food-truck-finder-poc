// Storybook story configuration for AuthModal component
// This file demonstrates the different states and configurations of the AuthModal

import { AuthModal } from './AuthModal';

// Example usage configurations for documentation purposes
const exampleConfigurations = {
  default: {
    mounted: true,
    isOpen: true,
    resolvedTheme: 'light' as const,
    enableCaptcha: false,
    rateLimitConfig: {
      maxAttempts: 5,
      windowMs: 900000, // 15 minutes
    },
  },
  withCaptcha: {
    mounted: true,
    isOpen: true,
    enableCaptcha: true,
    rateLimitConfig: {
      maxAttempts: 3,
      windowMs: 300000, // 5 minutes
    },
  },
};

/**
 * AuthModal Component Documentation
 * 
 * Enterprise-grade authentication modal with:
 * - Email/password authentication
 * - OAuth social login (Google, GitHub)
 * - Password strength validation
 * - Rate limiting protection
 * - Device fingerprinting for security
 * - SSR-safe hydration
 * - Comprehensive error handling
 * 
 * ## Security Features
 * - Password Strength Validation: Real-time feedback on password complexity
 * - Rate Limiting: Configurable attempt limits with time windows
 * - Device Fingerprinting: Browser fingerprinting for additional security
 * - Error Handling: Detailed error messages with field-specific feedback
 * - Input Validation: Client-side validation with server-side verification
 * 
 * ## Accessibility
 * - ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader compatibility
 * - Focus management
 */

// Export configurations for documentation
export { exampleConfigurations };
