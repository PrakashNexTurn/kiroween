# Design Document: Ant Design Migration

## Overview

This document outlines the technical design for migrating the Kiro's Ghost frontend from Tailwind CSS to Ant Design (antd). The migration will replace all Tailwind utilities and custom components with Ant Design's comprehensive component library while maintaining all existing functionality, responsive design, and accessibility features.

Ant Design provides a mature, enterprise-grade component library with built-in theming, accessibility, and responsive design capabilities. This migration will result in a more polished, professional UI with reduced custom component maintenance overhead.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Ant Design ConfigProvider                     │  │
│  │  - Theme Configuration                                │  │
│  │  - Global Settings                                    │  │
│  │  - Locale Configuration                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │         Theme Context (Custom)                        │  │
│  │  - Theme State Management                             │  │
│  │  - Theme Switching Logic                              │  │
│  │  - Ant Design Token Generation                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐  │
│  │         Application Components                        │  │
│  │  - Pages (using Ant Design Layout)                    │  │
│  │  - Components (using Ant Design components)           │  │
│  │  - Custom integrations (Monaco, Markdown)             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Replacement Strategy

The migration follows a systematic replacement approach:

1. **Install Ant Design** - Add antd as a dependency
2. **Configure Theme System** - Set up ConfigProvider with custom theme tokens
3. **Replace Common Components** - Migrate Button, Input, Card, Modal, etc.
4. **Update Page Layouts** - Use Ant Design Layout components
5. **Migrate Complex Components** - File trees, task lists, navigation
6. **Remove Tailwind** - Clean up Tailwind dependencies and configuration
7. **Test and Validate** - Ensure all functionality works correctly

## Components and Interfaces

### Theme Configuration

#### Ant Design ConfigProvider Setup

```typescript
interface ThemeConfig {
  token: {
    // Color tokens
    colorPrimary: string;
    colorSuccess: string;
    colorWarning: string;
    colorError: string;
    colorInfo: string;
    colorTextBase: string;
    colorBgBase: string;
    
    // Typography
    fontFamily: string;
    fontSize: number;
    
    // Spacing
    borderRadius: number;
    
    // Layout
    controlHeight: number;
  };
  
  components: {
    Button: ComponentToken;
    Input: ComponentToken;
    Card: ComponentToken;
    // ... other component-specific tokens
  };
}
```

#### Theme Context Integration

The existing ThemeContext will be updated to generate Ant Design theme tokens:

```typescript
interface ThemeContextValue {
  currentTheme: string;
  theme: Theme; // Existing theme object
  antdTheme: ThemeConfig; // New: Ant Design theme config
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}
```

### Component Mapping

#### Direct Replacements

| Current Component | Ant Design Component | Notes |
|------------------|---------------------|-------|
| Button | Button | Direct replacement with variant mapping |
| Input | Input | Direct replacement with validation |
| Card | Card | Direct replacement with hover effects |
| Modal | Modal | Direct replacement with focus trap |
| Select | Select | Direct replacement |
| Textarea | Input.TextArea | Direct replacement |
| LoadingSpinner | Spin | Direct replacement |
| Badge | Badge | Direct replacement |
| ProgressBar | Progress | Direct replacement |
| Toast | message/notification | Use antd notification system |

#### Complex Replacements

| Current Component | Ant Design Component | Migration Strategy |
|------------------|---------------------|-------------------|
| FileTree | Tree | Use Tree with custom rendering |
| Breadcrumbs | Breadcrumb | Direct replacement with routing |
| ContextMenu | Dropdown + Menu | Combine Dropdown and Menu |
| Skeleton | Skeleton | Direct replacement |
| ErrorBoundary | Keep custom | Wrap with antd Alert for display |

### Layout Components

#### Application Layout

```typescript
// Using Ant Design Layout
import { Layout } from 'antd';
const { Header, Content, Sider } = Layout;

<Layout>
  <Header>
    {/* Navigation */}
  </Header>
  <Layout>
    <Sider>
      {/* Sidebar navigation */}
    </Sider>
    <Content>
      {/* Main content */}
    </Content>
  </Layout>
</Layout>
```

#### Responsive Grid System

Replace Tailwind grid with Ant Design Grid:

