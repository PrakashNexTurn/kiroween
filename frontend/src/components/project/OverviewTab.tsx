/**
 * OverviewTab Component
 * Displays project metadata, task statistics, phase timeline, and quick actions
 * 
 * Requirements: 4.3, 9.1, 9.3, 11.2, 11.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.4, 10.5
 */

import { useState } from 'react';
import { Hammer, TestTube, Wrench } from 'lucide-react';
import { Row, Col, Statistic, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  FileTextOutlined, 
  CheckCircleOutlined,
  FileSearchOutlined,
  LayoutOutlined,
  CheckSquareOutlined,
  RocketOutlined,
  FileProtectOutlined,
  BuildOutlined,
  BugOutlined,
  ToolOutlined,
  CheckOutlined
} from '@ant-design/icons';
import type { ProjectMetadata } from '../../types/project.types';
import { Button, Modal } from '../common';
import { projectService } from '../../services/projectService';
import { showSuccess, showError, showLongRunning } from '../common';
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
      
      // Show long-running operation toast
      showLongRunning('Building project...');
      
      const response = await projectService.buildProject(project.projectId);
      
      setResultTitle('Build Complete');
      setResultMessage(response.status === 'success' ? 'Project built successfully!' : 'Build failed');
      setResultLogs(response.logs || '');
      setShowResultModal(true);
      
      if (response.status === 'success') {
        showSuccess('Project built successfully');
        onProjectUpdate?.();
      } else {
        showError('Build failed. Check logs for details.', {
          onRetry: handleBuildProject
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to build project';
      showError(errorMessage, {
        onRetry: handleBuildProject
      });
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
      
      // Show long-running operation toast
      showLongRunning('Running tests...');
      
      const response = await projectService.testProject(project.projectId);
      
      setResultTitle('Test Complete');
      setResultMessage(response.status === 'success' ? 'All tests passed!' : 'Some tests failed');
      setResultLogs(response.logs || '');
      setShowResultModal(true);
      
      if (response.status === 'success') {
        showSuccess('All tests passed');
        onProjectUpdate?.();
      } else {
        showError('Some tests failed. Check logs for details.', {
          onRetry: handleTestProject
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run tests';
      showError(errorMessage, {
        onRetry: handleTestProject
      });
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
  // Phase configuration
  const PHASES: Phase[] = ['INIT', 'SPEC', 'BUILD', 'TEST', 'FIX', 'COMPLETE'];
  const PHASE_NAMES: Record<Phase, string> = {
    INIT: 'Initialize',
    SPEC: 'Specification',
    BUILD: 'Build',
    TEST: 'Test',
    FIX: 'Fix',
    COMPLETE: 'Complete',
  };
  const PHASE_ICONS: Record<Phase, React.ReactNode> = {
    INIT: <RocketOutlined />,
    SPEC: <FileProtectOutlined />,
    BUILD: <BuildOutlined />,
    TEST: <BugOutlined />,
    FIX: <ToolOutlined />,
    COMPLETE: <CheckOutlined />,
  };

  // Prepare spec files table data
  const specFilesData = project.specGenerated ? [
    {
      key: 'requirements',
      file: 'Requirements',
      icon: <FileSearchOutlined />,
      status: project.specGenerated.requirements ? 'Generated' : 'Not generated',
      date: project.specGenerated.requirements ? formatDate(project.specGenerated.requirements) : '-',
    },
    {
      key: 'design',
      file: 'Design',
      icon: <LayoutOutlined />,
      status: project.specGenerated.design ? 'Generated' : 'Not generated',
      date: project.specGenerated.design ? formatDate(project.specGenerated.design) : '-',
    },
    {
      key: 'tasks',
      file: 'Tasks',
      icon: <CheckSquareOutlined />,
      status: project.specGenerated.tasks ? 'Generated' : 'Not generated',
      date: project.specGenerated.tasks ? formatDate(project.specGenerated.tasks) : '-',
    },
  ] : [];

  const specColumns: ColumnsType<typeof specFilesData[0]> = [
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      render: (text: string, record) => (
        <Space>
          {record.icon}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Generated',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  // Prepare phase timeline table data
  const currentPhaseIndex = PHASES.indexOf(project.phase);
  const phaseTimelineData = PHASES.map((phase, index) => {
    const isCompleted = index < currentPhaseIndex;
    const isCurrent = phase === project.phase;

    return {
      key: phase,
      phase: phase,
      name: PHASE_NAMES[phase],
      icon: PHASE_ICONS[phase],
      status: isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending',
      order: index + 1,
    };
  });

  const phaseColumns: ColumnsType<typeof phaseTimelineData[0]> = [
    {
      title: '#',
      dataIndex: 'order',
      key: 'order',
      width: 50,
      align: 'center',
    },
    {
      title: 'Phase',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Space>
          {record.icon}
          <span style={{ 
            fontWeight: record.phase === project.phase ? 600 : 400,
            color: record.phase === project.phase ? 'var(--color-brand-primary)' : 'inherit'
          }}>
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === 'Completed') color = 'success';
        else if (status === 'In Progress') color = 'processing';
        else if (status === 'Pending') color = 'default';

        return (
          <Tag color={color} icon={status === 'Completed' ? <CheckCircleOutlined /> : undefined}>
            {status}
          </Tag>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      {/* Phase and Progress Bar - Mobile Optimized */}
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} sm={8}>
          <Space size="small">
            <span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Phase:
            </span>
            <Tag color={
              project.phase === 'INIT' || project.phase === 'SPEC' ? 'blue' :
              project.phase === 'BUILD' ? 'default' :
              project.phase === 'TEST' ? 'cyan' :
              project.phase === 'FIX' ? 'red' :
              project.phase === 'COMPLETE' ? 'green' : 'default'
            }>
              {project.phase}
            </Tag>
          </Space>
        </Col>
        <Col xs={24} sm={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: 500, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
              Progress:
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                height: '10px', 
                backgroundColor: 'var(--color-bg-tertiary)', 
                borderRadius: '5px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${project.completionPercentage}%`,
                  background: 'linear-gradient(90deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
                  transition: 'width 0.3s ease',
                  borderRadius: '5px'
                }} />
              </div>
            </div>
            <span style={{ fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: 600, color: 'var(--color-brand-primary)', minWidth: '40px', textAlign: 'right' }}>
              {Math.round(project.completionPercentage)}%
            </span>
          </div>
        </Col>
      </Row>

      {/* Task Statistics - Mobile Optimized */}
      <Row gutter={[12, 12]}>
        <Col xs={8} sm={12} md={8}>
          <Statistic
            title="Total Tasks"
            value={project.taskStats.total}
            prefix={<FileTextOutlined style={{ fontSize: 'clamp(16px, 4vw, 20px)' }} />}
            valueStyle={{ color: 'var(--color-text-primary)', fontSize: 'clamp(24px, 6vw, 32px)' }}
            style={{ textAlign: 'center' }}
          />
        </Col>
        <Col xs={8} sm={12} md={8}>
          <Statistic
            title="Completed"
            value={project.taskStats.completed}
            prefix={<CheckCircleOutlined style={{ fontSize: 'clamp(16px, 4vw, 20px)' }} />}
            valueStyle={{ color: 'var(--color-status-success)', fontSize: 'clamp(24px, 6vw, 32px)' }}
            style={{ textAlign: 'center' }}
          />
        </Col>
        <Col xs={8} sm={12} md={8}>
          <Statistic
            title="Progress"
            value={project.completionPercentage}
            suffix="%"
            valueStyle={{ color: 'var(--color-brand-primary)', fontSize: 'clamp(24px, 6vw, 32px)' }}
            style={{ textAlign: 'center' }}
          />
        </Col>
      </Row>

      {/* Specification Files - Compact Table */}
      {project.specGenerated && specFilesData.length > 0 && (
        <div>
          <h3 style={{ marginBottom: 8, fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Specification Files</h3>
          <Table
            dataSource={specFilesData}
            columns={specColumns}
            pagination={false}
            size="small"
            showHeader={false}
          />
        </div>
      )}

      {/* Phase Timeline - Compact Table */}
      <div>
        <h3 style={{ marginBottom: 8, fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Phase Timeline</h3>
        <Table
          dataSource={phaseTimelineData}
          columns={phaseColumns}
          pagination={false}
          size="small"
          rowClassName={(record) => record.phase === project.phase ? 'ant-table-row-selected' : ''}
        />
      </div>

      {/* Quick Actions */}
      {(shouldShowBuildButton(project.phase) ||
        shouldShowTestButton(project.phase) ||
        shouldShowFixButton(project)) && (
        <div>
          <h3 style={{ marginBottom: 8, fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Quick Actions</h3>
          <Space wrap>
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
          </Space>
        </div>
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
    </Space>
  );
}
