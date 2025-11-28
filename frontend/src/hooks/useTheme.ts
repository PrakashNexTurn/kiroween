/**
 * useTheme Hook
 * Custom hook to access theme context
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeContextValue } from '../types/theme.types';

/**
 * Hook to access theme context
 * @returns Theme context value with current theme, theme object, setTheme function, and available themes
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
        'Make sure your component is wrapped with <ThemeProvider>.'
    );
  }

  return context;
}
