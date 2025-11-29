/**
 * File System Service
 * 
 * This module provides API methods for interacting with project files.
 * It handles file tree retrieval and file content reading.
 * 
 * Requirements: 3.1.1, 3.1.4, 3.1.5, 3.2.1, 3.2.4
 */

import { apiClient } from './api';
import type { FileTreeNode } from '../types/project.types';

/**
 * Response structure for file tree endpoint
 */
interface FileTreeResponse {
  projectId: string;
  projectRoot: string;
  tree: FileTreeNode;
}

/**
 * Response structure for file content endpoint
 */
export interface FileContentResponse {
  projectId: string;
  filePath: string;
  content: string;
  isBinary: boolean;
  isTruncated: boolean;
  size: number;
  encoding: string;
  language: string | null;
}

/**
 * Get the file tree for a project
 * 
 * @param projectId - The ID of the project
 * @returns Promise resolving to the root file tree node
 * @throws ApiError if request fails
 * 
 * Requirement: 3.1.1 - Fetch file tree from Backend API
 */
export async function getFileTree(projectId: string): Promise<FileTreeNode> {
  const response = await apiClient.get<FileTreeResponse>(
    `/projects/${projectId}/files/tree`
  );
  
  return response.data.tree;
}

/**
 * Get the content of a file
 * 
 * @param projectId - The ID of the project
 * @param filePath - Path to the file (relative to project root)
 * @returns Promise resolving to file content and metadata
 * @throws ApiError if file not found or request fails
 * 
 * Requirement: 3.2.1 - Fetch file content from Backend API
 */
export async function getFileContent(
  projectId: string,
  filePath: string
): Promise<FileContentResponse> {
  const response = await apiClient.get<FileContentResponse>(
    `/projects/${projectId}/files/content`,
    {
      params: { file_path: filePath },
    }
  );
  
  return response.data;
}

/**
 * File System Service
 * 
 * Provides methods for file tree and file content operations
 */
export const fileSystemService = {
  getFileTree,
  getFileContent,
};
