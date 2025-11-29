/**
 * SteeringFileViewer Component
 * Displays and edits steering file content using Monaco editor
 * 
 * Requirements: 1.4.3, 1.4.4
 */

import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Save, AlertCircle, FileText } from 'lucide-react';
import { Button, EditorSkeleton } from '../common';
import { showSuccess, showError } from '../common/Toast';
import { steeringService } from '../../services';

/**
 * Steering file data structure
 */
interface SteeringFileData {
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
 * Props for SteeringFileViewer component
 */
export interface SteeringFileViewerProps {
  projectId: string;
  fileName: string;
  onSaveSuccess?: () => void;
}

/**
 * SteeringFileViewer component
 * Fetches, displays, and allows editing of steering files
 * Requirement 1.4.3: Display file content in Monaco editor
 * Requirement 1.4.4: Add save functionality
 */
export function SteeringFileViewer({
  projectId,
  fileName,
  onSaveSuccess,
}: SteeringFileViewerProps) {
  const [fileData, setFileData] = useState<SteeringFileData | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Fetch file content on mount or when fileName changes
   */
  useEffect(() => {
    let isMounted = true;

    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      setHasChanges(false);

      try {
        const data = await steeringService.readSteeringFile(projectId, fileName);

        if (isMounted) {
          setFileData(data);
          setContent(data.content);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.message || `Failed to load ${fileName}`
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFileContent();

    return () => {
      isMounted = false;
    };
  }, [projectId, fileName]);

  /**
   * Handle content changes in the editor
   */
  const handleEditorChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    setHasChanges(newContent !== fileData?.content);
  };

  /**
   * Save file content
   * Requirement 1.4.4: Add save functionality
   */
  const handleSave = async () => {
    if (!hasChanges || saving) return;

    setSaving(true);

    try {
      await steeringService.updateSteeringFile(projectId, fileName, content);

      // Update file data with new content
      if (fileData) {
        setFileData({
          ...fileData,
          content,
          metadata: {
            ...fileData.metadata,
            size: content.length,
          },
        });
      }

      setHasChanges(false);
      showSuccess(`${fileName} saved successfully`);
      onSaveSuccess?.();
    } catch (err: any) {
      showError(err.message || `Failed to save ${fileName}`, {
        onRetry: handleSave
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (hasChanges && !saving) {
        handleSave();
      }
    }
  };

  // Loading state with skeleton
  // Requirement 4.1.3: Loading states for steering files
  if (loading) {
    return <EditorSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
        <AlertCircle
          size={48}
          style={{ color: 'var(--color-status-error)' }}
        />
        <p
          className="text-sm text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {error}
        </p>
      </div>
    );
  }

  // No data state
  if (!fileData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <FileText
          size={48}
          style={{ color: 'var(--color-text-secondary)' }}
        />
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          No file data available
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" onKeyDown={handleKeyDown}>
      {/* Header with file info and save button */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <FileText
            size={20}
            style={{ color: 'var(--color-brand-primary)' }}
          />
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {fileName}
            </p>
            <p
              className="text-xs"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              {(fileData.metadata.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Unsaved changes
            </span>
          )}
          <Button
            onClick={handleSave}
            variant="primary"
            size="sm"
            disabled={!hasChanges || saving}
            loading={saving}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          value={content}
          onChange={handleEditorChange}
          language="markdown"
          theme="vs-dark"
          options={{
            readOnly: false,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
            },
            tabSize: 2,
            insertSpaces: true,
          }}
          loading={<EditorSkeleton />}
        />
      </div>

      {/* Footer with keyboard shortcut hint */}
      <div
        className="px-4 py-2 border-t text-xs"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-tertiary)',
        }}
      >
        Press <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>Ctrl+S</kbd> or{' '}
        <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>Cmd+S</kbd> to save
      </div>
    </div>
  );
}
