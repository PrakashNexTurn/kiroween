/**
 * Theme Context and Provider
 * Manages theme state and provides theme switching functionality
 */

import { createContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ThemeContextValue } from '../types/theme.types';
import { themes, getTheme, getAvailableThemes } from '../styles/themes';

/**
 * Theme context - provides theme state to all components
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

/**
 * Local storage key for theme persistence
 */
const THEME_STORAGE_KEY = 'kiro-theme';

/**
 * Default theme name
 */
const DEFAULT_THEME = 'light';

/**
 * Apply theme to document root by injecting CSS variables
 * @param theme - Theme object to apply
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Apply background colors
  root.style.setProperty(
    '--color-bg-primary',
    theme.colors.background.primary
  );
  root.style.setProperty(
    '--color-bg-secondary',
    theme.colors.background.secondary
  );
  root.style.setProperty(
    '--color-bg-tertiary',
    theme.colors.background.tertiary
  );

  // Apply text colors
  root.style.setProperty('--color-text-primary', theme.colors.text.primary);
  root.style.setProperty(
    '--color-text-secondary',
    theme.colors.text.secondary
  );
  root.style.setProperty('--color-text-tertiary', theme.colors.text.tertiary);
  root.style.setProperty('--color-text-inverse', theme.colors.text.inverse);

  // Apply brand colors
  root.style.setProperty('--color-brand-primary', theme.colors.brand.primary);
  root.style.setProperty(
    '--color-brand-secondary',
    theme.colors.brand.secondary
  );
  root.style.setProperty('--color-brand-accent', theme.colors.brand.accent);

  // Apply status colors
  root.style.setProperty(
    '--color-status-success',
    theme.colors.status.success
  );
  root.style.setProperty(
    '--color-status-warning',
    theme.colors.status.warning
  );
  root.style.setProperty('--color-status-error', theme.colors.status.error);
  root.style.setProperty('--color-status-info', theme.colors.status.info);

  // Apply phase colors
  root.style.setProperty('--color-phase-init', theme.colors.phase.init);
  root.style.setProperty('--color-phase-spec', theme.colors.phase.spec);
  root.style.setProperty('--color-phase-build', theme.colors.phase.build);
  root.style.setProperty('--color-phase-test', theme.colors.phase.test);
  root.style.setProperty('--color-phase-fix', theme.colors.phase.fix);
  root.style.setProperty(
    '--color-phase-complete',
    theme.colors.phase.complete
  );

  // Apply UI element colors
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-hover', theme.colors.hover);
  root.style.setProperty('--color-active', theme.colors.active);
  root.style.setProperty('--color-disabled', theme.colors.disabled);

  // Apply dark mode class for Tailwind
  // Both dark and halloween themes use dark mode styling
  if (theme.name === 'dark' || theme.name === 'halloween') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Add smooth transition for theme switching
  // This ensures all color changes animate smoothly
  root.style.setProperty(
    'transition',
    'background-color 0.3s ease-in-out, color 0.3s ease-in-out, border-color 0.3s ease-in-out'
  );
}

/**
 * Get stored theme from localStorage
 * @returns Stored theme name or default theme
 */
function getStoredTheme(): string {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && stored in themes) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return DEFAULT_THEME;
}

/**
 * Store theme to localStorage
 * @param themeName - Theme name to store
 */
function storeTheme(themeName: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
  } catch (error) {
    console.warn('Failed to store theme to localStorage:', error);
  }
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Wraps the application and provides theme context
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage or default
  const [currentTheme, setCurrentTheme] = useState<string>(() =>
    getStoredTheme()
  );

  // Get the actual theme object - memoize to ensure proper re-renders
  const theme = useMemo(() => getTheme(currentTheme), [currentTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /**
   * Set theme and persist to localStorage
   * @param themeName - Name of theme to set
   */
  const setTheme = (themeName: string): void => {
    if (themeName in themes) {
      setCurrentTheme(themeName);
      storeTheme(themeName);
    } else {
      console.warn(`Theme "${themeName}" not found, using default theme`);
      setCurrentTheme(DEFAULT_THEME);
      storeTheme(DEFAULT_THEME);
    }
  };

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      currentTheme,
      theme,
      setTheme,
      availableThemes: getAvailableThemes(),
    }),
    [currentTheme, theme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
