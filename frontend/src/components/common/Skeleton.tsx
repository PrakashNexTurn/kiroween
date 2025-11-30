/**
 * Skeleton Component
 * Provides loading skeleton placeholders for various UI elements
 * 
 * Requirements: 3.3.4, 4.1.3
 */

import React from 'react';
import { Skeleton as AntSkeleton } from 'antd';

/**
 * Props for Skeleton component
 */
export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component
 * Displays an animated placeholder for loading content
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const active = animation !== 'none';

  // For circular variant, use Avatar skeleton
  if (variant === 'circular') {
    return (
      <AntSkeleton.Avatar
        active={active}
        size={typeof width === 'number' ? width : 'default'}
        className={className}
      />
    );
  }

  // For text and rectangular variants, use Button skeleton with custom styling
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <AntSkeleton.Button
      active={active}
      style={style}
      className={className}
      block={!width}
      shape={variant === 'text' ? 'default' : 'default'}
    />
  );
};

/**
 * FileTreeSkeleton Component
 * Skeleton loader for file tree
 * Requirement 3.3.4: Loading skeleton for file tree
 */
export const FileTreeSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '16px' }} role="status" aria-label="Loading file tree">
      <AntSkeleton active paragraph={{ rows: 8 }} />
    </div>
  );
};

/**
 * FileContentSkeleton Component
 * Skeleton loader for file content viewer
 * Requirement 3.3.4: Loading indicator for file content
 */
export const FileContentSkeleton: React.FC = () => {
  return (
    <div style={{ height: '100%', padding: '16px' }} role="status" aria-label="Loading file content">
      <AntSkeleton active paragraph={{ rows: 15 }} />
    </div>
  );
};

/**
 * SteeringFileListSkeleton Component
 * Skeleton loader for steering file list
 * Requirement 4.1.3: Loading states for steering files
 */
export const SteeringFileListSkeleton: React.FC = () => {
  return (
    <div style={{ padding: '16px' }} role="status" aria-label="Loading steering files">
      <AntSkeleton active avatar paragraph={{ rows: 2 }} />
      <div style={{ marginTop: '16px' }}>
        <AntSkeleton active avatar paragraph={{ rows: 2 }} />
      </div>
      <div style={{ marginTop: '16px' }}>
        <AntSkeleton active avatar paragraph={{ rows: 2 }} />
      </div>
    </div>
  );
};

/**
 * EditorSkeleton Component
 * Skeleton loader for Monaco editor
 * Requirement 4.1.3: Consistent loading UI across features
 */
export const EditorSkeleton: React.FC = () => {
  return (
    <div style={{ height: '100%', padding: '16px' }} role="status" aria-label="Loading editor">
      <AntSkeleton active paragraph={{ rows: 10 }} />
    </div>
  );
};

/**
 * CardSkeleton Component
 * Skeleton loader for card components
 * Requirement 4.1.3: Consistent loading UI across features
 */
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 5 }) => {
  return (
    <div style={{ padding: '24px', borderRadius: '8px' }} role="status" aria-label="Loading content">
      <AntSkeleton active paragraph={{ rows: lines }} />
    </div>
  );
};
