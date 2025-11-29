import React, { useEffect, useRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, autoResize = false, disabled, className = '', id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    
    // Use theme variables for consistent styling
    const baseStyles = 'w-full px-4 py-3 text-base rounded-xl transition-all duration-base focus:outline-none shadow-sm resize-y';
    const normalStyles = 'border-2 border-brand-primary bg-background-primary text-text-primary hover:border-brand-secondary hover:shadow-md focus:border-brand-secondary focus:ring-4 focus:ring-brand-primary focus:ring-opacity-15';
    const errorStyles = 'border-2 border-status-error bg-background-primary text-text-primary focus:ring-4 focus:ring-status-error focus:ring-opacity-15';
    const disabledStyles = 'bg-disabled cursor-not-allowed opacity-50 border-border';
    
    const textareaStyles = error
      ? `${baseStyles} ${errorStyles}`
      : `${baseStyles} ${normalStyles}`;
    
    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        const adjustHeight = () => {
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        };
        
        adjustHeight();
        textarea.addEventListener('input', adjustHeight);
        
        return () => {
          textarea.removeEventListener('input', adjustHeight);
        };
      }
    }, [autoResize, props.value]);
    
    // Handle both internal and forwarded refs
    const setRefs = (element: HTMLTextAreaElement | null) => {
      internalRef.current = element;
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={textareaId}
          disabled={disabled}
          className={`${textareaStyles} ${disabled ? disabledStyles : ''} ${autoResize ? 'resize-none' : ''} ${className}`}
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

Textarea.displayName = 'Textarea';
