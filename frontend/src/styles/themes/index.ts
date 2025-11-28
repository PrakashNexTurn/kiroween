/**
 * Theme registry
 * Central export point for all available themes
 */

import type { Theme } from '../../types/theme.types';
import { lightTheme } from './light';
import { darkTheme } from './dark';
import { halloweenTheme } from './halloween';

/**
 * Registry of all available themes
 * New themes can be added here to make them available throughout the application
 */
export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  halloween: halloweenTheme,
  // Future themes can be added here:
  // highContrast: highContrastTheme,
  // solarized: solarizedTheme,
  // ocean: oceanTheme,
};

/**
 * Get a theme by name
 * @param themeName - Name of the theme to retrieve
 * @returns The theme object, or light theme as fallback
 */
export function getTheme(themeName: string): Theme {
  return themes[themeName] || themes.light;
}

/**
 * Get list of all available theme names
 * @returns Array of theme names
 */
export function getAvailableThemes(): string[] {
  return Object.keys(themes);
}

/**
 * Check if a theme name is valid
 * @param themeName - Name to check
 * @returns True if the theme exists
 */
export function isValidTheme(themeName: string): boolean {
  return themeName in themes;
}

// Export individual themes for direct import
export { lightTheme } from './light';
export { darkTheme } from './dark';
export { halloweenTheme } from './halloween';
