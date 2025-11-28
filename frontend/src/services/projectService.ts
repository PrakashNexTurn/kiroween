/**
 * Project Service
 * 
 * This module provides all API methods for interacting with projects.
 * Each method corresponds to a backend API endpoint and handles the
 * request/response cycle with proper typing.
 * 
 * Requirements: 1.5, 3.2, 4.2, 5.2, 5.5, 6.3, 7.3, 9.2, 9.4, 10.2
 */

import { apiClient } from './api';
import type {
  ApiResponse,
  CreateProjectRequest,
  UpdateSpecFileRequest,
  GenerateSpecRequest,
  ExecuteTaskRequest,
  FixProjectRequest,
  ProjectSummary,
  ProjectMetadata,
} from '../types';

/**
 * Response structure for reading a spec file
 */
interface ReadSpecFileResponse {
  projectId: string;
  fileName: string;
  content: string;
  metadata: {
    projectName: string;
    phase: string;
    updatedAt: string;
    [key: string]: any;
  };
}

/**
 * Response structure for project list
 */
interface ListProjectsResponse {
  projects: ProjectSummary[];
  total: number;
}

/**
 * Response structure for spec generation
 */
interface GenerateSpecResponse {
  specType: string;
  filePath: string;
  generatedAt: string;
}

/**
 * Response structure for task execution
 */
interface ExecuteTaskResponse {
  task_number: string;
  phase: string;
  completion_percentage: number;
  task_stats: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    failed: number;
  };
}

/**
 * Response structure for build operation
 */
interface BuildProjectResponse {
  build_status: string;
  build_logs: string;
}

/**
 * Response structure for test operation
 */
interface TestProjectResponse {
  test_status: string;
  tests_passed: number;
  tests_failed: number;
  test_logs: string;
}

/**
 * Response structure for fix operation
 */
interface FixProjectResponse {
  fix_status: string;
  files_modified: string[];
  retest_results: {
    test_status: string;
    tests_passed: number;
    tests_failed: number;
  };
}

/**
 * Response structure for file update
 */
interface UpdateFileResponse {
  file_name: string;
  updated_at: string;
}

/**
 * Project Service
 * 
 * Provides methods for all project-related API operations
 */