```typescript
import { Row, Col } from 'antd';

<Row gutter={[16, 16]}>
  <Col xs={24} sm={12} md={8} lg={6}>
    {/* Responsive column */}
  </Col>
</Row>
```

## Data Models

### Theme Token Generation

```typescript
interface Theme {
  name: string;
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    brand: {
      primary: string;
      secondary: string;
      accent: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    phase: {
      init: string;
      spec: string;
      build: string;
      test: string;
      fix: string;
      complete: string;
    };
    border: string;
    hover: string;
    active: string;
    disabled: string;
  };
}

// Function to convert Theme to Ant Design ThemeConfig
function themeToAntdConfig(theme: Theme): ThemeConfig {
  return {
    token: {
      colorPrimary: theme.colors.brand.primary,
      colorSuccess: theme.colors.status.success,
      colorWarning: theme.colors.status.warning,
      colorError: theme.colors.status.error,
      colorInfo: theme.colors.status.info,
      colorTextBase: theme.colors.text.primary,
      colorBgBase: theme.colors.background.primary,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 16,
      borderRadius: 8,
      controlHeight: 40,
    },
    algorithm: theme.name === 'dark' || theme.name === 'halloween' 
      ? antd.theme.darkAlgorithm 
      : antd.theme.defaultAlgorithm,
  };
}
```

### Component Props Mapping

```typescript
// Button variant mapping
type TailwindVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type AntdButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link';

const variantMap: Record<TailwindVariant, AntdButtonType> = {
  primary: 'primary',
  secondary: 'default',
  danger: 'primary', // with danger prop
  ghost: 'text',
};
```

## Correctness 
Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the acceptance criteria analysis, the following correctness properties have been identified for the Ant Design migration:

### Property 1: Theme selection updates Ant Design tokens

*For any* theme selection, when a user selects a theme, the ConfigProvider should be updated with theme tokens that match the selected theme's color scheme.

**Validates: Requirements 2.1**

### Property 2: Theme persistence round-trip

*For any* theme selection, if a user sets a theme and reloads the page, the same theme should be active after reload.

**Validates: Requirements 2.4**

### Property 3: Theme switching propagates to components

*For any* theme switch, when switching from one theme to another, all Ant Design components should re-render with the new theme tokens.

**Validates: Requirements 2.3**

### Property 4: Custom theme conversion produces valid config

*For any* custom theme object (with valid color definitions), converting it to Ant Design configuration should produce a valid ThemeConfig object with all required token properties.

**Validates: Requirements 2.5**

### Property 5: Responsive layout adapts to viewport changes

*For any* viewport size change, when the viewport width crosses a breakpoint threshold, the layout should adapt using Ant Design's responsive grid system.

**Validates: Requirements 4.2**

### Property 6: Monaco Editor theme synchronization

*For any* application theme change, the Monaco Editor theme should update to match the application theme (light/dark).

**Validates: Requirements 8.3**

## Error Handling

### Migration Error Scenarios

1. **Component Prop Mismatch**
   - **Scenario**: Custom component props don't map directly to Ant Design props
   - **Handling**: Create wrapper components that translate props
   - **Example**: Custom Button `variant` prop maps to Ant Design `type` and `danger` props

2. **Theme Token Missing**
   - **Scenario**: Custom theme color doesn't have an Ant Design equivalent
   - **Handling**: Map to closest Ant Design token or use custom CSS variables
   - **Example**: Phase colors map to custom tokens in theme config

3. **Responsive Breakpoint Differences**
   - **Scenario**: Tailwind breakpoints differ from Ant Design breakpoints
   - **Handling**: Update breakpoint values to match Ant Design's system
   - **Tailwind**: `sm: 640px, md: 768px, lg: 1024px, xl: 1280px`
   - **Ant Design**: `xs: 480px, sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1600px`

4. **Custom Animation Loss**
   - **Scenario**: Tailwind animations don't have Ant Design equivalents
   - **Handling**: Use Ant Design's motion system or keep Framer Motion for custom animations
   - **Example**: Page transitions continue using Framer Motion

5. **Build Configuration Conflicts**
   - **Scenario**: Ant Design CSS conflicts with remaining Tailwind CSS
   - **Handling**: Remove Tailwind completely before adding Ant Design
   - **Order**: Uninstall Tailwind → Remove config → Install Ant Design

