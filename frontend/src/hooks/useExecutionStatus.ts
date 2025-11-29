/**
 * useExecutionStatus Hook
 * 
 * Convenient hook for managing execution status indicator state
 */

import { useState } from 'react';

export type ExecutionStatus = 'idle' | 'executing' | 'success' | 'error';

/**
 * Hook for managing execution status indicator state
 * Provides convenient methods for updating status
 */
export function useExecutionStatus() {
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [message, setMessage] = useState<string>('');

  const startExecution = (msg?: string) => {
    setStatus('executing');
    setMessage(msg || 'Executing task...');
  };

  const completeExecution = (msg?: string) => {
    setStatus('success');
    setMessage(msg || 'Task completed successfully');
  };

  const failExecution = (msg?: string) => {
    setStatus('error');
    setMessage(msg || 'Task execution failed');
  };

  const reset = () => {
    setStatus('idle');
    setMessage('');
  };

  return {
    status,
    message,
    startExecution,
    completeExecution,
    failExecution,
    reset,
  };
}
