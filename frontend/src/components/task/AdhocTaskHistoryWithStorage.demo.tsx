/**
 * AdhocTaskHistory with Local Storage Demo
 * Demonstrates the AdhocTaskHistory component with local storage integration
 * 
 * This demo shows how to:
 * - Load history from local storage on mount
 * - Save history to local storage when tasks are executed
 * - Maintain the 50-item limit automatically
 */

import { useState, useEffect } from 'react';
import { AdhocTaskHistory } from './AdhocTaskHistory';
import { AdhocTaskModal } from './AdhocTaskModal';
import type { AdhocTaskHistoryItem } from './AdhocTaskHistory';
import { Button } from '../common';
import {
  loadAdhocHistory,
  addAdhocTaskToHistory,
  clearAdhocHistory,
  getMaxHistoryItems,
} from '../../utils/adhocTaskStorage';

/**
 * Demo component showing AdhocTaskHistory with local storage integration
 * Requirements: 2.5.1, 2.5.2
 */
export function AdhocTaskHistoryWithStorageDemo() {
  const [history, setHistory] = useState<AdhocTaskHistoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  /**
   * Load history from local storage on component mount
   * Requirement 2.5.1: Load history on component mount
   */
  useEffect(() => {
    const loadedHistory = loadAdhocHistory();
    setHistory(loadedHistory);
  }, []);

  /**
   * Handle executing an adhoc task
   * Requirement 2.5.1: Save executed tasks to local storage
   * Requirement 2.5.2: Limit to last 50 tasks
   */
  const handleExecute = async (instruction: string) => {
    setIsExecuting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new history item
      const newItem: AdhocTaskHistoryItem = {
        id: Date.now().toString(),
        instruction,
        status: Math.random() > 0.2 ? 'success' : 'failure', // 80% success rate for demo
        executedAt: new Date(),
        logs: `Executing: ${instruction}\n\nProcessing...\nCompleted successfully!`,
        filesModified: ['src/example.ts', 'src/utils/helper.ts'],
      };

      // Add to history and save to local storage (automatically limits to 50)
      const updatedHistory = addAdhocTaskToHistory(newItem, history);
      setHistory(updatedHistory);

      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to execute adhoc task:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Handle rerunning a task from history
   */
  const handleRerun = () => {
    setIsModalOpen(true);
    // The modal will be opened with the instruction pre-filled
    // In a real implementation, you'd pass initialInstruction to the modal
  };

  /**
   * Handle clearing all history
   */
  const handleClearHistory = () => {
    const clearedHistory = clearAdhocHistory();
    setHistory(clearedHistory);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">AdhocTaskHistory with Local Storage Demo</h1>
        <p className="text-sm text-text-secondary">
          This demo shows how adhoc task history is persisted to local storage.
          History is automatically limited to {getMaxHistoryItems()} items.
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          Execute Adhoc Task
        </Button>
        <Button onClick={handleClearHistory} variant="secondary">
          Clear History
        </Button>
      </div>

      {/* Stats */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <p className="text-sm">
          <span className="font-semibold">History Items:</span> {history.length} / {getMaxHistoryItems()}
        </p>
        <p className="text-xs text-text-tertiary mt-1">
          History is automatically saved to local storage and limited to the last {getMaxHistoryItems()} tasks.
        </p>
      </div>

      {/* History Component */}
      <AdhocTaskHistory history={history} onRerun={handleRerun} />

      {/* Modal */}
      <AdhocTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExecute={handleExecute}
        isExecuting={isExecuting}
      />
    </div>
  );
}
