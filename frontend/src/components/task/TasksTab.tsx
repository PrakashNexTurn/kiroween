/**
 * TasksTab Component
 * 
 * Displays task list with execution controls and log viewer
 * Implements task execution workflow
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, PlayCircle, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { showSuccess, showError } from '../common/Toast';
import { TaskItem } from './TaskItem';
import { LogViewer } from './LogViewer';
import { projectService } from '../../services/projectService';
import { parseTasksFromMarkdown, getNextPendingTask } from '../../utils/taskParser';
import type { Task } from '../../types';

export interface TasksTabProps {
  projectId: string;
  onTaskComplete?: () => void;
  onExecutionStateChange?: (isExecuting: boolean) => void;
}

/**
 * TasksTab displays and manages project tasks
 * 
 * Requirements:
 * - 7.1: Fetch tasks.md content and parse tasks
 * - 7.2: Display task list with TaskItem components
 * - 7.3: Find next pending task and execute
 * - 7.4: Show loading state during execution
 * - 7.5: Stream logs and update task status
 */
export function TasksTab({ projectId, onTaskComplete, onExecutionStateChange }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [logs, setLogs] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Notify parent component when execution state changes
  const updateExecutingState = (isExecuting: boolean) => {
    setExecuting(isExecuting);
    if (onExecutionStateChange) {
      onExecutionStateChange(isExecuting);
    }
  };

  // Fetch and parse tasks.md (Requirement 7.1)
  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectService.readSpecFile(projectId, 'tasks.md');
      const parsedTasks = parseTasksFromMarkdown(response.content);
      
      setTasks(parsedTasks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Execute next pending task (Requirements 7.3, 7.4, 7.5)
  const executeNextTask = async () => {
    const nextTask = getNextPendingTask(tasks);
    
    if (!nextTask) {
      showError('No pending tasks to execute');
      return;
    }

    try {
      updateExecutingState(true);
      setLogs(''); // Clear previous logs
      
      // Update task status to in_progress
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number === nextTask.number
            ? { ...t, status: 'in_progress' as const }
            : t
        )
      );

      // Call API to execute task (Requirement 7.3)
      const response = await projectService.executeTask(projectId, nextTask.number);
      
      // Display logs (Requirement 7.5)
      if (response.logs) {
        setLogs(response.logs);
      }

      // Update task status based on result
      const success = response.status === 'success';
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number === nextTask.number
            ? { ...t, status: success ? 'completed' : 'failed' }
            : t
        )
      );

      if (success) {
        showSuccess(`Task ${nextTask.number} completed successfully`);
        
        // Refresh project status
        if (onTaskComplete) {
          onTaskComplete();
        }
      } else {
        showError(`Task ${nextTask.number} failed`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task execution failed';
      showError(errorMessage);
      
      // Mark task as failed
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number === nextTask.number
            ? { ...t, status: 'failed' as const }
            : t
        )
      );
      
      // Add error to logs
      setLogs(prev => prev + '\n\nError: ' + errorMessage);
    } finally {
      updateExecutingState(false);
    }
  };

  // Execute all pending tasks sequentially
  const executeAllTasks = async () => {
    let nextTask = getNextPendingTask(tasks);
    
    while (nextTask) {
      await executeNextTask();
      nextTask = getNextPendingTask(tasks);
    }
  };

  // Execute all tasks in a specific section (e.g., all 1.x tasks)
  const executeSectionTasks = async (sectionNumber: string) => {
    try {
      updateExecutingState(true);
      setLogs(''); // Clear previous logs
      
      // Update all tasks in this section to in_progress
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number.startsWith(sectionNumber + '.')
            ? { ...t, status: 'in_progress' as const }
            : t
        )
      );

      // Call API to execute section tasks (pass just the section number like "1")
      const response = await projectService.executeTask(projectId, sectionNumber);
      
      // Display logs
      if (response.logs) {
        setLogs(response.logs);
      }

      // Update task statuses based on result
      const success = response.status === 'success';
      
      if (success) {
        // Mark all tasks in section as completed
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.number.startsWith(sectionNumber + '.')
              ? { ...t, status: 'completed' as const }
              : t
          )
        );
        
        showSuccess(`Section ${sectionNumber} completed successfully`);
        
        // Refresh project status
        if (onTaskComplete) {
          onTaskComplete();
        }
      } else {
        // Mark tasks as failed
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.number.startsWith(sectionNumber + '.')
              ? { ...t, status: 'failed' as const }
              : t
          )
        );
        
        showError(`Section ${sectionNumber} execution failed`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Section execution failed';
      showError(errorMessage);
      
      // Mark tasks as failed
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number.startsWith(sectionNumber + '.')
            ? { ...t, status: 'failed' as const }
            : t
        )
      );
      
      // Add error to logs
      setLogs(prev => prev + '\n\nError: ' + errorMessage);
    } finally {
      updateExecutingState(false);
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    setLogs('');
  };

  // Execute a specific task when clicked
  const executeSpecificTask = async (task: Task) => {
    // Don't execute if already completed or currently executing
    if (task.status === 'completed' || executing) {
      return;
    }

    try {
      updateExecutingState(true);
      setLogs(''); // Clear previous logs
      
      // Update task status to in_progress
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number === task.number
            ? { ...t, status: 'in_progress' as const }
            : t
        )
      );

      // Call API to execute specific task
      const response = await projectService.executeTask(projectId, task.number);
      
      // Display logs
      if (response.logs) {
        setLogs(response.logs);
      }

      // Update task status based on result
      const success = response.status === 'success';
      
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number === task.number
            ? { ...t, status: success ? 'completed' : 'failed' }
            : t
        )
      );

      if (success) {
        showSuccess(`Task ${task.number} completed successfully`);
        
        // Refresh project status
        if (onTaskComplete) {
          onTaskComplete();
        }
      } else {
        showError(`Task ${task.number} failed`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task execution failed';
      showError(errorMessage);
      
      // Mark task as failed
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.number === task.number
            ? { ...t, status: 'failed' as const }
            : t
        )
      );
      
      // Add error to logs
      setLogs(prev => prev + '\n\nError: ' + errorMessage);
    } finally {
      updateExecutingState(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <AlertCircle className="w-12 h-12 text-status-error" />
        <p className="text-text-secondary">{error}</p>
        <Button onClick={fetchTasks}>Retry</Button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-text-secondary">No tasks found in tasks.md</p>
        <Button onClick={fetchTasks}>Refresh</Button>
      </div>
    );
  }

  const nextTask = getNextPendingTask(tasks);
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group tasks by their top-level parent (1.x, 2.x, 3.x, etc.)
  const taskGroups = new Map<string, Task[]>();
  
  tasks.forEach(task => {
    const topLevelNumber = task.number.split('.')[0];
    if (!taskGroups.has(topLevelNumber)) {
      taskGroups.set(topLevelNumber, []);
    }
    taskGroups.get(topLevelNumber)!.push(task);
  });

  // Convert to array and sort by group number
  const sortedGroups = Array.from(taskGroups.entries()).sort((a, b) => 
    parseInt(a[0]) - parseInt(b[0])
  );

  return (
    <>
      {/* Full-screen loading overlay during execution - rendered at body level */}
      {executing && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          <div 
            className="rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '2px solid var(--color-border)'
            }}
          >
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Executing Task...
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Please wait, this may take several minutes
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

    <div className="space-y-4">
      {/* Compact Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {completedCount}/{totalCount} ({progress.toFixed(0)}%)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={executeNextTask}
            disabled={!nextTask || executing}
            variant="primary"
            size="sm"
          >
            {executing ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute Next</span>
              </>
            )}
          </Button>

          <Button
            onClick={executeAllTasks}
            disabled={!nextTask || executing}
            variant="secondary"
            size="sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Execute All</span>
          </Button>

          <Button onClick={fetchTasks} variant="ghost" size="sm" disabled={executing}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Compact Progress bar */}
      <div 
        className="w-full bg-background-tertiary rounded-full h-1.5"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Task completion progress"
      >
        <div
          className="bg-status-success h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Task groups in columns (Requirement 7.2) */}
      <div 
        className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3"
        role="list"
        aria-label="Project tasks grouped by section"
      >
        {sortedGroups.map(([groupNumber, groupTasks]) => {
          const hasPendingTasks = groupTasks.some(t => t.status === 'pending' || t.status === 'in_progress');
          
          return (
            <div 
              key={groupNumber}
              className="border rounded-lg p-3 space-y-1.5"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {/* Group header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">
                  Section {groupNumber}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">
                    {groupTasks.filter(t => t.status === 'completed').length}/{groupTasks.length}
                  </span>
                  <Button
                    onClick={() => executeSectionTasks(groupNumber)}
                    disabled={!hasPendingTasks || executing}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    title={`Execute all tasks in section ${groupNumber}`}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Tasks in this group */}
              <div className="space-y-1">
                {groupTasks.map(task => (
                  <TaskItem
                    key={task.number}
                    task={task}
                    onClick={() => executeSpecificTask(task)}
                    isNested={task.parent !== null}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log viewer (Requirement 7.5) */}
      <LogViewer
        logs={logs}
        isStreaming={executing}
        onClear={handleClearLogs}
      />
    </div>
    </>
  );
}
