/**
 * Dark theme configuration
 * Provides a modern, eye-friendly dark color scheme
 */

import type { Theme } from '../../types/theme.types';

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: '#1A1D23',
      secondary: '#22252B',
      tertiary: '#2A2D35',
    },
    text: {
      primary: '#E9ECEF',
      secondary: '#ADB5BD',
      tertiary: '#868E96', // Adjusted from #6C757D for better contrast (4.5:1 ratio)
      inverse: '#212529',
    },
    brand: {
      primary: '#4A9EFF', // Bright blue for dark mode
      secondary: '#3A8EEF', // Slightly darker blue
      accent: '#66B2FF', // Lighter blue accent
    },
    status: {
      success: '#3DD365', // Bright green
      warning: '#FFD93D', // Bright amber
      error: '#FF5757', // Bright red
      info: '#4ECDC4', // Bright cyan
    },
    phase: {
      init: '#4A9EFF', // Bright blue
      spec: '#3A8EEF', // Slightly darker blue
      build: '#ADB5BD', // Gray
      test: '#4ECDC4', // Cyan
      fix: '#FF5757', // Red
      complete: '#3DD365', // Green
    },
    border: '#3A3D45',
    hover: '#2A2D35',
    active: '#32353D',
    disabled: '#2A2D35',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  typography: {
    fontFamily: {
      primary: "'Inter', system-ui, sans-serif",
      monospace: "'Fira Code', 'Courier New', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  },
  borderRadius: {
    sm: '0.25rem',
    base: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  animations: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    variants: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      },
      cardHover: {
        rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
        hover: { scale: 1.02, boxShadow: '0 10px 15px rgba(0,0,0,0.3)' },
      },
    },
  },
};
