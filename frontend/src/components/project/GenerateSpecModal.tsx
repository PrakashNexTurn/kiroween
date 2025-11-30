/**
 * GenerateSpecModal Component
 * Modal for generating specification files with AI
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Form, Input } from 'antd';
import { Modal, Button, LoadingSpinner } from '../common';
import { projectService } from '../../services/projectService';
import { showSuccess } from '../common/Toast';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Props for GenerateSpecModal component
 */
interface GenerateSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  specType: 'requirements' | 'design' | 'tasks';
  onSuccess?: () => void;
  onGenerationStateChange?: (isGenerating: boolean) => void;
}

/**
 * GenerateSpecModal component
 * Allows users to generate spec files with a description
 */
export function GenerateSpecModal({
  isOpen,
  onClose,
  projectId,
  specType,
  onSuccess,
  onGenerationStateChange,
}: GenerateSpecModalProps) {
  const [form] = Form.useForm<{ description: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (values: { description: string }) => {
    try {
      setIsSubmitting(true);
      
      // Notify parent that generation is starting
      if (onGenerationStateChange) {
        onGenerationStateChange(true);
      }

      // Call API to generate spec
      await projectService.generateSpec(projectId, specType, values.description.trim());

      // Show success message
      showSuccess(
        `${specType.charAt(0).toUpperCase() + specType.slice(1)} spec generated successfully`
      );

      // Reset form
      form.resetFields();

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      // Handle API error with user-friendly message
      handleApiError(err, { customMessage: 'Failed to generate spec' });
    } finally {
      setIsSubmitting(false);
      
      // Notify parent that generation is complete
      if (onGenerationStateChange) {
        onGenerationStateChange(false);
      }
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      form.resetFields();
      onClose();
    }
  };

  /**
   * Get spec type display name
   */
  const getSpecTypeDisplayName = (): string => {
    return specType.charAt(0).toUpperCase() + specType.slice(1);
  };

  return (
    <>
      {/* Full-screen loading overlay during generation - rendered at body level */}
      {isSubmitting && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            margin: 0,
            padding: 0,
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh'
          }}
        >
          <div 
            className="rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '2px solid var(--color-border)'
            }}
          >
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Generating {getSpecTypeDisplayName()} Spec...
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Please wait, this may take several minutes
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={`Generate ${getSpecTypeDisplayName()} Spec`}
        size="md"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <div className="mb-6">
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Provide a description of what you want to build. The AI will generate a {specType}{' '}
              specification based on your input.
            </p>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: 'Description is required' },
                { min: 10, message: 'Description must be at least 10 characters' },
                { whitespace: true, message: 'Description cannot be only whitespace' },
              ]}
            >
              <Input.TextArea
                placeholder={`Describe the ${specType} for your project...`}
                rows={6}
              />
            </Form.Item>

            <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Minimum 10 characters. Be as detailed as possible for better results.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
