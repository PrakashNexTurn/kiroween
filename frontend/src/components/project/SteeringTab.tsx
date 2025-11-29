/**
 * SteeringTab Component
 * Displays and manages steering files for a project
 * 
 * Requirements: 1.4.1, 1.4.2, 1.4.5
 */

import { useState, useEffect } from 'react';
import { FileText, Plus, AlertCircle } from 'lucide-react';
import { Button, Card, SteeringFileListSkeleton, showError } from '../common';
import { SteeringFileViewer } from './SteeringFileViewer';
import { steeringService } from '../../services';

/**
 * Steering file information
 */
interface SteeringFile {
  fileName: string;
  filePath: string;
  exists: boolean;
  size?: number;
  modifiedAt?: string;
}

/**
 * Props for SteeringTab component
 */
interface SteeringTabProps {
  projectId: string;
  onGenerateClick?: () => void;
  key?: number;
}

/**
 * SteeringTab component
 * Lists steering files and provides file selection and generation capabilities
 */
export function SteeringTab({ projectId, onGenerateClick }: SteeringTabProps) {
  const [steeringFiles, setSteeringFiles] = useState<SteeringFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load steering files on mount
   */
  useEffect(() => {
    loadSteeringFiles();
  }, [projectId]);

  /**
   * Load steering files from API
   * Requirement 3.3.5: Enhanced error handling with retry
   */
  const loadSteeringFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await steeringService.listSteeringFiles(projectId);
      setSteeringFiles(response.files || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load steering files';
      setError(errorMessage);
      
      // Show error toast with retry functionality (Requirement 3.3.5)
      showError(errorMessage, {
        onRetry: loadSteeringFiles,
        duration: 7000
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    // TODO: Load and display file content when SteeringFileViewer is implemented
  };

  /**
   * Handle generate button click
   */
  const handleGenerateClick = () => {
    onGenerateClick?.();
  };

  /**
   * Render loading state with skeleton
   * Requirement 4.1.3: Loading states for steering files
   */
  if (isLoading) {
    return (
      <Card>
        <SteeringFileListSkeleton />
      </Card>
    );
  }

  /**
   * Render error state with graceful degradation
   * Requirement 3.3.5: User-friendly error messages and retry functionality
   */
  if (error) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-status-error-bg)' }}
          >
            <AlertCircle
              size={32}
              style={{ color: 'var(--color-status-error)' }}
            />
          </div>
          <div className="text-center max-w-md">
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Failed to load steering files
            </p>
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {error}
            </p>
            <p
              className="text-xs mb-6"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              💡 Make sure the backend server is running and the project exists
            </p>
          </div>
          <Button 
            onClick={loadSteeringFiles} 
            variant="primary" 
            size="md"
            className="flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  /**
   * Render empty state when no steering files exist
   */
  if (steeringFiles.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <FileText
            size={48}
            className="mx-auto mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          />
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            No Steering Files
          </h3>
          <p
            className="text-sm mb-6 max-w-md mx-auto"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Steering files provide AI assistants with project-specific context and conventions.
            Generate them to help guide development.
          </p>
          <Button
            onClick={handleGenerateClick}
            variant="primary"
            className="flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Generate Steering Files
          </Button>
        </div>
      </Card>
    );
  }

  /**
   * Render file list
   */
  return (
    <div className="space-y-6">
      {/* Header with generate button */}
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Steering Files
        </h2>
        <Button
          onClick={handleGenerateClick}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Regenerate
        </Button>
      </div>

      {/* File list */}
      <Card>
        <div className="space-y-2">
          {steeringFiles.map((file) => (
            <button
              key={file.fileName}
              onClick={() => handleFileSelect(file.fileName)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                selectedFile === file.fileName
                  ? 'ring-2 ring-[var(--color-brand-primary)]'
                  : ''
              }`}
              style={{
                backgroundColor:
                  selectedFile === file.fileName
                    ? 'var(--color-bg-tertiary)'
                    : 'var(--color-bg-secondary)',
              }}
            >
              <div className="flex items-center gap-3">
                <FileText
                  size={20}
                  style={{ color: 'var(--color-brand-primary)' }}
                />
                <div className="flex-1">
                  <p
                    className="font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {file.fileName}
                  </p>
                  {file.modifiedAt && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Modified {new Date(file.modifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {file.size && (
                  <span
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* File viewer */}
      {selectedFile && (
        <Card className="h-[600px]">
          <SteeringFileViewer
            projectId={projectId}
            fileName={selectedFile}
            onSaveSuccess={loadSteeringFiles}
          />
        </Card>
      )}
    </div>
  );
}
