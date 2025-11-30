import React from 'react';
import { Card as AntCard } from 'antd';
import type { CardProps as AntCardProps } from 'antd';

export interface CardProps extends AntCardProps {
  children: React.ReactNode;
  hover?: boolean;
  backgroundColor?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, backgroundColor, style, ...props }, ref) => {
    const combinedStyle: React.CSSProperties = {
      ...(backgroundColor && { backgroundColor }),
      ...(hover && {
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }),
      ...style,
    };

    const cardProps = {
      ...props,
      style: combinedStyle,
      hoverable: hover,
    };

    return (
      <AntCard ref={ref} {...cardProps}>
        {children}
      </AntCard>
    );
  }
);

Card.displayName = 'Card';
