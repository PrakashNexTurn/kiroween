/**
 * SpecViewer Component
 * View and edit specification files with markdown rendering and Monaco editor
 * 
 * Requirements: 5.2, 5.3, 5.4, 5.5, 6.1
 */

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';
import { Button, LoadingSpinner } from '../common';
import { projectService } from '../../services/projectService';
import { showSuccess, showError } from '../common/Toast';
import { useTheme } from '../../hooks/useTheme';

/**
 * Props for SpecViewer component
 */
interface SpecViewerProps {
  projectId: string;
  fileName: 'requirements.md' | 'design.md' | 'tasks.md';
  onGenerateClick?: () => void;
}

/**
 * SpecViewer component
 * Displays spec files with view/edit modes and markdown rendering
 */
export function SpecViewer({ projectId, fileName, onGenerateClick }: SpecViewerProps) {
  const [content, setContent] = useState<string>('');
  const [editedContent, setEditedContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { currentTheme } = useTheme();

  /**
   * Fetch spec file content
   */
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await projectService.readSpecFile(projectId, fileName);
      
      // Handle case where response might be undefined or null
      if (!response) {
        setContent('');
        setEditedContent('');
        return;
      }
      
      setContent(response.content || '');
      setEditedContent(response.content || '');
    } catch (err) {
      console.error('Error fetching spec file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load spec file';
      setError(errorMessage);
      showError(errorMessage);
      // Set empty content on error so user can still create manually
      setContent('');
      setEditedContent('');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, fileName]);

  /**
   * Load content on mount and when projectId/fileName changes
   */
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  /**
   * Save auto-draft to localStorage
   */
  useEffect(() => {
    if (isEditing && hasChanges) {
      const draftKey = `spec-draft-${projectId}-${fileName}`;
      localStorage.setItem(draftKey, editedContent);
    }
  }, [isEditing, hasChanges, editedContent, projectId, fileName]);

  /**
   * Restore draft from localStorage when entering edit mode
   */
  useEffect(() => {
    if (isEditing) {
      const draftKey = `spec-draft-${projectId}-${fileName}`;
      const draft = localStorage.getItem(draftKey);
      if (draft && draft !== content) {
        // Ask user if they want to restore draft
        const restore = window.confirm(
          'A draft was found for this file. Do you want to restore it?'
        );
        if (restore) {
          setEditedContent(draft);
          setHasChanges(true);
        }
      }
    }
  }, [isEditing, projectId, fileName, content]);

  /**
   * Handle edit button click
   */
  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
    setHasChanges(false);
  };

  /**
   * Handle cancel button click
   */
  const handleCancel = () => {
    if (hasChanges) {
      const confirmCancel = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmCancel) {
        return;
      }
    }
    setIsEditing(false);
    setEditedContent(content);
    setHasChanges(false);
    
    // Clear draft from localStorage
    const draftKey = `spec-draft-${projectId}-${fileName}`;
    localStorage.removeItem(draftKey);
  };

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await projectService.updateSpecFile(projectId, fileName, editedContent);
      setContent(editedContent);
      setIsEditing(false);
      setHasChanges(false);
      
      // Clear draft from localStorage
      const draftKey = `spec-draft-${projectId}-${fileName}`;
      localStorage.removeItem(draftKey);
      
      showSuccess('Spec file saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save spec file';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle editor content change
   */
  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    setEditedContent(newValue);
    setHasChanges(newValue !== content);
  };

  /**
   * Handle keyboard shortcuts in editor
   */
  const handleEditorMount = (editor: Parameters<NonNullable<React.ComponentProps<typeof Editor>['onMount']>>[0], monaco: Parameters<NonNullable<React.ComponentProps<typeof Editor>['onMount']>>[1]) => {
    // Add Ctrl+S / Cmd+S to save
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        if (hasChanges) {
          handleSave();
        }
      }
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (error && !content) {
    return (
      <div
        className="rounded-lg p-6 text-center"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <p
          className="text-lg font-medium mb-4"
          style={{ color: 'var(--color-status-error)' }}
        >
          Error loading spec file
        </p>
        <p
          className="mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {error}
        </p>
        <Button onClick={fetchContent} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  // Show empty state with generate button
  if (!content && !isEditing) {
    return (
      <div
        className="rounded-lg p-12 text-center"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <p
          className="text-lg font-medium mb-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          No content yet
        </p>
        <p
          className="mb-6"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          This spec file hasn't been created yet. Generate it or create it manually.
        </p>
        <div className="flex gap-4 justify-center">
          {onGenerateClick && (
            <Button onClick={onGenerateClick} variant="primary">
              Generate {fileName.replace('.md', '')}
            </Button>
          )}
          <Button onClick={handleEdit} variant="secondary">
            Create Manually
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3
            className="text-lg font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {fileName}
          </h3>
          {hasChanges && (
            <span
              className="text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: 'var(--color-status-warning)',
                color: 'var(--color-text-inverse)',
              }}
            >
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={handleEdit} variant="primary" size="sm">
                Edit
              </Button>
              {onGenerateClick && !content && (
                <Button onClick={onGenerateClick} variant="secondary" size="sm">
                  Generate
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                variant="secondary"
                size="sm"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                disabled={!hasChanges || isSaving}
                loading={isSaving}
              >
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}
        role="region"
        aria-label={`${fileName} content`}
      >
        {isEditing ? (
          // Edit Mode: Monaco Editor
          <div style={{ height: '600px' }} role="textbox" aria-label={`Edit ${fileName}`}>
            <Editor
              height="100%"
              defaultLanguage="markdown"
              value={editedContent}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme={currentTheme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        ) : (
          // View Mode: Markdown Rendering
          <div
            className="p-6 prose prose-sm max-w-none text-left"
            style={{ color: 'var(--color-text-primary)', textAlign: 'left' }}
            role="article"
            aria-label={`${fileName} preview`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { className, children, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const isInline = !match;
                  
                  return !isInline && language ? (
                    <SyntaxHighlighter
                      style={currentTheme === 'dark' ? vscDarkPlus : vs}
                      language={language}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
