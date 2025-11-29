import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, disabled, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    
    // Use theme variables for consistent styling
    const baseStyles = 'w-full h-12 px-4 py-3 text-base rounded-xl transition-all duration-base focus:outline-none shadow-sm';
    const normalStyles = 'border-2 border-brand-primary bg-background-primary text-text-primary hover:border-brand-secondary hover:shadow-md focus:border-brand-secondary focus:ring-4 focus:ring-brand-primary focus:ring-opacity-15';
    const errorStyles = 'border-2 border-status-error bg-background-primary text-text-primary focus:ring-4 focus:ring-status-error focus:ring-opacity-15';
    const disabledStyles = 'bg-disabled cursor-not-allowed opacity-50 border-border';
    
    const inputStyles = error
      ? `${baseStyles} ${errorStyles}`
      : `${baseStyles} ${normalStyles}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`${inputStyles} ${disabled ? disabledStyles : ''} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
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

Input.displayName = 'Input';
