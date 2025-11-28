/**
 * Task Parser Utility
 * 
 * Parses markdown task list format from tasks.md files
 * Extracts task number, description, status, and optional flag
 * Handles nested tasks (subtasks) and builds task tree structure
 * 
 * Requirements: 7.1
 */

import type { Task } from '../types';

/**
 * Parse tasks from markdown content
 * 
 * Format: - [ ] 1. Task description
 *         - [x] 2. Completed task
 *         - [ ]* 3. Optional task
 *         - [-] 4. In progress task
 * 
 * @param content - Markdown content from tasks.md
 * @returns Array of parsed tasks
 */
export function parseTasksFromMarkdown(content: string): Task[] {
  const tasks: Task[] = [];
  const lines = content.split('\n');
  const taskMap = new Map<string, Task>();
  
  // Regular expression to match task lines
  // Matches: - [ ] 1.2 Task description or - [x] 1. Task description
  const taskRegex = /^(\s*)- \[([ x\-])\](\*)?\s+(\d+(?:\.\d+)?)\s+(.+)$/;
  
  for (const line of lines) {
    const match = line.match(taskRegex);
    
    if (match) {
      const [, , statusChar, optionalMarker, taskNumber, description] = match;
      
      // Determine status from checkbox character
      let status: Task['status'] = 'pending';
      if (statusChar === 'x') {
        status = 'completed';
      } else if (statusChar === '-') {
        status = 'in_progress';
      }
      
      // Check if task is optional (marked with *)
      const isOptional = optionalMarker === '*';
      
      // Determine parent based on task number
      // e.g., "1.2" has parent "1", "1.2.3" has parent "1.2"
      const parts = taskNumber.split('.');
      let parent: string | null = null;
      
      if (parts.length > 1) {
        // This is a subtask
        parent = parts.slice(0, -1).join('.');
      }
      
      const task: Task = {
        number: taskNumber,
        description: description.trim(),
        status,
        isOptional,
        requirementsRefs: extractRequirementRefs(description),
        parent,
        subtasks: [],
      };
      
      tasks.push(task);
      taskMap.set(taskNumber, task);
    }
  }
  
  // Build subtask relationships
  for (const task of tasks) {
    if (task.parent) {
      const parentTask = taskMap.get(task.parent);
      if (parentTask) {
        parentTask.subtasks.push(task.number);
      }
    }
  }
  
  return tasks;
}

/**
 * Extract requirement references from task description
 * 
 * Looks for patterns like "_Requirements: 1.1, 2.3_" or "_Requirements: All_"
 * 
 * @param description - Task description text
 * @returns Array of requirement references
 */
function extractRequirementRefs(description: string): string[] {
  const refs: string[] = [];
  
  // Match patterns like "_Requirements: 1.1, 2.3_"
  const reqRegex = /_Requirements?:\s*([^_]+)_/i;
  const match = description.match(reqRegex);
  
  if (match) {
    const reqText = match[1].trim();
    
    // Handle "All" case
    if (reqText.toLowerCase() === 'all' || reqText.toLowerCase() === 'all (foundational)') {
      return ['All'];
    }
    
    // Split by comma and clean up
    const parts = reqText.split(',').map(part => part.trim());
    refs.push(...parts);
  }
  
  return refs;
}

/**
 * Get the next pending task from a list of tasks
 * 
 * @param tasks - Array of tasks
 * @returns The next pending task, or null if none found
 */
export function getNextPendingTask(tasks: Task[]): Task | null {
  // Sort tasks by number to ensure correct order
  const sortedTasks = [...tasks].sort((a, b) => {
    const aParts = a.number.split('.').map(Number);
    const bParts = b.number.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      
      if (aVal !== bVal) {
        return aVal - bVal;
      }
    }
    
    return 0;
  });
  
  // Find first pending task
  return sortedTasks.find(task => task.status === 'pending') || null;
}

/**
 * Get all top-level tasks (tasks without parents)
 * 
 * @param tasks - Array of tasks
 * @returns Array of top-level tasks
 */
export function getTopLevelTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => task.parent === null);
}

/**
 * Get subtasks for a given parent task
 * 
 * @param tasks - Array of all tasks
 * @param parentNumber - Parent task number
 * @returns Array of subtasks
 */
export function getSubtasks(tasks: Task[], parentNumber: string): Task[] {
  return tasks.filter(task => task.parent === parentNumber);
}

/**
 * Calculate task statistics from a list of tasks
 * 
 * @param tasks - Array of tasks
 * @returns Task statistics object
 */
export function calculateTaskStats(tasks: Task[]) {
  const stats = {
    total: tasks.length,
    completed: 0,
    inProgress: 0,
    pending: 0,
    failed: 0,
  };
  
  for (const task of tasks) {
    switch (task.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'in_progress':
        stats.inProgress++;
        break;
      case 'pending':
        stats.pending++;
        break;
      case 'failed':
        stats.failed++;
        break;
    }
  }
  
  return stats;
}
