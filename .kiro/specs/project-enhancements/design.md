# Design Document - Project Enhancements

## Overview

This document consolidates the design for three major enhancements to Kiro's Ghost:
1. **Project Steering Generation** - Auto-generate AI context files
2. **Adhoc Task Execution UI** - Execute custom instructions via UI
3. **Project File Explorer** - Browse and view project files

These features integrate seamlessly into the existing project detail page, providing a comprehensive development environment.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         Project Detail Page                         │
│  ┌───────────────────────────────────────────────┐  │
│  │ Tabs: Overview | Specs | Tasks | Files | Steering│
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌─────────────┬─────────────┬──────────────────┐  │
│  │   Tasks     │   Files     │    Steering      │  │
│  │             │             │                  │  │
│  │ - Task List │ - File Tree │ - Steering Files │  │
│  │ - Execute   │ - Content   │ - Editor         │  │
│  │ - Adhoc     │   Viewer    │ - Generate       │  │
│  └─────────────┴─────────────┴──────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Backend API                            │
│  - Steering: POST /steering/generate                │
│  - Adhoc: POST /custom                              │
│  - Files: GET /files/tree, GET /files/content       │
└─────────────────────────────────────────────────────┘
```

## Component Architecture

### Backend Components

#### 1. SteeringGenerator Service
**Location**: `backend/src/steering_generator.py`

```python
class SteeringGenerator:
    def generate_product_md(self, project: Project) -> str
    def generate_tech_md(self, project: Project) -> str
    def generate_structure_md(self, project: Project) -> str
    def generate_all(self, project: Project) -> Dict[str, str]
```

#### 2. FileSystemService
**Location**: `backend/src/file_system_service.py`

```python
class FileSystemService:
    def get_directory_tree(self, project_root: str, max_depth: int = 10) -> Dict[str, Any]
    def read_file_content(self, project_root: str, file_path: str, max_size: int = 1048576) -> Dict[str, Any]
    def is_binary_file(self, file_path: str) -> bool
    def validate_path(self, project_root: str, file_path: str) -> bool
```

#### 3. New API Endpoints

```python
# Steering
POST   /projects/{project_id}/steering/generate
GET    /projects/{project_id}/steering/files
GET    /projects/{project_id}/steering/files/{file_name}
PUT    /projects/{project_id}/steering/files/{file_name}

# Adhoc (already exists)
POST   /projects/{project_id}/custom

# Files
GET    /projects/{project_id}/files/tree
GET    /projects/{project_id}/files/content
```

### Frontend Components

#### Tab Structure

```
ProjectDetailPage
├── OverviewTab (existing)
├── SpecsTab (existing)
├── TasksTab (enhanced)
│   ├── TaskList (existing)
│   ├── AdhocTaskButton (new)
│   ├── AdhocTaskModal (new)
│   └── AdhocTaskHistory (new)
├── FilesTab (new)
│   ├── FileTree
│   ├── FileSearchBar
│   └── FileContentViewer
└── SteeringTab (new)
    ├── SteeringFileList
    ├── SteeringFileViewer
    └── GenerateSteeringButton
```

#### New Components

**Steering Components**:
- `GenerateSteeringModal.tsx` - Modal for steering generation
- `SteeringTab.tsx` - Main steering tab
- `SteeringFileViewer.tsx` - View/edit steering files

**Adhoc Task Components**:
- `AdhocTaskModal.tsx` - Modal for custom instructions
- `AdhocTaskHistory.tsx` - History of executed tasks
- `ExecutionStatusIndicator.tsx` - Real-time status

**File Explorer Components**:
- `FilesTab.tsx` - Main files tab
- `FileTree.tsx` - Interactive file tree
- `FileTreeNode.tsx` - Individual tree nodes
- `FileContentViewer.tsx` - Monaco editor for files
- `FileSearchBar.tsx` - Search/filter files

### Service Layer

```typescript
// Steering
interface SteeringService {
  generateSteering(projectId: string, force: boolean): Promise<OrchestratorResponse>;
  listSteeringFiles(projectId: string): Promise<SteeringFileInfo[]>;
  getSteeringFile(projectId: string, fileName: string): Promise<string>;
  updateSteeringFile(projectId: string, fileName: string, content: string): Promise<void>;
}

// Custom Instructions
interface CustomInstructionService {
  executeCustomInstruction(projectId: string, instruction: string): Promise<OrchestratorResponse>;
  getExecutionHistory(projectId: string): Promise<AdhocTaskHistoryItem[]>;
}

// File System
interface FileSystemService {
  getFileTree(projectId: string): Promise<FileTreeNode>;
  getFileContent(projectId: string, filePath: string): Promise<FileContentResponse>;
}
```

## Data Models

### Steering Models

```typescript
interface SteeringFileInfo {
  fileName: string;
  filePath: string;
  exists: boolean;
  size?: number;
  modifiedAt?: Date;
}
```

### Adhoc Task Models

```typescript
interface AdhocTaskHistoryItem {
  id: string;
  instruction: string;
  status: 'success' | 'failure';
  executedAt: Date;
  logs: string;
  error?: string;
  filesModified?: string[];
}

