/**
 * Error Handler Utility
 * 
 * Provides centralized error handling and user-friendly error messages
 * Requirements: 3.3.5 - User-friendly error messages, retry functionality, graceful degradation
 */

import { showError } from '../components/common/Toast';
import type { ApiError } from '../types';

/**
 * Check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Error severity levels for graceful degradation
 */
export const ErrorSeverity = {
  LOW: 'low' as const,        // Non-critical, can continue with degraded functionality
  MEDIUM: 'medium' as const,  // Important but not blocking
  HIGH: 'high' as const,      // Critical, blocks main functionality
  FATAL: 'fatal' as const,    // Unrecoverable error
};

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

/**
 * Get error severity based on error type
 */
export function getErrorSeverity(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return ErrorSeverity.HIGH;
      
      case 'NOT_FOUND':
        return ErrorSeverity.MEDIUM;
      
      case 'UNAUTHORIZED':
        return ErrorSeverity.HIGH;
      
      case 'SERVER_ERROR':
        return ErrorSeverity.HIGH;
      
      case 'VALIDATION_ERROR':
        return ErrorSeverity.LOW;
      
      default:
        return ErrorSeverity.MEDIUM;
    }
  }
  
  return ErrorSeverity.MEDIUM;
}

/**
 * Get user-friendly error message based on error code
 * Requirement 3.3.5: User-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection and ensure the backend is running at http://localhost:8000.';
      
      case 'NOT_FOUND':
        return 'The requested resource was not found. It may have been deleted or moved.';
      
      case 'UNAUTHORIZED':
        return 'You are not authorized to perform this action. Please check your permissions.';
      
      case 'SERVER_ERROR':
        return 'An internal server error occurred. The backend may be experiencing issues. Please try again in a moment.';
      
      case 'VALIDATION_ERROR':
        return error.message || 'The provided data is invalid. Please check your input and try again.';
      
      case 'TIMEOUT':
        return 'The request took too long to complete. The server may be busy or the operation is complex. Please try again.';
      
      case 'FILE_TOO_LARGE':
        return 'The file is too large to display. Files over 1MB are truncated for performance.';
      
      case 'BINARY_FILE':
        return 'This is a binary file and cannot be displayed as text.';
      
      case 'PERMISSION_DENIED':
        return 'Access denied. The file or directory may have restricted permissions.';
      
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get actionable suggestion for error recovery
 * Requirement 3.3.5: Graceful degradation with helpful suggestions
 */
export function getErrorSuggestion(error: unknown): string | null {
  if (isApiError(error)) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Make sure the backend server is running with: cd backend && python main.py';
      
      case 'NOT_FOUND':
        return 'Try refreshing the page or navigating back to the project list.';
      
      case 'SERVER_ERROR':
        return 'Check the backend logs for more details about what went wrong.';
      
      case 'TIMEOUT':
        return 'For large projects, some operations may take longer. Consider breaking down the task.';
      
      case 'FILE_TOO_LARGE':
        return 'You can still view the file in your local editor or IDE.';
      
      default:
        return null;
    }
  }
  
  return null;
}

/**
 * Handle API errors by displaying appropriate toast notifications
 * Requirement 3.3.5: User-friendly error messages with retry functionality
 * 
 * @param error - The error to handle
 * @param options - Optional configuration for error handling
 */
export interface HandleErrorOptions {
  customMessage?: string;
  onRetry?: () => void | Promise<void>;
  showSuggestion?: boolean;
  silent?: boolean; // Don't show toast, just log
}

export function handleApiError(error: unknown, options: HandleErrorOptions = {}): void {
  const { customMessage, onRetry, showSuggestion = true, silent = false } = options;
  
  // Log the full error for debugging
  console.error('[Error Handler]', error);
  
  if (silent) {
    return;
  }
  
  const message = customMessage || getErrorMessage(error);
  const suggestion = showSuggestion ? getErrorSuggestion(error) : null;
  const severity = getErrorSeverity(error);
  
  // Combine message with suggestion if available
  const fullMessage = suggestion ? `${message}\n\n💡 ${suggestion}` : message;
  
  // Show warning for low severity errors, error for others
  if (severity === ErrorSeverity.LOW) {
    showError(fullMessage, { onRetry, duration: 5000 });
  } else {
    showError(fullMessage, { onRetry, duration: severity === ErrorSeverity.HIGH ? 8000 : 6000 });
  }
}

