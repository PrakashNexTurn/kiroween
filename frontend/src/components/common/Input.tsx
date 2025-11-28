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
    
    // Professional styling: 48px height, 12px border-radius, 2px dark blue border, 16px font
    const baseStyles = 'w-full h-12 px-4 py-3 text-base rounded-xl transition-all duration-200 focus:outline-none shadow-[0_2px_8px_rgba(0,82,163,0.15)]';
    const normalStyles = 'border-2 border-[#0052A3] bg-white text-[#003D7A] hover:border-[#003D7A] hover:shadow-[0_4px_12px_rgba(0,82,163,0.25)] focus:border-[#003D7A] focus:ring-4 focus:ring-[rgba(0,82,163,0.15)]';
    const errorStyles = 'border-2 border-[#DC3545] bg-white text-[#003D7A] focus:ring-4 focus:ring-[rgba(220,53,69,0.15)]';
    const disabledStyles = 'bg-[#E9ECEF] cursor-not-allowed opacity-50 border-[#DEE2E6]';
    
    const inputStyles = error
      ? `${baseStyles} ${errorStyles}`
      : `${baseStyles} ${normalStyles}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#003D7A] mb-2"
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
