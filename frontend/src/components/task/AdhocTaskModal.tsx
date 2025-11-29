/**
 * AdhocTaskModal Component
 * Modal for executing custom instructions not in the predefined task list
 * 
 * Requirements: 2.1.2, 2.2.1, 2.2.2, 2.2.3, 2.2.4, 2.2.5, 2.4.1, 2.4.2
 */

import { useState, useEffect } from 'react';
import { Modal, Button, Select, Textarea } from '../common';
import type { SelectOption } from '../common';
import { useKeyboard } from '../../hooks/useKeyboard';

/**
 * Instruction template for common tasks
 */
export interface InstructionTemplate {
  id: string;
  name: string;
  description: string;
  instruction: string;
  category: 'testing' | 'documentation' | 'refactoring' | 'debugging' | 'other';
}

/**
 * Default instruction templates
 * Requirement 2.4.3: Define 5 default templates
 */
const DEFAULT_TEMPLATES: InstructionTemplate[] = [
  {
    id: 'fix-linting',
    name: 'Fix Linting Errors',
    description: 'Fix all linting and formatting issues',
    instruction: 'Please fix all linting and formatting errors in the codebase. Run the linter, identify all issues, and correct them according to the project\'s code style guidelines.',
    category: 'refactoring',
  },
  {
    id: 'add-tests',
    name: 'Add Unit Tests',
    description: 'Add comprehensive unit tests',
    instruction: 'Please add comprehensive unit tests for the core functionality. Focus on testing edge cases, error handling, and ensuring good code coverage.',
    category: 'testing',
  },
  {
    id: 'update-docs',
    name: 'Update Documentation',
    description: 'Update project documentation',
    instruction: 'Please update the project documentation including README, API documentation, and inline code comments. Ensure all public APIs are well-documented.',
    category: 'documentation',
  },
  {
    id: 'refactor-code',
    name: 'Refactor Code',
    description: 'Refactor for better maintainability',
    instruction: 'Please refactor the code to improve maintainability and readability. Look for code duplication, complex functions that can be simplified, and opportunities to improve the architecture.',
    category: 'refactoring',
  },
  {
    id: 'debug-issue',
    name: 'Debug Issue',
    description: 'Debug and fix a specific issue',
    instruction: 'Please investigate and fix the following issue:\n\n[Describe the issue here]\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:',
    category: 'debugging',
  },
];

/**
 * Props for AdhocTaskModal component
 */
interface AdhocTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (instruction: string) => Promise<void>;
  isExecuting?: boolean;
  initialInstruction?: string;
}

/**
 * AdhocTaskModal component
 * Allows users to enter and execute custom instructions
 */