interface InstructionTemplate {
  id: string;
  name: string;
  description: string;
  instruction: string;
  category: 'testing' | 'documentation' | 'refactoring' | 'debugging' | 'other';
}
```

### File Explorer Models

```typescript
interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  children?: FileTreeNode[];
  extension?: string;
}

interface FileContentResponse {
  filePath: string;
  content: string;
  isBinary: boolean;
  isTruncated: boolean;
  size: number;
  encoding: string;
  language?: string;
}
```

## UI Layout

### Project Detail Page with New Tabs

```
┌─────────────────────────────────────────────────────┐
│  👻 Project: My Haunted App                    [⚙️] │
├─────────────────────────────────────────────────────┤
│  Overview | Specs | Tasks | Files | Steering       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Tab Content Area]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tasks Tab (Enhanced)

```
┌─────────────────────────────────────────────────────┐
│  Tasks                                              │
├─────────────────────────────────────────────────────┤
│  [⚡ Execute Adhoc Task (Ctrl+K)]                   │
│                                                     │
│  📋 Task List                                       │
│  ├─ [ ] 1. Task one                                │
│  ├─ [x] 2. Task two                                │
│  └─ [ ] 3. Task three                              │
│                                                     │
│  📜 Adhoc Task History                              │
│  ├─ ✅ Fix linting errors (2 min ago)              │
│  └─ ✅ Add unit tests (1 hour ago)                 │
└─────────────────────────────────────────────────────┘
```

### Files Tab

```
┌─────────────────────────────────────────────────────┐
│  Files                                              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────────────────────┐   │
│  │ 🔍 Search... │  File: src/app.py            │   │
│  ├──────────────┤  ┌────────────────────────┐  │   │
│  │ 📁 src       │  │ import os              │  │   │
│  │  ├─ 📜 app.py│  │ from fastapi import... │  │   │
│  │  └─ 📁 utils │  │                        │  │   │
│  │ 📝 README.md │  │ def main():            │  │   │
│  └──────────────┴──┴────────────────────────┘  │   │
└─────────────────────────────────────────────────────┘
```

### Steering Tab

```
┌─────────────────────────────────────────────────────┐
│  Steering                    [Generate Steering]    │
├─────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────────────────────┐   │
│  │ 📝 Files     │  Editing: product.md         │   │
│  ├──────────────┤  ┌────────────────────────┐  │   │
│  │ product.md   │  │ # Product Overview     │  │   │
│  │ tech.md      │  │                        │  │   │
│  │ structure.md │  │ [Content...]           │  │   │
│  └──────────────┴──┴────────────────────────┘  │   │
└─────────────────────────────────────────────────────┘
```

## Error Handling

### Common Error Patterns

1. **Network Errors**: Display toast with retry option
2. **API Errors**: Show error message from backend
3. **Validation Errors**: Inline validation messages
4. **File Errors**: Specific messages for binary/large/missing files
5. **Permission Errors**: Clear message about access restrictions

## Performance Considerations

### Backend Optimizations

1. **Caching**: Cache file trees and steering files (5 min TTL)
2. **Size Limits**: Enforce 1MB limit on file content
3. **Depth Limits**: Limit directory traversal to 10 levels
4. **Exclusions**: Skip node_modules, .git, etc.
5. **Lazy Loading**: Load folder contents on-demand

### Frontend Optimizations

1. **Virtual Scrolling**: Use react-window for large trees
2. **Code Splitting**: Lazy load Monaco editor
3. **Memoization**: Memo components to prevent re-renders
4. **Debouncing**: Debounce search inputs
5. **State Management**: Use Context API efficiently

## Security Considerations

1. **Path Validation**: Always validate paths are within project root
2. **Sanitization**: Sanitize all file paths and user inputs
3. **Size Limits**: Enforce file size limits
4. **Binary Detection**: Detect and refuse binary files
5. **Rate Limiting**: Limit API calls to prevent abuse

## Testing Strategy

### Backend Tests
- Unit tests for all services
- API endpoint tests
- Path validation tests
- Error handling tests
- Security tests

### Frontend Tests
- Component rendering tests
- User interaction tests
- API integration tests
- Error state tests
- Accessibility tests

## Accessibility

- Full keyboard navigation
- ARIA labels on all interactive elements
- Focus management
- Screen reader support
- High contrast mode support

## Implementation Priority

### Phase 1: Core Features (Week 1-2)
1. File Explorer backend + frontend
2. Adhoc Task UI
3. Basic Steering generation

### Phase 2: Enhancement (Week 3)
4. Steering file editing
5. Adhoc task history
6. File search

### Phase 3: Polish (Week 4)
7. Performance optimizations
8. Accessibility improvements
9. Documentation
10. Testing
