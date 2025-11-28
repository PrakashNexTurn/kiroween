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
    // Professional styling: 48px height, 12px border-radius, 16px font, weight 600
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
    
    const variantStyles = {
      // Primary: Dark blue (#0052A3) background, white text
      primary: 'bg-[#0052A3] text-white hover:bg-[#003D7A] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,82,163,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(0,82,163,0.3)] focus:ring-[rgba(0,82,163,0.15)] shadow-[0_4px_12px_rgba(0,82,163,0.3)]',
      // Secondary: White background, dark blue border (2px), dark blue text
      secondary: 'bg-white text-[#0052A3] border-2 border-[#0052A3] hover:bg-[#0052A3] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,82,163,0.25)] active:translate-y-0 focus:ring-[rgba(0,82,163,0.15)]',
      // Danger: Red for destructive actions
      danger: 'bg-[#DC3545] text-white hover:bg-[#C82333] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(220,53,69,0.4)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(220,53,69,0.3)] focus:ring-[rgba(220,53,69,0.15)] shadow-[0_4px_12px_rgba(220,53,69,0.3)]',
      // Ghost: Transparent with hover effect
      ghost: 'bg-transparent text-[#0052A3] hover:bg-[#F8F9FA] focus:ring-[rgba(0,82,163,0.15)]',
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm h-10 rounded-lg',
      md: 'px-6 py-3 text-base h-12 rounded-xl', // 48px height, 12px border-radius, 16px font
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
