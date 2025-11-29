/**
 * ContextMenu Component
 * A reusable context menu that appears on right-click
 * 
 * Requirements: 3.4.1 - Context menu for files
 */

import React, { useEffect, useRef } from 'react';

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
 * Displays a context menu at the specified position
 * 
 * Features:
 * - Positioned at mouse coordinates
 * - Closes on outside click
 * - Closes on item selection
 * - Keyboard navigation support
 * - Accessibility features
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * Close menu on outside click
   * Requirement: Close menu on outside click
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      // Close menu if right-click happens outside
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [onClose]);

  /**
   * Close menu on Escape key
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  /**
   * Use state to track adjusted position
   */
  const [position, setPosition] = React.useState({ x, y });

  /**
   * Adjust menu position after mount to stay within viewport
   */
  useEffect(() => {
    if (!menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    // Adjust horizontal position if menu would overflow
    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    // Adjust vertical position if menu would overflow
    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  /**
   * Handle item click
   */
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    item.onClick();
    onClose();
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent, item: ContextMenuItem) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded shadow-lg py-1 min-w-[160px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}
      role="menu"
      aria-label="Context menu"
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.divider && index > 0 && (
            <div
              className="my-1 h-px"
              style={{ backgroundColor: 'var(--color-border)' }}
              role="separator"
            />
          )}
          <div
            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
              item.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              color: item.disabled
                ? 'var(--color-text-tertiary)'
                : 'var(--color-text-primary)',
            }}
            onClick={() => handleItemClick(item)}
            onKeyDown={(e) => handleKeyDown(e, item)}
            role="menuitem"
            tabIndex={item.disabled ? -1 : 0}
            aria-disabled={item.disabled}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {item.icon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
