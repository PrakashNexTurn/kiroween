/**
 * CreateProjectModal Component
 * Modal for creating new projects with form validation
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { useEffect } from 'react';
import { Modal, Input, Textarea, Button } from '../common';
import { showSuccess } from '../common/Toast';
import { projectService } from '../../services/projectService';
import { useForm } from '../../hooks';
import { required, minLength, combine, notOnlyWhitespace } from '../../utils';
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
  // Use form hook with validation
  const form = useForm<FormData>({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: {
      name: combine(
        (value) => required(value, 'Project name'),
        (value) => notOnlyWhitespace('Project name')(value),
        minLength(3, 'Project name')
      ),
      description: combine(
        (value) => required(value, 'Project description'),
        (value) => notOnlyWhitespace('Project description')(value),
        minLength(10, 'Project description')
      ),
    },
    onSubmit: async (values) => {
      try {
        // Call API to create project
        await projectService.createProject(values.name.trim(), values.description.trim());

        // Show success message
        showSuccess('Project created successfully!');

        // Reset form
        form.resetForm();

        // Close modal
        onClose();

        // Trigger success callback to refresh project list
        onSuccess();
      } catch (error) {
        // Handle API error with user-friendly message
        handleApiError(error, 'Failed to create project. Please try again.');
      }
    },
    validateOnBlur: true,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      form.resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle modal close
  const handleClose = () => {
    if (!form.isSubmitting) {
      form.resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="👻 Summon a New Project" size="md">
      <form onSubmit={form.handleSubmit} className="space-y-6">
        {/* Project Name Input */}
        <Input
          label="Project Name"
          placeholder="e.g., My Haunted App"
          value={form.values.name}
          onChange={(e) => form.handleChange('name')(e.target.value)}
          onBlur={form.handleBlur('name')}
          error={form.touched.name ? form.errors.name : undefined}
          disabled={form.isSubmitting}
          required
          autoFocus
        />

        {/* Project Description Textarea */}
        <Textarea
          label="Project Description"
          placeholder="Describe what you want to build... The ghost will help bring it to life! ✨"
          value={form.values.description}
          onChange={(e) => form.handleChange('description')(e.target.value)}
          onBlur={form.handleBlur('description')}
          error={form.touched.description ? form.errors.description : undefined}
          disabled={form.isSubmitting}
          rows={4}
          required
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={form.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={form.isSubmitting}
            loading={form.isSubmitting}
          >
            {form.isSubmitting ? 'Summoning...' : 'Summon Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
