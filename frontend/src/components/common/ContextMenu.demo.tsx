/**
 * ContextMenu Demo
 * Demonstrates the context menu component functionality
 */

import React, { useState } from 'react';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { Copy, Edit, Trash, Download } from 'lucide-react';

/**
 * Demo component for ContextMenu
 */
export const ContextMenuDemo: React.FC = () => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [lastAction, setLastAction] = useState<string>('');

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const menuItems: ContextMenuItem[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => setLastAction('Copy clicked'),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => setLastAction('Edit clicked'),
    },
    {
      id: 'download',
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: () => setLastAction('Download clicked'),
      divider: true,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash className="w-4 h-4" />,
      onClick: () => setLastAction('Delete clicked'),
    },
    {
      id: 'disabled',
      label: 'Disabled Action',
      onClick: () => setLastAction('Should not happen'),
      disabled: true,
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Context Menu Demo</h2>
      
      <div
        className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-bg-secondary)',
        }}
        onContextMenu={handleContextMenu}
      >
        <p className="text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Right-click anywhere in this area
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          A context menu will appear with various actions
        </p>
      </div>

      {lastAction && (
        <div
          className="mt-4 p-4 rounded"
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
          }}
        >
          <strong>Last Action:</strong> {lastAction}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
