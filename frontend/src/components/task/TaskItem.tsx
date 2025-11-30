/**
 * TaskItem Component
 * 
 * Displays individual task with status indicators and styling
 * Migrated to use Ant Design List.Item
 * 
 * Requirements: 7.2, 3.4
 */

import { List, Typography, Tooltip } from 'antd';
import { CheckCircle2, Circle, Loader2, XCircle, Play } from 'lucide-react';
import type { Task } from '../../types';

const { Text } = Typography;

export interface TaskItemProps {
  task: Task;
  onClick?: (task: Task) => void;
  isNested?: boolean;
  allTasks?: Task[];
}

/**
 * TaskItem displays a single task with color-coded status
 * 
 * Requirements:
 * - 7.2: Display task number, description, and status
 * - 3.4: Use Ant Design List.Item for task display
 * - Color-coded status indicators (gray=pending, blue=in progress, green=completed, red=failed)
 * - Show checkbox icon based on status
 * - Highlight optional tasks differently
 * - Make clickable to show task details
 */
export function TaskItem({ task, onClick, isNested = false, allTasks = [] }: TaskItemProps) {
  // Determine status color and icon
  const getStatusConfig = () => {
    switch (task.status) {
      case 'completed':
        return {
          color: '#52c41a', // Ant Design success color
          icon: CheckCircle2,
          label: 'Completed',
          badgeStatus: 'success' as const,
        };
      case 'in_progress':
        return {
          color: '#1890ff', // Ant Design info color
          icon: Loader2,
          label: 'In Progress',
          badgeStatus: 'processing' as const,
        };
      case 'failed':
        return {
          color: '#ff4d4f', // Ant Design error color
          icon: XCircle,
          label: 'Failed',
          badgeStatus: 'error' as const,
        };
      case 'pending':
      default:
        return {
          color: '#d9d9d9', // Ant Design default color
          icon: Circle,
          label: 'Pending',
          badgeStatus: 'default' as const,
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

  // Create subtasks tooltip content
  const subtasksTooltip = task.subtasks.length > 0 ? (
    <div style={{ maxWidth: '300px' }}>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>Subtasks:</div>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {task.subtasks.map((subtaskNumber) => {
          const subtask = allTasks.find(t => t.number === subtaskNumber);
          if (!subtask) return null;
          return (
            <li key={subtask.number} style={{ marginBottom: '4px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', marginRight: '6px' }}>
                {subtask.number}
              </span>
              <span style={{ fontSize: '12px' }}>{subtask.description}</span>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  const listItem = (
    <List.Item
      style={{
        padding: '8px 12px',
        marginLeft: isNested ? '0' : '0',
        cursor: isClickable ? 'pointer' : 'default',
        opacity: task.isOptional ? 0.7 : 1,
        transition: 'all 0.2s',
        borderRadius: '6px',
      }}
      className={isClickable ? 'task-item-clickable' : ''}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : 'listitem'}
      aria-label={`Task ${task.number}: ${task.description} - ${statusConfig.label}${isClickable ? ' - Click to execute' : ''}`}
      title={isClickable ? 'Click to execute this task' : undefined}
    >
      <List.Item.Meta
        avatar={
          <div style={{ color: statusConfig.color, marginTop: '2px' }}>
            <StatusIcon
              style={{
                width: '14px',
                height: '14px',
                animation: task.status === 'in_progress' ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </div>
        }
        title={
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', width: '100%' }}>
            <Text
              code
              strong
              style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
                lineHeight: '1.5',
              }}
            >
              {task.number}
            </Text>
            <Text
              style={{
                fontSize: '12px',
                color: 'var(--color-text-primary)',
                flex: 1,
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {task.description}
              {task.isOptional && (
                <Text
                  type="secondary"
                  italic
                  style={{ fontSize: '10px', marginLeft: '4px' }}
                >
                  (opt)
                </Text>
              )}
            </Text>
          </div>
        }
        description={
          task.subtasks.length > 0 ? (
            <Text
              type="secondary"
              style={{ fontSize: '10px' }}
            >
              {task.subtasks.length} sub
            </Text>
          ) : null
        }
      />
      {isClickable && (
        <div className="task-item-action" style={{ opacity: 0, transition: 'opacity 0.2s' }}>
          <Play style={{ width: '12px', height: '12px', color: statusConfig.color }} />
        </div>
      )}
      <style>{`
        .task-item-clickable:hover {
          background-color: var(--color-bg-tertiary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .task-item-clickable:hover .task-item-action {
          opacity: 1;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </List.Item>
  );

  // Wrap with tooltip if there are subtasks
  return subtasksTooltip ? (
    <Tooltip title={subtasksTooltip} placement="right" mouseEnterDelay={0.3}>
      {listItem}
    </Tooltip>
  ) : (
    listItem
  );
}
