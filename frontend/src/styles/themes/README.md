# Theme System

This directory contains the theme configuration files for the Kiro Project Orchestrator Frontend.

## Overview

The theme system is designed to be extensible and supports multiple themes. Currently, three themes are available:
- **Light Theme**: Clean, professional light color scheme
- **Dark Theme**: Modern, eye-friendly dark color scheme
- **Halloween Theme**: Spooky, festive theme with orange, purple, and dark tones

## Architecture

### Theme Configuration Files

- `light.ts` - Light theme configuration
- `dark.ts` - Dark theme configuration
- `halloween.ts` - Halloween theme configuration
- `index.ts` - Theme registry and utility functions

### Theme Structure

Each theme includes:
- **Colors**: Background, text, brand, status, phase, and UI element colors
- **Spacing**: Consistent spacing scale
- **Typography**: Font families, sizes, weights, and line heights
- **Shadows**: Box shadow variants
- **Border Radius**: Border radius variants
- **Animations**: Duration, easing, and Framer Motion variants

## Usage

### Using the Theme Context

```tsx
import { useTheme } from '../hooks/useTheme';

function MyComponent() {
  const { currentTheme, theme, setTheme, availableThemes } = useTheme();

  return (
    <div style={{ backgroundColor: theme.colors.background.primary }}>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
    </div>
  );
}
```

### Using Tailwind Classes

The theme system integrates with Tailwind CSS through CSS variables:

```tsx
<div className="bg-background-primary text-text-primary">
  <h1 className="text-brand-primary">Hello World</h1>
  <p className="text-text-secondary">Secondary text</p>
</div>
```

### Available Color Classes

- **Background**: `bg-background-primary`, `bg-background-secondary`, `bg-background-tertiary`
- **Text**: `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `text-text-inverse`
- **Brand**: `text-brand-primary`, `text-brand-secondary`, `text-brand-accent`
- **Status**: `text-status-success`, `text-status-warning`, `text-status-error`, `text-status-info`
- **Phase**: `text-phase-init`, `text-phase-spec`, `text-phase-build`, `text-phase-test`, `text-phase-fix`, `text-phase-complete`

## Adding New Themes

To add a new theme:

1. Create a new theme file (e.g., `ocean.ts`):

```typescript
import type { Theme } from '../../types/theme.types';

export const oceanTheme: Theme = {
  name: 'ocean',
  colors: {
    // Define your colors
  },
  // ... other theme properties
};
```

2. Register the theme in `index.ts`:

```typescript
import { oceanTheme } from './ocean';

export const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme, // Add your theme here
};
```

3. Export the theme:

```typescript
export { oceanTheme } from './ocean';
```

That's it! The new theme will automatically be available in the theme switcher.

## Theme Persistence

The theme system automatically persists the selected theme to `localStorage` under the key `kiro-theme`. When the application loads, it restores the previously selected theme.

## CSS Variables

The theme system injects CSS variables into the document root, which are then used by Tailwind CSS. This allows for smooth theme transitions and dynamic theming.

Example CSS variables:
- `--color-bg-primary`
- `--color-text-primary`
- `--color-brand-primary`
- etc.

## Smooth Transitions

Theme switching includes smooth color transitions (300ms ease) for a polished user experience.
