import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color,
  className = '',
  label = 'Loading...',
}) => {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const colorStyles = color ? '' : 'text-brand-primary';
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status">
      <Loader2
        className={`${sizeStyles[size]} ${colorStyles} animate-spin`}
        style={color ? { color } : undefined}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};
