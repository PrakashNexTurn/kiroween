/**
 * Steering Service
 * 
 * This module provides all API methods for interacting with steering files.
 * Steering files are markdown files that guide AI assistants with project-specific
 * context and conventions.
 * 
 * Requirements: 1.2.1, 1.2.2, 1.2.3, 1.2.4
 */

import { apiClient } from './api';
import type { ApiResponse } from '../types';

/**
 * Request body for generating steering files
 */
export interface GenerateSteeringRequest {
  force: boolean;
}

/**
 * Response structure for steering file generation
 */
export interface GenerateSteeringResponse {
  message: string;
  files_generated: string[];
  files_skipped?: string[];
  file_paths?: Record<string, string>;
}

/**
 * Information about a steering file
 */
export interface SteeringFileInfo {
  fileName: string;
  filePath: string;
  exists: boolean;
  size?: number;
  error?: string;
}

/**
 * Response structure for listing steering files
 */
export interface ListSteeringFilesResponse {
  projectId: string;
  files: SteeringFileInfo[];
  count?: number;
  message?: string;
  error?: string;
}

/**
 * Response structure for reading a steering file
 */
export interface ReadSteeringFileResponse {
  projectId: string;
  fileName: string;
  content: string;
  metadata: {
    projectName: string;
    size: number;
    filePath: string;
  };
}

/**
 * Request body for updating a steering file
 */
export interface UpdateSteeringFileRequest {
  content: string;
}

/**
 * Response structure for updating a steering file
 */
export interface UpdateSteeringFileResponse {
  message: string;
  fileName: string;
  filePath: string;
  size: number;
}

/**
 * Steering Service
 * 
 * Provides methods for all steering-related API operations
 */
export const steeringService = {
  /**
   * Generate steering files for a project
   * 
   * @param projectId - The ID of the project
   * @param force - If true, overwrite existing files. If false, skip existing files.
   * @returns Promise resolving to API response with generation results
   * @throws ApiError if generation fails
   * 
   * Requirement: 1.2.1 - Send POST request to Backend API /projects/{project_id}/steering/generate
   */
  async generateSteering(
    projectId: string,
    force: boolean = false
  ): Promise<ApiResponse<GenerateSteeringResponse>> {
    const request: GenerateSteeringRequest = { force };
    const response = await apiClient.post<ApiResponse<GenerateSteeringResponse>>(
      `/projects/${projectId}/steering/generate`,
      request
    );
    return response.data;
  },

  /**
   * List all steering files for a project
   * 
   * @param projectId - The ID of the project
   * @returns Promise resolving to list of steering files with metadata
   * @throws ApiError if request fails
   * 
   * Requirement: 1.2.2 - Send GET request to Backend API /projects/{project_id}/steering/files
   */
  async listSteeringFiles(projectId: string): Promise<ListSteeringFilesResponse> {
    const response = await apiClient.get<ListSteeringFilesResponse>(
      `/projects/${projectId}/steering/files`
    );
    return response.data;
  },

  /**
   * Read the content of a steering file
   * 
   * @param projectId - The ID of the project
   * @param fileName - Name of the steering file (e.g., product.md, tech.md, structure.md)
   * @returns Promise resolving to file content and metadata
   * @throws ApiError if file not found or request fails
   * 
   * Requirement: 1.2.3 - Send GET request to Backend API /projects/{project_id}/steering/files/{file_name}
   */
  async readSteeringFile(
    projectId: string,
    fileName: string
  ): Promise<ReadSteeringFileResponse> {
    const response = await apiClient.get<ReadSteeringFileResponse>(
      `/projects/${projectId}/steering/files/${fileName}`
    );
    return response.data;
  },

  /**
   * Update the content of a steering file
   * 
   * @param projectId - The ID of the project
   * @param fileName - Name of the steering file to update
   * @param content - New file content
   * @returns Promise resolving to API response with update confirmation
   * @throws ApiError if validation fails or request fails
   * 
   * Requirement: 1.2.4 - Send PUT request to Backend API /projects/{project_id}/steering/files/{file_name}
   */
  async updateSteeringFile(
    projectId: string,
    fileName: string,
    content: string
  ): Promise<ApiResponse<UpdateSteeringFileResponse>> {
    const request: UpdateSteeringFileRequest = { content };
    const response = await apiClient.put<ApiResponse<UpdateSteeringFileResponse>>(
      `/projects/${projectId}/steering/files/${fileName}`,
      request
    );
    return response.data;
  },
};
