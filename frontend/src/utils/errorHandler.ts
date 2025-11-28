/**
 * Error Handler Utility
 * 
 * Provides centralized error handling and user-friendly error messages
 * Requirements: 12.1, 12.2, 13.4, 13.5
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
 * Get user-friendly error message based on error code
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection and ensure the backend is running.';
      
      case 'NOT_FOUND':
        return 'The requested resource was not found. It may have been deleted or moved.';
      
      case 'UNAUTHORIZED':
        return 'You are not authorized to perform this action. Please check your permissions.';
      
      case 'SERVER_ERROR':
        return 'An internal server error occurred. Please try again later or contact support if the problem persists.';
      
      case 'VALIDATION_ERROR':
        return error.message || 'The provided data is invalid. Please check your input and try again.';
      
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
 * Handle API errors by displaying appropriate toast notifications
 * 
 * @param error - The error to handle
 * @param customMessage - Optional custom message to display instead of the default
 */
export function handleApiError(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  
  // Log the full error for debugging
  console.error('[Error Handler]', error);
  
  // Display user-friendly error message
  showError(message);
}

/**
 * Handle network errors specifically
 */
export function handleNetworkError(): void {
  showError(
    'Unable to connect to the server. Please check your internet connection and ensure the backend is running.',
    { duration: 6000 }
  );
}

/**
 * Handle 404 errors specifically
 */
export function handleNotFoundError(resourceType?: string): void {
  const message = resourceType
    ? `${resourceType} not found. It may have been deleted or moved.`
    : 'The requested resource was not found.';
  
  showError(message);
}

/**
 * Handle authentication errors specifically
 */
export function handleAuthError(): void {
  showError(
    'You are not authorized to perform this action. Please check your permissions.',
    { duration: 5000 }
  );
}

/**
 * Handle server errors specifically
 */
export function handleServerError(): void {
  showError(
    'An internal server error occurred. Please try again later or contact support if the problem persists.',
    { duration: 6000 }
  );
}

/**
 * Handle validation errors with field-specific messages
 */
export function handleValidationError(error: unknown): void {
  if (isApiError(error) && error.details?.fields) {
    // If we have field-specific errors, show them
    const fields = error.details.fields as Record<string, string>;
    const fieldErrors = Object.entries(fields)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
    
    showError(`Validation failed: ${fieldErrors}`);
  } else {
    showError(getErrorMessage(error));
  }
}

/**
 * Create an error handler function for async operations
 * Useful for wrapping API calls in try-catch blocks
 * 
 * @example
 * const handleError = createErrorHandler('Failed to load projects');
 * try {
 *   await projectService.getProjects();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function createErrorHandler(defaultMessage: string) {
  return (error: unknown): void => {
    handleApiError(error, defaultMessage);
  };
}
