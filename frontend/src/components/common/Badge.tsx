import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd';
import { Phase } from '../../types/project.types';
import { useTheme } from '../../hooks/useTheme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: Phase | 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  customColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  customColor,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  // Map variant to Ant Design color
  const getColor = (): string | undefined => {
    if (customColor) return customColor;

    const colorMap: Record<string, string> = {
      // Phase variants - use theme colors
      INIT: theme.colors.phase.init,
      SPEC: theme.colors.phase.spec,
      BUILD: theme.colors.phase.build,
      TEST: theme.colors.phase.test,
      FIX: theme.colors.phase.fix,
      COMPLETE: theme.colors.phase.complete,
      
      // Status variants
      success: theme.colors.status.success,
      warning: theme.colors.status.warning,
      error: theme.colors.status.error,
      info: theme.colors.status.info,
      default: theme.colors.background.tertiary,
    };

    return colorMap[variant];
  };

  const tagProps: TagProps = {
    color: getColor(),
    className,
    style: {
      fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
      padding: size === 'sm' ? '2px 8px' : size === 'lg' ? '6px 16px' : '4px 12px',
      borderRadius: '9999px', // Full rounded
    },
  };

  return (
    <Tag {...tagProps} {...props}>
      {children}
    </Tag>
  );
};
