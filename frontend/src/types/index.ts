/**
 * Central export point for all TypeScript type definitions
 * Import types from this file throughout the application
 */

// Project types
export {
  Phase,
  type ProjectSummary,
  type ProjectMetadata,
  type Task,
  type TaskStats,
  type BuildConfig,
  type Phase as PhaseType,
} from './project.types';

// API types
export type {
  ApiResponse,
  ApiError,
  CreateProjectRequest,
  UpdateSpecFileRequest,
  GenerateSpecRequest,
  ExecuteTaskRequest,
  FixProjectRequest,
  SpecFileResponse,
} from './api.types';

// Theme types
export type {
  Theme,
  ThemeColors,
  ThemeBackgroundColors,
  ThemeTextColors,
  ThemeBrandColors,
  ThemeStatusColors,
  ThemePhaseColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeShadows,
  ThemeBorderRadius,
  ThemeAnimations,
  ThemeAnimationDuration,
  ThemeAnimationEasing,
  ThemeAnimationVariants,
  ThemeContextValue,
} from './theme.types';
