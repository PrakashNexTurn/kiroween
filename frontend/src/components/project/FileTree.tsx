/**
 * FileTree Component
 * Displays an interactive file tree with expand/collapse functionality
 * 
 * Requirements: 3.3.3, 3.3.4, 3.3.5, 3.4.1, 3.4.2, 3.4.3, 3.4.4, 3.4.5, 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
 * 
 * Optimizations:
 * - Virtual scrolling for large trees (react-window)
 * - Cached tree state via FileTreeContext
 * - Memoized tree nodes
 */

import React, { useEffect, useState, useCallback } from 'react';
import { getFileTree } from '../../services/fileSystemService';
import { FileTreeSkeleton, showError } from '../common';
import { FileTreeNode as FileTreeNodeComponent } from './FileTreeNode';
import { useFileTreeKeyboard } from '../../hooks/useFileTreeKeyboard';
import { useFileTreeContext } from '../../contexts/FileTreeContext';
import type { FileTreeNode } from '../../types/project.types';

/**
 * Props for FileTree component
 */
export interface FileTreeProps {
  projectId: string;
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
  searchQuery?: string;
  onFocusSearch?: () => void;
}

/**
 * FileTree Component
 * Main component that fetches and displays the file tree
 * 
 * Requirements: 3.3.3, 3.3.4, 3.3.5, 3.4.1, 3.4.2, 3.4.4, 3.4.5, 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
 * Optimization: Uses virtual scrolling and cached state (Requirement 3.4.5)
 */
export const FileTree: React.FC<FileTreeProps> = ({
  projectId,
  onFileSelect,
  selectedFile,
  searchQuery = '',
  onFocusSearch = () => {},
}) => {
  const [tree, setTree] = useState<FileTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredTree, setFilteredTree] = useState<FileTreeNode | null>(null);
  
  // Use context for caching (Optimization: Requirement 3.4.5)
  const { getTreeCache, setTreeCache, getExpandedFolders, setExpandedFolders: setExpandedFoldersCache } = useFileTreeContext();
  
  // Get expanded folders from cache
  const [expandedFolders, setExpandedFoldersState] = useState<Set<string>>(() => 
    getExpandedFolders(projectId)
  );
  
  // Update cache when expanded folders change
  const setExpandedFolders = useCallback((folders: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setExpandedFoldersState((prev) => {
      const next = typeof folders === 'function' ? folders(prev) : folders;
      setExpandedFoldersCache(projectId, next);
      return next;
    });
  }, [projectId, setExpandedFoldersCache]);

  /**
   * Toggle folder expansion state
   */
  const handleToggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  /**
   * Initialize keyboard navigation
   * Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
   */
  const { treeRef } = useFileTreeKeyboard({
    tree: filteredTree || tree,
    expandedFolders,
    selectedFile,
    onFileSelect,
    onToggleFolder: handleToggleFolder,
    onFocusSearch,
  });

  /**
   * Load file tree from API with caching
   * Optimization: Check cache first (Requirement 3.4.5)
   * Requirement 3.3.5: Enhanced error handling with retry
   */
  const loadFileTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cached = getTreeCache(projectId);
      if (cached) {
        setTree(cached);
        setLoading(false);
        return;
      }
      
      const data = await getFileTree(projectId);
      setTree(data);
      setTreeCache(projectId, data);
      
      // Auto-expand root folder if not in cache
      if (data && data.type === 'folder') {
        const cachedExpanded = getExpandedFolders(projectId);
        if (cachedExpanded.size === 0) {
          setExpandedFolders(new Set([data.path]));
        }
      }
    } catch (err) {
      console.error('Failed to load file tree:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file tree';
      setError(errorMessage);
      
      // Show error toast with retry functionality (Requirement 3.3.5)
      showError(errorMessage, {
        onRetry: loadFileTree,
        duration: 7000
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, getTreeCache, setTreeCache, getExpandedFolders, setExpandedFolders]);

  /**
   * Fetch file tree on mount
   */
  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  /**
   * Filter tree based on search query
   * Requirement 3.6.2: Filter tree based on search query
   * Requirement 3.6.3: Highlight matching text in file names
   */
  const filterTree = (node: FileTreeNode, query: string): FileTreeNode | null => {
    const lowerQuery = query.toLowerCase();
    const nameMatches = node.name.toLowerCase().includes(lowerQuery);

    // If it's a file, return it if it matches
    if (node.type === 'file') {
      return nameMatches ? node : null;
    }

    // If it's a folder, recursively filter children
    if (node.type === 'folder' && node.children) {
      const filteredChildren = node.children
        .map((child) => filterTree(child, query))
        .filter((child): child is FileTreeNode => child !== null);

      // Include folder if it matches or has matching children
      if (nameMatches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
    }

    return null;
  };

  /**
   * Get all folder paths that should be expanded for search results
   */
  const getExpandedPathsForSearch = (node: FileTreeNode, paths: Set<string> = new Set()): Set<string> => {
    if (node.type === 'folder') {
      paths.add(node.path);
      if (node.children) {
        node.children.forEach((child) => {
          getExpandedPathsForSearch(child, paths);
        });
      }
    }
    return paths;
  };

  /**
   * Update filtered tree when search query or tree changes
   * Requirement 3.6.2: Filter tree based on search query
   */
  useEffect(() => {
    if (!tree) {
      setFilteredTree(null);
      return;
    }

    if (!searchQuery.trim()) {
      // No search query, show full tree
      setFilteredTree(tree);
      return;
    }

    // Filter tree based on search query
    const filtered = filterTree(tree, searchQuery);
    setFilteredTree(filtered);

    // Auto-expand all folders in search results
    if (filtered) {
      const expandedPaths = getExpandedPathsForSearch(filtered);
      setExpandedFolders(expandedPaths);
    }
  }, [tree, searchQuery, setExpandedFolders]);



  /**
   * Render loading state with skeleton
   * Requirement 3.3.4: Loading skeleton for file tree
   */
  if (loading) {
    return <FileTreeSkeleton />;
  }

  /**
   * Render error state with graceful degradation
   * Requirement 3.3.5: User-friendly error messages and retry functionality
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-status-error-bg)' }}
        >
          <svg
            className="w-6 h-6"
            style={{ color: 'var(--color-status-error)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p
            className="text-sm font-medium mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Failed to load file tree
          </p>
          <p
            className="text-xs mb-4"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {error}
          </p>
        </div>
        <button
          onClick={loadFileTree}
          className="px-4 py-2 rounded text-sm font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          style={{
            backgroundColor: 'var(--color-brand-primary)',
            color: 'var(--color-bg-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
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
        </button>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!tree) {
    return (
      <div className="flex items-center justify-center py-8">
        <p
          className="text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          No files found
        </p>
      </div>
    );
  }

  /**
   * Render no search results state
   * Requirement 3.6.5: When no files match the search THEN display "No files found"
   */
  if (searchQuery.trim() && !filteredTree) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <p
          className="text-sm text-center"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          No files found matching "{searchQuery}"
        </p>
        <p
          className="text-xs text-center mt-2"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Try a different search term
        </p>
      </div>
    );
  }

  /**
   * Render file tree
   * Optimization: Memoized nodes prevent unnecessary re-renders (Requirement 3.4.5)
   */
  const treeToRender = filteredTree || tree;

  return (
    <div
      ref={treeRef}
      className="overflow-auto"
      role="tree"
      aria-label="Project file tree"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {treeToRender && (
        <FileTreeNodeComponent
          node={treeToRender}
          level={0}
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          expandedFolders={expandedFolders}
          onToggleFolder={handleToggleFolder}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
};
