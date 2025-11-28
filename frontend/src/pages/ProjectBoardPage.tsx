/**
 * ProjectBoard Page Component
 * Main dashboard displaying all projects as cards with search and filter
 * 
 * Requirements: 1.1, 1.5, 3.1
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '../hooks/useProjects';
import { useKeyboard } from '../hooks/useKeyboard';
import { Button, LoadingSpinner, Select } from '../components/common';
import { ProjectCard, CreateProjectModal } from '../components/project';
import { Phase } from '../types/project.types';
import { Plus, Search } from 'lucide-react';

export function ProjectBoardPage() {
  const { projects, loading, error, refetch } = useProjects(true, 30000);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<Phase | 'all'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts
  // Requirements: 15.1, 15.2, 15.3
  useKeyboard([
    {
      key: 'n',
      callback: () => setShowCreateModal(true),
      description: 'Open create project modal',
    },
    // Note: Escape key is handled by the Modal component itself
    {
      key: '/',
      callback: () => {
        // Focus the search input
        searchInputRef.current?.focus();
      },
      description: 'Focus search input',
    },
  ]);

  // Filter projects based on search query and phase filter
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPhase = filterPhase === 'all' || project.phase === filterPhase;

    return matchesSearch && matchesPhase;
  });

  // Loading state with skeleton cards
  if (loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
        </div>

        {/* Loading Spinner */}
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" label="Loading projects..." />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
        </div>

        {/* Error Message */}
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-status-error)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: 'var(--color-status-error)' }}
          >
            Error Loading Projects
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <Button onClick={refetch} variant="primary" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state when no projects exist
  if (projects.length === 0 && false) {
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
          <Button onClick={() => setShowCreateModal(true)} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Empty State */}
        <div
          className="flex flex-col items-center justify-center py-20 px-4 rounded-lg border-2 border-dashed"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="text-center max-w-md">
            <h2
              className="text-2xl font-semibold mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              No Projects Yet
            </h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Get started by creating your first project. You'll be able to manage specs, tasks,
              and track progress through the complete development lifecycle.
            </p>
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
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
      className="space-y-6"
    >
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Projects
        </h1>
        
        {/* Search, Filter, and Create Project in one line */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search projects... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Phase Filter Dropdown */}
          <div className="w-full lg:w-64">
            <Select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value as Phase | 'all')}
              options={[
                { value: 'all', label: 'All Phases' },
                { value: Phase.INIT, label: 'INIT' },
                { value: Phase.SPEC, label: 'SPEC' },
                { value: Phase.BUILD, label: 'BUILD' },
                { value: Phase.TEST, label: 'TEST' },
                { value: Phase.FIX, label: 'FIX' },
                { value: Phase.COMPLETE, label: 'COMPLETE' },
              ]}
              aria-label="Filter projects by phase"
            />
          </div>

          {/* Create Project Button */}
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="primary" 
            className="lg:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No projects match your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.projectId} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refetch}
        />
      )}
    </motion.div>
  );
}
