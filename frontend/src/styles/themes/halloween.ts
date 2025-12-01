/**
 * Halloween theme configuration
 * Provides a spooky, festive Halloween color scheme with haunted fonts, animations, and glowing effects
 */

import type { Theme } from '../../types/theme.types';

export const halloweenTheme: Theme = {
  name: 'halloween',
  colors: {
    background: {
      primary: '#0A0508', // Deep black-purple
      secondary: '#1A0F1F', // Deep purple-black
      tertiary: '#2D1B3D', // Dark purple
    },
    text: {
      primary: '#FFE5B4', // Warm cream/peach
      secondary: '#D4A574', // Muted gold
      tertiary: '#A67C52', // Bronze
      inverse: '#0A0508',
    },
    brand: {
      primary: '#FF6B35', // Vibrant Halloween orange
      secondary: '#FF8C42', // Lighter orange
      accent: '#9D4EDD', // Purple accent
    },
    status: {
      success: '#7CB342', // Spooky green
      warning: '#FF9800', // Pumpkin orange
      error: '#D32F2F', // Blood red
      info: '#9D4EDD', // Purple
    },
    phase: {
      init: '#FF6B35', // Orange
      spec: '#9D4EDD', // Purple
      build: '#D4A574', // Gold
      test: '#7CB342', // Green
      fix: '#D32F2F', // Red
      complete: '#7CB342', // Green
    },
    border: '#4A2F5C',
    hover: '#3D2550',
    active: '#5A3F6C',
    disabled: '#2D1B3D',
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
      primary: "'Creepster', 'Griffy', 'Creepy', 'Spooky', 'Inter', system-ui, sans-serif",
      monospace: "'Courier Prime', 'Fira Code', 'Courier New', monospace",
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
    sm: '0 0 8px 0 rgba(255, 107, 53, 0.3)',
    base: '0 0 15px 0 rgba(255, 107, 53, 0.4), 0 0 8px 0 rgba(157, 78, 221, 0.3)',
    md: '0 0 20px -2px rgba(255, 107, 53, 0.5), 0 0 15px -4px rgba(157, 78, 221, 0.4)',
    lg: '0 0 30px -3px rgba(255, 107, 53, 0.5), 0 0 20px -2px rgba(157, 78, 221, 0.4)',
    xl: '0 0 40px -5px rgba(255, 107, 53, 0.6), 0 0 30px -5px rgba(157, 78, 221, 0.5)',
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
        rest: { scale: 1, boxShadow: '0 0 15px rgba(255, 107, 53, 0.3)' },
        hover: { scale: 1.02, boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)' },
      },
    },
  },
};
