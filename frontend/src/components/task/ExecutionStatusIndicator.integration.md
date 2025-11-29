# ExecutionStatusIndicator Integration Guide

## Overview

The `ExecutionStatusIndicator` component provides a dismissible status notification for task execution. It displays an animated spinner during execution and can be dismissed after completion.

## Requirements Fulfilled

- **Requirement 2.3.2**: Display animated spinner during execution and show status message
- **Requirement 2.3.3**: Make dismissible after completion

## Basic Usage

### Option 1: Using the Component Directly

```tsx
import { ExecutionStatusIndicator } from './components/task';
import type { ExecutionStatus } from './components/task';

function MyComponent() {
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [message, setMessage] = useState('');

  const handleExecute = async () => {
    setStatus('executing');
    setMessage('Processing your request...');
    
    try {
      await someAsyncOperation();
      setStatus('success');
      setMessage('Operation completed successfully!');
    } catch (error) {
      setStatus('error');
      setMessage('Operation failed. Please try again.');
    }
  };

  return (
    <>
      <button onClick={handleExecute}>Execute</button>
      
      <ExecutionStatusIndicator
        status={status}
        message={message}
        onDismiss={() => setStatus('idle')}
      />
    </>
  );
}
```

### Option 2: Using the Hook (Recommended)

```tsx
import { ExecutionStatusIndicator, useExecutionStatus } from './components/task';

function MyComponent() {
  const {
    status,
    message,
    startExecution,
    completeExecution,
    failExecution,
    reset,
  } = useExecutionStatus();

  const handleExecute = async () => {
    startExecution('Processing your request...');
    
    try {
      await someAsyncOperation();
      completeExecution('Operation completed successfully!');
    } catch (error) {
      failExecution('Operation failed. Please try again.');
    }
  };

  return (
    <>
      <button onClick={handleExecute}>Execute</button>
      
      <ExecutionStatusIndicator
        status={status}
        message={message}
        onDismiss={reset}
      />
    </>
  );
}
```

## Integration with TasksTab

Here's how to integrate the ExecutionStatusIndicator into the TasksTab component:

```tsx
import { ExecutionStatusIndicator, useExecutionStatus } from './ExecutionStatusIndicator';

export function TasksTab({ projectId, onTaskComplete }: TasksTabProps) {
  const [executing, setExecuting] = useState(false);
  
  // Add execution status hook
  const {
    status: executionStatus,
    message: executionMessage,
    startExecution,
    completeExecution,
    failExecution,
    reset: resetExecutionStatus,
  } = useExecutionStatus();

  const executeNextTask = async () => {
    const nextTask = getNextPendingTask(tasks);
    
    if (!nextTask) {
      showError('No pending tasks to execute');
      return;
    }

    try {
      setExecuting(true);
      startExecution(`Executing task ${nextTask.number}...`);
      
      const response = await projectService.executeTask(projectId, nextTask.number);
      
      if (response.status === 'success') {
        completeExecution(`Task ${nextTask.number} completed successfully`);
        showSuccess(`Task ${nextTask.number} completed successfully`);
      } else {
        failExecution(`Task ${nextTask.number} failed`);
        showError(`Task ${nextTask.number} failed`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task execution failed';
      failExecution(errorMessage);
      showError(errorMessage);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div>
      {/* Your existing TasksTab content */}
      
      {/* Add the execution status indicator */}
      <ExecutionStatusIndicator
        status={executionStatus}
        message={executionMessage}
        onDismiss={resetExecutionStatus}
        autoHideDelay={5000} // Auto-hide after 5 seconds
      />
    </div>
  );
}
```

## Props

### ExecutionStatusIndicator

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'idle' \| 'executing' \| 'success' \| 'error'` | Required | Current execution status |
| `message` | `string` | Optional | Custom status message (uses default if not provided) |
| `onDismiss` | `() => void` | Optional | Callback when user dismisses the notification |
| `autoHideDelay` | `number` | `0` | Auto-hide delay in milliseconds (0 to disable) |
| `className` | `string` | `''` | Additional CSS classes |

### useExecutionStatus Hook

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `status` | `ExecutionStatus` | Current execution status |
| `message` | `string` | Current status message |
| `startExecution` | `(msg?: string) => void` | Set status to 'executing' |
| `completeExecution` | `(msg?: string) => void` | Set status to 'success' |
| `failExecution` | `(msg?: string) => void` | Set status to 'error' |
| `reset` | `() => void` | Reset to 'idle' status |

## Features

- ✅ Animated spinner during execution (Requirement 2.3.2)
- ✅ Status message display (Requirement 2.3.2)
- ✅ Dismissible after completion (Requirement 2.3.3)
- ✅ Auto-hide with configurable delay
- ✅ Accessible with ARIA attributes
- ✅ Smooth slide-up animation
- ✅ Convenient hook for state management
- ✅ Fixed positioning (bottom-right corner)
- ✅ Responsive design

## Accessibility

The component includes proper ARIA attributes:

- `role="status"` for screen readers
- `aria-live="polite"` for executing/success states
- `aria-live="assertive"` for error states
- `aria-atomic="true"` to announce the entire message
- `aria-label` on dismiss button

## Styling

The component uses CSS variables from the theme system:

- `--color-accent-primary` for executing state
- `--color-status-success` for success state
- `--color-status-error` for error state
- `--color-text-inverse` for text color

## Animation

The component uses the `animate-slideInUp` CSS animation defined in `index.css`:

```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Demo

See `ExecutionStatusIndicator.demo.tsx` for a complete interactive demo showcasing all features.
