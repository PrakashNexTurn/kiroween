/**
 * API-related TypeScript type definitions
 * These types define the structure of API requests and responses
 */

/**
 * Standard API response wrapper
 * @template T - The type of the output data
 */
export interface ApiResponse<T> {
  status: 'success' | 'failure';
  action: string;
  projectId: string;
  output: T;
  logs: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  code: string;
  message: string;
  details: Record<string, any>;
}

/**
 * Request body for creating a new project
 */
export interface CreateProjectRequest {
  name: string;
  description: string;
}

/**
 * Request body for updating a spec file
 */
export interface UpdateSpecFileRequest {
  content: string;
}

/**
 * Request body for generating a spec
 */
export interface GenerateSpecRequest {
  specType: 'requirements' | 'design' | 'tasks';
  description: string;
}

/**
 * Request body for executing a task
 */
export interface ExecuteTaskRequest {
  taskNumber?: string;
}

/**
 * Request body for fixing project issues
 */
export interface FixProjectRequest {
  failureDetails: string;
}

/**
 * Response structure for reading a spec file
 */
export interface SpecFileResponse {
  content: string;
  metadata: {
    lastModified?: string;
    size?: number;
    [key: string]: any;
  };
}
