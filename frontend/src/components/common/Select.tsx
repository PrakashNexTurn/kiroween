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
    
    // Use theme variables for consistent styling
    const baseStyles = 'w-full px-4 py-3 text-base rounded-xl transition-all duration-base focus:outline-none appearance-none bg-no-repeat shadow-sm cursor-pointer';
    const normalStyles = 'border-2 border-brand-primary bg-background-primary text-text-primary hover:border-brand-secondary hover:shadow-md focus:border-brand-secondary focus:ring-4 focus:ring-brand-primary focus:ring-opacity-15';
    const errorStyles = 'border-2 border-status-error bg-background-primary text-text-primary focus:ring-4 focus:ring-status-error focus:ring-opacity-15';
    const disabledStyles = 'bg-disabled cursor-not-allowed opacity-50 border-border';
    
    const sizeStyles = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
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
            className="block text-sm font-medium text-text-primary mb-2"
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
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-brand-primary" aria-hidden="true" />
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
