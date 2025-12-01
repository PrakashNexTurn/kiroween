/**
 * FilesTab Component
 * Displays project file explorer with tree view and content viewer
 * Migrated to Ant Design for consistent UI
 * 
 * Requirements: 3.3.1, 3.3.2
 */

import React, { useState } from 'react';
import { Layout, Input, Tooltip } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '../common';
import { FileTree } from './FileTree';
import { FileContentViewer } from './FileContentViewer';

const { Sider, Content } = Layout;

/**
 * Props for FilesTab component
 */
export interface FilesTabProps {
  projectId: string;
}

/**
 * FilesTab component
 * Provides IDE-like file explorer with Ant Design Layout
 */
export function FilesTab({ projectId }: FilesTabProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [siderWidth, setSiderWidth] = useState(180);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile/tablet on mount and resize
  React.useEffect(() => {
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
  React.useEffect(() => {
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

  return (
    <Layout style={{ height: 'calc(100vh - 250px)', minHeight: '500px', backgroundColor: 'var(--color-bg-primary)' }}>
      {/* File Tree Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={siderWidth}
        collapsedWidth={0}
        theme="light"
        trigger={null}
        className="files-tab-sider"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Search Bar */}
          <div style={{ padding: '12px' }}>
            <Input
              placeholder="Search files..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>

          {/* File Tree */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px 8px' }}>
            <FileTree
              projectId={projectId}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              searchQuery={searchQuery}
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
              <Tooltip title={collapsed ? 'Show file tree' : 'Hide file tree'}>
                <Button
                  onClick={() => setCollapsed(!collapsed)}
                  variant="ghost"
                  size="sm"
                  style={{ padding: '4px 8px', minWidth: 'auto' }}
                >
                  {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                </Button>
              </Tooltip>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
                title={selectedFile}
              >
                {selectedFile.split('/').slice(-2).join('/')}
              </div>
            </div>

            {/* File Content */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <FileContentViewer
                projectId={projectId}
                filePath={selectedFile}
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
                Select a file from the tree to view its contents
              </p>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
}
