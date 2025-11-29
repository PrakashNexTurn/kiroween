/**
 * Tests for Adhoc Task Storage Utility
 * 
 * Tests the local storage functionality for adhoc task history
 * Requirements: 2.5.1, 2.5.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveAdhocHistory,
  loadAdhocHistory,
  addAdhocTaskToHistory,
  clearAdhocHistory,
  getMaxHistoryItems,
} from './adhocTaskStorage';
import type { AdhocTaskHistoryItem } from '../components/task/AdhocTaskHistory';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('adhocTaskStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveAdhocHistory and loadAdhocHistory', () => {
    it('should save and load history correctly', () => {
      const history: AdhocTaskHistoryItem[] = [
        {
          id: '1',
          instruction: 'Test instruction',
          status: 'success',
          executedAt: new Date('2024-01-01T12:00:00Z'),
          logs: 'Test logs',
        },
      ];

      saveAdhocHistory(history);
      const loaded = loadAdhocHistory();

      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
      expect(loaded[0].instruction).toBe('Test instruction');
      expect(loaded[0].status).toBe('success');
      expect(loaded[0].executedAt).toEqual(new Date('2024-01-01T12:00:00Z'));
    });

    it('should return empty array when no history exists', () => {
      const loaded = loadAdhocHistory();
      expect(loaded).toEqual([]);
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.setItem('kiro-ghost-adhoc-history', 'invalid json');
      const loaded = loadAdhocHistory();
      expect(loaded).toEqual([]);
    });
  });

  describe('addAdhocTaskToHistory', () => {
    it('should add new task to the beginning of history', () => {
      const existingHistory: AdhocTaskHistoryItem[] = [
        {
          id: '1',
          instruction: 'Old task',
          status: 'success',
          executedAt: new Date('2024-01-01T12:00:00Z'),
          logs: 'Old logs',
        },
      ];

      const newTask: AdhocTaskHistoryItem = {
        id: '2',
        instruction: 'New task',
        status: 'success',
        executedAt: new Date('2024-01-02T12:00:00Z'),
        logs: 'New logs',
      };

      const updated = addAdhocTaskToHistory(newTask, existingHistory);

      expect(updated).toHaveLength(2);
      expect(updated[0].id).toBe('2'); // New task should be first
      expect(updated[1].id).toBe('1'); // Old task should be second
    });

    it('should automatically save to local storage', () => {
      const newTask: AdhocTaskHistoryItem = {
        id: '1',
        instruction: 'Test task',
        status: 'success',
        executedAt: new Date(),
        logs: 'Test logs',
      };

      addAdhocTaskToHistory(newTask, []);

      const loaded = loadAdhocHistory();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe('1');
    });

    it('should limit history to 50 items', () => {
      // Create 60 tasks
      const existingHistory: AdhocTaskHistoryItem[] = Array.from({ length: 60 }, (_, i) => ({
        id: `${i}`,
        instruction: `Task ${i}`,
        status: 'success' as const,
        executedAt: new Date(),
        logs: `Logs ${i}`,
      }));

      const newTask: AdhocTaskHistoryItem = {
        id: '100',
        instruction: 'New task',
        status: 'success',
        executedAt: new Date(),
        logs: 'New logs',
      };

      const updated = addAdhocTaskToHistory(newTask, existingHistory);

      // Should be limited to 50
      expect(updated).toHaveLength(50);
      expect(updated[0].id).toBe('100'); // New task should be first
    });
  });

  describe('clearAdhocHistory', () => {
    it('should clear all history from local storage', () => {
      const history: AdhocTaskHistoryItem[] = [
        {
          id: '1',
          instruction: 'Test',
          status: 'success',
          executedAt: new Date(),
          logs: 'Logs',
        },
      ];

      saveAdhocHistory(history);
      expect(loadAdhocHistory()).toHaveLength(1);

      const cleared = clearAdhocHistory();
      expect(cleared).toEqual([]);
      expect(loadAdhocHistory()).toEqual([]);
    });
  });

  describe('getMaxHistoryItems', () => {
    it('should return 50', () => {
      expect(getMaxHistoryItems()).toBe(50);
    });
  });

  describe('saveAdhocHistory limit enforcement', () => {
    it('should limit saved history to 50 items', () => {
      // Create 60 tasks
      const history: AdhocTaskHistoryItem[] = Array.from({ length: 60 }, (_, i) => ({
        id: `${i}`,
        instruction: `Task ${i}`,
        status: 'success' as const,
        executedAt: new Date(),
        logs: `Logs ${i}`,
      }));

      saveAdhocHistory(history);
      const loaded = loadAdhocHistory();

      // Should be limited to 50
      expect(loaded).toHaveLength(50);
      // Should keep the first 50 items (most recent)
      expect(loaded[0].id).toBe('0');
      expect(loaded[49].id).toBe('49');
    });
  });
});
