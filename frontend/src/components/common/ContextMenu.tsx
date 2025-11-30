/**
 * ContextMenu Component
 * A reusable context menu that appears on right-click
 * Migrated to use Ant Design Dropdown and Menu components
 * 
 * Requirements: 10.3 - Context menu using Ant Design Dropdown or Menu components
 */

import React, { useEffect, useState } from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

/**
 * Context menu item definition
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

/**
 * Props for ContextMenu component
 */
export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/**
 * ContextMenu Component
 * Displays a context menu at the specified position using Ant Design
 * 
 * Features:
 * - Positioned at mouse coordinates
 * - Closes on outside click (handled by Ant Design)
 * - Closes on item selection
 * - Keyboard navigation support (built-in with Ant Design)
 * - Accessibility features (built-in with Ant Design)
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
}) => {
  const [open, setOpen] = useState(true);

  /**
   * Close menu on Escape key
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  /**
   * Convert ContextMenuItem[] to Ant Design MenuProps['items']
   * Process items and add dividers where needed
   */
  const processedMenuItems: MenuProps['items'] = [];
  items.forEach((item, index) => {
    // Add divider before this item if needed
    if (item.divider && index > 0) {
      processedMenuItems.push({
        type: 'divider',
        key: `divider-${item.id}`,
      });
    }

    // Add the actual menu item
    processedMenuItems.push({
      key: item.id,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      onClick: () => {
        if (!item.disabled) {
          item.onClick();
          setOpen(false);
          onClose();
        }
      },
    });
  });

  /**
   * Handle dropdown visibility change
   */
  const handleOpenChange = (visible: boolean) => {
    setOpen(visible);
    if (!visible) {
      onClose();
    }
  };

  return (
    <Dropdown
      menu={{ items: processedMenuItems }}
      open={open}
      onOpenChange={handleOpenChange}
      trigger={[]}
    >
      {/* Invisible anchor element positioned at mouse coordinates */}
      <div
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />
    </Dropdown>
  );
};
