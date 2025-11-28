# Layout Components

This directory contains the main layout components for the Kiro Project Orchestrator frontend application.

## Components

### Layout

The main application layout component that provides the overall structure.

**Features:**
- Wraps the entire application
- Includes the Header component
- Uses React Router's `Outlet` for rendering page content
- Applies theme background colors
- Responsive design with proper spacing

**Usage:**
```tsx
import { Layout } from './components/layout';

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="projects/:projectId" element={<ProjectDetail />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Header

The application header component with logo, breadcrumbs, and theme toggle.

**Features:**
- App logo/title with link to home
- Automatic breadcrumb navigation based on current route
- Theme toggle button
- Sticky positioning at top of viewport
- Responsive design (mobile-friendly)
- Breadcrumbs hidden on mobile devices

**Breadcrumb Generation:**
The header automatically generates breadcrumbs from the current URL path:
- `/` → Home
- `/projects` → Home > Projects
- `/projects/abc-123` → Home > Projects > Abc 123

### ThemeToggle

A button component for switching between light and dark themes.

**Features:**
- Sun icon for light mode, moon icon for dark mode
- Smooth icon transition animations (rotate + scale + fade)
- Hover effect with scale animation
- Proper ARIA labels for accessibility
- Tooltip on hover
- Focus ring for keyboard navigation

**Usage:**
```tsx
import { ThemeToggle } from './components/layout';

<ThemeToggle />
```

## Styling

All layout components use:
- CSS variables for theming (automatically updated by ThemeContext)
- Tailwind CSS utility classes for responsive design
- Inline styles for theme-dependent colors
- Smooth transitions for theme switching

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Semantic HTML elements (`<header>`, `<nav>`, `<main>`)
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

## Responsive Design

- **Mobile (< 640px)**: Simplified header with abbreviated title, no breadcrumbs
- **Tablet (640px - 1024px)**: Full header with breadcrumbs
- **Desktop (> 1024px)**: Full layout with optimal spacing

## Theme Integration

All components automatically respond to theme changes through the ThemeContext:
- Background colors
- Text colors
- Border colors
- Hover states
- Active states

No manual theme handling is required in child components.
