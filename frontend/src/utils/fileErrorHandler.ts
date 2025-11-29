/**
 * File System Error Handler
 * Specialized error handling for file system operations
 * 
 * Requirement 3.3.5: User-friendly error messages for file operations
 */

import { handleApiError, type HandleErrorOptions } from './errorHandler';
import type { ApiError } from '../types';

/**
 * Handle file tree loading errors
 */
export function handleFileTreeError(error: unknown, onRetry?: () => void | Promise<void>): void {
  const options: HandleErrorOptions = {
    customMessage: 'Failed to load project files. The project directory may not exist or may not be accessible.',
    onRetry,
    showSuggestion: true,
  };
  
  handleApiError(error, options);
}

/**
 * Handle file content loading errors
 */
export function handleFileContentError(
  error: unknown,
  filePath: string,
  onRetry?: () => void | Promise<void>
): void {
  let customMessage = `Failed to load file: ${filePath}`;
  
  // Provide specific messages for common file errors
  if (error && typeof error === 'object' && 'code' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.code) {
      case 'FILE_TOO_LARGE':
        customMessage = `File is too large to display: ${filePath}. Files over 1MB are truncated.`;
        break;
      case 'BINARY_FILE':
        customMessage = `Cannot display binary file: ${filePath}. Please use a local editor to view this file.`;
        break;
      case 'PERMISSION_DENIED':
        customMessage = `Access denied to file: ${filePath}. Check file permissions.`;
        break;
      case 'NOT_FOUND':
        customMessage = `File not found: ${filePath}. It may have been moved or deleted.`;
        break;
    }
  }
  
  const options: HandleErrorOptions = {
    customMessage,
    onRetry,
    showSuggestion: true,
  };
  
  handleApiError(error, options);
}

/**
 * Handle file search errors
 */
export function handleFileSearchError(error: unknown, searchQuery: string): void {
  const options: HandleErrorOptions = {
    customMessage: `Failed to search for "${searchQuery}". Please try again or refine your search.`,
    showSuggestion: false,
  };
  
  handleApiError(error, options);
}

/**
 * Handle steering file errors
 */
export function handleSteeringFileError(
  error: unknown,
  fileName: string,
  onRetry?: () => void | Promise<void>
): void {
  const options: HandleErrorOptions = {
    customMessage: `Failed to load steering file: ${fileName}. The file may not exist or may be corrupted.`,
    onRetry,
    showSuggestion: true,
  };
  
  handleApiError(error, options);
}

/**
 * Handle steering file save errors
 */
export function handleSteeringSaveError(error: unknown, fileName: string): void {
  const options: HandleErrorOptions = {
    customMessage: `Failed to save steering file: ${fileName}. Check file permissions and try again.`,
    showSuggestion: true,
  };
  
  handleApiError(error, options);
}

/**
 * Handle steering generation errors
 */
export function handleSteeringGenerationError(
  error: unknown,
  onRetry?: () => void | Promise<void>
): void {
  const options: HandleErrorOptions = {
    customMessage: 'Failed to generate steering files. The project may not have the required metadata.',
    onRetry,
    showSuggestion: true,
  };
  
  handleApiError(error, options);
}
