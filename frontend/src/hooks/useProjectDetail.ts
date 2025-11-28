/**
 * useProjectDetail Hook
 * Custom hook for managing project detail data with auto-refresh capability
 * 
 * Requirements: 4.2
 */

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { ProjectMetadata } from '../types/project.types';

/**
 * Return type for useProjectDetail hook
 */
export interface UseProjectDetailReturn {
  project: ProjectMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage project detail data
 * 
 * @param projectId - The ID of the project to fetch
 * @param autoRefresh - Enable automatic refresh (default: false)
 * @param interval - Refresh interval in milliseconds (default: 30000)
 * @returns Object containing project metadata, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { project, loading, error, refetch } = useProjectDetail('project-123');
 * 
 * // With auto-refresh every 30 seconds
 * const { project, loading, error } = useProjectDetail('project-123', true, 30000);
 * 
 * // Handle loading and error states
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage message={error} />;
 * if (!project) return <NotFound />;
 * ```
 */
export function useProjectDetail(
  projectId: string,
  autoRefresh = false,
  interval = 30000,
  pausePolling = false
): UseProjectDetailReturn {
  const [project, setProject] = useState<ProjectMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch project status from the API
   * Memoized to prevent unnecessary re-creation
   */
  const fetchProjectStatus = useCallback(async () => {
    if (!projectId) {
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjectStatus(projectId);
      setProject(data);
    } catch (err: any) {
      // Handle both ApiError objects and Error instances
      const errorMessage = err?.message || 
        (err instanceof Error ? err.message : `Failed to fetch project status for ${projectId}`);
      setError(errorMessage);
      console.error('Error fetching project status:', err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Initial fetch on mount or when projectId changes
  useEffect(() => {
    fetchProjectStatus();
  }, [fetchProjectStatus]);

  // Auto-refresh setup (paused when pausePolling is true)
  useEffect(() => {
    if (!autoRefresh || pausePolling) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchProjectStatus();
    }, interval);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefresh, interval, pausePolling, fetchProjectStatus]);

  return {
    project,
    loading,
    error,
    refetch: fetchProjectStatus,
  };
}
