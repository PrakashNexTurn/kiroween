/**
 * TasksTab Component
 * 
 * Displays task list with execution controls and log viewer
 * Implements task execution workflow
 * Enhanced with adhoc task execution functionality
 * Migrated to use Ant Design List
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5, 2.3.5, 3.4
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { List, Progress, Space, Typography, Card, Spin, Alert, Row, Col, Tooltip } from 'antd';
import { Play, PlayCircle, AlertCircle, Zap, RefreshCw, Edit } from 'lucide-react';
import { Button } from '../common/Button';
import { showSuccess, showError, showLongRunning } from '../common/Toast';
import { TaskItem } from './TaskItem';
import { LogViewer } from './LogViewer';
import { AdhocTaskModal } from './AdhocTaskModal';
import { AdhocTaskHistory } from './AdhocTaskHistory';
import type { AdhocTaskHistoryItem } from './AdhocTaskHistory';
import { projectService } from '../../services/projectService';
import { customInstructionService } from '../../services/customInstructionService';
import { parseTasksFromMarkdown, getNextPendingTask } from '../../utils/taskParser';
import { loadAdhocHistory, addAdhocTaskToHistory } from '../../utils/adhocTaskStorage';
import { useKeyboard } from '../../hooks/useKeyboard';
import type { Task } from '../../types';

const { Title, Text } = Typography;

export interface TasksTabProps {
  projectId: string;
  onTaskComplete?: () => void;
  onExecutionStateChange?: (isExecuting: boolean) => void;
  onEditClick?: () => void;
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
 * - 2.1.1: Display "Execute Adhoc Task" button
 * - 2.1.2: Open modal on button click
 * - 2.1.3: Use distinct visual style for adhoc button
 * - 2.1.4: Disable button when project is loading
 * - 2.1.5: Disable button when adhoc task is executing
 * - 2.3.5: Refresh project status after adhoc task completion
 */
