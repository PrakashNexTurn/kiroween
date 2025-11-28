/**
 * OverviewTab Component
 * Displays project metadata, task statistics, phase timeline, and quick actions
 * 
 * Requirements: 4.3, 9.1, 9.3, 11.2, 11.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.4, 10.5
 */

import { useState } from 'react';
import { Calendar, FileText, CheckCircle, Clock, AlertCircle, XCircle, Hammer, TestTube, Wrench } from 'lucide-react';
import type { ProjectMetadata } from '../../types/project.types';
import { Card, Button, Modal } from '../common';
import { PhaseTimeline } from './PhaseTimeline';
import { projectService } from '../../services/projectService';
import { showSuccess, showError } from '../common';
import { Phase } from '../../types/project.types';

/**
 * Props for OverviewTab component
 */
export interface OverviewTabProps {
  project: ProjectMetadata;
  onProjectUpdate?: () => void;
}

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if build button should be visible
 */
function shouldShowBuildButton(phase: Phase): boolean {
  return ['BUILD', 'TEST', 'FIX', 'COMPLETE'].includes(phase);
}

/**
 * Check if test button should be visible
 */
function shouldShowTestButton(phase: Phase): boolean {
  return ['TEST', 'FIX', 'COMPLETE'].includes(phase);
}

/**
 * Check if fix button should be visible (when tests have failed)
 */
function shouldShowFixButton(project: ProjectMetadata): boolean {
  return project.taskStats.failed > 0;
}

/**
 * OverviewTab component
 * Displays comprehensive project overview with metadata, statistics, and actions
 */