export const projectService = {
  /**
   * Get all projects
   * 
   * @returns Promise resolving to array of project summaries
   * @throws ApiError if request fails
   * 
   * Requirement: 1.5 - Fetch project data from Backend API
   */
  async getProjects(): Promise<ProjectSummary[]> {
    const response = await apiClient.get<ApiResponse<ListProjectsResponse>>('/projects');
    
    // Handle different response structures
    if (response.data.output && response.data.output.projects) {
      return response.data.output.projects;
    }
    
    // If the response is directly an array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If the response has a projects field at the top level
    if ((response.data as any).projects) {
      return (response.data as any).projects;
    }
    
    // Return empty array if no projects found
    return [];
  },

  /**
   * Get detailed status of a specific project
   * 
   * @param projectId - The ID of the project
   * @returns Promise resolving to project metadata
   * @throws ApiError if project not found or request fails
   * 
   * Requirement: 4.2 - Fetch project status from Backend API
   */
  async getProjectStatus(projectId: string): Promise<ProjectMetadata> {
    const response = await apiClient.get<ApiResponse<ProjectMetadata>>(
      `/projects/${projectId}/status`
    );
    
    // Handle case where output might be at the top level
    if (response.data.output) {
      return response.data.output;
    }
    
    // If the response data itself is the project metadata (no wrapper)
    if ((response.data as any).projectId) {
      return response.data as any as ProjectMetadata;
    }
    
    throw new Error('Invalid response structure from API');
  },

  /**
   * Create a new project
   * 
   * @param name - Project name
   * @param description - Project description
   * @returns Promise resolving to API response with project data
   * @throws ApiError if validation fails or request fails
   * 
   * Requirement: 3.2 - Send POST request to Backend API /projects/create
   */
  async createProject(
    name: string,
    description: string
  ): Promise<ApiResponse<ProjectMetadata>> {
    const request: CreateProjectRequest = { name, description };
    const response = await apiClient.post<ApiResponse<ProjectMetadata>>(
      '/projects/create',
      request
    );
    return response.data;
  },

  /**
   * Read the content of a spec file
   * 
   * @param projectId - The ID of the project
   * @param fileName - Name of the file (requirements.md, design.md, or tasks.md)
   * @returns Promise resolving to file content and metadata
   * @throws ApiError if file not found or request fails
   * 
   * Requirement: 5.2 - Fetch file content from Backend API
   */
  async readSpecFile(
    projectId: string,
    fileName: string
  ): Promise<ReadSpecFileResponse> {
    const response = await apiClient.get<ApiResponse<ReadSpecFileResponse>>(
      `/projects/${projectId}/files/${fileName}`
    );
    
    // Handle different response structures
    if (response.data.output) {
      return response.data.output;
    }
    
    // If the response data itself contains the file info (no wrapper)
    if ((response.data as any).content !== undefined) {
      return response.data as any as ReadSpecFileResponse;
    }
    
    // Return empty content if structure is unexpected
    return {
      projectId,
      fileName,
      content: '',
      metadata: {
        projectName: '',
        phase: '',
        updatedAt: new Date().toISOString(),
      },
    };
  },

  /**
   * Update the content of a spec file
   * 
   * @param projectId - The ID of the project
   * @param fileName - Name of the file to update
   * @param content - New file content
   * @returns Promise resolving to API response with update confirmation
   * @throws ApiError if validation fails or request fails
   * 
   * Requirement: 5.5 - Send PUT request to Backend API
   */
  async updateSpecFile(
    projectId: string,
    fileName: string,
    content: string
  ): Promise<ApiResponse<UpdateFileResponse>> {
    const request: UpdateSpecFileRequest = { content };
    const response = await apiClient.put<ApiResponse<UpdateFileResponse>>(
      `/projects/${projectId}/files/${fileName}`,
      request
    );
    return response.data;
  },

  /**
   * Generate a specification file
   * 
   * @param projectId - The ID of the project
   * @param specType - Type of spec to generate (requirements, design, or tasks)
   * @param description - Description to guide generation
   * @returns Promise resolving to API response with generation result
   * @throws ApiError if validation fails or request fails
   * 
   * Requirement: 6.3 - Send POST request to Backend API /projects/{project_id}/spec/generate
   */
  async generateSpec(
    projectId: string,
    specType: 'requirements' | 'design' | 'tasks',
    description: string
  ): Promise<ApiResponse<GenerateSpecResponse>> {
    const request: GenerateSpecRequest = { specType, description };
    const response = await apiClient.post<ApiResponse<GenerateSpecResponse>>(
      `/projects/${projectId}/spec/generate`,
      request
    );
    return response.data;
  },

  /**
   * Execute a project task
   * 
   * @param projectId - The ID of the project
   * @param taskNumber - Optional task number to execute (if omitted, executes all tasks)
   * @returns Promise resolving to API response with execution result
   * @throws ApiError if task execution fails
   * 
   * Requirement: 7.3 - Send POST request to Backend API /projects/{project_id}/tasks/execute
   */
  async executeTask(
    projectId: string,
    taskNumber?: string
  ): Promise<ApiResponse<ExecuteTaskResponse>> {
    const request: ExecuteTaskRequest = taskNumber ? { taskNumber } : {};
    const response = await apiClient.post<ApiResponse<ExecuteTaskResponse>>(
      `/projects/${projectId}/tasks/execute`,
      request,
      { timeout: 300000 } // 5 minutes timeout for long-running task execution
    );
    return response.data;
  },

  /**
   * Build the project
   * 
   * @param projectId - The ID of the project
   * @returns Promise resolving to API response with build result
   * @throws ApiError if build fails
   * 
   * Requirement: 9.2 - Send POST request to Backend API /projects/{project_id}/build
   */
  async buildProject(projectId: string): Promise<ApiResponse<BuildProjectResponse>> {
    const response = await apiClient.post<ApiResponse<BuildProjectResponse>>(
      `/projects/${projectId}/build`
    );
    return response.data;
  },

  /**
   * Run project tests
   * 
   * @param projectId - The ID of the project
   * @returns Promise resolving to API response with test results
   * @throws ApiError if tests fail to run
   * 
   * Requirement: 9.4 - Send POST request to Backend API /projects/{project_id}/test
   */
  async testProject(projectId: string): Promise<ApiResponse<TestProjectResponse>> {
    const response = await apiClient.post<ApiResponse<TestProjectResponse>>(
      `/projects/${projectId}/test`
    );
    return response.data;
  },

  /**
   * Fix project issues
   * 
   * @param projectId - The ID of the project
   * @param failureDetails - Details about the failures to fix
   * @returns Promise resolving to API response with fix results
   * @throws ApiError if fix operation fails
   * 
   * Requirement: 10.2 - Send POST request to Backend API /projects/{project_id}/fix
   */
  async fixProject(
    projectId: string,
    failureDetails: string
  ): Promise<ApiResponse<FixProjectResponse>> {
    const request: FixProjectRequest = { failureDetails };
    const response = await apiClient.post<ApiResponse<FixProjectResponse>>(
      `/projects/${projectId}/fix`,
      request
    );
    return response.data;
  },
};
