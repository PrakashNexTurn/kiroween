/**
 * LogViewer Component
 * 
 * Terminal-style panel for displaying execution logs
 * Features auto-scroll, copy, and clear functionality
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../common/Button';
import { showSuccess } from '../common/Toast';
import { parseLogsForRendering } from '../../utils/logFormatter';

export interface LogViewerProps {
  logs: string;
  isStreaming: boolean;
  onClear?: () => void;
}

/**
 * LogViewer displays execution logs in a terminal-style panel
 * 
 * Requirements:
 * - 8.1: Display logs in terminal-style panel with dark background and monospace font
 * - 8.2: Append new log content
 * - 8.3: Auto-scroll to bottom when new logs arrive
 * - 8.4: Keep logs visible after execution completes
 * - 8.5: Clear logs button
 */
export function LogViewer({ logs, isStreaming, onClear }: LogViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const previousLogsLength = useRef(logs.length);

  // Auto-scroll to bottom when new logs arrive (Requirement 8.3)
  useEffect(() => {
    if (logs.length > previousLogsLength.current && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
    previousLogsLength.current = logs.length;
  }, [logs]);

  // Copy logs to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logs);
      showSuccess('Logs copied to clipboard');
    } catch (error) {
      console.error('Failed to copy logs:', error);
    }
  };

  // Clear logs
  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div 
      className="border border-border rounded-lg overflow-hidden bg-background-secondary"
      role="region"
      aria-label="Execution logs"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-background-tertiary border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary" id="log-viewer-title">
            Execution Logs
          </h3>
          {isStreaming && (
            <span 
              className="flex items-center gap-1 text-xs text-text-secondary"
              role="status"
              aria-live="polite"
            >
              <span className="inline-block w-2 h-2 bg-status-info rounded-full animate-pulse" aria-hidden="true" />
              Streaming...
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Copy button (Requirement 8.4) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!logs}
            aria-label="Copy logs"
          >
            <Copy className="w-4 h-4" />
          </Button>
          
          {/* Clear button (Requirement 8.5) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!logs || isStreaming}
            aria-label="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          {/* Toggle expand/collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse logs' : 'Expand logs'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Log content (Requirement 8.1: Terminal-style with dark background and monospace font) */}
      {isExpanded && (
        <div
          ref={logContainerRef}
          className="p-4 h-96 overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm"
          style={{
            backgroundColor: '#1a1a1a',
            color: '#e0e0e0',
          }}
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-labelledby="log-viewer-title"
        >
          {logs ? (
            <div 
              className="whitespace-pre break-words" 
              style={{ 
                fontFamily: 'monospace',
                textAlign: 'left',
                display: 'block',
              }}
            >
              {parseLogsForRendering(logs).map((parsedLine, lineIndex) => (
                <div 
                  key={lineIndex} 
                  style={{ 
                    whiteSpace: 'pre',
                    textAlign: 'left',
                    display: 'block',
                  }}
                >
                  {parsedLine.segments.length > 0 ? (
                    parsedLine.segments.map((segment, segmentIndex) => (
                      <span
                        key={segmentIndex}
                        style={{
                          color: segment.color || '#e0e0e0',
                          fontWeight: segment.bold ? 'bold' : 'normal',
                          whiteSpace: 'pre',
                        }}
                      >
                        {segment.text}
                      </span>
                    ))
                  ) : (
                    // Empty line - preserve it
                    <span>&nbsp;</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No logs yet. Execute a task to see logs here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
