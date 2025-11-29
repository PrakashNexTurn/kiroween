/**
 * FileContentViewer Component
 * Displays file content using Monaco editor with syntax highlighting
 * 
 * Requirements: 3.5.1, 3.5.2, 3.5.3, 3.5.4, 3.5.5
 * 
 * Optimization: Lazy load Monaco editor (Requirement 3.4.5)
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { getFileContent, type FileContentResponse } from '../../services/fileSystemService';
import { FileContentSkeleton } from '../common';

// Lazy load Monaco editor (Optimization: Requirement 3.4.5)
const Editor = lazy(() => import('@monaco-editor/react'));

/**
 * Props for FileContentViewer component
 */
export interface FileContentViewerProps {
  projectId: string;
  filePath: string;
}

/**
 * Map file extensions to Monaco editor language identifiers
 */
const getLanguageFromPath = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'mjs': 'javascript',
    'cjs': 'javascript',
    
    // Python
    'py': 'python',
    'pyw': 'python',
    'pyi': 'python',
    
    // Web
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    
    // Markup
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'md': 'markdown',
    'markdown': 'markdown',
    
    // Shell
    'sh': 'shell',
    'bash': 'shell',
    'zsh': 'shell',
    
    // Other languages
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'php': 'php',
    'sql': 'sql',
    'r': 'r',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    
    // Config files
    'env': 'shell',
    'gitignore': 'shell',
    'dockerignore': 'shell',
    'editorconfig': 'ini',
    'ini': 'ini',
    'cfg': 'ini',
    'conf': 'ini',
    
    // Text
    'txt': 'plaintext',
    'log': 'plaintext',
  };
  
  return languageMap[extension || ''] || 'plaintext';
};

/**
 * FileContentViewer component
 * Fetches and displays file content with Monaco editor
 */
export function FileContentViewer({ projectId, filePath }: FileContentViewerProps) {
  const [fileData, setFileData] = useState<FileContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getFileContent(projectId, filePath);
        
        if (isMounted) {
          setFileData(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load file content');
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
  }, [projectId, filePath]);

  // Loading state with skeleton
  // Requirement 3.3.4: Loading indicator for file content
  if (loading) {
    return <FileContentSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
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
      <div className="flex items-center justify-center h-full">
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          No file data available
        </p>
      </div>
    );
  }

  // Binary file state
  if (fileData.isBinary) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <FileText
          size={48}
          style={{ color: 'var(--color-text-secondary)' }}
        />
        <p
          className="text-sm text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Binary file - cannot display
        </p>
        <p
          className="text-xs text-center"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Size: {(fileData.size / 1024).toFixed(2)} KB
        </p>
      </div>
    );
  }

  // Determine language for syntax highlighting
  const language = fileData.language || getLanguageFromPath(filePath);

  return (
    <div className="h-full flex flex-col">
      {/* Warning for truncated files */}
      {fileData.isTruncated && (
        <div
          className="px-3 py-2 text-xs border-b"
          style={{
            backgroundColor: 'var(--color-status-warning)',
            color: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
          }}
        >
          ⚠️ File is too large ({(fileData.size / 1024 / 1024).toFixed(2)} MB). Showing truncated content.
        </div>
      )}

      {/* Monaco Editor with lazy loading (Optimization: Requirement 3.4.5) */}
      <div className="flex-1">
        <Suspense fallback={<FileContentSkeleton />}>
          <Editor
            value={fileData.content}
            language={language}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              folding: true,
              wordWrap: 'off',
              automaticLayout: true,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
              },
            }}
            loading={<FileContentSkeleton />}
          />
        </Suspense>
      </div>
    </div>
  );
}
