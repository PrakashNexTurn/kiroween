# Error Handling Guide

This document describes the enhanced error handling system implemented in Kiro's Ghost.

## Overview

The application now features comprehensive error handling with:
- **User-friendly error messages** - Clear, actionable messages instead of technical jargon
- **Retry functionality** - One-click retry for failed operations
- **Graceful degradation** - Helpful suggestions when things go wrong
- **Error severity levels** - Different handling based on error criticality

## Requirements

Implements **Requirement 3.3.5**: User-friendly error messages, retry functionality, and graceful degradation.

## Error Handling Architecture

### 1. Error Types

The system handles various error types:

- **Network Errors** - Connection issues, backend unavailable
- **Timeout Errors** - Requests that take too long
- **Not Found Errors** - Missing resources
- **Server Errors** - Backend failures
- **Validation Errors** - Invalid input data
- **File System Errors** - File access issues

### 2. Error Severity Levels

```typescript
enum ErrorSeverity {
  LOW = 'low',        // Non-critical, can continue with degraded functionality
  MEDIUM = 'medium',  // Important but not blocking
  HIGH = 'high',      // Critical, blocks main functionality
  FATAL = 'fatal',    // Unrecoverable error
}
```

### 3. Core Utilities

#### `errorHandler.ts`

Main error handling utilities:

```typescript
// Handle any API error with retry support
handleApiError(error, {
  customMessage: 'Failed to load data',
  onRetry: () => loadData(),
  showSuggestion: true
});

// Get user-friendly error message
const message = getErrorMessage(error);

// Get actionable suggestion
const suggestion = getErrorSuggestion(error);

// Retry with exponential backoff
const data = await retryWithBackoff(() => fetchData(), 3, 1000);

// Graceful degradation with fallback
const data = await withFallback(
  () => fetchData(),
  defaultData,
  (error) => console.error('Using fallback:', error)
);
```

#### `fileErrorHandler.ts`

Specialized handlers for file operations:

```typescript
// Handle file tree errors
handleFileTreeError(error, () => loadFileTree());

// Handle file content errors
handleFileContentError(error, filePath, () => loadFile());

// Handle steering file errors
handleSteeringFileError(error, fileName, () => loadSteeringFile());
```

## Usage Examples

### Basic Error Handling

```typescript
try {
  const data = await apiCall();
} catch (error) {
  handleApiError(error, {
    customMessage: 'Failed to load data',
    onRetry: () => apiCall()
  });
}
```

### With Retry Functionality

```typescript
const loadData = async () => {
  try {
    const data = await getFileTree(projectId);
    setData(data);
  } catch (error) {
    handleFileTreeError(error, loadData); // Retry button will call loadData
  }
};
```

### Automatic Retry with Backoff

```typescript
const data = await retryWithBackoff(
  () => fetchData(),
  3,      // max retries
  1000    // initial delay (ms)
);
```

### Graceful Degradation

```typescript
const data = await withFallback(
  () => fetchComplexData(),
  simpleData,  // fallback value
  (error) => {
    console.warn('Using simplified data:', error);
    showWarning('Some features may be limited');
  }
);
```

## Component Integration

### FileTree Component

```typescript
const loadFileTree = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await getFileTree(projectId);
    setTree(data);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load file tree';
    setError(errorMessage);
    
    // Show error toast with retry
    showError(errorMessage, {
      onRetry: loadFileTree,
      duration: 7000
    });
  } finally {
    setLoading(false);
  }
}, [projectId]);
```

### Error State UI

```typescript
if (error) {
  return (
    <div className="error-container">
      <ErrorIcon />
      <h3>Failed to load data</h3>
      <p>{error}</p>
      <p className="suggestion">💡 Make sure the backend is running</p>
      <Button onClick={retry}>Retry</Button>
    </div>
  );
}
```

## Toast Notifications

All error toasts support retry functionality:

```typescript
showError('Failed to load data', {
  onRetry: () => loadData(),
  duration: 7000
});
```

The toast will display a "Retry" button that calls the provided function.

## API Client Enhancements

The Axios interceptor now handles:

1. **Timeout errors** - Detects `ECONNABORTED` and timeout messages
2. **Network errors** - No response received
3. **HTTP status codes** - 400, 401, 403, 404, 500, 503
4. **Structured backend errors** - Extracts error details from response

## Error Messages

### User-Friendly Messages

❌ **Before**: `Error: Request failed with status code 500`

✅ **After**: `An internal server error occurred. The backend may be experiencing issues. Please try again in a moment.`

### With Suggestions

❌ **Before**: `Network Error`

✅ **After**: 
```
Unable to connect to the server. Please check your internet connection 
and ensure the backend is running at http://localhost:8000.

💡 Make sure the backend server is running with: cd backend && python main.py
```

## Error Boundary

The `ErrorBoundary` component catches React errors:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Features:
- Displays user-friendly error page
- Shows error details in expandable section
- Provides "Try Again" (soft reset) and "Reload Page" (hard reset) buttons
- Includes helpful suggestions

## Best Practices

### 1. Always Provide Retry

```typescript
// ✅ Good
handleApiError(error, { onRetry: loadData });

// ❌ Bad
handleApiError(error);
```

### 2. Use Specific Error Handlers

```typescript
// ✅ Good
handleFileTreeError(error, loadFileTree);

// ❌ Less specific
handleApiError(error, { customMessage: 'Failed to load files' });
```

### 3. Show Helpful Suggestions

```typescript
// ✅ Good
handleApiError(error, { showSuggestion: true });

// ❌ Missing context
handleApiError(error, { showSuggestion: false });
```

### 4. Set Appropriate Error State

```typescript
// ✅ Good
try {
  const data = await loadData();
  setData(data);
  setError(null); // Clear previous errors
} catch (error) {
  setError(getErrorMessage(error));
  handleApiError(error, { onRetry: loadData });
}

// ❌ Missing error state
try {
  const data = await loadData();
  setData(data);
} catch (error) {
  handleApiError(error);
  // Component doesn't know about the error
}
```

### 5. Graceful Degradation

```typescript
// ✅ Good - Show partial data
const data = await withFallback(
  () => fetchFullData(),
  cachedData,
  (error) => showWarning('Showing cached data')
);

// ❌ Bad - Show nothing
try {
  const data = await fetchFullData();
} catch (error) {
  // User sees blank screen
}
```

## Testing Error Handling

### Simulate Network Error

```typescript
// In browser console
// Stop the backend server and try to load data
```

### Simulate Timeout

```typescript
// Reduce timeout in api.ts temporarily
timeout: 100, // Very short timeout
```

### Simulate Server Error

```typescript
// In backend, throw an error
raise Exception("Test error")
```

## Future Enhancements

Potential improvements:

1. **Error Tracking** - Integrate with Sentry or similar service
2. **Offline Mode** - Better handling when completely offline
3. **Error Analytics** - Track which errors occur most frequently
4. **Smart Retry** - Adjust retry strategy based on error type
5. **User Feedback** - Allow users to report errors with context

## Summary

The enhanced error handling system provides:

✅ Clear, user-friendly error messages  
✅ One-click retry functionality  
✅ Helpful suggestions for recovery  
✅ Graceful degradation with fallbacks  
✅ Automatic retry with exponential backoff  
✅ Specialized handlers for different error types  
✅ Comprehensive error boundary for React errors  

This ensures users always know what went wrong and how to fix it, improving the overall user experience.
