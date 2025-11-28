/**
 * useKeyboard Hook
 * Custom hook for handling keyboard shortcuts
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */

import { useEffect } from 'react';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** The key to listen for (e.g., 'n', 'Escape', '/') */
  key: string;
  /** Whether Ctrl (or Cmd on Mac) must be pressed */
  ctrl?: boolean;
  /** Whether Shift must be pressed */
  shift?: boolean;
  /** Whether Alt must be pressed */
  alt?: boolean;
  /** Callback function to execute when shortcut is triggered */
  callback: () => void;
  /** Optional description for documentation */
  description?: string;
}

/**
 * Hook to handle keyboard shortcuts
 * 
 * Automatically prevents shortcuts from triggering when user is typing in input fields.
 * Cleans up event listeners on unmount.
 * 
 * @param shortcuts - Array of keyboard shortcut configurations
 * 
 * @example
 * ```tsx
 * useKeyboard([
 *   {
 *     key: 'n',
 *     callback: () => openCreateModal(),
 *     description: 'Open new project modal'
 *   },
 *   {
 *     key: 'Escape',
 *     callback: () => closeModal(),
 *     description: 'Close modal'
 *   },
 *   {
 *     key: 's',
 *     ctrl: true,
 *     callback: () => saveFile(),
 *     description: 'Save file'
 *   }
 * ]);
 * ```
 */
export function useKeyboard(shortcuts: KeyboardShortcut[]): void {
  useEffect(() => {
    /**
     * Check if the user is currently typing in an input field
     * Prevents shortcuts from triggering during text input
     */
    const isTypingInInput = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) {
        return false;
      }

      const tagName = target.tagName.toLowerCase();
      const isContentEditable = target.isContentEditable;

      return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        isContentEditable
      );
    };

    /**
     * Handle keydown events and match against registered shortcuts
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Don't trigger shortcuts when typing in input fields
      if (isTypingInInput(event.target)) {
        return;
      }

      // Check each shortcut for a match
      for (const shortcut of shortcuts) {
        // Check if the key matches (case-insensitive)
        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (!keyMatches) {
          continue;
        }

        // Check modifier keys
        // Ctrl key check (handles both Ctrl and Cmd on Mac)
        const ctrlMatch = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;

        const shiftMatch = shortcut.shift
          ? event.shiftKey
          : !event.shiftKey;

        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        // If all conditions match, execute the callback
        if (ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.callback();
          break; // Stop checking after first match
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount or when shortcuts change
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
