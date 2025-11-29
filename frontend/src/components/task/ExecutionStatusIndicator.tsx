/**
 * ExecutionStatusIndicator Component
 * 
 * Displays execution status with animated spinner and dismissible notification
 * 
 * Requirements: 2.3.2, 2.3.3
 */

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { ExecutionStatus } from '../../hooks/useExecutionStatus';

export type { ExecutionStatus } from '../../hooks/useExecutionStatus';

export interface ExecutionStatusIndicatorProps {
  status: ExecutionStatus;
  message?: string;
  onDismiss?: () => void;
  autoHideDelay?: number; // Auto-hide after completion (ms), 0 to disable
  className?: string;
}

/**
 * ExecutionStatusIndicator component
 * 
 * Requirement 2.3.2: Show loading spinner and status message during execution
 * Requirement 2.3.3: Make dismissible after completion
 */
export function ExecutionStatusIndicator({
  status,
  message,
  onDismiss,
  autoHideDelay = 0,
  className = '',
}: ExecutionStatusIndicatorProps) {
  const [dismissedStatus, setDismissedStatus] = useState<ExecutionStatus>('idle');

  // Compute visibility - show if status is not idle and hasn't been dismissed for this status
  const isVisible = status !== 'idle' && dismissedStatus !== status;

  const handleDismiss = useCallback(() => {
    setDismissedStatus(status);
    if (onDismiss) {
      onDismiss();
    }
  }, [status, onDismiss]);

  // Auto-hide after completion if configured
  useEffect(() => {
    if (autoHideDelay > 0 && (status === 'success' || status === 'error') && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [status, autoHideDelay, isVisible, handleDismiss]);

  // Don't render if idle or dismissed
  if (!isVisible) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'executing':
        return {
          icon: <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />,
          bgColor: 'var(--color-accent-primary)',
          textColor: 'var(--color-text-inverse)',
          defaultMessage: 'Executing task...',
          dismissible: false,
          ariaLive: 'polite' as const,
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" aria-hidden="true" />,
          bgColor: 'var(--color-status-success)',
          textColor: 'var(--color-text-inverse)',
          defaultMessage: 'Task completed successfully',
          dismissible: true,
          ariaLive: 'polite' as const,
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5" aria-hidden="true" />,
          bgColor: 'var(--color-status-error)',
          textColor: 'var(--color-text-inverse)',
          defaultMessage: 'Task execution failed',
          dismissible: true,
          ariaLive: 'assertive' as const,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const displayMessage = message || config.defaultMessage;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 animate-slideInUp ${className}`}
      role="status"
      aria-live={config.ariaLive}
      aria-atomic="true"
    >
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[500px]"
        style={{
          backgroundColor: config.bgColor,
          color: config.textColor,
        }}
      >
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {config.icon}
        </div>

        {/* Status Message */}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {displayMessage}
          </p>
        </div>

        {/* Dismiss Button - Only show when dismissible (Requirement 2.3.3) */}
        {config.dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 hover:opacity-80 hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white rounded p-1"
            aria-label="Dismiss notification"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}


