import React from 'react';
import { Input } from 'antd';
import type { TextAreaProps as AntTextAreaProps } from 'antd/es/input';

const { TextArea: AntTextArea } = Input;

export interface TextareaProps extends Omit<AntTextAreaProps, 'status'> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<any, TextareaProps>(
  ({ label, error, helperText, autoResize = false, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={textareaId}
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
        <AntTextArea
          ref={ref}
          id={textareaId}
          autoSize={autoResize ? { minRows: 3 } : false}
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

Textarea.displayName = 'Textarea';
