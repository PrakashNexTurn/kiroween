/**
 * GenerateSteeringModal Component
 * Modal for generating steering files with explanation and force regeneration option
 * 
 * Requirements: 1.3.2, 1.3.3, 1.3.4, 1.3.5
 */

import { useEffect } from 'react';
import { Form, Checkbox } from 'antd';
import { Modal, Button } from '../common';
import { FileText, AlertCircle } from 'lucide-react';

/**
 * Props for GenerateSteeringModal component
 */
export interface GenerateSteeringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (force: boolean) => Promise<void>;
  isGenerating?: boolean;
  hasExistingFiles?: boolean;
}

/**
 * GenerateSteeringModal component
 * Allows users to generate or regenerate steering files with explanation
 */
export function GenerateSteeringModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating = false,
  hasExistingFiles = false,
}: GenerateSteeringModalProps) {
  const [form] = Form.useForm<{ forceRegenerate: boolean }>();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({ forceRegenerate: false });
    }
  }, [isOpen, form]);

  /**
   * Handle generate button click
   * Requirement 1.3.4: Call API when user confirms generation
   */
  const handleGenerate = async () => {
    if (isGenerating) return;

    try {
      const values = form.getFieldsValue();
      await onGenerate(values.forceRegenerate || false);
      // Modal will be closed by parent component on success
    } catch (error) {
      // Error handling is done by parent component
      console.error('Failed to generate steering files:', error);
    }
  };

  /**
   * Handle modal close
   * Reset force regenerate state when closing
   */
  const handleClose = () => {
    if (!isGenerating) {
      form.resetFields();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Steering Files"
      size="lg"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ forceRegenerate: false }}
      >
        <div className="space-y-6">
          {/* Explanation Section */}
          {/* Requirement 1.3.2: Add explanation of steering files */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent-primary)' }} />
              <div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  What are Steering Files?
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Steering files provide AI assistants with project-specific context and conventions. 
                  They help guide code generation, maintain consistency, and ensure the AI understands 
                  your project's structure and requirements.
                </p>
              </div>
            </div>

            <div className="pl-8 space-y-2">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  📝 product.md
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Project overview, purpose, and key features
                </p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  🔧 tech.md
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Technology stack, dependencies, and common commands
                </p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  📁 structure.md
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  Project structure, file organization, and naming conventions
                </p>
              </div>
            </div>
          </div>

          {/* Warning for existing files */}
          {/* Requirement 1.3.3: Show warning that existing files will be overwritten */}
          {hasExistingFiles && (
            <div 
              className="flex items-start gap-3 p-4 rounded-lg border-2"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-status-warning)'
              }}
            >
              <AlertCircle 
                className="h-5 w-5 mt-0.5 flex-shrink-0" 
                style={{ color: 'var(--color-status-warning)' }} 
              />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  Existing Steering Files Detected
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Some or all steering files already exist in this project. 
                  Enable "Force Regeneration" below to overwrite them with fresh templates.
                </p>
              </div>
            </div>
          )}

          {/* Force Regeneration Checkbox */}
          {/* Requirement 1.3.3: Add force regeneration checkbox */}
          {hasExistingFiles && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <Form.Item
                name="forceRegenerate"
                valuePropName="checked"
                className="mb-0"
              >
                <Checkbox disabled={isGenerating}>
                  <div className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    <span className="font-medium">Force Regeneration</span>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                      Overwrite existing steering files with fresh templates. 
                      Any manual edits will be lost.
                    </p>
                  </div>
                </Checkbox>
              </Form.Item>
            </div>
          )}

          {/* Info for new generation */}
          {!hasExistingFiles && (
            <div 
              className="p-4 rounded-lg border-2"
              style={{ 
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-accent-primary)'
              }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Three steering files will be created in your project's <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>.kiro/steering/</code> directory. 
                You can edit them later to customize the AI context for your project.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {/* Requirement 1.3.5: Handle API calls */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleGenerate}
              variant="primary"
              loading={isGenerating}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Steering Files'}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
