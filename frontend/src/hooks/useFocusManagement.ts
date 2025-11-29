/**
 * useFocusManagement Hook
 * 
 * Provides utilities for managing focus in accessible components
 * Requirement 3.7.3: Focus management for accessibility
 */

import { useEffect, useRef, useCallback } from 'react';

export interface UseFocusManagementOptions {
  /**
   * Whether to trap focus within the container
   */
  trapFocus?: boolean;
  
  /**
   * Whether to restore focus to the trigger element when unmounting
   */
  restoreFocus?: boolean;
  
  /**
   * Whether to auto-focus the first focusable element
   */
  autoFocus?: boolean;
  
  /**
   * Callback when focus leaves the container
   */
  onFocusLeave?: () => void;
}

/**
 * Hook for managing focus in accessible components
 * 
 * Features:
 * - Focus trapping for modals and dialogs
 * - Focus restoration when components unmount
 * - Auto-focus first element
 * - Focus leave detection
 */
export function useFocusManagement(options: UseFocusManagementOptions = {}) {
  const {
    trapFocus = false,
    restoreFocus = false,
    autoFocus = false,
    onFocusLeave,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  /**
   * Get all focusable elements within a container
   */
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  }, []);

  /**
   * Focus the first focusable element in the container
   */
  const focusFirstElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  /**
   * Focus the last focusable element in the container
   */
  const focusLastElement = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  /**
   * Handle Tab key for focus trapping
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!trapFocus || !containerRef.current) return;
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab on first element -> focus last element
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [trapFocus, getFocusableElements]
  );

  /**
   * Handle focus leaving the container
   */
  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      if (!containerRef.current || !onFocusLeave) return;

      // Check if focus moved outside the container
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      if (relatedTarget && !containerRef.current.contains(relatedTarget)) {
        onFocusLeave();
      }
    },
    [onFocusLeave]
  );

  /**
   * Set up focus management on mount
   */
  useEffect(() => {
    // Store the currently focused element
    if (restoreFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Auto-focus first element
    if (autoFocus) {
      // Use setTimeout to ensure the component is fully rendered
      const timeoutId = setTimeout(() => {
        focusFirstElement();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [autoFocus, restoreFocus, focusFirstElement]);

  /**
   * Set up event listeners for focus trapping
   */
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focusout', handleFocusOut);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focusout', handleFocusOut);
    };
  }, [trapFocus, handleKeyDown, handleFocusOut]);

  /**
   * Restore focus on unmount
   */
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        // Use setTimeout to ensure the component is fully unmounted
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    };
  }, [restoreFocus]);

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
    getFocusableElements,
  };
}
