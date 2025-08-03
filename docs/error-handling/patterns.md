# Error Handling Patterns

This document provides a comprehensive overview of the error handling patterns used in our project.

## ErrorEnvelope

The `ErrorEnvelope` pattern is leveraged for uniform error representation across various layers of the application. It encapsulates essential error information such as status codes, messages, and additional data.

Example:

```typescript
interface ErrorEnvelope {
  statusCode: number;
  message: string;
  details?: Record<string, unknown>;
}
```

This consistent structure aids in predictable error handling and logging.

## Logger

Our logger system consists of `AuditLogger` and `ActivityLogger`, tailored for security and activity logging respectively.

### AuditLogger

Logs admin activities and critical events to ensure security compliance and traceability.

Example:

```typescript
AuditLogger.logAdminAction({
  userId: '123',
  userEmail: 'admin@example.com',
  action: 'update',
  resourceType: 'user',
  details: { role: 'admin' },
});
```

### ActivityLogger

Logs general activities for operational monitoring. Useful for non-critical events.

Example:

```typescript
logActivity({
  type: 'system_event',
  action: 'cron_job_executed',
  details: { jobId: 'cleanup' },
});
```

## Fallback UI

The `SupabaseFallback` mechanism presents a graceful degradation strategy during outages. It serves cached data when real-time data is unavailable, ensuring a seamless user experience.

Example:

```typescript
function DataStatusIndicator({ status }) {
  if (status === 'unavailable') {
    return <div>Service temporarily unavailable. Please check back later.</div>;
  }
  return null;
}
```

More details can be found in the [Crash Points documentation](../errors/build_errors_6-30-2025.md).

## Retry Utility

The `withRetry` function provides a robust mechanism to handle transient failures by retrying operations with exponential backoff.

Example:

```typescript
const result = await withRetry(() => fetch('/api/data'), {
  maxAttempts: 3,
  initialDelayMs: 1000,
});
```

This utility enhances resilience against temporary network issues.

## Failure Mode to Pattern Mapping

| Failure Mode           | Recommended Pattern  |
|------------------------|----------------------|
| API Network Errors     | Retry Utility        |
| Cache Unavailability   | Fallback UI          |
| Unauthorized Access    | AuditLogger          |
| System Monitoring      | ActivityLogger       |

Refer to related tests in the [Error Handling Tests](../../tests/error-handling/README.md) for implementation details.
