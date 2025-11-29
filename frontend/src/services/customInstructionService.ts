/**
 * Custom Instruction Service
 * 
 * This module provides API methods for executing custom (adhoc) instructions
 * that are not part of the predefined task list.
 * 
 * Requirements: 2.3.1
 */

import { apiClient } from './api';
import type { ApiResponse } from '../types';

/**
 * Request body for executing a custom instruction
 */
export interface CustomInstructionRequest {
  instruction: string;
}

/**
 * Response structure for custom instruction execution
 */
export interface CustomInstructionResponse {
  instruction: string;
  executedAt: string;
  filesModified?: string[];
  [key: string]: any;
}

/**
 * Custom Instruction Service
 * 
 * Provides methods for executing custom instructions via the backend API
 */
export const customInstructionService = {
  /**
   * Execute a custom instruction for a project
   * 
   * @param projectId - The ID of the project
   * @param instruction - The custom instruction text to execute
   * @returns Promise resolving to API response with execution result
   * @throws ApiError if validation fails or execution fails
   * 
   * Requirement: 2.3.1 - Send POST request to Backend API /projects/{project_id}/custom
   */
  async executeCustomInstruction(
    projectId: string,
    instruction: string
  ): Promise<ApiResponse<CustomInstructionResponse>> {
    const request: CustomInstructionRequest = { instruction };
    const response = await apiClient.post<ApiResponse<CustomInstructionResponse>>(
      `/projects/${projectId}/custom`,
      request,
      { timeout: 300000 } // 5 minutes timeout for long-running custom instructions
    );
    return response.data;
  },
};
