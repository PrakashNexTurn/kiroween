/**
 * Light theme configuration
 * Provides a clean, professional light color scheme
 */

import type { Theme } from '../../types/theme.types';

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#E9ECEF',
    },
    text: {
      primary: '#003D7A', // Professional dark blue for primary text
      secondary: '#6C757D',
      tertiary: '#868E96', // Adjusted from #ADB5BD for better contrast (4.5:1 ratio)
      inverse: '#FFFFFF',
    },
    brand: {
      primary: '#0052A3', // Professional dark blue
      secondary: '#003D7A', // Darker blue for hover states
      accent: '#0066CC', // Lighter blue for accents
    },
    status: {
      success: '#28A745',
      warning: '#FFC107', // Amber for warnings
      error: '#DC3545',
      info: '#17A2B8',
    },
    phase: {
      init: '#0052A3', // Professional dark blue
      spec: '#003D7A', // Darker blue
      build: '#6C757D', // Gray
      test: '#17A2B8', // Cyan
      fix: '#DC3545', // Red
      complete: '#28A745', // Green
    },
    border: '#DEE2E6',
    hover: '#F8F9FA',
    active: '#E9ECEF',
    disabled: '#E9ECEF',
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
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
        rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
        hover: { scale: 1.02, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
      },
    },
  },
};
