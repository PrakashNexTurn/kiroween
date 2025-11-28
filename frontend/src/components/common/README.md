# Common UI Components

This directory contains reusable UI components that are used throughout the Kiro Project Orchestrator Frontend application.

## Components

### Button

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (default: false) - Shows a spinner and disables the button
- `disabled`: boolean - Disables the button
- All standard HTML button attributes

**Example:**
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" loading>
  Processing...
</Button>
```

### Card

A container component with optional hover effects and custom backgrounds.

**Props:**
- `hover`: boolean (default: false) - Adds elevation and scale on hover
- `backgroundColor`: string - Custom background color
- All standard HTML div attributes

**Example:**
```tsx
<Card hover>
  <h3>Project Name</h3>
  <p>Project description</p>
</Card>

<Card backgroundColor="#E3F2FD">
  <p>Custom colored card</p>
</Card>
```

### Modal

A modal dialog with backdrop, animations, and accessibility features.

**Props:**
- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Callback when modal should close
- `title`: string - Modal title
- `children`: React.ReactNode - Modal content
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `showCloseButton`: boolean (default: true)

**Features:**
- Escape key to close
- Click backdrop to close
- Focus trap for accessibility
- Smooth animations

**Example:**
```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex gap-2 justify-end mt-4">
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

### Input

A text input component with label, error states, and validation.

**Props:**
- `label`: string - Input label
- `error`: string - Error message to display
- `helperText`: string - Helper text below input
- `disabled`: boolean - Disables the input
- All standard HTML input attributes

**Example:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="email@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  helperText="We'll never share your email"
/>
```

### Textarea

A textarea component with label, error states, and auto-resize capability.

**Props:**
- `label`: string - Textarea label
- `error`: string - Error message to display
- `helperText`: string - Helper text below textarea
- `autoResize`: boolean (default: false) - Automatically adjusts height
- `disabled`: boolean - Disables the textarea
- All standard HTML textarea attributes

**Example:**
```tsx
<Textarea
  label="Description"
  placeholder="Enter project description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  autoResize
  rows={3}
/>
```

### Badge

A badge component for displaying status, phases, or labels.

**Props:**
- `variant`: Phase | 'success' | 'warning' | 'error' | 'info' | 'default'
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `customColor`: string - Custom background color
- `children`: React.ReactNode - Badge content

**Example:**
```tsx
<Badge variant="INIT">INIT</Badge>
<Badge variant="success" size="sm">Completed</Badge>
<Badge customColor="#9C27B0">Custom</Badge>
```

### ProgressBar

A progress bar component with percentage display and color variants.

**Props:**
- `percentage`: number (0-100) - Progress percentage
- `variant`: 'primary' | 'success' | 'warning' | 'danger' (default: 'primary')
- `showLabel`: boolean (default: true) - Shows percentage label
- `height`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string - Additional CSS classes

**Example:**
```tsx
<ProgressBar percentage={75} variant="success" />
<ProgressBar percentage={50} showLabel={false} height="lg" />
```

### LoadingSpinner

An animated loading spinner component.

**Props:**
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: string - Custom spinner color
- `className`: string - Additional CSS classes
- `label`: string (default: 'Loading...') - Accessible label

**Example:**
```tsx
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" color="#FF5722" />
```

### Toast Notifications

A toast notification system with helper functions.

**Functions:**
- `showSuccess(message, options?)` - Shows success toast
- `showError(message, options?)` - Shows error toast
- `showInfo(message, options?)` - Shows info toast
- `showWarning(message, options?)` - Shows warning toast

**Component:**
- `ToastContainer` - Must be added to app root

**Example:**
```tsx
// In App.tsx
import { ToastContainer } from './components/common';

function App() {
  return (
    <>
      <ToastContainer />
      {/* rest of app */}
    </>
  );
}

// In any component
import { showSuccess, showError } from './components/common';

const handleSubmit = async () => {
  try {
    await submitForm();
    showSuccess('Form submitted successfully!');
  } catch (error) {
    showError('Failed to submit form');
  }
};
```

## Demo

To see all components in action, import and use the `ComponentsDemo` component:

```tsx
import { ComponentsDemo } from './components/common/ComponentsDemo';

// In your route or page
<ComponentsDemo />
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Theming

All components use CSS variables from the theme system and automatically adapt to light/dark themes. Colors are defined in:
- `src/styles/themes/light.ts`
- `src/styles/themes/dark.ts`

## Testing

Components can be tested using React Testing Library:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

test('button click handler', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  fireEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```
