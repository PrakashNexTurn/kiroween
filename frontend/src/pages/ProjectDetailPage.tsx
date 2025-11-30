/**
 * ProjectDetailPage Component
 * Detailed view of a single project with tabs for Overview, Specs, and Tasks
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button as AntButton, Tabs, Skeleton, Alert, Space } from 'antd';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { useKeyboard } from '../hooks/useKeyboard';
import { OverviewTab, SpecsTab, SteeringTab, GenerateSteeringModal, FilesTab } from '../components/project';
import { useNavigation } from '../utils';
import { steeringService } from '../services';
import { showSuccess, showError, showLongRunning } from '../components/common';

/**
 * Tab type for navigation
 */
type TabType = 'overview' | 'specs' | 'tasks' | 'files' | 'steering';

/**
 * ProjectDetailPage component
 * Displays detailed project information with tabbed navigation
 */
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { goToHome } = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false);
  const [isGeneratingSteering, setIsGeneratingSteering] = useState(false);
  const [showSteeringModal, setShowSteeringModal] = useState(false);
  const [steeringRefreshTrigger, setSteeringRefreshTrigger] = useState(0);
  
  // Get active tab from URL or default to 'overview'
  const activeTab = (searchParams.get('tab') as TabType) || 'overview';
  
  // Fetch project data with auto-refresh (paused during task execution or spec generation)
  const { project, loading, error, refetch } = useProjectDetail(
    projectId || '',
    true,
    30000,
    isExecutingTask || isGeneratingSpec // Pause polling when executing tasks or generating specs
  );

  // Handle tab switching
  const handleTabChange = (tab: TabType) => {
    setSearchParams({ tab });
  };

  // Handle back navigation
  const handleBack = () => {
    goToHome();
  };

  // Handle generate steering button click
  // Requirement 1.3.1: Add button to project detail page header
  const handleGenerateSteeringClick = () => {
    setShowSteeringModal(true);
  };

  // Handle steering generation
  // Requirement 1.3.1: Open GenerateSteeringModal on click
  const handleGenerateSteering = async (force: boolean) => {
    try {
      setIsGeneratingSteering(true);
      
      // Show long-running operation toast
      showLongRunning('Generating steering files...');
      
      const response = await steeringService.generateSteering(projectId || '', force);
      
      // Close modal on success
      setShowSteeringModal(false);
      
      // Requirement 1.3.1: Refresh steering tab after generation
      setSteeringRefreshTrigger(prev => prev + 1);
      
      // Show success message
      const filesGenerated = response.output.files_generated || [];
      if (filesGenerated.length > 0) {
        showSuccess(`Generated ${filesGenerated.length} steering file(s): ${filesGenerated.join(', ')}`);
      } else {
        showSuccess('All steering files already exist. Use force regeneration to overwrite.');
      }
    } catch (error) {
      console.error('Failed to generate steering files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate steering files';
      showError(errorMessage, {
        onRetry: () => handleGenerateSteering(force)
      });
    } finally {
      setIsGeneratingSteering(false);
    }
  };

  // Project detail keyboard shortcuts
  // Requirements: 15.4, 15.5
  useKeyboard([
    {
      key: 't',
      callback: () => handleTabChange('tasks'),
      description: 'Switch to Tasks tab',
    },
    {
      key: 's',
      callback: () => handleTabChange('specs'),
      description: 'Switch to Specs tab',
    },
    {
      key: 'o',
      callback: () => handleTabChange('overview'),
      description: 'Switch to Overview tab',
    },
    {
      key: 'f',
      callback: () => handleTabChange('files'),
      description: 'Switch to Files tab',
    },
    {
      key: 'g',
      callback: () => handleTabChange('steering'),
      description: 'Switch to Steering tab',
    },
  ]);

  // Show loading state with skeleton
  // Requirement 4.1.3: Consistent loading UI across features
  if (loading && !project) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header skeleton */}
          <Skeleton active paragraph={{ rows: 1 }} />
          
          {/* Tab navigation skeleton */}
          <Skeleton.Button active block />
          
          {/* Content skeleton */}
          <Skeleton active paragraph={{ rows: 10 }} />
        </Space>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <Alert
          message="Error loading project"
          description={error}
          type="error"
          showIcon
          action={
            <Space>
              <AntButton onClick={handleBack}>
                Back to Projects
              </AntButton>
              <AntButton type="primary" onClick={refetch}>
                Try Again
              </AntButton>
            </Space>
          }
        />
      </div>
    );
  }

  // Show not found state
  if (!project) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <Alert
          message="Project not found"
          description="The project you're looking for doesn't exist or has been deleted."
          type="warning"
          showIcon
          action={
            <AntButton type="primary" onClick={handleBack}>
              Back to Projects
            </AntButton>
          }
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '8px 12px',
      }}
    >
      {/* Tab Navigation - Mobile Optimized */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => handleTabChange(key as TabType)}
        size="small"
        tabBarStyle={{
          marginBottom: '16px',
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
        }}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: <OverviewTab project={project} onProjectUpdate={refetch} />,
          },
          {
            key: 'steering',
            label: 'Steering',
            children: (
              <SteeringTab 
                projectId={projectId || ''} 
                onGenerateClick={handleGenerateSteeringClick}
                key={steeringRefreshTrigger}
              />
            ),
          },
          {
            key: 'specs',
            label: 'Specs',
            children: (
              <SpecsTab 
                projectId={projectId || ''} 
                onGenerationStateChange={setIsGeneratingSpec}
                onTaskComplete={refetch}
                onExecutionStateChange={setIsExecutingTask}
              />
            ),
          },
          {
            key: 'files',
            label: 'Files',
            children: <FilesTab projectId={projectId || ''} />,
          },
        ]}
      />

      {/* Generate Steering Modal */}
      {/* Requirement 1.3.1: Open GenerateSteeringModal on click */}
      <GenerateSteeringModal
        isOpen={showSteeringModal}
        onClose={() => setShowSteeringModal(false)}
        onGenerate={handleGenerateSteering}
        isGenerating={isGeneratingSteering}
        hasExistingFiles={false}
      />
    </motion.div>
  );
}
