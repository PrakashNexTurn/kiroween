import React from 'react';

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
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  const heightStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  const variantStyles = {
    primary: 'bg-brand-primary',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-error',
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-sm font-medium text-text-secondary">
            {clampedPercentage}%
          </span>
        )}
      </div>
      <div
        className={`w-full bg-background-tertiary rounded-full overflow-hidden ${heightStyles[height]}`}
        role="progressbar"
        aria-valuenow={clampedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heightStyles[height]} ${variantStyles[variant]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
