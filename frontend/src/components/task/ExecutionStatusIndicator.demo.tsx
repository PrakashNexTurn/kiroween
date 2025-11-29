/**
 * ExecutionStatusIndicator Demo
 * 
 * Demonstrates the ExecutionStatusIndicator component with different states
 */

import { useState } from 'react';
import { ExecutionStatusIndicator } from './ExecutionStatusIndicator';
import { useExecutionStatus } from '../../hooks/useExecutionStatus';
import { Button } from '../common/Button';
import type { ExecutionStatus } from '../../hooks/useExecutionStatus';

export function ExecutionStatusIndicatorDemo() {
  const [manualStatus, setManualStatus] = useState<ExecutionStatus>('idle');
  const [manualMessage, setManualMessage] = useState('');
  
  // Using the hook
  const {
    status: hookStatus,
    message: hookMessage,
    startExecution,
    completeExecution,
    failExecution,
    reset,
  } = useExecutionStatus();

  const handleManualExecuting = () => {
    setManualStatus('executing');
    setManualMessage('Processing your request...');
  };

  const handleManualSuccess = () => {
    setManualStatus('success');
    setManualMessage('Operation completed successfully!');
  };

  const handleManualError = () => {
    setManualStatus('error');
    setManualMessage('Something went wrong. Please try again.');
  };

  const handleManualReset = () => {
    setManualStatus('idle');
    setManualMessage('');
  };

  const handleHookSimulation = async () => {
    startExecution('Starting task execution...');
    
    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Randomly succeed or fail
    if (Math.random() > 0.5) {
      completeExecution('Task completed successfully!');
    } else {
      failExecution('Task execution failed. Check logs for details.');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          ExecutionStatusIndicator Demo
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Demonstrates the execution status indicator component with different states
        </p>
      </div>

      {/* Manual Control Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Manual Control
        </h2>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={handleManualExecuting} variant="primary">
            Show Executing
          </Button>
          <Button onClick={handleManualSuccess} variant="primary">
            Show Success
          </Button>
          <Button onClick={handleManualError} variant="primary">
            Show Error
          </Button>
          <Button onClick={handleManualReset} variant="secondary">
            Reset
          </Button>
        </div>
        <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Current Status: <strong style={{ color: 'var(--color-text-primary)' }}>{manualStatus}</strong>
          </p>
          {manualMessage && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Message: {manualMessage}
            </p>
          )}
        </div>
      </div>

      {/* Hook Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Using Hook (useExecutionStatus)
        </h2>
        <div className="flex gap-3 flex-wrap">
          <Button 
            onClick={handleHookSimulation} 
            variant="primary"
            disabled={hookStatus === 'executing'}
          >
            Simulate Execution (3s)
          </Button>
          <Button onClick={reset} variant="secondary">
            Reset
          </Button>
        </div>
        <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Current Status: <strong style={{ color: 'var(--color-text-primary)' }}>{hookStatus}</strong>
          </p>
          {hookMessage && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Message: {hookMessage}
            </p>
          )}
        </div>
      </div>

      {/* Auto-hide Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Auto-hide After 5 Seconds
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          The indicator below will automatically hide 5 seconds after showing success or error.
        </p>
        <ExecutionStatusIndicator
          status={hookStatus}
          message={hookMessage}
          autoHideDelay={5000}
          onDismiss={reset}
        />
      </div>

      {/* Features List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Features
        </h2>
        <ul className="list-disc list-inside space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <li>Animated spinner during execution (Requirement 2.3.2)</li>
          <li>Status message display (Requirement 2.3.2)</li>
          <li>Dismissible after completion (Requirement 2.3.3)</li>
          <li>Auto-hide with configurable delay</li>
          <li>Accessible with ARIA attributes</li>
          <li>Smooth animations</li>
          <li>Convenient hook for state management</li>
        </ul>
      </div>

      {/* Status Indicators */}
      <ExecutionStatusIndicator
        status={manualStatus}
        message={manualMessage}
        onDismiss={handleManualReset}
      />
    </div>
  );
}
