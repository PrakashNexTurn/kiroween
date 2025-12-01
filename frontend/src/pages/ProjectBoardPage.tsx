/**
 * ProjectBoard Page Component
 * Main dashboard displaying all projects as cards with search and filter
 * 
 * Requirements: 1.1, 1.5, 3.1
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Row, Col, Input, Select as AntSelect, Button as AntButton, Spin, Alert, Empty, Space, Flex } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { useProjects } from '../hooks/useProjects';
import { useKeyboard } from '../hooks/useKeyboard';
import { ProjectCard, CreateProjectModal } from '../components/project';
import { Phase } from '../types/project.types';

const { Search } = Input;

export function ProjectBoardPage() {
  const { projects, loading, error, refetch } = useProjects(true, 30000);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPhase, setFilterPhase] = useState<Phase | 'all'>('all');
  const searchInputRef = useRef<InputRef>(null);

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
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Section */}
        <Flex justify="space-between" align="flex-start" gap="middle" wrap="wrap">
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
        </Flex>

        {/* Loading Spinner */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0' }}>
          <Spin size="large" tip="Loading projects..." />
        </div>
      </Space>
    );
  }

  // Error state
  if (error) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Section */}
        <Flex justify="space-between" align="flex-start" gap="middle" wrap="wrap">
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
        </Flex>

        {/* Error Message */}
        <Alert
          message="Error Loading Projects"
          description={error}
          type="error"
          showIcon
          action={
            <AntButton type="primary" onClick={refetch}>
              Retry
            </AntButton>
          }
        />
      </Space>
    );
  }

  // Empty state when no projects exist
  if (projects.length === 0 && false) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Section */}
        <Flex justify="space-between" align="flex-start" gap="middle" wrap="wrap">
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: 'var(--color-text-primary)' }}>
            Projects
          </h1>
          <AntButton 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Project
          </AntButton>
        </Flex>

        {/* Empty State */}
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div style={{ textAlign: 'center', maxWidth: '448px', margin: '0 auto' }}>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: 'var(--color-text-primary)',
                }}
              >
                👻 The Ghost Awaits...
              </h2>
              <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>
                Summon your first project and let Kiro's spirit guide you from idea to production. 
                No IDE installation required - just pure AI-powered development magic! ✨
              </p>
            </div>
          }
        >
          <AntButton 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowCreateModal(true)}
          >
            Summon Your First Project
          </AntButton>
        </Empty>
      </Space>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header Section */}
        <div>
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 32px)', 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            color: 'var(--color-text-primary)',
            lineHeight: 1.2
          }}>
            👻 Your Haunted Projects
          </h1>
          <p style={{ 
            marginBottom: '16px', 
            color: 'var(--color-text-secondary)',
            fontSize: 'clamp(14px, 3vw, 16px)',
            lineHeight: 1.5
          }}>
            The ghost follows you everywhere - manage your projects from any device, anywhere
          </p>
        
        {/* Search, Filter, and Create Project - Mobile Optimized */}
        <Row gutter={[12, 12]}>
          {/* Search Input - Full width on mobile */}
          <Col xs={24} md={12}>
            <Search
              ref={searchInputRef}
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              size="large"
              style={{ fontSize: '16px' }}
            />
          </Col>

          {/* Phase Filter Dropdown - Half width on mobile */}
          <Col xs={12} md={6}>
            <AntSelect
              value={filterPhase}
              onChange={(value) => setFilterPhase(value as Phase | 'all')}
              style={{ width: '100%' }}
              size="large"
              options={[
                { value: 'all', label: 'All' },
                { value: Phase.INIT, label: 'INIT' },
                { value: Phase.SPEC, label: 'SPEC' },
                { value: Phase.BUILD, label: 'BUILD' },
                { value: Phase.TEST, label: 'TEST' },
                { value: Phase.FIX, label: 'FIX' },
                { value: Phase.COMPLETE, label: 'DONE' },
              ]}
              aria-label="Filter projects by phase"
            />
          </Col>

          {/* Create Project Button - Half width on mobile */}
          <Col xs={12} md={6}>
            <AntButton 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              size="large"
              block
              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              <span className="button-text-full">Create Project</span>
              <span className="button-text-short">Create</span>
            </AntButton>
          </Col>
        </Row>
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <Empty
          description="No projects match your search criteria."
          style={{ padding: '48px 0' }}
        />
      ) : (
        <Row gutter={[12, 12]}>
  {filteredProjects.map((project) => (
    <Col
      key={project.projectId}
      xs={24}
      sm={12}
      md={8}
      lg={6}
      xl={6}
      style={{ display: "flex" }}
    >
      <div style={{ width: "100%", height: "100%" }}> 
        <ProjectCard project={project} />
      </div>
    </Col>
  ))}
</Row>

      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refetch}
        />
      )}
      </Space>
    </motion.div>
  );
}
