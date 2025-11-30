/**
 * CreateProjectModal Component
 * Modal for creating new projects with form validation
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { useEffect } from 'react';
import { Form, Input } from 'antd';
import { Modal, Button } from '../common';
import { showSuccess } from '../common/Toast';
import { projectService } from '../../services/projectService';
import { handleApiError } from '../../utils/errorHandler';

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  description: string;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [form] = Form.useForm<FormData>();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  // Handle form submission
  const handleSubmit = async (values: FormData) => {
    try {
      // Call API to create project
      await projectService.createProject(values.name.trim(), values.description.trim());

      // Show success message
      showSuccess('Project created successfully!');

      // Reset form
      form.resetFields();

      // Close modal
      onClose();

      // Trigger success callback to refresh project list
      onSuccess();
    } catch (error) {
      // Handle API error with user-friendly message
      handleApiError(error, { customMessage: 'Failed to create project. Please try again.' });
    }
  };

  // Handle modal close
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="👻 Summon a New Project" size="md">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Project Name Input */}
        <Form.Item
          label="Project Name"
          name="name"
          rules={[
            { required: true, message: 'Project name is required' },
            { min: 3, message: 'Project name must be at least 3 characters' },
            { whitespace: true, message: 'Project name cannot be only whitespace' },
          ]}
        >
          <Input
            placeholder="e.g., My Haunted App"
            autoFocus
          />
        </Form.Item>

        {/* Project Description Textarea */}
        <Form.Item
          label="Project Description"
          name="description"
          rules={[
            { required: true, message: 'Project description is required' },
            { min: 10, message: 'Project description must be at least 10 characters' },
            { whitespace: true, message: 'Project description cannot be only whitespace' },
          ]}
        >
          <Input.TextArea
            placeholder="Describe what you want to build... The ghost will help bring it to life! ✨"
            rows={4}
          />
        </Form.Item>

        {/* Form Actions */}
        <Form.Item className="mb-0">
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              htmlType="submit"
              variant="primary"
            >
              Summon Project
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
