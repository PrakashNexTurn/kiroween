/**
 * Theme to Ant Design Configuration Utility
 * Converts custom theme objects to Ant Design ConfigProvider theme configuration
 */

import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import type { Theme } from '../types/theme.types';

/**
 * Convert custom Theme object to Ant Design ThemeConfig
 * Maps custom theme colors and settings to Ant Design's token system
 * 
 * @param theme - Custom theme object
 * @returns Ant Design ThemeConfig object
 */
export function themeToAntdConfig(theme: Theme): ThemeConfig {
  // Determine if this is a dark theme
  const isDark = theme.name === 'dark' || theme.name === 'halloween';

  return {
    // Use Ant Design's algorithm for dark/light mode
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    
    // Global design tokens
    token: {
      // Color tokens
      colorPrimary: theme.colors.brand.primary,
      colorSuccess: theme.colors.status.success,
      colorWarning: theme.colors.status.warning,
      colorError: theme.colors.status.error,
      colorInfo: theme.colors.status.info,
      colorTextBase: theme.colors.text.primary,
      colorBgBase: theme.colors.background.primary,
      colorBorder: theme.colors.border,
      
      // Typography tokens
      fontFamily: theme.typography.fontFamily.primary,
      fontSize: 16, // Base font size in pixels
      fontSizeHeading1: parseFloat(theme.typography.fontSize['4xl']) * 16,
      fontSizeHeading2: parseFloat(theme.typography.fontSize['3xl']) * 16,
      fontSizeHeading3: parseFloat(theme.typography.fontSize['2xl']) * 16,
      fontSizeHeading4: parseFloat(theme.typography.fontSize.xl) * 16,
      fontSizeHeading5: parseFloat(theme.typography.fontSize.lg) * 16,
      
      // Border radius
      borderRadius: parseFloat(theme.borderRadius.base) * 16,
      borderRadiusLG: parseFloat(theme.borderRadius.lg) * 16,
      borderRadiusSM: parseFloat(theme.borderRadius.sm) * 16,
      
      // Control height (buttons, inputs, etc.)
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      
      // Line height
      lineHeight: theme.typography.lineHeight.normal,
      
      // Motion
      motionDurationFast: theme.animations.duration.fast,
      motionDurationMid: theme.animations.duration.base,
      motionDurationSlow: theme.animations.duration.slow,
      motionEaseInOut: theme.animations.easing.easeInOut,
      motionEaseOut: theme.animations.easing.easeOut,
      
      // Spacing (using padding as base unit)
      padding: parseFloat(theme.spacing.md) * 16,
      paddingLG: parseFloat(theme.spacing.lg) * 16,
      paddingSM: parseFloat(theme.spacing.sm) * 16,
      paddingXS: parseFloat(theme.spacing.xs) * 16,
      
      // Box shadow
      boxShadow: theme.shadows.base,
      boxShadowSecondary: theme.shadows.sm,
    },
    
    // Component-specific tokens
    components: {
      Button: {
        primaryShadow: theme.shadows.sm,
        dangerShadow: theme.shadows.sm,
      },
      Card: {
        boxShadow: theme.shadows.base,
      },
      Modal: {
        contentBg: theme.colors.background.primary,
        headerBg: theme.colors.background.secondary,
      },
      Input: {
        activeBg: theme.colors.background.primary,
        hoverBg: theme.colors.hover,
      },
      Select: {
        optionActiveBg: theme.colors.active,
        optionSelectedBg: theme.colors.hover,
      },
      Menu: {
        itemBg: theme.colors.background.primary,
        itemHoverBg: theme.colors.hover,
        itemActiveBg: theme.colors.active,
      },
      Tree: {
        nodeHoverBg: theme.colors.hover,
        nodeSelectedBg: theme.colors.active,
      },
      Notification: {
        colorBgElevated: theme.colors.background.secondary,
      },
      Message: {
        contentBg: theme.colors.background.secondary,
      },
    },
  };
}
