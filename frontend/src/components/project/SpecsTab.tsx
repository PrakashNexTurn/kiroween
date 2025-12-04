/**
 * SpecsTab Component
 * Sub-tab navigation for viewing and editing specification files
 * 
 * Requirements: 5.1
 */

import { useState } from 'react';
import { Tabs } from 'antd';
import { FileSearchOutlined, LayoutOutlined, CheckSquareOutlined } from '@ant-design/icons';
import { SpecViewer } from './SpecViewer';
import { GenerateSpecModal } from './GenerateSpecModal';
import { TasksTab } from '../task/TasksTab';

/**
 * Spec file type
 */
type SpecType = 'requirements' | 'design' | 'tasks';

/**
 * Props for SpecsTab component
 */
interface SpecsTabProps {
  projectId: string;
  onGenerationStateChange?: (isGenerating: boolean) => void;
  onTaskComplete?: () => void;
  onExecutionStateChange?: (isExecuting: boolean) => void;
}

/**
 * SpecsTab component
 * Provides sub-tab navigation for requirements, design, and tasks specs
 */
export function SpecsTab({ projectId, onGenerationStateChange, onTaskComplete, onExecutionStateChange }: SpecsTabProps) {
  const [activeSpec, setActiveSpec] = useState<SpecType>('requirements');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showTasksEditor, setShowTasksEditor] = useState(false);

  /**
   * Handle generate button click
   */
  const handleGenerateClick = () => {
    setShowGenerateModal(true);
  };

  /**
   * Handle successful spec generation
   */
  const handleGenerateSuccess = () => {
    // Trigger refresh of SpecViewer by changing key
    setRefreshKey((prev) => prev + 1);
  };

  /**
   * Handle edit tasks button click
   */
  const handleEditTasksClick = () => {
    setShowTasksEditor(true);
  };

  const tabItems = [
    {
      key: 'requirements',
      label: (
        <span>
          <FileSearchOutlined /> Requirements
        </span>
      ),
      children: (
        <SpecViewer
          key={`requirements-${refreshKey}`}
          projectId={projectId}
          fileName="requirements.md"
          onGenerateClick={handleGenerateClick}
        />
      ),
    },
    {
      key: 'design',
      label: (
        <span>
          <LayoutOutlined /> Design
        </span>
      ),
      children: (
        <SpecViewer
          key={`design-${refreshKey}`}
          projectId={projectId}
          fileName="design.md"
          onGenerateClick={handleGenerateClick}
        />
      ),
    },
    {
      key: 'tasks',
      label: (
        <span>
          <CheckSquareOutlined /> Tasks
        </span>
      ),
      children: showTasksEditor ? (
        <SpecViewer
          key={`tasks-editor-${refreshKey}`}
          projectId={projectId}
          fileName="tasks.md"
          onGenerateClick={handleGenerateClick}
          startInEditMode={true}
          onClose={() => {
            setShowTasksEditor(false);
            setRefreshKey((prev) => prev + 1);
          }}
        />
      ) : (
        <TasksTab
          key={`tasks-${refreshKey}`}
          projectId={projectId}
          onTaskComplete={() => {
            onTaskComplete?.();
            setRefreshKey((prev) => prev + 1);
          }}
          onExecutionStateChange={onExecutionStateChange}
          onEditClick={handleEditTasksClick}
          onGenerateClick={handleGenerateClick}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={activeSpec}
        onChange={(key) => setActiveSpec(key as SpecType)}
        items={tabItems}
      />

      {/* Generate Modal */}
      <GenerateSpecModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        projectId={projectId}
        specType={activeSpec}
        onSuccess={handleGenerateSuccess}
        onGenerationStateChange={onGenerationStateChange}
      />
    </div>
  );
}
