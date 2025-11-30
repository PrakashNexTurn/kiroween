import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'size' | 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, type, children, ...props }, ref) => {
    // Map custom variant to Ant Design type and danger prop
    const getAntdProps = () => {
      switch (variant) {
        case 'primary':
          return { type: 'primary' as const, danger: false };
        case 'secondary':
          return { type: 'default' as const, danger: false };
        case 'danger':
          return { type: 'primary' as const, danger: true };
        case 'ghost':
          return { type: 'text' as const, danger: false };
        default:
          return { type: 'default' as const, danger: false };
      }
    };

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

    const { type: antdType, danger } = getAntdProps();

    return (
      <AntButton
        ref={ref}
        type={antdType}
        danger={danger}
        size={getAntdSize()}
        loading={loading}
        htmlType={type}
        {...props}
      >
        {children}
      </AntButton>
    );
  }
);

Button.displayName = 'Button';
