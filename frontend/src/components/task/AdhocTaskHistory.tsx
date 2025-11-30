/**
 * Enhanced AdhocTaskHistory UI (Inline Styles Only)
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button, Badge } from '../common';
import { parseLogsForRendering } from '../../utils/logFormatter';

export interface AdhocTaskHistoryItem {
  id: string;
  instruction: string;
  status: 'success' | 'failure';
  executedAt: Date;
  logs: string;
  error?: string;
  filesModified?: string[];
}

interface AdhocTaskHistoryProps {
  history: AdhocTaskHistoryItem[];
  onRerun: (instruction: string) => void;
  className?: string;
}

interface HistoryItemProps {
  item: AdhocTaskHistoryItem;
  onRerun: (instruction: string) => void;
}

function HistoryItem({ item, onRerun }: HistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    if (diffDays < 7) return `${diffDays} day(s) ago`;

    return date.toLocaleDateString();
  };

  const handleRerun = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRerun(item.instruction);
  };

  const formattedLogs = parseLogsForRendering(item.logs);

  return (
    <div
      style={{
        border: '1px solid var(--color-border-primary)',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          padding: 16,
          cursor: 'pointer',
          alignItems: 'flex-start',
          gap: 12,
          backgroundColor: isExpanded
            ? 'var(--color-bg-secondary)'
            : 'var(--color-bg-primary)',
        }}
      >
        {/* Expand/Collapse */}
        <div style={{ marginTop: 4 }}>
          {isExpanded ? (
            <ChevronDown size={20} color="var(--color-text-secondary)" />
          ) : (
            <ChevronRight size={20} color="var(--color-text-secondary)" />
          )}
        </div>

        {/* Status Icon */}
        <div style={{ marginTop: 3 }}>
          {item.status === 'success' ? (
            <CheckCircle2 size={20} color="var(--color-status-success)" />
          ) : (
            <XCircle size={20} color="var(--color-status-error)" />
          )}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              color: 'var(--color-text-primary)',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={item.instruction}
          >
            {item.instruction}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {/* Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} color="var(--color-text-tertiary)" />
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                {formatTimestamp(item.executedAt)}
              </span>
            </div>

            {/* Status Badge */}
            <Badge
              variant={item.status === 'success' ? 'success' : 'error'}
              size="sm"
            >
              {item.status === 'success' ? 'Success' : 'Failed'}
            </Badge>

            {/* Files Modified */}
            {item.filesModified?.length ? (
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                {item.filesModified.length} file(s) modified
              </span>
            ) : null}
          </div>
        </div>

        {/* Rerun Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRerun}
          style={{ marginLeft: 8 }}
        >
          <RotateCw size={16} />
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          style={{
            borderTop: '1px solid var(--color-border-primary)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Instruction */}
          <div>
            <h4
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
                marginBottom: 6,
              }}
            >
              Instruction
            </h4>
            <pre
              style={{
                background: 'var(--color-bg-tertiary)',
                padding: 12,
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                color: 'var(--color-text-secondary)',
              }}
            >
              {item.instruction}
            </pre>
          </div>

          {/* Error */}
          {item.status === 'failure' && item.error && (
            <div>
              <h4
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: 'var(--color-status-error)',
                  marginBottom: 6,
                }}
              >
                Error
              </h4>
              <pre
                style={{
                  background: 'var(--color-bg-tertiary)',
                  padding: 12,
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: 'var(--color-status-error)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.error}
              </pre>
            </div>
          )}

          {/* Modified Files */}
          {item.filesModified?.length ? (
            <div>
              <h4
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 6,
                }}
              >
                Files Modified ({item.filesModified.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {item.filesModified.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      padding: 8,
                      borderRadius: 6,
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Logs */}
          <div>
            <h4
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                color: 'var(--color-text-tertiary)',
                marginBottom: 6,
              }}
            >
              Execution Logs
            </h4>

            <div
              style={{
                maxHeight: 350,
                overflowY: 'auto',
                background: 'var(--color-bg-tertiary)',
                padding: 12,
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
              }}
            >
              {formattedLogs.length ? (
                formattedLogs.map((line, i) => (
                  <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
                    {line.segments.map((seg, j) => (
                      <span
                        key={j}
                        style={{
                          color: seg.color || 'var(--color-text-secondary)',
                          fontWeight: seg.bold ? 'bold' : 'normal',
                        }}
                      >
                        {seg.text}
                      </span>
                    ))}
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--color-text-tertiary)' }}>
                  No logs available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdhocTaskHistory({ history, onRerun, className = '' }: AdhocTaskHistoryProps) {
  return (
    <div className={className}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Adhoc Task History
        </h3>
        <p style={{ fontSize: 13, marginTop: 4, color: 'var(--color-text-secondary)' }}>
          View and rerun previously executed tasks.
        </p>
      </div>

      {/* History List */}
      {history.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((item) => (
            <HistoryItem key={item.id} item={item} onRerun={onRerun} />
          ))}
        </div>
      ) : (
        <div
          style={{
            border: '2px dashed var(--color-border-secondary)',
            padding: 40,
            borderRadius: 8,
            textAlign: 'center',
            background: 'var(--color-bg-secondary)',
          }}
        >
          <Clock
            size={40}
            style={{ opacity: 0.5, marginBottom: 16, color: 'var(--color-text-tertiary)' }}
          />
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
            No adhoc tasks executed yet
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            Execute an adhoc instruction to see its history here.
          </p>
        </div>
      )}
    </div>
  );
}
