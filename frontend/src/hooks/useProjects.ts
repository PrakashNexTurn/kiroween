/**
 * useProjects Hook
 * Custom hook for managing projects list with auto-refresh capability
 * 
 * Requirements: 1.1, 1.5
 */

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import type { ProjectSummary } from '../types/project.types';

/**
 * Return type for useProjects hook
 */
export interface UseProjectsReturn {
  projects: ProjectSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage projects list
 * 
 * @param autoRefresh - Enable automatic refresh (default: false)
 * @param interval - Refresh interval in milliseconds (default: 30000)
 * @returns Object containing projects, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { projects, loading, error, refetch } = useProjects();
 * 
 * // With auto-refresh every 30 seconds
 * const { projects, loading, error } = useProjects(true, 30000);
 * ```
 */
export function useProjects(
  autoRefresh = false,
  interval = 30000
): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch projects from the API
   * Memoized to prevent unnecessary re-creation
   */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchProjects();
    }, interval);

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, [autoRefresh, interval, fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}
