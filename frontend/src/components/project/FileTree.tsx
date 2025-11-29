/**
 * FileTree Component
 * Displays an interactive file tree with expand/collapse functionality
 * 
 * Requirements: 3.3.3, 3.3.4, 3.3.5, 3.4.1, 3.4.2, 3.4.3, 3.4.4, 3.4.5, 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
 */

import React, { useEffect, useState } from 'react';
import { getFileTree } from '../../services/fileSystemService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FileTreeNode as FileTreeNodeComponent } from './FileTreeNode';
import { useFileTreeKeyboard } from '../../hooks/useFileTreeKeyboard';
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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [filteredTree, setFilteredTree] = useState<FileTreeNode | null>(null);

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
   * Fetch file tree on mount
   */
  useEffect(() => {
    loadFileTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /**
   * Load file tree from API
   */
  const loadFileTree = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getFileTree(projectId);
      setTree(data);
      
      // Auto-expand root folder
      if (data && data.type === 'folder') {
        setExpandedFolders(new Set([data.path]));
      }
    } catch (err) {
      console.error('Failed to load file tree:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file tree';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
  }, [tree, searchQuery]);

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <LoadingSpinner size="md" label="Loading file tree..." />
        <p
          className="text-sm mt-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Loading file tree...
        </p>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <p
          className="text-sm text-center mb-4"
          style={{ color: 'var(--color-error)' }}
        >
          {error}
        </p>
        <button
          onClick={loadFileTree}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
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
      <FileTreeNodeComponent
        node={treeToRender}
        level={0}
        onFileSelect={onFileSelect}
        selectedFile={selectedFile}
        expandedFolders={expandedFolders}
        onToggleFolder={handleToggleFolder}
        searchQuery={searchQuery}
      />
    </div>
  );
};
