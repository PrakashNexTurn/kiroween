/**
 * Skeleton Component
 * Provides loading skeleton placeholders for various UI elements
 * 
 * Requirements: 3.3.4, 4.1.3
 */

import React from 'react';

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
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    backgroundColor: 'var(--color-bg-tertiary)',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
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
    <div className="space-y-2 p-4" role="status" aria-label="Loading file tree">
      {/* Root folder */}
      <div className="flex items-center gap-2">
        <Skeleton width={16} height={16} variant="rectangular" />
        <Skeleton width="60%" height={20} variant="text" />
      </div>

      {/* Nested items */}
      <div className="ml-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} variant="rectangular" />
          <Skeleton width="50%" height={18} variant="text" />
        </div>
        <div className="ml-4 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width={16} height={16} variant="rectangular" />
            <Skeleton width="70%" height={18} variant="text" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width={16} height={16} variant="rectangular" />
            <Skeleton width="55%" height={18} variant="text" />
          </div>
        </div>
      </div>

      {/* Another folder */}
      <div className="flex items-center gap-2">
        <Skeleton width={16} height={16} variant="rectangular" />
        <Skeleton width="45%" height={20} variant="text" />
      </div>

      <div className="ml-4 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} variant="rectangular" />
          <Skeleton width="65%" height={18} variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} variant="rectangular" />
          <Skeleton width="50%" height={18} variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={16} height={16} variant="rectangular" />
          <Skeleton width="60%" height={18} variant="text" />
        </div>
      </div>

      {/* More items */}
      <div className="flex items-center gap-2">
        <Skeleton width={16} height={16} variant="rectangular" />
        <Skeleton width="40%" height={18} variant="text" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton width={16} height={16} variant="rectangular" />
        <Skeleton width="55%" height={18} variant="text" />
      </div>
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
    <div className="h-full p-4 space-y-3" role="status" aria-label="Loading file content">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <Skeleton width="30%" height={24} variant="text" />
        <Skeleton width={80} height={32} variant="rectangular" />
      </div>

      {/* Code lines */}
      <div className="space-y-2">
        <Skeleton width="85%" height={16} variant="text" />
        <Skeleton width="70%" height={16} variant="text" />
        <Skeleton width="90%" height={16} variant="text" />
        <Skeleton width="60%" height={16} variant="text" />
        <Skeleton width="95%" height={16} variant="text" />
        <Skeleton width="75%" height={16} variant="text" />
        <Skeleton width="80%" height={16} variant="text" />
        <Skeleton width="65%" height={16} variant="text" />
        <Skeleton width="88%" height={16} variant="text" />
        <Skeleton width="72%" height={16} variant="text" />
        <Skeleton width="85%" height={16} variant="text" />
        <Skeleton width="78%" height={16} variant="text" />
        <Skeleton width="92%" height={16} variant="text" />
        <Skeleton width="68%" height={16} variant="text" />
        <Skeleton width="83%" height={16} variant="text" />
      </div>
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
    <div className="space-y-3 p-4" role="status" aria-label="Loading steering files">
      {/* File item 1 */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Skeleton width={20} height={20} variant="rectangular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={18} variant="text" />
            <Skeleton width="60%" height={14} variant="text" />
          </div>
          <Skeleton width={60} height={14} variant="text" />
        </div>
      </div>

      {/* File item 2 */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Skeleton width={20} height={20} variant="rectangular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="35%" height={18} variant="text" />
            <Skeleton width="55%" height={14} variant="text" />
          </div>
          <Skeleton width={60} height={14} variant="text" />
        </div>
      </div>

      {/* File item 3 */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Skeleton width={20} height={20} variant="rectangular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="45%" height={18} variant="text" />
            <Skeleton width="50%" height={14} variant="text" />
          </div>
          <Skeleton width={60} height={14} variant="text" />
        </div>
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
    <div className="h-full flex flex-col" role="status" aria-label="Loading editor">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Skeleton width={20} height={20} variant="rectangular" />
          <div className="space-y-1">
            <Skeleton width={120} height={16} variant="text" />
            <Skeleton width={80} height={12} variant="text" />
          </div>
        </div>
        <Skeleton width={80} height={32} variant="rectangular" />
      </div>

      {/* Editor content */}
      <div className="flex-1 p-4 space-y-2">
        <Skeleton width="90%" height={16} variant="text" />
        <Skeleton width="75%" height={16} variant="text" />
        <Skeleton width="85%" height={16} variant="text" />
        <Skeleton width="70%" height={16} variant="text" />
        <Skeleton width="95%" height={16} variant="text" />
        <Skeleton width="80%" height={16} variant="text" />
        <Skeleton width="88%" height={16} variant="text" />
        <Skeleton width="65%" height={16} variant="text" />
        <Skeleton width="92%" height={16} variant="text" />
        <Skeleton width="78%" height={16} variant="text" />
      </div>
    </div>
  );
};

/**
 * CardSkeleton Component
 * Skeleton loader for card components
 * Requirement 4.1.3: Consistent loading UI across features
 */
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 5 }) => {
  // Pre-calculate widths to avoid calling Math.random during render
  const widths = React.useMemo(() => {
    return Array.from({ length: lines }, () => `${Math.random() * 30 + 60}%`);
  }, [lines]);

  return (
    <div className="p-6 rounded-lg space-y-3" style={{ backgroundColor: 'var(--color-bg-secondary)' }} role="status" aria-label="Loading content">
      <Skeleton width="60%" height={24} variant="text" />
      <div className="space-y-2">
        {widths.map((width, i) => (
          <Skeleton
            key={i}
            width={width}
            height={16}
            variant="text"
          />
        ))}
      </div>
    </div>
  );
};
