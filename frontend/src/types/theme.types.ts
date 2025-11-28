/**
 * Theme system TypeScript type definitions
 * These types define the structure of the theming system
 */

/**
 * Background color variants
 */
export interface ThemeBackgroundColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

/**
 * Text color variants
 */
export interface ThemeTextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
}

/**
 * Brand color variants
 */
export interface ThemeBrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

/**
 * Status color variants
 */
export interface ThemeStatusColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Phase-specific colors
 */
export interface ThemePhaseColors {
  init: string;
  spec: string;
  build: string;
  test: string;
  fix: string;
  complete: string;
}

/**
 * Complete color palette for a theme
 */
export interface ThemeColors {
  background: ThemeBackgroundColors;
  text: ThemeTextColors;
  brand: ThemeBrandColors;
  status: ThemeStatusColors;
  phase: ThemePhaseColors;
  border: string;
  hover: string;
  active: string;
  disabled: string;
}

/**
 * Spacing scale configuration
 */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

/**
 * Typography configuration
 */
export interface ThemeTypography {
  fontFamily: {
    primary: string;
    monospace: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

/**
 * Shadow variants
 */
export interface ThemeShadows {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Border radius variants
 */
export interface ThemeBorderRadius {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

/**
 * Animation duration configuration
 */
export interface ThemeAnimationDuration {
  fast: string;
  base: string;
  slow: string;
  slower: string;
}

/**
 * Animation easing functions
 */
export interface ThemeAnimationEasing {
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  spring: string;
}

/**
 * Framer Motion animation variants
 */
export interface ThemeAnimationVariants {
  fadeIn: {
    initial: { opacity: number };
    animate: { opacity: number };
    exit: { opacity: number };
  };
  slideUp: {
    initial: { opacity: number; y: number };
    animate: { opacity: number; y: number };
    exit: { opacity: number; y: number };
  };
  scaleIn: {
    initial: { opacity: number; scale: number };
    animate: { opacity: number; scale: number };
    exit: { opacity: number; scale: number };
  };
  cardHover: {
    rest: { scale: number; boxShadow: string };
    hover: { scale: number; boxShadow: string };
  };
}

/**
 * Complete animation configuration
 */
export interface ThemeAnimations {
  duration: ThemeAnimationDuration;
  easing: ThemeAnimationEasing;
  variants: ThemeAnimationVariants;
}

/**
 * Complete theme configuration
 */
export interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  animations: ThemeAnimations;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  currentTheme: string;
  theme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}
