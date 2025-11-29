/**
 * Adhoc Task Storage Utility
 * 
 * Manages local storage for adhoc task history
 * Requirements: 2.5.1, 2.5.2
 */

import type { AdhocTaskHistoryItem } from '../components/task/AdhocTaskHistory';

const STORAGE_KEY = 'kiro-ghost-adhoc-history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Serializable version of AdhocTaskHistoryItem for storage
 */
interface StoredAdhocTaskHistoryItem {
  id: string;
  instruction: string;
  status: 'success' | 'failure';
  executedAt: string; // ISO string
  logs: string;
  error?: string;
  filesModified?: string[];
}

/**
 * Save adhoc task history to local storage
 * Requirement 2.5.1: Save executed tasks to local storage
 * Requirement 2.5.2: Limit to last 50 tasks
 * 
 * @param history - Array of adhoc task history items
 */
export function saveAdhocHistory(history: AdhocTaskHistoryItem[]): void {
  try {
    // Limit to last 50 tasks
    const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS);
    
    // Convert Date objects to ISO strings for storage
    const storedHistory: StoredAdhocTaskHistoryItem[] = limitedHistory.map(item => ({
      ...item,
      executedAt: item.executedAt.toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedHistory));
  } catch (error) {
    console.error('Failed to save adhoc history to local storage:', error);
  }
}

/**
 * Load adhoc task history from local storage
 * Requirement 2.5.1: Load history on component mount
 * 
 * @returns Array of adhoc task history items
 */
export function loadAdhocHistory(): AdhocTaskHistoryItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return [];
    }
    
    const storedHistory: StoredAdhocTaskHistoryItem[] = JSON.parse(stored);
    
    // Convert ISO strings back to Date objects
    const history: AdhocTaskHistoryItem[] = storedHistory.map(item => ({
      ...item,
      executedAt: new Date(item.executedAt),
    }));
    
    return history;
  } catch (error) {
    console.error('Failed to load adhoc history from local storage:', error);
    return [];
  }
}

/**
 * Add a new adhoc task to history
 * Automatically saves to local storage and maintains the 50-item limit
 * 
 * @param item - The adhoc task history item to add
 * @param existingHistory - Current history array
 * @returns Updated history array
 */
export function addAdhocTaskToHistory(
  item: AdhocTaskHistoryItem,
  existingHistory: AdhocTaskHistoryItem[]
): AdhocTaskHistoryItem[] {
  // Add new item to the beginning of the array (most recent first)
  const updatedHistory = [item, ...existingHistory];
  
  // Save to local storage (will automatically limit to 50)
  saveAdhocHistory(updatedHistory);
  
  return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
}

/**
 * Clear all adhoc task history
 * 
 * @returns Empty array
 */
export function clearAdhocHistory(): AdhocTaskHistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear adhoc history from local storage:', error);
  }
  return [];
}

/**
 * Get the maximum number of history items allowed
 * 
 * @returns Maximum history items (50)
 */
export function getMaxHistoryItems(): number {
  return MAX_HISTORY_ITEMS;
}