export function OverviewTab({ project, onProjectUpdate }: OverviewTabProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultLogs, setResultLogs] = useState('');

  /**
   * Handle build project action
   */
  const handleBuildProject = async () => {
    try {
      setIsBuilding(true);
      const response = await projectService.buildProject(project.projectId);
      
      setResultTitle('Build Complete');
      setResultMessage(response.status === 'success' ? 'Project built successfully!' : 'Build failed');
      setResultLogs(response.logs || '');
      setShowResultModal(true);
      
      if (response.status === 'success') {
        showSuccess('Project built successfully');
        onProjectUpdate?.();
      } else {
        showError('Build failed. Check logs for details.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to build project';
      showError(errorMessage);
      setResultTitle('Build Error');
      setResultMessage(errorMessage);
      setResultLogs('');
      setShowResultModal(true);
    } finally {
      setIsBuilding(false);
    }
  };

  /**
   * Handle test project action
   */
  const handleTestProject = async () => {
    try {
      setIsTesting(true);
      const response = await projectService.testProject(project.projectId);
      
      setResultTitle('Test Complete');
      setResultMessage(response.status === 'success' ? 'All tests passed!' : 'Some tests failed');
      setResultLogs(response.logs || '');
      setShowResultModal(true);
      
      if (response.status === 'success') {
        showSuccess('All tests passed');
        onProjectUpdate?.();
      } else {
        showError('Some tests failed. Check logs for details.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run tests';
      showError(errorMessage);
      setResultTitle('Test Error');
      setResultMessage(errorMessage);
      setResultLogs('');
      setShowResultModal(true);
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Handle fix issues action
   */
  const handleFixIssues = async () => {
    try {
      setIsFixing(true);
      // Get failure details from task stats
      const failureDetails = `${project.taskStats.failed} task(s) failed`;
      const response = await projectService.fixProject(project.projectId, failureDetails);
      
      setResultTitle('Fix Complete');
      setResultMessage(response.status === 'success' ? 'Issues fixed successfully!' : 'Fix attempt completed');
      setResultLogs(response.logs || '');
      setShowResultModal(true);
      
      if (response.status === 'success') {
        showSuccess('Issues fixed successfully');
        onProjectUpdate?.();
      } else {
        showError('Fix attempt completed. Check logs for details.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fix issues';
      showError(errorMessage);
      setResultTitle('Fix Error');
      setResultMessage(errorMessage);
      setResultLogs('');
      setShowResultModal(true);
    } finally {
      setIsFixing(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Project Metadata Section */}
      <Card>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Project Information
        </h2>
        
        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label
              className="text-sm font-medium block mb-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Name
            </label>
            <p
              className="text-base"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {project.name}
            </p>
          </div>

          {/* Project Description */}
          {project.description && (
            <div>
              <label
                className="text-sm font-medium block mb-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Description
              </label>
              <p
                className="text-base"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {project.description}
              </p>
            </div>
          )}

          {/* Dates */}
          {(project.createdAt || project.updatedAt) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.createdAt && (
                <div>
                  <label
                    className="text-sm font-medium flex items-center gap-2 mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Calendar size={16} />
                    Created
                  </label>
                  <p
                    className="text-base"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {formatDate(project.createdAt)}
                  </p>
                </div>
              )}

              {project.updatedAt && (
                <div>
                  <label
                    className="text-sm font-medium flex items-center gap-2 mb-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    <Calendar size={16} />
                    Last Updated
                  </label>
                  <p
                    className="text-base"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {formatDate(project.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Task Statistics Section */}
      <Card>
        <h2
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Task Statistics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Total Tasks */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText
                size={20}
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Total
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {project.taskStats.total}
            </p>
          </div>

          {/* Completed Tasks */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle
                size={20}
                style={{ color: 'var(--color-status-success)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Completed
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--color-status-success)' }}
            >
              {project.taskStats.completed}
            </p>
          </div>

          {/* In Progress Tasks */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock
                size={20}
                style={{ color: 'var(--color-brand-primary)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                In Progress
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--color-brand-primary)' }}
            >
              {project.taskStats.inProgress}
            </p>
          </div>

          {/* Pending Tasks */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle
                size={20}
                style={{ color: 'var(--color-text-secondary)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Pending
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {project.taskStats.pending}
            </p>
          </div>

          {/* Failed Tasks */}
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <XCircle
                size={20}
                style={{ color: 'var(--color-status-error)' }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Failed
              </span>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ color: 'var(--color-status-error)' }}
            >
              {project.taskStats.failed}
            </p>
          </div>
        </div>
      </Card>

      {/* Spec Generation Timestamps Section */}
      {project.specGenerated && (
        <Card>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Specification Files
          </h2>
          
          <div className="space-y-3">
            {/* Requirements */}
            <div className="flex items-center justify-between">
              <span
                className="text-base font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Requirements
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {project.specGenerated.requirements
                  ? `Generated ${formatDate(project.specGenerated.requirements)}`
                  : 'Not generated'}
              </span>
            </div>

            {/* Design */}
            <div className="flex items-center justify-between">
              <span
                className="text-base font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Design
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {project.specGenerated.design
                  ? `Generated ${formatDate(project.specGenerated.design)}`
                  : 'Not generated'}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex items-center justify-between">
              <span
                className="text-base font-medium"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Tasks
              </span>
              <span
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {project.specGenerated.tasks
                  ? `Generated ${formatDate(project.specGenerated.tasks)}`
                  : 'Not generated'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Phase Timeline */}
      <Card>
        <h2
          className="text-xl font-semibold mb-6"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Phase Timeline
        </h2>
        <PhaseTimeline currentPhase={project.phase} />
      </Card>

      {/* Quick Actions */}
      {(shouldShowBuildButton(project.phase) ||
        shouldShowTestButton(project.phase) ||
        shouldShowFixButton(project)) && (
        <Card>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Quick Actions
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {/* Build Project Button */}
            {shouldShowBuildButton(project.phase) && (
              <Button
                onClick={handleBuildProject}
                disabled={isBuilding}
                variant="primary"
                className="flex items-center gap-2"
              >
                <Hammer size={18} />
                {isBuilding ? 'Building...' : 'Build Project'}
              </Button>
            )}

            {/* Run Tests Button */}
            {shouldShowTestButton(project.phase) && (
              <Button
                onClick={handleTestProject}
                disabled={isTesting}
                variant="primary"
                className="flex items-center gap-2"
              >
                <TestTube size={18} />
                {isTesting ? 'Testing...' : 'Run Tests'}
              </Button>
            )}

            {/* Fix Issues Button */}
            {shouldShowFixButton(project) && (
              <Button
                onClick={handleFixIssues}
                disabled={isFixing}
                variant="danger"
                className="flex items-center gap-2"
              >
                <Wrench size={18} />
                {isFixing ? 'Fixing...' : 'Fix Issues'}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title={resultTitle}
        size="lg"
      >
        <div className="space-y-4">
          <p
            className="text-base"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {resultMessage}
          </p>

          {resultLogs && (
            <div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Logs:
              </h3>
              <div
                className="p-4 rounded-md font-mono text-xs overflow-auto max-h-96"
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                }}
              >
                <pre className="whitespace-pre-wrap">{resultLogs}</pre>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setShowResultModal(false)}
              variant="primary"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
