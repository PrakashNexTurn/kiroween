# Adhoc Task Storage Utility

This utility module provides local storage management for adhoc task history in Kiro's Ghost.

## Overview

The adhoc task storage utility handles:
- Saving executed adhoc tasks to browser local storage
- Loading task history on component mount
- Automatically limiting history to the last 50 tasks
- Providing a clean API for history management

## Requirements

- **2.5.1**: Save executed tasks to local storage and load history on component mount
- **2.5.2**: Limit to last 50 tasks

## API Reference

### `saveAdhocHistory(history: AdhocTaskHistoryItem[]): void`

Saves the adhoc task history to local storage. Automatically limits to the last 50 tasks.

```typescript
import { saveAdhocHistory } from '@/utils/adhocTaskStorage';

const history: AdhocTaskHistoryItem[] = [...];
saveAdhocHistory(history);
```

### `loadAdhocHistory(): AdhocTaskHistoryItem[]`

Loads the adhoc task history from local storage. Returns an empty array if no history exists or if there's an error.

```typescript
import { loadAdhocHistory } from '@/utils/adhocTaskStorage';

const history = loadAdhocHistory();
console.log(`Loaded ${history.length} tasks from history`);
```

### `addAdhocTaskToHistory(item: AdhocTaskHistoryItem, existingHistory: AdhocTaskHistoryItem[]): AdhocTaskHistoryItem[]`

Adds a new adhoc task to the history. The new task is added to the beginning of the array (most recent first). Automatically saves to local storage and maintains the 50-item limit.

```typescript
import { addAdhocTaskToHistory } from '@/utils/adhocTaskStorage';

const newTask: AdhocTaskHistoryItem = {
  id: Date.now().toString(),
  instruction: 'Fix linting errors',
  status: 'success',
  executedAt: new Date(),
  logs: 'Task completed successfully',
  filesModified: ['src/app.ts'],
};

const updatedHistory = addAdhocTaskToHistory(newTask, currentHistory);
setHistory(updatedHistory);
```

### `clearAdhocHistory(): AdhocTaskHistoryItem[]`

Clears all adhoc task history from local storage. Returns an empty array.

```typescript
import { clearAdhocHistory } from '@/utils/adhocTaskStorage';

const emptyHistory = clearAdhocHistory();
setHistory(emptyHistory);
```

### `getMaxHistoryItems(): number`

Returns the maximum number of history items allowed (50).

```typescript
import { getMaxHistoryItems } from '@/utils/adhocTaskStorage';

console.log(`Maximum history items: ${getMaxHistoryItems()}`);
```

## Usage Example

Here's a complete example of integrating local storage with the AdhocTaskHistory component:

```typescript
import { useState, useEffect } from 'react';
import { AdhocTaskHistory } from '@/components/task/AdhocTaskHistory';
import type { AdhocTaskHistoryItem } from '@/components/task/AdhocTaskHistory';
import {
  loadAdhocHistory,
  addAdhocTaskToHistory,
} from '@/utils/adhocTaskStorage';

function MyComponent() {
  const [history, setHistory] = useState<AdhocTaskHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const loadedHistory = loadAdhocHistory();
    setHistory(loadedHistory);
  }, []);

  // Execute adhoc task and save to history
  const handleExecute = async (instruction: string) => {
    try {
      // Call API to execute task
      const response = await executeCustomInstruction(projectId, instruction);

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
      const updatedHistory = addAdhocTaskToHistory(newItem, history);
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Failed to execute task:', error);
    }
  };

  const handleRerun = (instruction: string) => {
    // Open modal with pre-filled instruction
    handleExecute(instruction);
  };

  return (
    <AdhocTaskHistory history={history} onRerun={handleRerun} />
  );
}
```

## Storage Details

### Storage Key

The history is stored in local storage under the key: `kiro-ghost-adhoc-history`

### Data Format

The data is stored as a JSON string containing an array of objects with the following structure:

```typescript
interface StoredAdhocTaskHistoryItem {
  id: string;
  instruction: string;
  status: 'success' | 'failure';
  executedAt: string; // ISO 8601 date string
  logs: string;
  error?: string;
  filesModified?: string[];
}
```

### Size Limit

The history is automatically limited to the last 50 tasks. When saving, if the history exceeds 50 items, only the first 50 (most recent) are kept.

### Error Handling

All functions include try-catch blocks to handle errors gracefully:
- If saving fails, an error is logged to the console but the application continues
- If loading fails or data is corrupted, an empty array is returned
- If clearing fails, an error is logged but an empty array is still returned

## Browser Compatibility

This utility uses the browser's `localStorage` API, which is supported in all modern browsers. The storage limit varies by browser but is typically 5-10 MB, which is more than sufficient for 50 task history items.

## Testing

See `adhocTaskStorage.test.ts` for comprehensive unit tests covering:
- Saving and loading history
- Adding tasks to history
- Automatic 50-item limit enforcement
- Clearing history
- Error handling for corrupted data

## Demo

See `AdhocTaskHistoryWithStorage.demo.tsx` for a complete working example of the local storage integration with the AdhocTaskHistory component.
