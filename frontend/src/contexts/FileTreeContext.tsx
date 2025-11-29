/**
 * FileTreeContext
 * Provides cached file tree state across components
 * 
 * Optimization: Cache tree state to avoid unnecessary re-fetches
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FileTreeNode } from '../types/project.types';

interface FileTreeCache {
  [projectId: string]: {
    tree: FileTreeNode;
    timestamp: number;
    expandedFolders: Set<string>;
  };
}

interface FileTreeContextValue {
  getTreeCache: (projectId: string) => FileTreeNode | null;
  setTreeCache: (projectId: string, tree: FileTreeNode) => void;
  getExpandedFolders: (projectId: string) => Set<string>;
  setExpandedFolders: (projectId: string, folders: Set<string>) => void;
  clearCache: (projectId?: string) => void;
}

const FileTreeContext = createContext<FileTreeContextValue | undefined>(undefined);

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function FileTreeProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<FileTreeCache>({});

  const getTreeCache = useCallback((projectId: string): FileTreeNode | null => {
    const cached = cache[projectId];
    if (!cached) return null;

    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > CACHE_TTL) {
      // Cache expired
      return null;
    }

    return cached.tree;
  }, [cache]);

  const setTreeCache = useCallback((projectId: string, tree: FileTreeNode) => {
    setCache((prev) => ({
      ...prev,
      [projectId]: {
        tree,
        timestamp: Date.now(),
        expandedFolders: prev[projectId]?.expandedFolders || new Set(),
      },
    }));
  }, []);

  const getExpandedFolders = useCallback((projectId: string): Set<string> => {
    return cache[projectId]?.expandedFolders || new Set();
  }, [cache]);

  const setExpandedFolders = useCallback((projectId: string, folders: Set<string>) => {
    setCache((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        tree: prev[projectId]?.tree,
        timestamp: prev[projectId]?.timestamp || Date.now(),
        expandedFolders: folders,
      },
    }));
  }, []);

  const clearCache = useCallback((projectId?: string) => {
    if (projectId) {
      setCache((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    } else {
      setCache({});
    }
  }, []);

  const value: FileTreeContextValue = {
    getTreeCache,
    setTreeCache,
    getExpandedFolders,
    setExpandedFolders,
    clearCache,
  };

  return (
    <FileTreeContext.Provider value={value}>
      {children}
    </FileTreeContext.Provider>
  );
}

export function useFileTreeContext() {
  const context = useContext(FileTreeContext);
  if (!context) {
    throw new Error('useFileTreeContext must be used within FileTreeProvider');
  }
  return context;
}