### Runtime Error Handling

```typescript
// Theme loading error handling
function loadTheme(themeName: string): ThemeConfig {
  try {
    const theme = getTheme(themeName);
    return themeToAntdConfig(theme);
  } catch (error) {
    console.error('Failed to load theme:', error);
    // Fallback to default theme
    return themeToAntdConfig(getTheme('light'));
  }
}

// Component rendering error boundary
<ErrorBoundary
  fallback={
    <Alert
      message="Component Error"
      description="Failed to render component. Please refresh the page."
      type="error"
      showIcon
    />
  }
>
  {children}
</ErrorBoundary>
```

## Testing Strategy

### Unit Testing

Unit tests will verify specific component replacements and functionality:

1. **Theme Conversion Tests**
   - Test `themeToAntdConfig` function with each theme
   - Verify all required tokens are present
   - Verify color values are valid hex/rgb strings

2. **Component Wrapper Tests**
   - Test custom prop mapping (e.g., Button variant → type)
   - Verify event handlers are preserved
   - Test loading and disabled states

3. **Layout Component Tests**
   - Test responsive grid rendering
   - Verify breakpoint behavior
   - Test layout composition

4. **Integration Tests**
   - Test theme switching updates all components
   - Test form submission with Ant Design Form
   - Test modal open/close with focus management
   - Test file tree expand/collapse
   - Test navigation and routing

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using **fast-check** (JavaScript property-based testing library):

1. **Property 1: Theme selection updates Ant Design tokens**
   - Generate random theme selections
   - Verify ConfigProvider receives correct tokens
   - **Feature: antd-migration, Property 1: Theme selection updates Ant Design tokens**

2. **Property 2: Theme persistence round-trip**
   - Generate random theme names
   - Set theme, simulate reload, verify theme persists
   - **Feature: antd-migration, Property 2: Theme persistence round-trip**

3. **Property 3: Theme switching propagates to components**
   - Generate random theme pairs (from → to)
   - Verify component re-renders with new tokens
   - **Feature: antd-migration, Property 3: Theme switching propagates to components**

4. **Property 4: Custom theme conversion produces valid config**
   - Generate random valid theme objects
   - Verify conversion produces valid ThemeConfig
   - **Feature: antd-migration, Property 4: Custom theme conversion produces valid config**

5. **Property 5: Responsive layout adapts to viewport changes**
   - Generate random viewport widths
   - Verify layout uses correct breakpoint
   - **Feature: antd-migration, Property 5: Responsive layout adapts to viewport changes**

6. **Property 6: Monaco Editor theme synchronization**
   - Generate random theme changes
   - Verify Monaco Editor theme updates
   - **Feature: antd-migration, Property 6: Monaco Editor theme synchronization**

### Visual Regression Testing

While not automated in this migration, visual regression testing should be performed manually:

1. Compare screenshots of each page before/after migration
2. Verify responsive behavior on different screen sizes
3. Test theme switching visual consistency
4. Verify accessibility features (focus indicators, contrast ratios)

### Testing Configuration

- **Unit Test Framework**: Vitest (already configured)
- **Property-Based Testing**: fast-check
- **Component Testing**: React Testing Library
- **Minimum PBT Iterations**: 100 per property test

## Implementation Phases

### Phase 1: Setup and Configuration (Foundation)

1. Install Ant Design dependencies
2. Configure Ant Design ConfigProvider
3. Set up theme token generation
4. Update ThemeContext to provide Ant Design theme config

### Phase 2: Common Component Migration

1. Replace Button component
2. Replace Input component
3. Replace Card component
4. Replace Modal component
5. Replace Select, Textarea, LoadingSpinner, Badge, ProgressBar
6. Update Toast notifications to use Ant Design message/notification

### Phase 3: Layout and Navigation

1. Implement Ant Design Layout structure
2. Replace responsive grid with Ant Design Grid
3. Update Breadcrumbs component
4. Update navigation components

### Phase 4: Complex Components

1. Migrate FileTree to Ant Design Tree
2. Update ContextMenu to Ant Design Dropdown + Menu
3. Migrate task lists to Ant Design List
4. Update form components to Ant Design Form

### Phase 5: Integration and Styling

1. Integrate Monaco Editor with Ant Design theme
2. Style React Markdown to complement Ant Design
3. Update syntax highlighting styles
4. Ensure all custom styles work with Ant Design

