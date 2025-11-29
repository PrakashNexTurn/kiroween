# ContextMenu Component

## Overview

The ContextMenu component provides a reusable context menu that appears on right-click. It's integrated with the file tree to provide quick actions like copying file paths.

## Features

- **Right-click activation**: Opens on right-click (contextmenu event)
- **Outside click detection**: Automatically closes when clicking outside
- **Escape key support**: Closes on Escape key press
- **Viewport awareness**: Adjusts position to stay within viewport bounds
- **Keyboard navigation**: Full keyboard support with Enter/Space
- **Accessibility**: ARIA labels and roles for screen readers
- **Customizable items**: Support for icons, dividers, and disabled states

## Usage

### Basic Example

```tsx
import { ContextMenu, type ContextMenuItem } from '@/components/common/ContextMenu';
import { Copy } from 'lucide-react';

const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

const handleContextMenu = (e: React.MouseEvent) => {
  e.preventDefault();
  setContextMenu({ x: e.clientX, y: e.clientY });
};

const menuItems: ContextMenuItem[] = [
  {
    id: 'copy',
    label: 'Copy',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => console.log('Copy clicked'),
  },
];

return (
  <div onContextMenu={handleContextMenu}>
    Right-click me
    {contextMenu && (
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        items={menuItems}
        onClose={() => setContextMenu(null)}
      />
    )}
  </div>
);
```

### Menu Item Options

```typescript
interface ContextMenuItem {
  id: string;              // Unique identifier
  label: string;           // Display text
  icon?: React.ReactNode;  // Optional icon (e.g., Lucide icon)
  onClick: () => void;     // Click handler
  disabled?: boolean;      // Disable the item
  divider?: boolean;       // Show divider before this item
}
```

## Integration with FileTree

The context menu is integrated into the FileTreeNode component to provide file/folder actions:

- **Copy Path**: Copies the file/folder path to clipboard
- Shows success toast notification
- Fallback for browsers without clipboard API support

## Accessibility

- Full keyboard navigation (Tab, Enter, Space, Escape)
- ARIA roles: `menu`, `menuitem`, `separator`
- ARIA labels for screen readers
- Focus management
- Disabled state support

## Requirements Satisfied

- **3.4.1**: Context menu for files with "Copy Path" action
- Right-click event handling
- Outside click detection
- Proper positioning and viewport awareness
