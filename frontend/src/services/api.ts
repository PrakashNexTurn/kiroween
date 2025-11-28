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
 * - 404: Resource not found
 * - 500: Server error
 * - Network errors: Connection issues
 * - Other errors: Generic error handling
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
      response: error.response?.data,
    });

    // Handle specific error cases
    if (!error.response) {
      // Network error - no response received
      const networkError: ApiError = {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection and ensure the backend is running.',
        details: {
          originalError: error.message,
          baseURL: API_BASE_URL,
        },
      };
      return Promise.reject(networkError);
    }

    if (status === 404) {
      // Resource not found
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

    if (status === 401 || status === 403) {
      // Authentication/Authorization error
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

    if (status === 500) {
      // Server error
      const serverError: ApiError = {
        code: 'SERVER_ERROR',
        message: 'An internal server error occurred. Please try again later.',
        details: {
          url,
          method,
          response: error.response?.data,
        },
      };
      return Promise.reject(serverError);
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
