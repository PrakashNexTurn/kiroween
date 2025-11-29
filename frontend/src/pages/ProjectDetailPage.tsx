/**
 * ProjectDetailPage Component
 * Detailed view of a single project with tabs for Overview, Specs, and Tasks
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useProjectDetail } from '../hooks/useProjectDetail';
import { useKeyboard } from '../hooks/useKeyboard';
import { Badge, ProgressBar, Button, CardSkeleton } from '../components/common';
import { OverviewTab, SpecsTab, SteeringTab, GenerateSteeringModal, FilesTab } from '../components/project';
import { TasksTab } from '../components/task';
import { Phase } from '../types/project.types';
import { useNavigation } from '../utils';
import { steeringService } from '../services';
import toast from 'react-hot-toast';

/**
 * Tab type for navigation
 */
type TabType = 'overview' | 'specs' | 'tasks' | 'files' | 'steering';

/**
 * Get phase color for badge
 */
function getPhaseColor(phase: Phase): 'blue' | 'gray' | 'cyan' | 'red' | 'green' {
  switch (phase) {
    case Phase.INIT:
    case Phase.SPEC:
      return 'blue';
    case Phase.BUILD:
      return 'gray';
    case Phase.TEST:
      return 'cyan';
    case Phase.FIX:
      return 'red';
    case Phase.COMPLETE:
      return 'green';
    default:
      return 'gray';
  }
}

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
      
      const response = await steeringService.generateSteering(projectId || '', force);
      
      // Close modal on success
      setShowSteeringModal(false);
      
      // Requirement 1.3.1: Refresh steering tab after generation
      setSteeringRefreshTrigger(prev => prev + 1);
      
      // Show success message
      const filesGenerated = response.output.files_generated || [];
      if (filesGenerated.length > 0) {
        toast.success(`Generated ${filesGenerated.length} steering file(s): ${filesGenerated.join(', ')}`);
      } else {
        toast.success('All steering files already exist. Use force regeneration to overwrite.');
      }
    } catch (error) {
      console.error('Failed to generate steering files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate steering files';
      toast.error(errorMessage);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <CardSkeleton lines={1} />
          </div>
          
          {/* Tab navigation skeleton */}
          <div className="flex gap-2">
            <CardSkeleton lines={1} />
            <CardSkeleton lines={1} />
            <CardSkeleton lines={1} />
          </div>
          
          {/* Content skeleton */}
          <CardSkeleton lines={10} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <p
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--color-status-error)' }}
          >
            Error loading project
          </p>
          <p
            className="mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleBack} variant="secondary">
              Back to Projects
            </Button>
            <Button onClick={refetch} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <p
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Project not found
          </p>
          <p
            className="mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            The project you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={handleBack} variant="primary">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header Section */}
      <div className="mb-6">
        {/* Back Button and Project Name */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors hover:opacity-80"
            style={{
              color: 'var(--color-text-secondary)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
            aria-label="Back to projects"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1
            className="text-2xl sm:text-3xl font-bold flex-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {project.name}
          </h1>

          {/* Generate Steering Button */}
          {/* Requirement 1.3.1: Add button to project detail page header */}
          <Button
            onClick={handleGenerateSteeringClick}
            variant="secondary"
            size="sm"
            className="hidden sm:flex"
          >
            Generate Steering
          </Button>
        </div>

        {/* Phase Badge and Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Phase:
            </span>
            <Badge color={getPhaseColor(project.phase)} size="md">
              {project.phase}
            </Badge>
          </div>
          
          <div className="flex-1 max-w-md">
            <ProgressBar
              percentage={project.completionPercentage}
              variant="primary"
              showLabel
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="border-b mb-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <nav className="flex gap-8" aria-label="Project sections">
          <button
            onClick={() => handleTabChange('overview')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'overview' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeTab === 'overview'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeTab === 'overview' ? 'page' : undefined}
          >
            Overview
          </button>
          
          <button
            onClick={() => handleTabChange('specs')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'specs' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeTab === 'specs'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeTab === 'specs' ? 'page' : undefined}
          >
            Specs
          </button>
          
          <button
            onClick={() => handleTabChange('tasks')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'tasks' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeTab === 'tasks'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeTab === 'tasks' ? 'page' : undefined}
          >
            Tasks
          </button>
          
          <button
            onClick={() => handleTabChange('files')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'files' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeTab === 'files'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeTab === 'files' ? 'page' : undefined}
          >
            Files
          </button>
          
          <button
            onClick={() => handleTabChange('steering')}
            className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'steering' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeTab === 'steering'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeTab === 'steering' ? 'page' : undefined}
          >
            Steering
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <OverviewTab project={project} onProjectUpdate={refetch} />
        )}
        
        {activeTab === 'specs' && (
          <SpecsTab 
            projectId={projectId || ''} 
            onGenerationStateChange={setIsGeneratingSpec}
          />
        )}
        
        {activeTab === 'tasks' && (
          <TasksTab 
            projectId={projectId || ''} 
            onTaskComplete={refetch} 
            onExecutionStateChange={setIsExecutingTask}
          />
        )}
        
        {activeTab === 'files' && (
          <FilesTab 
            projectId={projectId || ''} 
          />
        )}
        
        {activeTab === 'steering' && (
          <SteeringTab 
            projectId={projectId || ''} 
            onGenerateClick={handleGenerateSteeringClick}
            key={steeringRefreshTrigger}
          />
        )}
      </div>

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
