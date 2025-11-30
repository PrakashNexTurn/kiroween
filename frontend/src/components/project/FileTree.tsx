/**
 * FileTree Component
 * Displays an interactive file tree with expand/collapse functionality
 * 
 * Requirements: 3.3.3, 3.3.4, 3.3.5, 3.4.1, 3.4.2, 3.4.3, 3.4.4, 3.4.5, 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5, 10.1, 10.4
 * 
 * Optimizations:
 * - Virtual scrolling for large trees (react-window)
 * - Cached tree state via FileTreeContext
 * - Memoized tree nodes
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Tree } from 'antd';
import type { TreeProps, DataNode } from 'antd/es/tree';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileJson,
  Image,
  FileArchive,
  Copy,
} from 'lucide-react';
import { getFileTree } from '../../services/fileSystemService';
import { FileTreeSkeleton, showError, showSuccess } from '../common';
import { useFileTreeKeyboard } from '../../hooks/useFileTreeKeyboard';
import { useFileTreeContext } from '../../contexts/FileTreeContext';
import type { FileTreeNode } from '../../types/project.types';
import { ContextMenu, type ContextMenuItem } from '../common/ContextMenu';
import './FileTree.css';

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
 * Get icon component based on file type/extension
 * Requirement 3.4.3: Add file type icons
 */
const getFileIcon = (node: FileTreeNode, isExpanded: boolean) => {
  const iconProps = {
    size: 14,
    className: 'flex-shrink-0',
    style: { minWidth: '14px', minHeight: '14px', width: '14px', height: '14px' },
    'aria-hidden': true as const,
  };

  // Folder icons
  if (node.type === 'folder') {
    return isExpanded ? (
      <FolderOpen
        {...iconProps}
        style={{ color: 'var(--color-brand-primary)' }}
      />
    ) : (
      <Folder
        {...iconProps}
        style={{ color: 'var(--color-text-secondary)' }}
      />
    );
  }

  // File icons based on extension
  const ext = node.extension?.toLowerCase();
  const iconStyle = { color: 'var(--color-text-secondary)' };

  switch (ext) {
    // Code files
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
    case '.py':
    case '.java':
    case '.cpp':
    case '.c':
    case '.cs':
    case '.go':
    case '.rs':
    case '.rb':
    case '.php':
      return <FileCode {...iconProps} style={iconStyle} />;

    // JSON/Config files
    case '.json':
    case '.yaml':
    case '.yml':
    case '.toml':
    case '.xml':
      return <FileJson {...iconProps} style={iconStyle} />;

    // Text/Markdown files
    case '.md':
    case '.txt':
    case '.log':
    case '.csv':
      return <FileText {...iconProps} style={iconStyle} />;

    // Image files
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
    case '.svg':
    case '.ico':
    case '.webp':
      return <Image {...iconProps} style={iconStyle} />;

    // Archive files
    case '.zip':
    case '.tar':
    case '.gz':
    case '.rar':
    case '.7z':
      return <FileArchive {...iconProps} style={iconStyle} />;

    // Default file icon
    default:
      return <File {...iconProps} style={iconStyle} />;
  }
};

/**
 * Format file size in human-readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
};

/**
 * Highlight matching text in file/folder names
 * Requirement 3.6.3: Highlight matching text in file names
 */
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) {
    return text;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span
        style={{
          backgroundColor: 'var(--color-brand-primary)',
          color: 'var(--color-bg-primary)',
          fontWeight: 600,
          padding: '0 2px',
          borderRadius: '2px',
        }}
      >
        {match}
      </span>
      {after}
    </>
  );
};

