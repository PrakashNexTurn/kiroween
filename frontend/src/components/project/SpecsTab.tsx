/**
 * SpecsTab Component
 * Sub-tab navigation for viewing and editing specification files
 * 
 * Requirements: 5.1
 */

import { useState } from 'react';
import { SpecViewer } from './SpecViewer';
import { GenerateSpecModal } from './GenerateSpecModal';

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
}

/**
 * SpecsTab component
 * Provides sub-tab navigation for requirements, design, and tasks specs
 */
export function SpecsTab({ projectId, onGenerationStateChange }: SpecsTabProps) {
  const [activeSpec, setActiveSpec] = useState<SpecType>('requirements');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  /**
   * Get the file name for the active spec
   */
  const getFileName = (): 'requirements.md' | 'design.md' | 'tasks.md' => {
    return `${activeSpec}.md` as 'requirements.md' | 'design.md' | 'tasks.md';
  };

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

  return (
    <div>
      {/* Sub-tab Navigation */}
      <div
        className="border-b mb-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <nav className="flex gap-6" aria-label="Specification files">
          <button
            onClick={() => setActiveSpec('requirements')}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeSpec === 'requirements' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeSpec === 'requirements'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeSpec === 'requirements' ? 'page' : undefined}
          >
            Requirements
          </button>

          <button
            onClick={() => setActiveSpec('design')}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeSpec === 'design' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeSpec === 'design'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeSpec === 'design' ? 'page' : undefined}
          >
            Design
          </button>

          <button
            onClick={() => setActiveSpec('tasks')}
            className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
              activeSpec === 'tasks' ? 'border-current' : 'border-transparent'
            }`}
            style={{
              color:
                activeSpec === 'tasks'
                  ? 'var(--color-brand-primary)'
                  : 'var(--color-text-secondary)',
            }}
            aria-current={activeSpec === 'tasks' ? 'page' : undefined}
          >
            Tasks
          </button>
        </nav>
      </div>

      {/* Spec Content */}
      <div>
        <SpecViewer
          key={`${activeSpec}-${refreshKey}`}
          projectId={projectId}
          fileName={getFileName()}
          onGenerateClick={handleGenerateClick}
        />
      </div>

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
