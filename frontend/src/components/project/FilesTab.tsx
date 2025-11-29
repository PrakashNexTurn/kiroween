/**
 * FilesTab Component
 * Displays project file explorer with tree view and content viewer
 * 
 * Requirements: 3.3.1, 3.3.2
 */

import React, { useState } from 'react';
import { Card } from '../common';
import { FileTree } from './FileTree';
import { FileContentViewer } from './FileContentViewer';
import { FileSearchBar } from './FileSearchBar';

/**
 * Props for FilesTab component
 */
export interface FilesTabProps {
  projectId: string;
}

/**
 * FilesTab component
 * Provides split-pane layout with file tree (30%) and content viewer (70%)
 */
export function FilesTab({ projectId }: FilesTabProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [dividerPosition, setDividerPosition] = useState(30); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchBarRef = React.useRef<HTMLInputElement>(null);

  /**
   * Focus search bar
   * Requirement 3.7.5: Ctrl+F to focus search
   */
  const handleFocusSearch = () => {
    searchBarRef.current?.focus();
  };

  /**
   * Handle mouse down on divider to start dragging
   */
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handle mouse move during divider drag
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const container = document.getElementById('files-container');
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constrain between 20% and 50%
    const constrainedPosition = Math.max(20, Math.min(50, newPosition));
    setDividerPosition(constrainedPosition);
  };

  /**
   * Handle mouse up to stop dragging
   */
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div
      id="files-container"
      className="flex h-[calc(100vh-250px)] gap-0"
      style={{ minHeight: '500px' }}
    >
      {/* Left Panel - File Tree */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${dividerPosition}%` }}
      >
        <Card className="h-full flex flex-col p-4">
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Project Files
          </h3>
          
          {/* Search Bar - Requirement 3.6.1 */}
          <FileSearchBar
            ref={searchBarRef}
            onSearchChange={setSearchQuery}
            placeholder="Search files..."
          />
          
          <div
            className="flex-1 overflow-auto"
            style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: '4px',
              padding: '8px',
            }}
          >
            <FileTree
              projectId={projectId}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              searchQuery={searchQuery}
              onFocusSearch={handleFocusSearch}
            />
          </div>
        </Card>
      </div>

      {/* Resizable Divider */}
      <div
        className="relative flex items-center justify-center cursor-col-resize hover:bg-brand-primary/20 transition-colors"
        style={{
          width: '8px',
          backgroundColor: isDragging ? 'var(--color-brand-primary)' : 'transparent',
        }}
        onMouseDown={handleDividerMouseDown}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize file tree and content viewer"
      >
        <div
          className="absolute w-1 h-12 rounded-full"
          style={{
            backgroundColor: 'var(--color-border)',
          }}
        />
      </div>

      {/* Right Panel - File Content Viewer */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${100 - dividerPosition - 0.5}%` }}
      >
        <Card className="h-full flex flex-col p-4">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-semibold truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                  title={selectedFile}
                >
                  {selectedFile}
                </h3>
              </div>
              
              <div
                className="flex-1 overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: '4px',
                }}
              >
                <FileContentViewer
                  projectId={projectId}
                  filePath={selectedFile}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Select a file to view its contents
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