export function AdhocTaskModal({
  isOpen,
  onClose,
  onExecute,
  isExecuting = false,
  initialInstruction = '',
}: AdhocTaskModalProps) {
  const MAX_CHARACTERS = 50000;
  
  const [instruction, setInstruction] = useState(initialInstruction);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<InstructionTemplate | null>(null);
  const [characterCount, setCharacterCount] = useState(0);

  // Update character count when instruction changes
  useEffect(() => {
    setCharacterCount(instruction.length);
  }, [instruction]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInstruction(initialInstruction);
      setSelectedTemplate('');
      setShowOverwriteWarning(false);
      setPendingTemplate(null);
    }
  }, [isOpen, initialInstruction]);

  // Keyboard shortcuts for modal (Requirement 2.1.2)
  useKeyboard([
    {
      key: 'Enter',
      ctrl: true,
      callback: () => {
        if (isOpen && !showOverwriteWarning && !isExecuteDisabled) {
          handleExecute();
        }
      },
      description: 'Execute adhoc task',
    },
    {
      key: 'Escape',
      callback: () => {
        if (isOpen && !isExecuting) {
          if (showOverwriteWarning) {
            cancelTemplateOverwrite();
          } else {
            handleClose();
          }
        }
      },
      description: 'Close modal',
    },
  ]);

  /**
   * Handle template selection
   * Requirement 2.4.2: Populate textarea with template text
   * Requirement 2.4.5: Warn before overwriting custom text
   */
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (!templateId) return;

    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Check if user has typed custom text
    const hasCustomText = instruction.trim().length > 0 && instruction !== initialInstruction;
    
    if (hasCustomText) {
      // Show warning before overwriting
      setShowOverwriteWarning(true);
      setPendingTemplate(template);
    } else {
      // No custom text, apply template immediately
      setInstruction(template.instruction);
    }
  };

  /**
   * Confirm template overwrite
   */
  const confirmTemplateOverwrite = () => {
    if (pendingTemplate) {
      setInstruction(pendingTemplate.instruction);
    }
    setShowOverwriteWarning(false);
    setPendingTemplate(null);
  };

  /**
   * Cancel template overwrite
   */
  const cancelTemplateOverwrite = () => {
    setSelectedTemplate('');
    setShowOverwriteWarning(false);
    setPendingTemplate(null);
  };

  /**
   * Handle instruction change
   * Requirement 2.2.4: Real-time validation
   */
  const handleInstructionChange = (value: string) => {
    // Enforce character limit
    if (value.length <= MAX_CHARACTERS) {
      setInstruction(value);
    }
  };

  /**
   * Handle execute button click
   * Requirement 2.2.5: Disable execute button when instruction is empty
   */
  const handleExecute = async () => {
    const trimmedInstruction = instruction.trim();
    if (!trimmedInstruction || isExecuting) return;

    try {
      await onExecute(trimmedInstruction);
      // Modal will be closed by parent component on success
    } catch (error) {
      // Error handling is done by parent component
      console.error('Failed to execute adhoc task:', error);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isExecuting) {
      onClose();
    }
  };

  /**
   * Check if execute button should be disabled
   */
  const isExecuteDisabled = !instruction.trim() || isExecuting;

  /**
   * Get character counter color based on usage
   */
  const getCharacterCounterColor = () => {
    const percentage = (characterCount / MAX_CHARACTERS) * 100;
    if (percentage >= 95) return 'text-status-error';
    if (percentage >= 80) return 'text-status-warning';
    return 'text-text-tertiary';
  };

  /**
   * Prepare template options for Select component
   */
  const templateOptions: SelectOption[] = [
    { value: '', label: 'Select a template...' },
    ...DEFAULT_TEMPLATES.map(template => ({
      value: template.id,
      label: `${template.name} - ${template.description}`,
    })),
  ];

  return (
    <>
      <Modal
        isOpen={isOpen && !showOverwriteWarning}
        onClose={handleClose}
        title="Execute Adhoc Task"
        size="xl"
      >
        <div className="space-y-4">
          {/* Description */}
          <div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Enter a custom instruction to execute a task that's not in your predefined task list.
              You can use a template or write your own instruction.
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              💡 Tip: Press{' '}
              <kbd 
                className="px-1.5 py-0.5 rounded mx-1"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                }}
              >
                {navigator.platform.includes('Mac') ? '⌘↵' : 'Ctrl+Enter'}
              </kbd>
              {' '}to execute or{' '}
              <kbd 
                className="px-1.5 py-0.5 rounded mx-1"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                }}
              >
                Esc
              </kbd>
              {' '}to close
            </p>
          </div>

          {/* Template Selector */}
          <Select
            label="Template (Optional)"
            options={templateOptions}
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            disabled={isExecuting}
            helperText="Choose a common task template to get started quickly"
          />

          {/* Instruction Textarea */}
          <div>
            <Textarea
              label="Instruction"
              value={instruction}
              onChange={(e) => handleInstructionChange(e.target.value)}
              placeholder="Example: Add error handling to the user authentication module, including try-catch blocks and proper error messages..."
              rows={12}
              disabled={isExecuting}
              helperText="Describe what you want the AI to do. Be as specific as possible for better results."
            />
            
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Minimum 1 character required
              </p>
              <p className={`text-xs font-mono ${getCharacterCounterColor()}`}>
                {characterCount.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isExecuting}
              title="Close modal (Esc)"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecute}
              variant="primary"
              loading={isExecuting}
              disabled={isExecuteDisabled}
              title="Execute adhoc task (Ctrl+Enter or Cmd+Enter)"
            >
              {isExecuting ? 'Executing...' : (
                <span className="flex items-center gap-2">
                  <span>Execute</span>
                  <kbd 
                    className="px-1.5 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {navigator.platform.includes('Mac') ? '⌘↵' : 'Ctrl+↵'}
                  </kbd>
                </span>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Overwrite Warning Modal */}
      <Modal
        isOpen={showOverwriteWarning}
        onClose={cancelTemplateOverwrite}
        title="Overwrite Custom Text?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            You have custom text in the instruction field. Applying this template will overwrite your current text.
          </p>
          
          {pendingTemplate && (
            <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {pendingTemplate.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {pendingTemplate.description}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={cancelTemplateOverwrite}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmTemplateOverwrite}
              variant="primary"
            >
              Overwrite
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
