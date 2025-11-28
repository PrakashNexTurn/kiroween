/**
 * TaskItem Component
 * 
 * Displays individual task with status indicators and styling
 * 
 * Requirements: 7.2
 */

import { CheckCircle2, Circle, Loader2, XCircle, Play } from 'lucide-react';
import type { Task } from '../../types';

export interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
  isNested?: boolean;
}

/**
 * TaskItem displays a single task with color-coded status
 * 
 * Requirements:
 * - 7.2: Display task number, description, and status
 * - Color-coded status indicators (gray=pending, blue=in progress, green=completed, red=failed)
 * - Show checkbox icon based on status
 * - Highlight optional tasks differently
 * - Make clickable to show task details
 */
export function TaskItem({ task, onClick, isNested = false }: TaskItemProps) {
  // Determine status color and icon
  const getStatusConfig = () => {
    switch (task.status) {
      case 'completed':
        return {
          color: 'text-status-success',
          bgColor: 'bg-status-success/10',
          borderColor: 'border-status-success/30',
          icon: CheckCircle2,
          label: 'Completed',
        };
      case 'in_progress':
        return {
          color: 'text-status-info',
          bgColor: 'bg-status-info/10',
          borderColor: 'border-status-info/30',
          icon: Loader2,
          label: 'In Progress',
        };
      case 'failed':
        return {
          color: 'text-status-error',
          bgColor: 'bg-status-error/10',
          borderColor: 'border-status-error/30',
          icon: XCircle,
          label: 'Failed',
        };
      case 'pending':
      default:
        return {
          color: 'text-text-tertiary',
          bgColor: 'bg-background-tertiary',
          borderColor: 'border-border',
          icon: Circle,
          label: 'Pending',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  // Determine if task is clickable (not completed)
  const isClickable = onClick && task.status !== 'completed';

  return (
    <div
      className={`
        group flex items-start gap-2 p-2 rounded border transition-all text-xs
        ${statusConfig.borderColor} ${statusConfig.bgColor}
        ${isClickable ? 'cursor-pointer hover:shadow-sm hover:border-status-info' : ''}
        ${task.status === 'completed' ? 'cursor-default' : ''}
        ${isNested ? 'ml-4' : ''}
        ${task.isOptional ? 'opacity-70' : ''}
      `}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : 'listitem'}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`Task ${task.number}: ${task.description} - ${statusConfig.label}${isClickable ? ' - Click to execute' : ''}`}
      title={isClickable ? 'Click to execute this task' : undefined}
    >
      {/* Status Icon - Smaller */}
      <div className={`flex-shrink-0 mt-0.5 ${statusConfig.color}`}>
        <StatusIcon
          className={`w-3.5 h-3.5 ${task.status === 'in_progress' ? 'animate-spin' : ''}`}
        />
      </div>

      {/* Task Content - More compact */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          {/* Task Number */}
          <span className="font-mono text-xs font-semibold text-text-secondary flex-shrink-0">
            {task.number}
          </span>

          {/* Task Description - Truncated */}
          <p className="flex-1 text-xs text-text-primary line-clamp-2">
            {task.description}
            {task.isOptional && (
              <span className="ml-1 text-[10px] text-text-tertiary italic">
                (opt)
              </span>
            )}
          </p>
        </div>

        {/* Subtasks indicator - More compact */}
        {task.subtasks.length > 0 && (
          <div className="mt-0.5 text-[10px] text-text-tertiary">
            {task.subtasks.length} sub
          </div>
        )}
      </div>

      {/* Clickable indicator for non-completed tasks */}
      {isClickable && (
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-3 h-3 text-status-info" />
        </div>
      )}

      {/* Status Label (for screen readers) */}
      <span className="sr-only">{statusConfig.label}</span>
    </div>
  );
}
