import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from 'antd';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'small' | 'default' | 'large';
  color?: string;
  className?: string;
  label?: string;
  tip?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  color,
  className = '',
  label = 'Loading...',
  tip,
}) => {
  // Map old size format to Ant Design format
  const mapSize = (s: typeof size): 'small' | 'default' | 'large' => {
    if (s === 'sm' || s === 'small') return 'small';
    if (s === 'lg' || s === 'large') return 'large';
    return 'default';
  };

  const spinProps: SpinProps = {
    size: mapSize(size),
    tip: tip || label,
    className,
  };

  // Apply custom color if provided
  const style = color ? { color } : undefined;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Spin {...spinProps} style={style} />
    </div>
  );
};
