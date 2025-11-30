import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<AntSelectProps, 'options' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
}

export const Select = React.forwardRef<any, SelectProps>(
  ({ label, error, helperText, id, options, size = 'md', ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    // Map custom size to Ant Design size
    const getAntdSize = () => {
      switch (size) {
        case 'sm':
          return 'small' as const;
        case 'md':
          return 'middle' as const;
        case 'lg':
          return 'large' as const;
        default:
          return 'middle' as const;
      }
    };

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={selectId}
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
        <AntSelect
          ref={ref}
          id={selectId}
          options={options}
          size={getAntdSize()}
          status={error ? 'error' : undefined}
          style={{ width: '100%' }}
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

Select.displayName = 'Select';
