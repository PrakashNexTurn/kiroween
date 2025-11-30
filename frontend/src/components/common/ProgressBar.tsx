import React from 'react';
import { Progress } from 'antd';
import type { ProgressProps as AntProgressProps } from 'antd';
import { useTheme } from '../../hooks/useTheme';

export interface ProgressBarProps {
  percentage: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  variant = 'primary',
  showLabel = true,
  height = 'md',
  className = '',
}) => {
  const { theme } = useTheme();

  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  // Map variant to color
  const getStrokeColor = (): string => {
    const colorMap: Record<string, string> = {
      primary: theme.colors.brand.primary,
      success: theme.colors.status.success,
      warning: theme.colors.status.warning,
      danger: theme.colors.status.error,
    };
    return colorMap[variant];
  };

  // Map height to stroke width
  const strokeWidth = height === 'sm' ? 4 : height === 'lg' ? 12 : 8;

  const progressProps: AntProgressProps = {
    percent: clampedPercentage,
    strokeColor: getStrokeColor(),
    trailColor: theme.colors.background.tertiary,
    showInfo: showLabel,
    strokeWidth,
    className,
  };

  return <Progress {...progressProps} />;
};
