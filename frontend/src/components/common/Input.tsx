import React from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps as AntInputProps } from 'antd';

export interface InputProps extends Omit<AntInputProps, 'status'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<any, InputProps>(
  ({ label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;
    
    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            {label}
          </label>
        )}
        <AntInput
          ref={ref}
          id={inputId}
          status={error ? 'error' : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {error && (
          <div
            id={errorId}
            role="alert"
            style={{
              marginTop: '8px',
              fontSize: '14px',
              color: 'var(--ant-color-error)',
            }}
          >
            {error}
          </div>
        )}
        {helperText && !error && (
          <div
            id={helperId}
            style={{
              marginTop: '8px',
              fontSize: '14px',
              opacity: 0.65,
            }}
          >
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