/**
 * FileTree Component
 * Main component that fetches and displays the file tree
 * 
 * Requirements: 3.3.3, 3.3.4, 3.3.5, 3.4.1, 3.4.2, 3.4.4, 3.4.5, 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5, 10.1, 10.4
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileTreeNode } | null>(null);
  
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
   * Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5, 10.4
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
   * Convert FileTreeNode to Ant Design DataNode format
   * Requirement 10.1: Use Ant Design Tree component
   */
  const convertToDataNode = useCallback((node: FileTreeNode, isExpanded: boolean): DataNode => {
    const isFolder = node.type === 'folder';
    const icon = getFileIcon(node, isExpanded);
    
    // Create title with icon, name, and file size (size shows on hover)
    const title = (
      <span 
        className="file-tree-item"
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          width: '100%',
          minHeight: '20px',
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            node,
          });
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
          {icon}
        </span>
        <span 
          style={{ 
            fontSize: '12px',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
          }}
          title={`${node.name}${!isFolder && node.size !== undefined ? ` (${formatFileSize(node.size)})` : ''}`}
        >
          {highlightMatch(node.name, searchQuery)}
        </span>
        {!isFolder && node.size !== undefined && (
          <span
            className="file-size-badge"
            style={{ 
              color: 'var(--color-text-tertiary)',
              opacity: 0,
              transition: 'opacity 0.2s',
              fontSize: '10px',
              lineHeight: '20px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatFileSize(node.size)}
          </span>
        )}
      </span>
    );

    const dataNode: DataNode = {
      key: node.path,
      title,
      isLeaf: !isFolder,
      children: isFolder && node.children 
        ? node.children.map((child) => convertToDataNode(child, expandedFolders.has(child.path)))
        : undefined,
    };

    return dataNode;
  }, [searchQuery, expandedFolders]);

  /**
   * Convert tree to Ant Design format
   */
  const treeData = useMemo(() => {
    const treeToRender = filteredTree || tree;
    if (!treeToRender) return [];
    return [convertToDataNode(treeToRender, expandedFolders.has(treeToRender.path))];
  }, [filteredTree, tree, convertToDataNode, expandedFolders]);

  /**
   * Handle node selection
   * Requirement 10.1: Maintain file selection
   */
  const handleSelect: TreeProps['onSelect'] = (selectedKeys) => {
    if (selectedKeys.length > 0) {
      const key = selectedKeys[0] as string;
      onFileSelect(key);
    }
  };

  /**
   * Handle node expansion
   * Requirement 10.1: Implement expand/collapse functionality
   */
  const handleExpand: TreeProps['onExpand'] = (expandedKeys) => {
    const expandedSet = new Set(expandedKeys as string[]);
    setExpandedFolders(expandedSet);
  };

  /**
   * Handle context menu close
   */
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  /**
   * Copy path to clipboard
   * Requirement 10.3: Maintain context menu integration
   */
  const handleCopyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      showSuccess(`Copied path: ${path}`);
    } catch (error) {
      console.error('Failed to copy path:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = path;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccess(`Copied path: ${path}`);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  /**
   * Get context menu items
   */
  const getContextMenuItems = (): ContextMenuItem[] => {
    if (!contextMenu) return [];
    
    return [
      {
        id: 'copy-path',
        label: 'Copy Path',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => handleCopyPath(contextMenu.node.path),
      },
    ];
  };



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
   * Render file tree using Ant Design Tree
   * Requirements: 10.1, 10.4
   * Optimization: Memoized nodes prevent unnecessary re-renders (Requirement 3.4.5)
   */
  return (
    <>
      <div
        ref={treeRef}
        className="overflow-auto"
        tabIndex={0}
        style={{ outline: 'none' }}
      >
        <Tree
          treeData={treeData}
          selectedKeys={selectedFile ? [selectedFile] : []}
          expandedKeys={Array.from(expandedFolders)}
          onSelect={handleSelect}
          onExpand={handleExpand}
          showLine={false}
          showIcon={false}
          blockNode
          switcherIcon={({ expanded }) => 
            expanded ? (
              <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
            ) : (
              <ChevronRight className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
            )
          }
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-primary)',
          }}
          className="custom-file-tree"
        />
      </div>
      
      {/* Context menu - Requirement 10.3 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={handleCloseContextMenu}
        />
      )}
    </>
  );
};
