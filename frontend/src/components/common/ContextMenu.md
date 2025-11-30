# ContextMenu Component

## Overview

The ContextMenu component provides a reusable context menu that appears on right-click. It's integrated with the file tree to provide quick actions like copying file paths. This component has been migrated to use Ant Design's Dropdown and Menu components.

## Features

- **Right-click activation**: Opens on right-click (contextmenu event)
- **Outside click detection**: Automatically closes when clicking outside (handled by Ant Design)
- **Escape key support**: Closes on Escape key press
- **Viewport awareness**: Adjusts position to stay within viewport bounds (handled by Ant Design)
- **Keyboard navigation**: Full keyboard support with Enter/Space (built-in with Ant Design)
- **Accessibility**: ARIA labels and roles for screen readers (built-in with Ant Design)
- **Customizable items**: Support for icons, dividers, and disabled states
- **Theme integration**: Automatically styled with Ant Design theme tokens

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

## Ant Design Migration

This component has been migrated from a custom implementation to use Ant Design's Dropdown and Menu components:

- **Dropdown**: Provides the positioning and visibility management
- **Menu**: Provides the menu items with built-in keyboard navigation and accessibility
- **Benefits**: 
  - Automatic viewport awareness and positioning
  - Built-in keyboard navigation (Arrow keys, Enter, Escape)
  - WCAG 2.1 Level AA accessibility compliance
  - Consistent styling with application theme
  - Reduced custom code maintenance

## Requirements Satisfied

- **10.3**: Context menu using Ant Design Dropdown or Menu components
- Right-click event handling
- Outside click detection (handled by Ant Design)
- Proper positioning and viewport awareness (handled by Ant Design)
- Keyboard navigation and accessibility (built-in with Ant Design)
