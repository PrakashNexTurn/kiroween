# Adhoc Task History Integration Guide

This guide explains how to integrate the local storage functionality for adhoc task history into the TasksTab component.

## Overview

Task 16 implemented the local storage utilities. Task 17 will integrate these utilities into the TasksTab component to provide a complete adhoc task execution experience with persistent history.

## What Was Implemented (Task 16)

1. **Local Storage Utility** (`frontend/src/utils/adhocTaskStorage.ts`)
   - `saveAdhocHistory()` - Save history to local storage
   - `loadAdhocHistory()` - Load history from local storage
   - `addAdhocTaskToHistory()` - Add new task and auto-save
   - `clearAdhocHistory()` - Clear all history
   - `getMaxHistoryItems()` - Get max limit (50)

2. **Demo Component** (`frontend/src/components/task/AdhocTaskHistoryWithStorage.demo.tsx`)
   - Shows complete working example
   - Demonstrates loading on mount
   - Demonstrates saving after execution
   - Shows automatic 50-item limit

3. **Tests** (`frontend/src/utils/adhocTaskStorage.test.ts`)
   - Unit tests for all storage functions
   - Tests for 50-item limit enforcement
   - Tests for error handling

4. **Documentation** (`frontend/src/utils/adhocTaskStorage.md`)
   - Complete API reference
   - Usage examples
   - Integration patterns

## Integration Steps (For Task 17)

When implementing Task 17 (Update TasksTab component), follow these steps:

### Step 1: Import the Storage Utilities

```typescript
import {
  loadAdhocHistory,
  addAdhocTaskToHistory,
} from '../../utils/adhocTaskStorage';
import { AdhocTaskHistory } from './AdhocTaskHistory';
import { AdhocTaskModal } from './AdhocTaskModal';
import type { AdhocTaskHistoryItem } from './AdhocTaskHistory';
```

### Step 2: Add State for History and Modal

```typescript
const [adhocHistory, setAdhocHistory] = useState<AdhocTaskHistoryItem[]>([]);
const [isAdhocModalOpen, setIsAdhocModalOpen] = useState(false);
const [isExecutingAdhoc, setIsExecutingAdhoc] = useState(false);
```

### Step 3: Load History on Mount

```typescript
useEffect(() => {
  const loadedHistory = loadAdhocHistory();
  setAdhocHistory(loadedHistory);
}, []);
```

### Step 4: Handle Adhoc Task Execution

```typescript
const handleExecuteAdhoc = async (instruction: string) => {
  setIsExecutingAdhoc(true);

  try {
    // Call API to execute custom instruction
    const response = await customInstructionService.executeCustomInstruction(
      projectId,
      instruction
    );

    // Create history item
    const newItem: AdhocTaskHistoryItem = {
      id: Date.now().toString(),
      instruction,
      status: response.status === 'success' ? 'success' : 'failure',
      executedAt: new Date(),
      logs: response.logs,
      error: response.status === 'failure' ? response.output : undefined,
      filesModified: response.output?.filesModified,
    };

    // Add to history and save to local storage
    const updatedHistory = addAdhocTaskToHistory(newItem, adhocHistory);
    setAdhocHistory(updatedHistory);

    // Close modal on success
    if (response.status === 'success') {
      setIsAdhocModalOpen(false);
      showSuccess('Adhoc task completed successfully');
      
      // Refresh project status
      if (onTaskComplete) {
        onTaskComplete();
      }
    } else {
      showError('Adhoc task failed');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to execute adhoc task';
    showError(errorMessage);
  } finally {
    setIsExecutingAdhoc(false);
  }
};
```

### Step 5: Handle Rerun from History

```typescript
const handleRerunAdhoc = (instruction: string) => {
  // Open modal with pre-filled instruction
  setIsAdhocModalOpen(true);
  // Note: You'll need to add initialInstruction prop to modal state
};
```

### Step 6: Add UI Components to TasksTab

```typescript
return (
  <div className="space-y-4">
    {/* Existing task list UI */}
    
    {/* Add "Execute Adhoc Task" button */}
    <Button
      onClick={() => setIsAdhocModalOpen(true)}
      disabled={executing || isExecutingAdhoc}
      variant="primary"
    >
      Execute Adhoc Task
    </Button>

    {/* Add Adhoc Task History */}
    <AdhocTaskHistory
      history={adhocHistory}
      onRerun={handleRerunAdhoc}
    />

    {/* Add Adhoc Task Modal */}
    <AdhocTaskModal
      isOpen={isAdhocModalOpen}
      onClose={() => setIsAdhocModalOpen(false)}
      onExecute={handleExecuteAdhoc}
      isExecuting={isExecutingAdhoc}
    />
  </div>
);
```

## Requirements Satisfied

### Requirement 2.5.1: Save and Load History
- ✅ `loadAdhocHistory()` loads history on component mount
- ✅ `addAdhocTaskToHistory()` saves executed tasks to local storage

### Requirement 2.5.2: Limit to Last 50 Tasks
- ✅ `saveAdhocHistory()` automatically limits to 50 items
- ✅ `addAdhocTaskToHistory()` maintains the limit when adding new tasks

## Testing the Integration

1. Execute an adhoc task
2. Refresh the page
3. Verify the task appears in history
4. Execute 50+ tasks
5. Verify only the last 50 are kept
6. Click "Rerun" on a history item
7. Verify the modal opens with the instruction

## Demo

Run the demo component to see the complete integration:

```typescript
import { AdhocTaskHistoryWithStorageDemo } from '@/components/task/AdhocTaskHistoryWithStorage.demo';

// Add to your demo page or test it standalone
<AdhocTaskHistoryWithStorageDemo />
```

## Notes

- The storage key is `kiro-ghost-adhoc-history`
- History items are stored with ISO date strings
- All functions handle errors gracefully
- The 50-item limit is enforced automatically
- Most recent tasks appear first in the history
