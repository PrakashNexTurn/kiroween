/**
 * Navigation Utilities
 * Type-safe navigation helpers and route definitions
 */

import { useNavigate as useRouterNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Route paths
 * Centralized route definitions for type-safe navigation
 */
export const ROUTES = {
  HOME: '/',
  PROJECT_DETAIL: (projectId: string) => `/projects/${projectId}`,
} as const;

/**
 * Type-safe navigation hook
 * Wraps React Router's useNavigate with type-safe route helpers
 */
export function useNavigation() {
  const navigate = useRouterNavigate();
  const location = useLocation();

  const goToHome = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  const goToProjectDetail = useCallback(
    (projectId: string) => {
      navigate(ROUTES.PROJECT_DETAIL(projectId));
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  return {
    navigate,
    goToHome,
    goToProjectDetail,
    goBack,
    goForward,
    currentPath: location.pathname,
    location,
  };
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

/**
 * Generate breadcrumbs from current location
 * Parses the current path and generates breadcrumb items
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      path: ROUTES.HOME,
      isActive: pathSegments.length === 0,
    },
  ];

  // Build breadcrumbs from path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Handle specific routes
    if (segment === 'projects' && pathSegments[index + 1]) {
      // Skip the 'projects' segment, we'll use the project ID
      return;
    }

    // For project detail pages
    if (pathSegments[index - 1] === 'projects') {
      breadcrumbs.push({
        label: `Project: ${segment}`,
        path: currentPath,
        isActive: isLast,
      });
    } else {
      // Generic segment
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath,
        isActive: isLast,
      });
    }
  });

  return breadcrumbs;
}
