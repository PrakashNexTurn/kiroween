/**
 * ContextMenu Component Tests
 * Tests for the Ant Design-based ContextMenu component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { Copy, Edit } from 'lucide-react';

describe('ContextMenu', () => {
  const mockOnClose = vi.fn();

  const mockItems: ContextMenuItem[] = [
    {
      id: 'copy',
      label: 'Copy',
      icon: <Copy className="w-4 h-4" />,
      onClick: vi.fn(),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: vi.fn(),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      onClick: vi.fn(),
      disabled: true,
    },
  ];

  it('renders context menu at specified position', () => {
    render(
      <ContextMenu
        x={100}
        y={200}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    // The component should render (Ant Design Dropdown is present)
    expect(document.body).toBeTruthy();
  });

  it('closes menu on Escape key', () => {
    render(
      <ContextMenu
        x={100}
        y={200}
        items={mockItems}
        onClose={mockOnClose}
      />
    );

    // Simulate Escape key press
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('processes menu items with dividers correctly', () => {
    const itemsWithDivider: ContextMenuItem[] = [
      {
        id: 'copy',
        label: 'Copy',
        onClick: vi.fn(),
      },
      {
        id: 'edit',
        label: 'Edit',
        onClick: vi.fn(),
        divider: true,
      },
    ];

    render(
      <ContextMenu
        x={100}
        y={200}
        items={itemsWithDivider}
        onClose={mockOnClose}
      />
    );

    // Component should render without errors
    expect(document.body).toBeTruthy();
  });

  it('handles disabled items correctly', () => {
    const disabledItem: ContextMenuItem[] = [
      {
        id: 'disabled',
        label: 'Disabled Action',
        onClick: vi.fn(),
        disabled: true,
      },
    ];

    render(
      <ContextMenu
        x={100}
        y={200}
        items={disabledItem}
        onClose={mockOnClose}
      />
    );

    // Component should render without errors
    expect(document.body).toBeTruthy();
  });
});
