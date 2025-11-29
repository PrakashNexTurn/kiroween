/**
 * API Service Layer - Axios Configuration
 * 
 * This module configures the Axios HTTP client with:
 * - Base URL from environment variables
 * - Default headers and timeout
 * - Request interceptor for logging
 * - Response interceptor for error handling
 * 
 * Requirements: 13.1, 13.3, 13.4
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

/**
 * Get the API base URL from environment variables
 * Falls back to localhost if not configured
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Configured Axios instance for API communication
 * 
 * Features:
 * - 30 second timeout for long-running operations
 * - JSON content type by default
 * - Request/response interceptors for logging and error handling
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds - some operations like task execution can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Logs outgoing requests for debugging purposes
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common error scenarios and provides user-friendly error messages
 * 
 * Error handling:
 * - Timeout: Request took too long
 * - 404: Resource not found
 * - 500: Server error
 * - Network errors: Connection issues
 * - Other errors: Generic error handling
 * 
 * Requirement 3.3.5: Enhanced error handling with better messages
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    
    return response;
  },
  (error: AxiosError<{ output?: { error?: ApiError } }>) => {
    // Extract error information
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    
    console.error(`[API Error] ${method} ${url}`, {
      status,
      message: error.message,
      code: error.code,
      response: error.response?.data,
    });

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const timeoutError: ApiError = {
        code: 'TIMEOUT',
        message: 'The request took too long to complete. The server may be busy or the operation is complex.',
        details: {
          url,
          method,
          timeout: error.config?.timeout,
        },
      };
      return Promise.reject(timeoutError);
    }

    // Handle network errors - no response received
    if (!error.response) {
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection and ensure the backend is running.',
        details: {
          originalError: error.message,
          baseURL: API_BASE_URL,
          url,
        },
      };
      return Promise.reject(networkError);
    }

    // Handle 404 - Resource not found
    if (status === 404) {
      const notFoundError: ApiError = {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        details: {
          url,
          method,
        },
      };
      return Promise.reject(notFoundError);
    }

    // Handle 401/403 - Authentication/Authorization error
    if (status === 401 || status === 403) {
      const authError: ApiError = {
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to perform this action.',
        details: {
          status,
          url,
        },
      };
      return Promise.reject(authError);
    }

    // Handle 400 - Bad Request / Validation Error
    if (status === 400) {
      const validationError: ApiError = {
        code: 'VALIDATION_ERROR',
        message: error.response?.data?.output?.error?.message || 'The request data is invalid.',
        details: {
          url,
          method,
          response: error.response?.data,
        },
      };
      return Promise.reject(validationError);
    }

    // Handle 500 - Server error
    if (status === 500) {
      const serverError: ApiError = {
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred. The backend may be experiencing issues.',
        details: {
          url,
          method,
          response: error.response?.data,
        },
      };
      return Promise.reject(serverError);
    }

    // Handle 503 - Service Unavailable
    if (status === 503) {
      const unavailableError: ApiError = {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The service is temporarily unavailable. Please try again in a moment.',
        details: {
          url,
          method,
        },
      };
      return Promise.reject(unavailableError);
    }

    // Check if the backend returned a structured error
    const backendError = error.response?.data?.output?.error;
    if (backendError) {
      return Promise.reject(backendError as ApiError);
    }

    // Generic error
    const genericError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred.',
      details: {
        status,
        url,
        method,
      },
    };
    
    return Promise.reject(genericError);
  }
);

/**
 * Export the base URL for use in other parts of the application
 */
export const getApiBaseUrl = (): string => API_BASE_URL;
