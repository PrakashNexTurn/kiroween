/**
 * Project-related TypeScript type definitions
 * These types define the structure of project data throughout the application
 */

/**
 * Phase enum representing the lifecycle stage of a project
 */
export const Phase = {
  INIT: 'INIT',
  SPEC: 'SPEC',
  BUILD: 'BUILD',
  TEST: 'TEST',
  FIX: 'FIX',
  COMPLETE: 'COMPLETE',
} as const;

export type Phase = (typeof Phase)[keyof typeof Phase];

/**
 * Task statistics for a project
 */
export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}

/**
 * Build configuration for a project
 */
export interface BuildConfig {
  buildCommand: string | null;
  testCommand: string | null;
  language: string | null;
}

/**
 * Summary view of a project (used in project board cards)
 */
export interface ProjectSummary {
  projectId: string;
  name: string;
  description?: string;
  phase: Phase;
  completionPercentage: number;
  updatedAt?: string;
}

/**
 * Detailed project metadata (used in project detail view)
 */
export interface ProjectMetadata extends ProjectSummary {
  createdAt?: string;
  specGenerated?: {
    requirements: string | null;
    design: string | null;
    tasks: string | null;
  };
  taskStats: TaskStats;
  buildConfig?: BuildConfig;
  nextAction?: string;
}

/**
 * Individual task within a project
 */
export interface Task {
  number: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  isOptional: boolean;
  requirementsRefs: string[];
  parent: string | null;
  subtasks: string[];
}

/**
 * File tree node representing a file or folder
 */
export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  extension?: string | null;
  children?: FileTreeNode[];
}