### Phase 6: Cleanup and Optimization

1. Remove Tailwind CSS dependencies
2. Delete Tailwind configuration files
3. Remove custom CSS that's now handled by Ant Design
4. Optimize Ant Design imports for bundle size
5. Update documentation

### Phase 7: Testing and Validation

1. Run all unit tests
2. Run all property-based tests
3. Perform manual testing on all pages
4. Test responsive behavior
5. Test accessibility features
6. Validate theme switching

## Migration Checklist

- [ ] Ant Design installed and configured
- [ ] ConfigProvider set up with theme tokens
- [ ] ThemeContext updated for Ant Design
- [ ] All common components migrated
- [ ] Layout components using Ant Design Layout
- [ ] Responsive grid using Ant Design Grid
- [ ] File tree using Ant Design Tree
- [ ] Forms using Ant Design Form
- [ ] Monaco Editor integrated with theme
- [ ] React Markdown styled appropriately
- [ ] Tailwind CSS removed
- [ ] All tests passing
- [ ] Responsive design verified
- [ ] Accessibility verified
- [ ] Theme switching works correctly
- [ ] Bundle size optimized

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "antd": "^5.22.0"
  },
  "devDependencies": {
    "fast-check": "^3.24.0"
  }
}
```

### Removed Dependencies

```json
{
  "dependencies": {},
  "devDependencies": {
    "tailwindcss": "^4.1.17",
    "@tailwindcss/postcss": "^4.1.17",
    "autoprefixer": "^10.4.22"
  }
}
```

### Preserved Dependencies

- React, React DOM, React Router (core framework)
- Monaco Editor (code editing)
- React Markdown, React Syntax Highlighter (content rendering)
- Framer Motion (custom animations)
- Lucide React (icons - compatible with Ant Design)
- Axios (HTTP client)

## Performance Considerations

### Bundle Size

- **Ant Design**: ~500KB minified + gzipped (with tree-shaking)
- **Tailwind CSS Removal**: Saves ~50-100KB (depending on usage)
- **Net Impact**: ~400KB increase, acceptable for enterprise UI library

### Optimization Strategies

1. **Tree Shaking**: Import only used components
   ```typescript
   import { Button, Input } from 'antd'; // Good
   import * as antd from 'antd'; // Bad
   ```

2. **Code Splitting**: Lazy load heavy components
   ```typescript
   const MonacoEditor = lazy(() => import('@monaco-editor/react'));
   ```

3. **Theme Caching**: Memoize theme config generation
   ```typescript
   const antdTheme = useMemo(() => themeToAntdConfig(theme), [theme]);
   ```

4. **CSS Optimization**: Use Ant Design's CSS-in-JS for better tree-shaking

## Accessibility Compliance

Ant Design provides built-in accessibility features that will improve the application:

1. **ARIA Attributes**: All components include proper ARIA labels and roles
2. **Keyboard Navigation**: Full keyboard support out of the box
3. **Focus Management**: Proper focus indicators and focus trap in modals
4. **Screen Reader Support**: Semantic HTML and ARIA descriptions
5. **Color Contrast**: Meets WCAG 2.1 Level AA standards

### Accessibility Testing

- Test keyboard navigation on all pages
- Verify focus indicators are visible
- Test with screen reader (NVDA/JAWS)
- Verify color contrast ratios
- Test form validation announcements

## Browser Compatibility

Ant Design supports:
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

This matches the current browser support for the application.

## Rollback Plan

If critical issues arise during migration:

1. **Git Branch Strategy**: Perform migration in a feature branch
2. **Incremental Rollout**: Migrate one page at a time if needed
3. **Feature Flags**: Use feature flags to toggle between old/new UI
4. **Backup**: Keep Tailwind configuration in a backup branch

## Success Criteria

The migration is successful when:

1. All pages render correctly with Ant Design components
2. All functionality works identically to pre-migration
3. Theme switching works for all themes
4. Responsive design works on all screen sizes
5. All tests pass (unit and property-based)
6. Accessibility features are maintained or improved
7. Bundle size increase is acceptable (<500KB)
8. No Tailwind CSS dependencies remain
9. Documentation is updated
10. Team is trained on Ant Design usage
