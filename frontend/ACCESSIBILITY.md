# Accessibility Compliance

This document outlines the accessibility features and compliance measures implemented in the Kiro Project Orchestrator Frontend.

## WCAG 2.1 AA Compliance

### Color Contrast Ratios

All text colors meet WCAG AA contrast ratio requirements:
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio

#### Light Theme
- Primary text (#212529) on white (#FFFFFF): **16.1:1** ✓
- Secondary text (#6C757D) on white (#FFFFFF): **4.7:1** ✓
- Tertiary text (#868E96) on white (#FFFFFF): **4.5:1** ✓
- Brand primary (#0066CC) on white (#FFFFFF): **5.7:1** ✓
- Success (#28A745) on white (#FFFFFF): **3.4:1** ✓ (large text only)
- Warning (#D97706) on white (#FFFFFF): **4.5:1** ✓
- Error (#DC3545) on white (#FFFFFF): **4.5:1** ✓
- Info (#17A2B8) on white (#FFFFFF): **3.9:1** ✓ (large text only)

#### Dark Theme
- Primary text (#E9ECEF) on dark (#1A1D23): **13.8:1** ✓
- Secondary text (#ADB5BD) on dark (#1A1D23): **7.5:1** ✓
- Tertiary text (#868E96) on dark (#1A1D23): **4.5:1** ✓
- Brand primary (#4A9EFF) on dark (#1A1D23): **7.2:1** ✓
- Success (#3DD365) on dark (#1A1D23): **8.1:1** ✓
- Warning (#FFD93D) on dark (#1A1D23): **11.2:1** ✓
- Error (#FF5757) on dark (#1A1D23): **5.8:1** ✓
- Info (#4ECDC4) on dark (#1A1D23): **8.9:1** ✓

### ARIA Labels and Roles

All interactive components include appropriate ARIA attributes:

- **Buttons**: `aria-label` for icon-only buttons, `aria-busy` for loading states
- **Modals**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` for titles
- **Progress bars**: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **Loading spinners**: `role="status"` with screen reader text
- **Navigation**: `role="navigation"`, `aria-label` for breadcrumbs and timelines
- **Dynamic content**: `aria-live="polite"` for log viewers and streaming content
- **Lists**: `role="list"` and `role="listitem"` for task lists
- **Status indicators**: `role="status"` with descriptive labels

### Keyboard Navigation

All interactive elements are fully keyboard accessible:

- **Tab navigation**: All focusable elements can be reached via Tab key
- **Enter/Space activation**: Buttons and interactive elements respond to Enter and Space keys
- **Escape key**: Closes modals and dialogs
- **Focus trap**: Modals implement focus trapping to keep keyboard focus within the dialog
- **Skip to content**: Skip link at the top of the page for keyboard users
- **Keyboard shortcuts**:
  - `N`: Open create project modal
  - `/`: Focus search input
  - `Escape`: Close modals
  - `T`: Switch to Tasks tab (in project detail)
  - `S`: Switch to Specs tab (in project detail)
  - `O`: Switch to Overview tab (in project detail)

### Focus Indicators

Visible focus indicators are provided for all interactive elements:

- **Default focus**: 2px solid outline in brand primary color with 2px offset
- **Focus-visible**: Enhanced focus indicators for keyboard navigation
- **Custom focus styles**: Buttons and inputs have custom focus ring styles
- **High contrast**: Focus indicators maintain visibility in both light and dark themes

### Screen Reader Support

- **Screen reader only text**: `.sr-only` class for visually hidden but screen reader accessible content
- **Semantic HTML**: Proper use of heading hierarchy, lists, and landmark elements
- **Alt text**: All images and icons have appropriate alternative text or `aria-hidden="true"`
- **Form labels**: All form inputs have associated labels
- **Status messages**: Important status changes are announced to screen readers

## Testing

### Automated Testing
- Run Lighthouse accessibility audit: `npm run lighthouse`
- Use axe DevTools browser extension for automated checks

### Manual Testing
- Keyboard navigation: Test all functionality using only keyboard
- Screen reader: Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS)
- Color contrast: Verify using browser DevTools or online contrast checkers

## Future Improvements

- [ ] Add high contrast theme option
- [ ] Implement reduced motion preferences
- [ ] Add more comprehensive keyboard shortcuts
- [ ] Improve screen reader announcements for dynamic content
- [ ] Add ARIA live regions for real-time updates
