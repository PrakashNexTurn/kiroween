/**
 * API Test Component
 * 
 * Simple component to verify API service is working correctly
 * This is a temporary component for testing purposes
 */

import { useState } from 'react';
import { projectService, getApiBaseUrl } from '../../services';
import type { ProjectSummary } from '../../types';

export function ApiTest() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGetProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
      console.log('✅ API Test Success: Fetched projects', data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects');
      console.error('❌ API Test Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold mb-4">API Service Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          API Base URL: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{getApiBaseUrl()}</code>
        </p>
      </div>

      <button
        onClick={testGetProjects}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Get Projects'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Projects ({projects.length}):</h4>
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.projectId} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Phase: {project.phase} | Progress: {project.completionPercentage}%
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
