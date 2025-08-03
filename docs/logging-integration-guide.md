# Error Logging & Monitoring Integration Guide

This document explains how to use the newly integrated error logging and monitoring system that was implemented as part of Task 2.2.5.

## Overview

The system provides centralized error logging that:
- Uses `console` methods in development for debugging
- Routes errors to Sentry (or placeholder) in production
- Integrates with `ErrorEnvelope` and `ErrorBoundary` components
- Fails fast if Sentry DSN is missing in production builds

## Files Created

### 1. `lib/logging/index.ts`
Main logging module that provides:
- `logError(error, context?, errorContext?)` - Log errors with optional context
- `logMessage(message, level?)` - Log informational messages  
- `logWarning(message)` - Convenience method for warnings
- `setUserContext(user)` - Set user context for error tracking
- `setTag(key, value)` - Add tags to error reports

### 2. `lib/telemetry/sentryClient.ts`
Sentry client abstraction that provides:
- Placeholder implementation for development
- Easy to replace with real Sentry SDK in production
- Consistent interface for error capture and context setting

### 3. `components/ErrorBoundary.tsx`
React ErrorBoundary component that:
- Catches JavaScript errors in component trees
- Logs errors using the centralized logging system
- Displays user-friendly fallback UI
- Includes HOC `withErrorBoundary` for easy integration

## Environment Configuration

### Required Environment Variables

For production builds, you must set:
```bash
SENTRY_DSN=your_sentry_dsn_here
```

If this variable is missing in production (`NODE_ENV=production`), the application will fail fast with a clear error message.

### Development Setup

In development, no environment variables are required. All errors will be logged to the console with detailed information.

## Usage Examples

### Basic Error Logging

```typescript
import { logError, logWarning } from '@/lib/logging';

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  logError(error, 'RiskyOperation');
}

// Log a warning
logWarning('This is deprecated and will be removed in v2.0');
```

### Using ErrorBoundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary 
      fallback={<div>Something went wrong!</div>}
      onError={(error, errorInfo) => {
        console.log('Error caught by boundary:', error);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}

// Or use the HOC
const SafeComponent = withErrorBoundary(MyComponent);
```

### Enhanced Error Fallback Components

The existing `UnknownErrorFallback` component now integrates with logging:

```tsx
import { UnknownErrorFallback } from '@/components/ui/error-states';

<UnknownErrorFallback 
  error={error}
  context="DataFetching" 
  retry={() => refetch()}
  errorDetails={error.message}
  showDetails={process.env.NODE_ENV === 'development'}
/>
```

### Setting User Context

```typescript
import { setUserContext, setTag } from '@/lib/logging';

// Set user context for error tracking
setUserContext({
  id: user.id,
  email: user.email
});

// Add custom tags
setTag('feature', 'food-truck-search');
setTag('component', 'TruckList');
```

## Integration with ErrorEnvelope

The existing `logAndReturnError` function in `lib/errors/errorEnvelope.ts` now uses the centralized logging system:

```typescript
import { logAndReturnError } from '@/lib/errors/errorEnvelope';

const result = await someAsyncOperation();
if (result.error) {
  return logAndReturnError(result.error, 'SomeAsyncOperation');
}
```

## Production Deployment

1. **Set SENTRY_DSN**: Ensure the `SENTRY_DSN` environment variable is set in your production environment
2. **Install Sentry SDK**: Replace the placeholder in `lib/telemetry/sentryClient.ts` with actual Sentry SDK calls
3. **Configure Sentry**: Add proper Sentry initialization with your desired configuration options

### Replacing the Placeholder

To use real Sentry in production, update `lib/telemetry/sentryClient.ts`:

```typescript
import * as Sentry from '@sentry/node';
// or '@sentry/nextjs' for Next.js applications

export class SentryClient {
  init(dsn: string): void {
    if (this.initialized) return;
    
    Sentry.init({
      dsn,
      // Add your Sentry configuration here
    });
    
    this.initialized = true;
  }

  captureException(error: unknown, context?: ErrorContext): void {
    Sentry.captureException(error);
  }

  // ... implement other methods with real Sentry calls
}
```

## Benefits

- **Consistent Logging**: All errors flow through the same logging pipeline
- **Environment Awareness**: Different behavior in dev vs production
- **Rich Context**: Errors include user info, tags, and component context
- **Fail-Fast**: Production builds fail immediately if misconfigured
- **User Experience**: Friendly error boundaries with retry functionality

## Next Steps

1. Configure your actual Sentry project and replace placeholder implementation
2. Add logging calls to existing error handling throughout the application
3. Wrap critical components with ErrorBoundary
4. Set up monitoring dashboards in your Sentry project
