import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, disabled, className = '', id, options, size = 'md', ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    
    // Professional styling: 48px height, 12px border-radius, 2px dark blue border
    const baseStyles = 'w-full px-4 py-3 text-base rounded-xl transition-all duration-200 focus:outline-none appearance-none bg-no-repeat shadow-[0_2px_8px_rgba(0,82,163,0.15)] cursor-pointer';
    const normalStyles = 'border-2 border-[#0052A3] bg-white text-[#003D7A] hover:border-[#003D7A] hover:shadow-[0_4px_12px_rgba(0,82,163,0.25)] focus:border-[#003D7A] focus:ring-4 focus:ring-[rgba(0,82,163,0.15)]';
    const errorStyles = 'border-2 border-[#DC3545] bg-white text-[#003D7A] focus:ring-4 focus:ring-[rgba(220,53,69,0.15)]';
    const disabledStyles = 'bg-[#E9ECEF] cursor-not-allowed opacity-50 border-[#DEE2E6]';
    
    const sizeStyles = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base', // 48px height, 16px font
      lg: 'h-14 text-lg',
    };
    
    const selectStyles = error
      ? `${baseStyles} ${errorStyles} ${sizeStyles[size]}`
      : `${baseStyles} ${normalStyles} ${sizeStyles[size]}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#003D7A] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`${selectStyles} ${disabled ? disabledStyles : ''} ${className} pr-12`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Dark blue arrow icon (20px) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-[#0052A3]" aria-hidden="true" />
          </div>
        </div>
        {error && (
          <p
            id={errorId}
            className="mt-2 text-sm text-status-error"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-2 text-sm text-text-secondary"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
