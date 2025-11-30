# Layout Components

This directory contains the main layout components for the Kiro Project Orchestrator frontend application.

## Components

### Layout

The main application layout component that provides the overall structure using Ant Design Layout components.

**Features:**
- Wraps the entire application with Ant Design Layout
- Includes the Header component (Ant Design Layout.Header)
- Uses React Router's `Outlet` for rendering page content
- Uses Ant Design Content and Footer components
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

**Ant Design Components Used:**
- `Layout` - Main layout container
- `Layout.Header` - Header section
- `Layout.Content` - Main content area
- `Layout.Footer` - Footer section

### Header

The application header component with logo, breadcrumbs, and theme toggle using Ant Design components.

**Features:**
- App logo/title with link to home
- Automatic breadcrumb navigation using Ant Design Breadcrumb component
- Theme toggle button
- Sticky positioning at top of viewport
- Responsive design (mobile-friendly)
- Breadcrumbs hidden on mobile devices

**Breadcrumb Generation:**
The header automatically generates breadcrumbs from the current URL path using Ant Design Breadcrumb:
- `/` → Home
- `/projects` → Home > Projects
- `/projects/abc-123` → Home > Projects > Abc 123

**Ant Design Components Used:**
- `Layout.Header` - Header container
- `Breadcrumb` - Navigation breadcrumbs

### ThemeToggle

A button component for switching between light, dark, and Halloween themes.

**Features:**
- Sun icon for light mode, moon icon for dark mode, ghost icon for Halloween mode
- Smooth icon transition animations
- Hover effect with scale animation
- Proper ARIA labels for accessibility
- Tooltip on hover
- Focus ring for keyboard navigation

**Usage:**
```tsx
import { ThemeToggle } from './components/layout';

<ThemeToggle />
```

## Responsive Grid System

For responsive layouts, use Ant Design's Grid system (Row and Col):

**Breakpoints:**
- `xs`: < 576px (mobile)
- `sm`: ≥ 576px (tablet)
- `md`: ≥ 768px (tablet landscape)
- `lg`: ≥ 992px (desktop)
- `xl`: ≥ 1200px (large desktop)
- `xxl`: ≥ 1600px (extra large desktop)

**Example Usage:**
```tsx
import { Row, Col } from 'antd';

<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    {/* Responsive column */}
  </Col>
  <Col xs={24} sm={12} md={8} lg={6}>
    {/* Another column */}
  </Col>
</Row>
```

**Gutter Spacing:**
- `gutter={16}` - Uniform spacing
- `gutter={[16, 16]}` - [horizontal, vertical] spacing
- `gutter={{ xs: 8, sm: 16, md: 24 }}` - Responsive spacing

## Styling

All layout components use:
- CSS variables for theming (automatically updated by ThemeContext)
- Ant Design Layout components for structure
- Inline styles for theme-dependent colors
- Smooth transitions for theme switching
- Ant Design's responsive grid system

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
