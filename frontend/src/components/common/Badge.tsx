import React from 'react';
import { Phase } from '../../types/project.types';

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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const variantStyles = {
    // Phase variants
    INIT: 'bg-phase-init text-text-inverse',
    SPEC: 'bg-phase-spec text-text-inverse',
    BUILD: 'bg-phase-build text-text-inverse',
    TEST: 'bg-phase-test text-text-inverse',
    FIX: 'bg-phase-fix text-text-inverse',
    COMPLETE: 'bg-phase-complete text-text-inverse',
    
    // Status variants
    success: 'bg-status-success text-text-inverse',
    warning: 'bg-status-warning text-text-primary',
    error: 'bg-status-error text-text-inverse',
    info: 'bg-status-info text-text-inverse',
    default: 'bg-background-tertiary text-text-primary',
  };
  
  const combinedClassName = customColor
    ? `${baseStyles} ${sizeStyles[size]} ${className}`
    : `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
  
  return (
    <span
      className={combinedClassName}
      style={customColor ? { backgroundColor: customColor, color: '#fff' } : undefined}
      {...props}
    >
      {children}
    </span>
  );
};
