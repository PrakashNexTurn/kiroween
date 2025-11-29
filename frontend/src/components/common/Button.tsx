import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, children, className = '', ...props }, ref) => {
    // Base styles with smooth transitions
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-base ease-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
    
    const variantStyles = {
      // Primary: Uses theme brand colors
      primary: 'bg-brand-primary text-text-inverse hover:bg-brand-secondary hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md focus:ring-brand-primary focus:ring-opacity-15 shadow-md',
      // Secondary: Background with brand border
      secondary: 'bg-background-primary text-brand-primary border-2 border-brand-primary hover:bg-brand-primary hover:text-text-inverse hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus:ring-brand-primary focus:ring-opacity-15',
      // Danger: Red for destructive actions
      danger: 'bg-status-error text-text-inverse hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md focus:ring-status-error focus:ring-opacity-15 shadow-md',
      // Ghost: Transparent with hover effect
      ghost: 'bg-transparent text-brand-primary hover:bg-hover focus:ring-brand-primary focus:ring-opacity-15',
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm h-10 rounded-lg',
      md: 'px-6 py-3 text-base h-12 rounded-xl',
      lg: 'px-8 py-4 text-lg h-14 rounded-xl',
    };
    
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
