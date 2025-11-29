/**
 * FileTreeNode Component
 * Renders individual tree nodes recursively with proper indentation
 * 
 * Requirements: 3.4.1, 3.4.3
 */

import React, { useState } from 'react';
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
import { ContextMenu, type ContextMenuItem } from '../common/ContextMenu';
import { showSuccess } from '../common/Toast';
import type { FileTreeNode as FileTreeNodeType } from '../../types/project.types';

/**
 * Props for FileTreeNode component
 */
export interface FileTreeNodeProps {
  node: FileTreeNodeType;
  level: number;
  onFileSelect: (filePath: string) => void;
  selectedFile: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  searchQuery?: string;
}

/**
 * Get icon component based on file type/extension
 * Requirement 3.4.3: Add file type icons
 */
const getFileIcon = (node: FileTreeNodeType, isExpanded: boolean) => {
  const iconProps = {
    className: 'w-4 h-4 flex-shrink-0',
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
const highlightMatch = (text: string, query: string, isSelected: boolean): React.ReactNode => {
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
          backgroundColor: isSelected
            ? 'rgba(255, 255, 255, 0.3)'
            : 'var(--color-brand-primary)',
          color: isSelected ? 'var(--color-bg-primary)' : 'var(--color-bg-primary)',
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
 * FileTreeNode Component
 * Renders a single node in the file tree with recursive children
 * 
 * Features:
 * - Recursive rendering with proper indentation (Requirement 3.4.1)
 * - File type icons (Requirement 3.4.3)
 * - Click event handling for folders and files (Requirement 3.4.1)
 * - Context menu with "Copy Path" action (Requirement 3.4.1)
 * - Keyboard navigation support
 * - Accessibility features (ARIA labels, roles)
 */
export const FileTreeNodeComponent: React.FC<FileTreeNodeProps> = ({
  node,
  level,
  onFileSelect,
  selectedFile,
  expandedFolders,
  onToggleFolder,
  searchQuery = '',
}) => {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;
  const hasChildren = isFolder && node.children && node.children.length > 0;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  /**
   * Handle click on node
   * Requirement 3.4.1: Handle click events
   * - Expands/collapses folders
   * - Selects files
   */
  const handleClick = () => {
    if (isFolder) {
      onToggleFolder(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  /**
   * Handle keyboard events for accessibility
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  /**
   * Handle right-click to show context menu
   * Requirement 3.4.1: Handle right-click events
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  /**
   * Close context menu
   */
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  /**
   * Copy path to clipboard
   * Requirement 3.4.1: Add "Copy Path" action
   */
  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(node.path);
      showSuccess(`Copied path: ${node.path}`);
    } catch (error) {
      console.error('Failed to copy path:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = node.path;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showSuccess(`Copied path: ${node.path}`);
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
    return [
      {
        id: 'copy-path',
        label: 'Copy Path',
        icon: <Copy className="w-4 h-4" />,
        onClick: handleCopyPath,
      },
    ];
  };

  /**
   * Get chevron icon for folders with children
   */
  const getChevron = () => {
    if (!isFolder || !hasChildren) return null;

    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
    return (
      <ChevronIcon
        className="w-3 h-3 flex-shrink-0"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-hidden="true"
      />
    );
  };

  return (
    <div role="treeitem" aria-expanded={isFolder ? isExpanded : undefined}>
      {/* Node content with proper indentation */}
      <div
        className="flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-opacity-10 rounded transition-colors"
        style={{
          paddingLeft: `${level * 16 + 8}px`, // Requirement 3.4.1: Proper indentation
          backgroundColor: isSelected
            ? 'var(--color-brand-primary)'
            : 'transparent',
          color: isSelected
            ? 'var(--color-bg-primary)'
            : 'var(--color-text-primary)',
        }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        role="button"
        aria-label={`${isFolder ? 'Folder' : 'File'}: ${node.name}`}
      >
        {/* Chevron for expandable folders */}
        <div className="w-3 flex items-center justify-center">
          {getChevron()}
        </div>

        {/* File/Folder icon - Requirement 3.4.3 */}
        {getFileIcon(node, isExpanded)}

        {/* Node name with highlighting - Requirement 3.6.3 */}
        <span
          className="text-sm truncate flex-1"
          title={node.name}
          style={{
            color: isSelected
              ? 'var(--color-bg-primary)'
              : 'var(--color-text-primary)',
          }}
        >
          {highlightMatch(node.name, searchQuery, isSelected)}
        </span>

        {/* File size for files */}
        {!isFolder && node.size !== undefined && (
          <span
            className="text-xs ml-auto flex-shrink-0"
            style={{
              color: isSelected
                ? 'var(--color-bg-primary)'
                : 'var(--color-text-secondary)',
            }}
          >
            {formatFileSize(node.size)}
          </span>
        )}
      </div>

      {/* Recursive children rendering - Requirement 3.4.1 */}
      {isFolder && isExpanded && hasChildren && (
        <div role="group">
          {node.children!.map((child) => (
            <FileTreeNodeComponent
              key={child.path}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* Context menu - Requirement 3.4.1 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

// Export as FileTreeNode for external use
export const FileTreeNode = FileTreeNodeComponent;