export function TasksTab({ projectId, onTaskComplete, onExecutionStateChange, onEditClick }: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [logs, setLogs] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Adhoc task state
  const [isAdhocModalOpen, setIsAdhocModalOpen] = useState(false);
  const [isAdhocExecuting, setIsAdhocExecuting] = useState(false);
  const [adhocHistory, setAdhocHistory] = useState<AdhocTaskHistoryItem[]>([]);
  const [adhocInitialInstruction, setAdhocInitialInstruction] = useState('');

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

  // Load adhoc task history from local storage (Requirement 2.5.1)
  useEffect(() => {
    const history = loadAdhocHistory();
    setAdhocHistory(history);
  }, []);

  // Keyboard shortcut: Ctrl+K (Cmd+K) to open adhoc task modal (Requirement 2.1.2)
  useKeyboard([
    {
      key: 'k',
      ctrl: true,
      callback: () => {
        if (!loading && !executing && !isAdhocExecuting) {
          handleOpenAdhocModal();
        }
      },
      description: 'Open adhoc task modal',
    },
  ]);

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
      showError(errorMessage, {
        onRetry: fetchTasks
      });
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
      
      // Show long-running operation toast
      showLongRunning(`Executing task ${nextTask.number}...`);
      
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
        showError(`Task ${nextTask.number} failed`, {
          onRetry: executeNextTask
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task execution failed';
      showError(errorMessage, {
        onRetry: executeNextTask
      });
      
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
      
      // Show long-running operation toast
      showLongRunning(`Executing section ${sectionNumber}...`);
      
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
        
        showError(`Section ${sectionNumber} execution failed`, {
          onRetry: () => executeSectionTasks(sectionNumber)
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Section execution failed';
      showError(errorMessage, {
        onRetry: () => executeSectionTasks(sectionNumber)
      });
      
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

  /**
   * Open adhoc task modal
   * Requirement 2.1.2: Open modal on button click
   */
  const handleOpenAdhocModal = () => {
    setAdhocInitialInstruction('');
    setIsAdhocModalOpen(true);
  };

  /**
   * Close adhoc task modal
   */
  const handleCloseAdhocModal = () => {
    setIsAdhocModalOpen(false);
    setAdhocInitialInstruction('');
  };

  /**
   * Execute adhoc task
   * Requirement 2.3.1: Call API to execute custom instruction
   * Requirement 2.3.5: Refresh project status after completion
   */
  const handleExecuteAdhocTask = async (instruction: string) => {
    try {
      setIsAdhocExecuting(true);
      setLogs(''); // Clear previous logs
      
      // Show long-running operation toast
      showLongRunning('Executing adhoc task...');
      
      // Call API to execute custom instruction
      const response = await customInstructionService.executeCustomInstruction(
        projectId,
        instruction
      );
      
      // Display logs
      if (response.logs) {
        setLogs(response.logs);
      }

      // Create history item
      const historyItem: AdhocTaskHistoryItem = {
        id: `adhoc-${Date.now()}`,
        instruction,
        status: response.status === 'success' ? 'success' : 'failure',
        executedAt: new Date(),
        logs: response.logs || '',
        error: response.status === 'failure' ? (typeof response.output === 'string' ? response.output : JSON.stringify(response.output)) : undefined,
        filesModified: response.output?.filesModified || [],
      };

      // Add to history and save to local storage
      const updatedHistory = addAdhocTaskToHistory(historyItem, adhocHistory);
      setAdhocHistory(updatedHistory);

      if (response.status === 'success') {
        showSuccess('Adhoc task completed successfully');
        
        // Close modal on success
        handleCloseAdhocModal();
        
        // Refresh project status and tasks
        if (onTaskComplete) {
          onTaskComplete();
        }
        await fetchTasks();
      } else {
        showError('Adhoc task failed', {
          onRetry: () => handleExecuteAdhocTask(instruction)
        });
        // Keep modal open on failure so user can see error
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Adhoc task execution failed';
      showError(errorMessage, {
        onRetry: () => handleExecuteAdhocTask(instruction)
      });
      
      // Create failure history item
      const historyItem: AdhocTaskHistoryItem = {
        id: `adhoc-${Date.now()}`,
        instruction,
        status: 'failure',
        executedAt: new Date(),
        logs: logs || '',
        error: errorMessage,
      };

      // Add to history
      const updatedHistory = addAdhocTaskToHistory(historyItem, adhocHistory);
      setAdhocHistory(updatedHistory);
      
      // Add error to logs
      setLogs(prev => prev + '\n\nError: ' + errorMessage);
    } finally {
      setIsAdhocExecuting(false);
    }
  };

  /**
   * Handle rerun from history
   * Requirement 2.5.4: Rerun button opens modal with instruction pre-filled
   */
  const handleRerunAdhocTask = (instruction: string) => {
    setAdhocInitialInstruction(instruction);
    setIsAdhocModalOpen(true);
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
      
      // Show long-running operation toast
      showLongRunning(`Executing task ${task.number}...`);
      
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
        showError(`Task ${task.number} failed`, {
          onRetry: () => executeSpecificTask(task)
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Task execution failed';
      showError(errorMessage, {
        onRetry: () => executeSpecificTask(task)
      });
      
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
        <Alert
          message="Error Loading Tasks"
          description={error}
          type="error"
          showIcon
          icon={<AlertCircle style={{ width: '20px', height: '20px' }} />}
        />
        <Button onClick={fetchTasks}>Retry</Button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
        <Alert
          message="No Tasks Found"
          description="No tasks found in tasks.md"
          type="info"
          showIcon
        />
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
          style={{ 
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
          }}
        >
          <Card
            style={{
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <Space direction="vertical" size="large" align="center">
              <Spin size="large" />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Executing Task...
                </Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Please wait, this may take several minutes
                </Text>
              </div>
            </Space>
          </Card>
        </div>,
        document.body
      )}

    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header with controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Tasks</Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {completedCount}/{totalCount} ({progress.toFixed(0)}%)
          </Text>
        </div>

        <Space size="small">
          {onEditClick && (
            <Button
              onClick={onEditClick}
              variant="primary"
              size="sm"
              disabled={executing}
            >
              <Edit style={{ width: '16px', height: '16px', marginRight: '4px' }} />
              <span>Edit</span>
            </Button>
          )}

          <Button
            onClick={executeNextTask}
            disabled={!nextTask || executing}
            variant="secondary"
            size="sm"
          >
            {executing ? (
              <>
                <Spin size="small" style={{ marginRight: '8px' }} />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play style={{ width: '16px', height: '16px', marginRight: '4px' }} />
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
            <PlayCircle style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span>Execute All</span>
          </Button>

          {/* Execute Adhoc Task Button - Requirement 2.1.1, 2.1.3, 2.1.4, 2.1.5 */}
          <Button
            onClick={handleOpenAdhocModal}
            disabled={loading || executing || isAdhocExecuting}
            variant="secondary"
            size="sm"
            title="Execute Adhoc Task (Ctrl+K or Cmd+K)"
          >
            <Zap style={{ width: '16px', height: '16px', marginRight: '4px' }} />
            <span>Adhoc Task</span>
            <kbd 
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                fontSize: '11px',
                borderRadius: '3px',
                backgroundColor: 'var(--color-bg-tertiary)',
                fontFamily: 'monospace',
                color: 'var(--color-text-tertiary)',
              }}
            >
              {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </Button>

          <Tooltip title="Refresh tasks">
            <Button 
              onClick={fetchTasks} 
              variant="ghost" 
              size="sm" 
              disabled={executing}
              style={{ padding: '4px 8px' }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Progress bar */}
      <Progress
        percent={Math.round(progress)}
        strokeColor="var(--color-status-success)"
        trailColor="var(--color-bg-tertiary)"
        size="small"
        showInfo={false}
      />

      {/* Task groups in columns (Requirement 7.2, 3.4) */}
      <Row gutter={[12, 12]} role="list" aria-label="Project tasks grouped by section">
        {sortedGroups.map(([groupNumber, groupTasks]) => {
          const hasPendingTasks = groupTasks.some(t => t.status === 'pending' || t.status === 'in_progress');
          
          return (
            <Col key={groupNumber} xs={24} sm={24} md={12} lg={8} xl={6}>
              <Card
                size="small"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: '14px' }}>
                      Section {groupNumber}
                    </Text>
                    <Space size={8}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {groupTasks.filter(t => t.status === 'completed').length}/{groupTasks.length}
                      </Text>
                      <Button
                        onClick={() => executeSectionTasks(groupNumber)}
                        disabled={!hasPendingTasks || executing}
                        variant="ghost"
                        size="sm"
                        style={{ height: '24px', padding: '0 8px' }}
                        title={`Execute all tasks in section ${groupNumber}`}
                      >
                        <Play style={{ width: '12px', height: '12px' }} />
                      </Button>
                    </Space>
                  </div>
                }
                style={{ height: '100%' }}
              >
                <List
                  size="small"
                  dataSource={groupTasks}
                  renderItem={(task) => (
                    <TaskItem
                      key={task.number}
                      task={task}
                      onClick={() => executeSpecificTask(task)}
                      isNested={task.parent !== null}
                      allTasks={tasks}
                    />
                  )}
                  split={false}
                />
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Log viewer (Requirement 7.5) */}
      <LogViewer
        logs={logs}
        isStreaming={executing || isAdhocExecuting}
        onClear={handleClearLogs}
      />

      {/* Adhoc Task History - Requirement 2.5.1, 2.5.2, 2.5.3, 2.5.4, 2.5.5 */}
      <AdhocTaskHistory
        history={adhocHistory}
        onRerun={handleRerunAdhocTask}
        className="mt-8"
      />

      {/* Adhoc Task Modal - Requirement 2.1.2 */}
      <AdhocTaskModal
        isOpen={isAdhocModalOpen}
        onClose={handleCloseAdhocModal}
        onExecute={handleExecuteAdhocTask}
        isExecuting={isAdhocExecuting}
        initialInstruction={adhocInitialInstruction}
      />
    </Space>
    </>
  );
}
