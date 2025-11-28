/**
 * Application Constants
 * Centralized configuration for the application
 * Requirements: 13.1
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const APP_NAME = 'Kiro Project Orchestrator';

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:projectId',
  NOT_FOUND: '*',
} as const;

export const STORAGE_KEYS = {
  THEME: 'kiro-theme',
} as const;

export const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds
