/**
 * Skeleton Component Demo
 * Demonstrates all skeleton loading states
 */

import {
  Skeleton,
  FileTreeSkeleton,
  FileContentSkeleton,
  SteeringFileListSkeleton,
  EditorSkeleton,
  CardSkeleton,
} from './Skeleton';
import { Card } from './Card';

export function SkeletonDemo() {
  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Skeleton Loading States Demo
      </h1>

      {/* Basic Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Basic Skeleton
        </h2>
        <Card className="p-6 space-y-4">
          <Skeleton width="60%" height={24} />
          <Skeleton width="80%" height={16} />
          <Skeleton width="70%" height={16} />
          <Skeleton width={200} height={40} variant="rectangular" />
          <Skeleton width={50} height={50} variant="circular" />
        </Card>
      </section>

      {/* File Tree Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          File Tree Skeleton
        </h2>
        <Card className="h-[400px]">
          <FileTreeSkeleton />
        </Card>
      </section>

      {/* File Content Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          File Content Skeleton
        </h2>
        <Card className="h-[400px]">
          <FileContentSkeleton />
        </Card>
      </section>

      {/* Steering File List Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Steering File List Skeleton
        </h2>
        <Card>
          <SteeringFileListSkeleton />
        </Card>
      </section>

      {/* Editor Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Editor Skeleton
        </h2>
        <Card className="h-[500px]">
          <EditorSkeleton />
        </Card>
      </section>

      {/* Card Skeleton */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Card Skeleton
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={5} />
          <CardSkeleton lines={7} />
          <CardSkeleton lines={10} />
        </div>
      </section>

      {/* Animation Comparison */}
      <section>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Animation Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Pulse Animation
            </h3>
            <div className="space-y-2">
              <Skeleton width="100%" height={16} animation="pulse" />
              <Skeleton width="80%" height={16} animation="pulse" />
              <Skeleton width="90%" height={16} animation="pulse" />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              Wave Animation
            </h3>
            <div className="space-y-2">
              <Skeleton width="100%" height={16} animation="wave" />
              <Skeleton width="80%" height={16} animation="wave" />
              <Skeleton width="90%" height={16} animation="wave" />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              No Animation
            </h3>
            <div className="space-y-2">
              <Skeleton width="100%" height={16} animation="none" />
              <Skeleton width="80%" height={16} animation="none" />
              <Skeleton width="90%" height={16} animation="none" />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
