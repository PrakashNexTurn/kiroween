/**
 * AdhocTaskHistory Component
 * Displays history of executed adhoc tasks with expandable logs
 * 
 * Requirements: 2.5.1, 2.5.2, 2.5.3, 2.5.4, 2.5.5
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Badge } from '../common';
import { parseLogsForRendering } from '../../utils/logFormatter';

/**
 * Adhoc task history item
 * Represents a single executed adhoc task
 */
export interface AdhocTaskHistoryItem {
  id: string;
  instruction: string;
  status: 'success' | 'failure';
  executedAt: Date;
  logs: string;
  error?: string;
  filesModified?: string[];
}

/**
 * Props for AdhocTaskHistory component
 */
interface AdhocTaskHistoryProps {
  history: AdhocTaskHistoryItem[];
  onRerun: (instruction: string) => void;
  className?: string;
}

/**
 * Individual history item component
 */
interface HistoryItemProps {
  item: AdhocTaskHistoryItem;
  onRerun: (instruction: string) => void;
}

function HistoryItem({ item, onRerun }: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  /**
   * Truncate instruction for display
   */
  const truncateInstruction = (instruction: string, maxLength: number = 80): string => {
    if (instruction.length <= maxLength) return instruction;
    return instruction.substring(0, maxLength) + '...';
  };

  /**
   * Handle rerun button click
   * Requirement 2.5.4: Add rerun button
   */
  const handleRerun = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRerun(item.instruction);
  };

  /**
   * Toggle expansion
   * Requirement 2.5.3: Implement expandable items for logs
   */
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  /**
   * Parse and format logs for rendering
   */
  const formattedLogs = parseLogsForRendering(item.logs);

  return (
    <div
      className="border rounded-lg overflow-hidden transition-all"
      style={{
        borderColor: 'var(--color-border-primary)',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-opacity-50 transition-colors"
        onClick={toggleExpansion}
        style={{
          backgroundColor: isExpanded ? 'var(--color-bg-secondary)' : 'transparent',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse Icon */}
          <button
            className="mt-1 flex-shrink-0 transition-transform"
            onClick={toggleExpansion}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            ) : (
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            )}
          </button>

          {/* Status Icon */}
          <div className="flex-shrink-0 mt-1">
            {item.status === 'success' ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--color-status-success)' }} />
            ) : (
              <XCircle className="w-5 h-5" style={{ color: 'var(--color-status-error)' }} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Instruction */}
            <p
              className="text-sm font-medium mb-1 truncate"
              style={{ color: 'var(--color-text-primary)' }}
              title={item.instruction}
            >
              {truncateInstruction(item.instruction)}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Timestamp */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-tertiary)' }} />
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formatTimestamp(item.executedAt)}
                </span>
              </div>

              {/* Status Badge */}
              <Badge variant={item.status === 'success' ? 'success' : 'error'} size="sm">
                {item.status === 'success' ? 'Success' : 'Failed'}
              </Badge>

              {/* Files Modified Count */}
              {item.filesModified && item.filesModified.length > 0 && (
                <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {item.filesModified.length} file{item.filesModified.length > 1 ? 's' : ''} modified
                </span>
              )}
            </div>
          </div>

          {/* Rerun Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRerun}
            className="flex-shrink-0"
            aria-label="Rerun task"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Content - Logs and Details */}
      {isExpanded && (
        <div
          className="border-t p-4 space-y-4"
          style={{ borderColor: 'var(--color-border-primary)' }}
        >
          {/* Full Instruction */}
          <div>
            <h4
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Instruction
            </h4>
            <p
              className="text-sm whitespace-pre-wrap font-mono p-3 rounded"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-tertiary)',
              }}
            >
              {item.instruction}
            </p>
          </div>

          {/* Error Message (if failed) */}
          {item.status === 'failure' && item.error && (
            <div>
              <h4
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: 'var(--color-status-error)' }}
              >
                Error
              </h4>
              <p
                className="text-sm whitespace-pre-wrap font-mono p-3 rounded"
                style={{
                  color: 'var(--color-status-error)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                }}
              >
                {item.error}
              </p>
            </div>
          )}

          {/* Files Modified */}
          {item.filesModified && item.filesModified.length > 0 && (
            <div>
              <h4
                className="text-xs font-semibold uppercase mb-2"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Files Modified ({item.filesModified.length})
              </h4>
              <ul className="space-y-1">
                {item.filesModified.map((file, index) => (
                  <li
                    key={index}
                    className="text-sm font-mono p-2 rounded"
                    style={{
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                    }}
                  >
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Execution Logs */}
          <div>
            <h4
              className="text-xs font-semibold uppercase mb-2"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Execution Logs
            </h4>
            <div
              className="text-sm font-mono p-3 rounded overflow-x-auto max-h-96 overflow-y-auto"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
              }}
            >
              {formattedLogs.length > 0 ? (
                formattedLogs.map((logLine, lineIndex) => (
                  <div key={lineIndex} className="whitespace-pre-wrap break-words">
                    {logLine.segments.map((segment, segmentIndex) => (
                      <span
                        key={segmentIndex}
                        style={{
                          color: segment.color || 'var(--color-text-secondary)',
                          fontWeight: segment.bold ? 'bold' : 'normal',
                        }}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--color-text-tertiary)' }}>No logs available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AdhocTaskHistory component
 * Displays a list of executed adhoc tasks with expandable details
 * 
 * Requirement 2.5.1: Display list of executed adhoc tasks
 * Requirement 2.5.2: List tasks with timestamp and status
 * Requirement 2.5.5: Display message when no tasks executed
 */
export function AdhocTaskHistory({ history, onRerun, className = '' }: AdhocTaskHistoryProps) {
  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Adhoc Task History
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          View and rerun previously executed custom instructions
        </p>
      </div>

      {/* History List */}
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} onRerun={onRerun} />
          ))}
        </div>
      ) : (
        /* Empty State - Requirement 2.5.5 */
        <div
          className="text-center py-12 rounded-lg border-2 border-dashed"
          style={{
            borderColor: 'var(--color-border-secondary)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <Clock
              className="w-12 h-12 opacity-50"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              No adhoc tasks executed yet
            </p>
            <p
              className="text-xs max-w-md"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Execute custom instructions using the "Execute Adhoc Task" button above.
              Your task history will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
