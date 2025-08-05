# Error Handling and Graceful Degradation - Comprehensive Guide

## Overview
This guide aggregates various documentation resources related to error handling patterns, implementation specifics, and testing methodologies used in the Food Truck Finder application. This document serves as a reference for maintaining a robust and resilient application through effective error handling and graceful degradation strategies.

---

## Core Error Handling Patterns

### ErrorEnvelope Pattern

The `ErrorEnvelope` pattern is leveraged for uniform error representation across various layers of the application. It encapsulates essential error information such as status codes, messages, and additional data.

```typescript
interface ErrorEnvelope {
  statusCode: number;
  message: string;
  details?: Record<string, unknown>;
}
```

This consistent structure aids in predictable error handling and logging.

### Logger System

Our logger system consists of `AuditLogger` and `ActivityLogger`, tailored for security and activity logging respectively.

#### AuditLogger

Logs admin activities and critical events to ensure security compliance and traceability.

```typescript
AuditLogger.logAdminAction({
  userId: '123',
  userEmail: 'admin@example.com',
  action: 'update',
  resourceType: 'user',
  details: { role: 'admin' },
});
```

#### ActivityLogger

Logs general activities for operational monitoring. Useful for non-critical events.

```typescript
logActivity({
  type: 'system_event',
  action: 'cron_job_executed',
  details: { jobId: 'cleanup' },
});
```

### Fallback UI Mechanisms

The `SupabaseFallback` mechanism presents a graceful degradation strategy during outages. It serves cached data when real-time data is unavailable, ensuring a seamless user experience.

```typescript
function DataStatusIndicator({ status }) {
  if (status === 'unavailable') {
    return <div>Service temporarily unavailable. Please check back later.</div>;
  }
  return null;
}
```

### Retry Utility

The `withRetry` function provides a robust mechanism to handle transient failures by retrying operations with exponential backoff.

```typescript
const result = await withRetry(() => fetch('/api/data'), {
  maxAttempts: 3,
  initialDelayMs: 1000,
});
```

This utility enhances resilience against temporary network issues.

---

## Advanced Error Handling Utilities

### WithRetry Configuration

The `withRetry` utility supports comprehensive configuration:

```typescript
export interface RetryConfig {
  maxAttempts?: number;        // Maximum number of retry attempts (default: 3)
  initialDelayMs?: number;     // Initial delay in milliseconds (default: 1000)
  maxDelayMs?: number;         // Maximum delay in milliseconds (default: 30000)
  backoffMultiplier?: number;  // Backoff multiplier (default: 2)
  useJitter?: boolean;         // Whether to use jitter (default: true)
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
}
```

### Pre-configured Retry Utilities

```typescript
// API-specific retry
export const withApiRetry = <T>(operation: () => Promise<T>) =>
  withRetry(operation, {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error, attempt) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        return status >= 500 || status === 429;
      }
      return defaultShouldRetry(error, attempt);
    }
  });

// Database-specific retry
export const withDbRetry = <T>(operation: () => Promise<T>) =>
  withRetry(operation, {
    maxAttempts: 5,
    initialDelay: 500,
    maxDelay: 5000,
    shouldRetry: (error, attempt) => {
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        return message.includes('connection') || 
               message.includes('timeout') ||
               message.includes('pool');
      }
      return false;
    }
  });
```

### Supabase Fallback Manager

The `SupabaseFallbackManager` provides a comprehensive fallback strategy:

```typescript
class SupabaseFallbackManager {
  public async getFoodTrucks(): Promise<FallbackResult> {
    try {
      // First, try to get fresh data from Supabase
      const freshData = await this.fetchFromSupabase();
      
      if (freshData.length > 0) {
        // Success! Cache this data for future fallback use
        this.cacheData(freshData);
        return {
          trucks: freshData,
          isFromCache: false,
          lastUpdate: 'Just now',
          status: 'fresh'
        };
      }
      
      return this.handleFallbackScenario();
    } catch (error: unknown) {
      console.warn('Supabase unavailable, using fallback strategy:', error);
      return this.handleFallbackScenario();
    }
  }
}
```

