/**
 * FilesTab Component
 * Displays project file explorer with tree view and content viewer
 * Migrated to Ant Design for consistent UI
 * 
 * Requirements: 3.3.1, 3.3.2
 */

import { useState } from 'react';
import { Layout, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

  return (
    <Layout style={{ height: 'calc(100vh - 250px)', minHeight: '500px', backgroundColor: 'var(--color-bg-primary)' }}>
      {/* File Tree Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        collapsedWidth={0}
        theme="light"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
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
            {/* File Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-secondary)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
