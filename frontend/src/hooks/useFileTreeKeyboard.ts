/**
 * useFileTreeKeyboard Hook
 * Manages keyboard navigation for the file tree
 * 
 * Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
 */

import { useEffect, useCallback, useRef } from 'react';
import type { FileTreeNode } from '../types/project.types';

export interface UseFileTreeKeyboardProps {
  tree: FileTreeNode | null;
  expandedFolders: Set<string>;
  selectedFile: string | null;
  onFileSelect: (filePath: string) => void;
  onToggleFolder: (path: string) => void;
  onFocusSearch: () => void;
}

/**
 * Flatten tree into a navigable list
 */
const flattenTree = (
  node: FileTreeNode,
  expandedFolders: Set<string>,
  result: FileTreeNode[] = []
): FileTreeNode[] => {
  result.push(node);

  if (node.type === 'folder' && expandedFolders.has(node.path) && node.children) {
    node.children.forEach((child) => {
      flattenTree(child, expandedFolders, result);
    });
  }

  return result;
};

/**
 * Custom hook for file tree keyboard navigation
 */
export const useFileTreeKeyboard = ({
  tree,
  expandedFolders,
  selectedFile,
  onFileSelect,
  onToggleFolder,
  onFocusSearch,
}: UseFileTreeKeyboardProps) => {
  const treeRef = useRef<HTMLDivElement>(null);

  /**
   * Get flat list of visible nodes
   */
  const getFlatNodes = useCallback((): FileTreeNode[] => {
    if (!tree) return [];
    return flattenTree(tree, expandedFolders);
  }, [tree, expandedFolders]);

  /**
   * Get current focused node index
   */
  const getCurrentIndex = useCallback((): number => {
    const flatNodes = getFlatNodes();
    if (!selectedFile) return 0;
    return flatNodes.findIndex((node) => node.path === selectedFile);
  }, [getFlatNodes, selectedFile]);

  /**
   * Handle keyboard navigation
   * Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Requirement 3.7.5: Ctrl+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onFocusSearch();
        return;
      }

      // Only handle navigation keys if tree has focus
      if (!treeRef.current?.contains(document.activeElement)) {
        return;
      }

      const flatNodes = getFlatNodes();
      if (flatNodes.length === 0) return;

      const currentIndex = getCurrentIndex();
      const currentNode = currentIndex >= 0 ? flatNodes[currentIndex] : null;

      switch (e.key) {
        // Requirement 3.7.1: Arrow Up/Down for navigation
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : flatNodes.length - 1;
          const prevNode = flatNodes[prevIndex];
          onFileSelect(prevNode.path);
          break;
        }

        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < flatNodes.length - 1 ? currentIndex + 1 : 0;
          const nextNode = flatNodes[nextIndex];
          onFileSelect(nextNode.path);
          break;
        }

        // Requirement 3.7.2: Arrow Right to expand folder
        case 'ArrowRight': {
          e.preventDefault();
          if (currentNode && currentNode.type === 'folder') {
            if (!expandedFolders.has(currentNode.path)) {
              onToggleFolder(currentNode.path);
            } else if (currentNode.children && currentNode.children.length > 0) {
              // If already expanded, move to first child
              const nextIndex = currentIndex + 1;
              if (nextIndex < flatNodes.length) {
                onFileSelect(flatNodes[nextIndex].path);
              }
            }
          }
          break;
        }

        // Requirement 3.7.3: Arrow Left to collapse folder
        case 'ArrowLeft': {
          e.preventDefault();
          if (currentNode && currentNode.type === 'folder') {
            if (expandedFolders.has(currentNode.path)) {
              onToggleFolder(currentNode.path);
            } else {
              // If already collapsed, move to parent
              const parentPath = currentNode.path.split('/').slice(0, -1).join('/');
              const parentNode = flatNodes.find((node) => node.path === parentPath);
              if (parentNode) {
                onFileSelect(parentNode.path);
              }
            }
          } else if (currentNode) {
            // For files, move to parent folder
            const parentPath = currentNode.path.split('/').slice(0, -1).join('/');
            const parentNode = flatNodes.find((node) => node.path === parentPath);
            if (parentNode) {
              onFileSelect(parentNode.path);
            }
          }
          break;
        }

        // Requirement 3.7.4: Enter to open file
        case 'Enter': {
          e.preventDefault();
          if (currentNode) {
            if (currentNode.type === 'folder') {
              onToggleFolder(currentNode.path);
            } else {
              onFileSelect(currentNode.path);
            }
          }
          break;
        }

        // Space bar as alternative to Enter
        case ' ': {
          e.preventDefault();
          if (currentNode) {
            if (currentNode.type === 'folder') {
              onToggleFolder(currentNode.path);
            } else {
              onFileSelect(currentNode.path);
            }
          }
          break;
        }

        // Home key - go to first node
        case 'Home': {
          e.preventDefault();
          if (flatNodes.length > 0) {
            onFileSelect(flatNodes[0].path);
          }
          break;
        }

        // End key - go to last node
        case 'End': {
          e.preventDefault();
          if (flatNodes.length > 0) {
            onFileSelect(flatNodes[flatNodes.length - 1].path);
          }
          break;
        }

        default:
          break;
      }
    },
    [
      getFlatNodes,
      getCurrentIndex,
      expandedFolders,
      onFileSelect,
      onToggleFolder,
      onFocusSearch,
    ]
  );

  /**
   * Attach keyboard event listener
   */
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return { treeRef };
};
