# Error Handling & Graceful Degradation Cheat Sheet

This cheat sheet provides best-practice strategies for handling errors and implementing graceful degradation in the Food Truck Finder application. Use this guide as a quick reference during development and onboarding.

---

## 🎯 Core Patterns

### 1. Error Envelope Pattern
```typescript
interface ErrorEnvelope {
  statusCode: number;
  message: string;
  details?: Record<string, unknown>;
}
```
**Use for**: Consistent error formatting across all layers

### 2. Retry with Exponential Backoff
```typescript
const result = await withRetry(() => fetch('/api/data'), {
  maxAttempts: 3,
  initialDelayMs: 1000,
});
```
**Use for**: Network requests, API calls, database operations

### 3. Fallback UI Components
```typescript
function DataStatusIndicator({ status }) {
  if (status === 'unavailable') {
    return <div>Service temporarily unavailable. Please check back later.</div>;
  }
  return null;
}
```
**Use for**: Service outages, degraded performance scenarios

---

## 🚨 Error Types & Responses

| Error Type | Response Strategy | Implementation |
|------------|-------------------|----------------|
| Network Timeout | Retry with backoff | `withApiRetry()` |
| Service Unavailable | Show cached data | `SupabaseFallback` |
| Validation Error | User-friendly message | `ValidationError` |
| Auth Failure | Redirect to login | `AuditLogger` |
| Component Crash | Error boundary | React Error Boundary |

---

## 🔧 Quick Implementation Guide

### API Error Handling
```typescript
try {
  const data = await withApiRetry(() => fetch('/api/trucks'));
  return data;
} catch (error) {
  console.error('API call failed:', error);
  return fallbackData;
}
```

### Component Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    // Log to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

### Validation Error Display
```typescript
const handleValidationErrors = (errors: ValidationErrorPayload[]) => {
  showValidationToast(errors, {
    title: 'Please fix the following errors:',
    duration: 5000
  });
};
```

---

## 📋 Testing Checklist

### Unit Tests
- [ ] Error objects are properly structured
- [ ] Validation functions handle edge cases
- [ ] Retry logic works with different error types
- [ ] Fallback components render correctly

### Integration Tests
- [ ] API error responses are handled gracefully
- [ ] Database connection failures are managed
- [ ] External service outages don't crash the app

### E2E Tests
- [ ] Network failures show appropriate messages
- [ ] Users can continue using cached data
- [ ] Error recovery works when services return

---

## 🎨 User Experience Guidelines

### Error Messages
- ❌ **Bad**: "HTTP 500 Internal Server Error"
- ✅ **Good**: "We're having trouble loading food trucks. Please try again in a moment."

### Loading States
- ❌ **Bad**: Blank screen during loading
- ✅ **Good**: Skeleton UI or spinner with message

### Degraded Service
- ❌ **Bad**: Feature completely unavailable
- ✅ **Good**: Limited functionality with clear explanation

---

## ⚡ Quick Wins

1. **Add `withRetry` to all API calls** - Instant resilience improvement
2. **Implement Error Boundaries** - Prevent component crashes from breaking the entire app
3. **Cache critical data** - Users can still browse when services are down
4. **Show meaningful loading states** - Better perceived performance
5. **Log errors with context** - Easier debugging and monitoring

---

## 📚 Reference Links

- [Full Error Handling Guide](README.md)
- [Test Implementation](../../tests/error-handling/README.md)
- [Validation Error Codes](../../lib/errors/validationError.ts)
- [Retry Utilities](../../lib/utils/withRetry.ts)
- [Supabase Fallback](../../lib/fallback/supabaseFallback.tsx)

