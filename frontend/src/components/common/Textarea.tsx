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
    
    // Professional styling: 12px border-radius, 2px dark blue border, 16px font, padding 12px 16px
    const baseStyles = 'w-full px-4 py-3 text-base rounded-xl transition-all duration-200 focus:outline-none shadow-[0_2px_8px_rgba(0,82,163,0.15)] resize-y';
    const normalStyles = 'border-2 border-[#0052A3] bg-white text-[#003D7A] hover:border-[#003D7A] hover:shadow-[0_4px_12px_rgba(0,82,163,0.25)] focus:border-[#003D7A] focus:ring-4 focus:ring-[rgba(0,82,163,0.15)]';
    const errorStyles = 'border-2 border-[#DC3545] bg-white text-[#003D7A] focus:ring-4 focus:ring-[rgba(220,53,69,0.15)]';
    const disabledStyles = 'bg-[#E9ECEF] cursor-not-allowed opacity-50 border-[#DEE2E6]';
    
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
            className="block text-sm font-medium text-[#003D7A] mb-2"
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