/**
 * Handle network errors specifically with retry
 * Requirement 3.3.5: Retry functionality for network errors
 */
export function handleNetworkError(onRetry?: () => void | Promise<void>): void {
  handleApiError(
    { code: 'NETWORK_ERROR', message: '' } as ApiError,
    { onRetry, showSuggestion: true }
  );
}

/**
 * Handle 404 errors specifically
 */
export function handleNotFoundError(resourceType?: string, onRetry?: () => void | Promise<void>): void {
  const message = resourceType
    ? `${resourceType} not found. It may have been deleted or moved.`
    : 'The requested resource was not found.';
  
  handleApiError(
    { code: 'NOT_FOUND', message } as ApiError,
    { onRetry, showSuggestion: true }
  );
}

/**
 * Handle authentication errors specifically
 */
export function handleAuthError(): void {
  handleApiError(
    { code: 'UNAUTHORIZED', message: '' } as ApiError,
    { showSuggestion: false }
  );
}

/**
 * Handle server errors specifically with retry
 * Requirement 3.3.5: Retry functionality for server errors
 */
export function handleServerError(onRetry?: () => void | Promise<void>): void {
  handleApiError(
    { code: 'SERVER_ERROR', message: '' } as ApiError,
    { onRetry, showSuggestion: true }
  );
}

/**
 * Handle timeout errors with retry
 * Requirement 3.3.5: Graceful degradation for timeout errors
 */
export function handleTimeoutError(onRetry?: () => void | Promise<void>): void {
  handleApiError(
    { code: 'TIMEOUT', message: '' } as ApiError,
    { onRetry, showSuggestion: true }
  );
}

/**
 * Handle validation errors with field-specific messages
 * Requirement 3.3.5: User-friendly validation error messages
 */
export function handleValidationError(error: unknown): void {
  if (isApiError(error) && error.details?.fields) {
    // If we have field-specific errors, show them
    const fields = error.details.fields as Record<string, string>;
    const fieldErrors = Object.entries(fields)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');
    
    showError(`Validation failed:\n${fieldErrors}`, { duration: 6000 });
  } else {
    handleApiError(error, { showSuggestion: false });
  }
}

/**
 * Create an error handler function for async operations
 * Useful for wrapping API calls in try-catch blocks
 * Requirement 3.3.5: Simplified error handling with retry support
 * 
 * @example
 * const handleError = createErrorHandler('Failed to load projects', loadProjects);
 * try {
 *   await projectService.getProjects();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function createErrorHandler(
  defaultMessage: string,
  onRetry?: () => void | Promise<void>
) {
  return (error: unknown): void => {
    handleApiError(error, { customMessage: defaultMessage, onRetry });
  };
}

/**
 * Retry an async operation with exponential backoff
 * Requirement 3.3.5: Automatic retry with exponential backoff
 * 
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param initialDelay - Initial delay in ms (default: 1000)
 * @returns Promise that resolves with the operation result or rejects after max retries
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors or auth errors
      if (isApiError(error) && 
          (error.code === 'VALIDATION_ERROR' || error.code === 'UNAUTHORIZED')) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Gracefully degrade functionality when an error occurs
 * Requirement 3.3.5: Graceful degradation
 * 
 * @param operation - The primary operation to attempt
 * @param fallback - Fallback value or function to use if operation fails
 * @param onError - Optional error handler
 * @returns Result of operation or fallback value
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: T | (() => T | Promise<T>),
  onError?: (error: unknown) => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn('[Graceful Degradation] Operation failed, using fallback:', error);
    
    if (onError) {
      onError(error);
    }
    
    return typeof fallback === 'function' ? await (fallback as () => T | Promise<T>)() : fallback;
  }
}