---

## Validation Error Management

### Validation Error Structure

```typescript
export interface ValidationErrorPayload {
  code: string;
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  value?: any;
  context?: Record<string, any>;
  timestamp: string;
  source: 'client' | 'api' | 'database' | 'pipeline';
}
```

### Error Code Standards

```typescript
export const ValidationErrorCodes = {
  // Field validation
  REQUIRED_FIELD: 'VALIDATION_001',
  INVALID_FORMAT: 'VALIDATION_002',
  OUT_OF_RANGE: 'VALIDATION_003',
  INVALID_TYPE: 'VALIDATION_004',
  
  // Cross-field validation
  CROSS_FIELD_MISMATCH: 'VALIDATION_101',
  TEMPORAL_INCONSISTENCY: 'VALIDATION_102',
  
  // Reference integrity
  FOREIGN_KEY_VIOLATION: 'VALIDATION_201',
  ORPHANED_RECORD: 'VALIDATION_202',
  CIRCULAR_REFERENCE: 'VALIDATION_203',
  
  // Business rules
  BUSINESS_RULE_VIOLATION: 'VALIDATION_301',
  POLICY_VIOLATION: 'VALIDATION_302',
  
  // System errors
  SCHEMA_VALIDATION_FAILED: 'VALIDATION_901',
  DATABASE_CONSTRAINT_VIOLATION: 'VALIDATION_902',
  SYSTEM_ERROR: 'VALIDATION_999'
} as const;
```

---

## Comprehensive Testing Strategy

### Test Structure

#### Unit Tests (Jest + React Testing Library)
- **`api-error-handling.test.ts`** - Tests for server-side error handling, API failures, and data transformation errors
- **`ui-component-errors.test.tsx`** - Tests for UI components with undefined/invalid props and error boundary integration

#### End-to-End Tests (Cypress)
- **`network-errors.cy.ts`** - Tests for network failures, 500 errors, timeout scenarios, and graceful degradation

### Test Scenarios Covered

#### 1. Component Error Fallbacks
- Components with `undefined` props
- Invalid prop types
- Missing required props
- Error boundary integration
- DOM structure preservation with invalid props

#### 2. API Error Handling
- HTTP 500 server errors
- Network connection failures
- Request timeouts
- Invalid JSON responses
- Database connection errors
- External API failures

#### 3. Network Error Scenarios
- API 500 server errors with graceful degradation
- Network connection failures
- Intermittent connectivity issues
- Slow network conditions
- Request timeout handling
- Progressive enhancement (JavaScript disabled)
- Error recovery when network is restored

#### 4. Data Validation Errors
- Invalid JSON parsing
- Missing required fields
- Type validation failures
- Array transformation errors
- Geocoding errors

#### 5. Error Recovery and Fallbacks
- Retry logic for failed requests
- Fallback data when primary sources fail
- Feature degradation when services are unavailable
- Error monitoring and user-friendly messaging

---

## Failure Mode to Pattern Mapping

| Failure Mode           | Recommended Pattern  |
|------------------------|----------------------|
| API Network Errors     | Retry Utility        |
| Cache Unavailability   | Fallback UI          |
| Unauthorized Access    | AuditLogger          |
| System Monitoring      | ActivityLogger       |

---

## Best Practices

1. **Graceful Degradation**: All tests verify that errors don't crash the application
2. **User-Friendly Messaging**: Error messages should be helpful, not technical
3. **Error Boundaries**: Components should be wrapped in error boundaries
4. **Fallback Content**: Always provide fallback content when data is unavailable
5. **Retry Logic**: Implement exponential backoff for failed requests
6. **Error Monitoring**: Log errors for monitoring and debugging

---

## Quick Reference

For a concise overview of best practices, see our [Error Handling Cheat Sheet](best-practices.md).

For detailed testing implementation, refer to the [Error Handling Tests](../../tests/error-handling/README.md).

For crash point documentation, see [Build Errors Documentation](../errors/build_errors_6-30-2025.md).

