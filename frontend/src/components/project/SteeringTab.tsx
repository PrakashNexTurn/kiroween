/**
 * SteeringTab Component
 * Displays and manages steering files for a project
 * 
 * Requirements: 1.4.1, 1.4.2, 1.4.5
 */

import React, { useState, useEffect } from 'react';
import { FileText, Plus, AlertCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Layout, List, Typography, Space, Spin, Alert, Tooltip } from 'antd';
import { Button, showError } from '../common';
import { SteeringFileViewer } from './SteeringFileViewer';
import { steeringService } from '../../services';

const { Sider, Content } = Layout;
const { Text } = Typography;

/**
 * Steering file information
 */
interface SteeringFile {
  fileName: string;
  filePath: string;
  exists: boolean;
  size?: number;
  modifiedAt?: string;
}

/**
 * Props for SteeringTab component
 */
interface SteeringTabProps {
  projectId: string;
  onGenerateClick?: () => void;
  key?: number;
}

/**
 * SteeringTab component
 * Lists steering files and provides file selection and generation capabilities
 */
export function SteeringTab({ projectId, onGenerateClick }: SteeringTabProps) {
  const [steeringFiles, setSteeringFiles] = useState<SteeringFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [siderWidth, setSiderWidth] = useState(180);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Load steering files on mount
   */
  useEffect(() => {
    loadSteeringFiles();
  }, [projectId]);

  // Detect mobile/tablet on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Set appropriate width based on screen size
      if (mobile) {
        if (window.innerWidth <= 576) {
          setSiderWidth(120);
        } else {
          setSiderWidth(150);
        }
      } else if (siderWidth < 180) {
        // Reset to default desktop width if coming from mobile
        setSiderWidth(180);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle resize start (desktop only)
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle resize
  useEffect(() => {
    if (!isResizing) {
      document.body.classList.remove('resizing-panel');
      return;
    }

    document.body.classList.add('resizing-panel');

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 120), 400);
      setSiderWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('resizing-panel');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resizing-panel');
    };
  }, [isResizing]);

  /**
   * Load steering files from API
   * Requirement 3.3.5: Enhanced error handling with retry
   */
  const loadSteeringFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await steeringService.listSteeringFiles(projectId);
      setSteeringFiles(response.files || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load steering files';
      setError(errorMessage);
      
      // Show error toast with retry functionality (Requirement 3.3.5)
      showError(errorMessage, {
        onRetry: loadSteeringFiles,
        duration: 70000
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    // TODO: Load and display file content when SteeringFileViewer is implemented
  };

  /**
   * Handle generate button click
   */
  const handleGenerateClick = () => {
    onGenerateClick?.();
  };

  /**
   * Render loading state with skeleton
   * Requirement 4.1.3: Loading states for steering files
   */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  /**
   * Render error state with graceful degradation
   * Requirement 3.3.5: User-friendly error messages and retry functionality
   */
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
        <Alert
          message="Error Loading Steering Files"
          description={error}
          type="error"
          showIcon
          icon={<AlertCircle style={{ width: '20px', height: '20px' }} />}
        />
        <Button onClick={loadSteeringFiles}>Retry</Button>
      </div>
    );
  }

  /**
   * Render empty state when no steering files exist
   */
  if (steeringFiles.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <FileText
          size={48}
          style={{ color: 'var(--color-text-secondary)', margin: '0 auto 16px' }}
        />
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}
        >
          No Steering Files
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            maxWidth: '400px',
            margin: '0 auto 24px',
          }}
        >
          Steering files provide AI assistants with project-specific context and conventions.
          Generate them to help guide development.
        </p>
        <Button onClick={handleGenerateClick} variant="primary">
          <Plus size={18} style={{ marginRight: '8px' }} />
          Generate Steering Files
        </Button>
      </div>
    );
  }

  /**
   * Render file list with Files tab style layout
   */
  return (
    <Layout style={{ height: 'calc(100vh - 250px)', minHeight: '500px', backgroundColor: 'var(--color-bg-primary)' }}>
      {/* File List Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={siderWidth}
        collapsedWidth={0}
        theme="light"
        trigger={null}
        className="steering-tab-sider"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '14px' }}>Steering Files</Text>
              <Button
                onClick={handleGenerateClick}
                variant="secondary"
                size="sm"
                style={{ width: '100%' }}
              >
                <Plus size={14} style={{ marginRight: '4px' }} />
                Regenerate
              </Button>
            </Space>
          </div>

          {/* File List */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <List
              size="small"
              dataSource={steeringFiles}
              renderItem={(file) => (
                <List.Item
                  onClick={() => handleFileSelect(file.fileName)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: selectedFile === file.fileName ? 'var(--color-brand-primary)' : 'transparent',
                    color: selectedFile === file.fileName ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                    borderLeft: selectedFile === file.fileName ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <FileText
                        size={14}
                        style={{ 
                          color: selectedFile === file.fileName ? 'var(--color-bg-primary)' : 'var(--color-brand-primary)',
                          flexShrink: 0,
                        }}
                      />
                    }
                    title={
                      <Text
                        style={{
                          fontSize: '12px',
                          color: selectedFile === file.fileName ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
                          fontWeight: selectedFile === file.fileName ? 500 : 400,
                        }}
                      >
                        {file.fileName}
                      </Text>
                    }
                    description={
                      file.size && (
                        <Text
                          style={{
                            fontSize: '10px',
                            color: selectedFile === file.fileName ? 'var(--color-bg-primary)' : 'var(--color-text-tertiary)',
                          }}
                        >
                          {(file.size / 1024).toFixed(1)} KB
                        </Text>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        </div>

        {/* Resize Handle - Desktop Only */}
        {!collapsed && !isMobile && (
          <div
            onMouseDown={handleResizeStart}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              cursor: 'col-resize',
              backgroundColor: isResizing ? 'var(--color-brand-primary)' : 'transparent',
              transition: 'background-color 0.2s',
              zIndex: 10,
            }}
            onMouseEnter={(e) => {
              if (!isResizing) {
                e.currentTarget.style.backgroundColor = 'var(--color-border)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isResizing) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          />
        )}
      </Sider>

      {/* File Content Area */}
      <Content
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        {selectedFile ? (
          <>
            {/* File Header with Toggle */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-secondary)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Tooltip title={collapsed ? 'Show file list' : 'Hide file list'}>
                <Button
                  onClick={() => setCollapsed(!collapsed)}
                  variant="ghost"
                  size="sm"
                  style={{ padding: '4px 8px', minWidth: 'auto' }}
                >
                  {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </Button>
              </Tooltip>
              <Text
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                }}
              >
                {selectedFile}
              </Text>
            </div>

            {/* File Content */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <SteeringFileViewer
                projectId={projectId}
                fileName={selectedFile}
                onSaveSuccess={loadSteeringFiles}
              />
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <FileText
                size={48}
                style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}
              />
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: '8px',
                }}
              >
                No file selected
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                Select a steering file to view and edit
              </p>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
}
