# Skeleton Loading Components

Comprehensive skeleton loading states for consistent UI feedback across the application.

## Requirements

- **3.3.4**: Loading skeletons for file tree
- **4.1.3**: Consistent loading UI across features

## Components

### Base Skeleton

The foundational skeleton component that all other skeletons build upon.

```tsx
import { Skeleton } from '@/components/common';

<Skeleton width="60%" height={24} variant="text" animation="pulse" />
<Skeleton width={200} height={40} variant="rectangular" />
<Skeleton width={50} height={50} variant="circular" />
```

**Props:**
- `width`: string | number - Width of skeleton (e.g., "60%", 200)
- `height`: string | number - Height of skeleton (e.g., "24px", 24)
- `variant`: 'text' | 'circular' | 'rectangular' - Shape variant
- `animation`: 'pulse' | 'wave' | 'none' - Animation type
- `className`: string - Additional CSS classes

### FileTreeSkeleton

Skeleton loader for the file tree component, showing a hierarchical structure.

```tsx
import { FileTreeSkeleton } from '@/components/common';

<FileTreeSkeleton />
```

**Usage:**
- Used in `FileTree.tsx` during initial load
- Shows nested folder/file structure
- Automatically matches file tree layout

### FileContentSkeleton

Skeleton loader for file content viewer, mimicking code editor layout.

```tsx
import { FileContentSkeleton } from '@/components/common';

<FileContentSkeleton />
```

**Usage:**
- Used in `FileContentViewer.tsx` while loading file content
- Shows header with file info and code lines
- Matches Monaco editor layout

### SteeringFileListSkeleton

Skeleton loader for steering file list, showing file items.

```tsx
import { SteeringFileListSkeleton } from '@/components/common';

<SteeringFileListSkeleton />
```

**Usage:**
- Used in `SteeringTab.tsx` while loading steering files
- Shows 3 file items with metadata
- Matches steering file list layout

### EditorSkeleton

Skeleton loader for Monaco editor, showing toolbar and content area.

```tsx
import { EditorSkeleton } from '@/components/common';

<EditorSkeleton />
```

**Usage:**
- Used in `SteeringFileViewer.tsx` while loading editor
- Used as fallback for lazy-loaded Monaco editor
- Shows toolbar with file info and code lines

### CardSkeleton

Flexible skeleton loader for card-based content.

```tsx
import { CardSkeleton } from '@/components/common';

<CardSkeleton lines={5} />
<CardSkeleton lines={10} />
```

**Props:**
- `lines`: number - Number of content lines to show (default: 5)

**Usage:**
- Used in `SpecViewer.tsx` for spec file loading
- Used in `ProjectDetailPage.tsx` for page loading
- General-purpose card content skeleton

## Animation Types

### Pulse Animation (Default)

Smooth opacity fade in/out effect. Best for most use cases.

```tsx
<Skeleton animation="pulse" />
```

### Wave Animation

Shimmer effect that moves across the skeleton. More visually engaging.

```tsx
<Skeleton animation="wave" />
```

### No Animation

Static skeleton without animation. Use for performance-critical scenarios.

```tsx
<Skeleton animation="none" />
```

## Implementation Examples

### File Tree Loading

```tsx
if (loading) {
  return <FileTreeSkeleton />;
}
```

### File Content Loading

```tsx
if (loading) {
  return <FileContentSkeleton />;
}
```

### Steering Files Loading

```tsx
if (isLoading) {
  return (
    <Card>
      <SteeringFileListSkeleton />
    </Card>
  );
}
```

### Editor Loading

```tsx
if (loading) {
  return <EditorSkeleton />;
}

// Or as Monaco editor fallback
<Suspense fallback={<FileContentSkeleton />}>
  <Editor {...props} loading={<FileContentSkeleton />} />
</Suspense>
```

### Page Loading

```tsx
if (loading && !project) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <CardSkeleton lines={1} />
        </div>
        <div className="flex gap-2">
          <CardSkeleton lines={1} />
          <CardSkeleton lines={1} />
          <CardSkeleton lines={1} />
        </div>
        <CardSkeleton lines={10} />
      </div>
    </div>
  );
}
```

## Design Principles

1. **Consistency**: All skeletons use the same color scheme and animations
2. **Accuracy**: Skeletons closely match the actual content layout
3. **Performance**: Lightweight components with CSS animations
4. **Accessibility**: Proper ARIA labels for screen readers
5. **Theming**: Automatically adapts to theme colors

## CSS Variables Used

- `--color-bg-tertiary`: Base skeleton color
- `--color-bg-secondary`: Wave animation highlight color
- `--color-border`: Border colors for structured skeletons

## Accessibility

All skeleton components include:
- `role="status"` for screen reader announcements
- `aria-label` describing what's loading
- Semantic HTML structure

## Performance

- Pure CSS animations (no JavaScript)
- Minimal DOM nodes
- Optimized for 60fps animations
- No external dependencies

## Browser Support

Works in all modern browsers that support:
- CSS animations
- CSS custom properties (variables)
- Flexbox

## Demo

See `Skeleton.demo.tsx` for a comprehensive showcase of all skeleton components and their variations.
