# Project Enhancements - Consolidated Spec

This spec consolidates three major enhancements to Kiro's Ghost into a single, cohesive implementation plan.

## 🎯 Features Included

### 1. 📝 Project Steering Generation
Generate AI context files automatically for each project to guide AI assistants with project-specific conventions and guidelines.

**Key Capabilities:**
- Auto-generate `product.md`, `tech.md`, and `structure.md`
- View and edit steering files in Monaco editor
- Regenerate steering files as project evolves
- Optional generation during project creation

### 2. ⚡ Adhoc Task Execution UI
Execute custom instructions that aren't part of the predefined task list, with templates and history tracking.

**Key Capabilities:**
- Execute custom instructions via modal UI
- 5 pre-built templates (fix linting, add tests, update docs, refactor, debug)
- Track execution history with rerun capability
- Keyboard shortcuts (Ctrl+K to open, Ctrl+Enter to execute)
- Real-time execution status and logs

### 3. 📁 Project File Explorer
Browse project files in an interactive tree view and view file contents in a Monaco editor.

**Key Capabilities:**
- Interactive file tree with expand/collapse
- View file contents with syntax highlighting
- Search and filter files
- Keyboard navigation (arrow keys, Enter)
- Context menu with quick actions
- Support for large projects with virtual scrolling

## 📊 Implementation Overview

### Timeline: 4 Weeks

- **Week 1**: Backend services (Steering, File System)
- **Week 2**: Core frontend components (File Explorer, Adhoc Task, Steering)
- **Week 3**: Enhanced features (Search, History, Keyboard shortcuts)
- **Week 4**: Polish, optimization, testing, documentation

### Task Breakdown

- **Total Tasks**: 40
- **Backend**: 6 tasks
- **Frontend Core**: 16 tasks
- **Enhancements**: 10 tasks
- **Polish & Testing**: 8 tasks

### Priority Order

1. **High Priority**: File Explorer (most visible, most useful)
2. **Medium Priority**: Adhoc Task Execution (enhances existing Tasks tab)
3. **Low Priority**: Steering Generation (nice-to-have, can be added later)

## 🏗️ Architecture

### New Backend Services
- `SteeringGenerator` - Generate steering file content
- `FileSystemService` - Safe file system operations

### New API Endpoints
```
# Steering
POST   /projects/{id}/steering/generate
GET    /projects/{id}/steering/files
GET    /projects/{id}/steering/files/{name}
PUT    /projects/{id}/steering/files/{name}

# Files
GET    /projects/{id}/files/tree
GET    /projects/{id}/files/content

# Adhoc (existing)
POST   /projects/{id}/custom
```

### New Frontend Components
```
ProjectDetailPage
├── TasksTab (enhanced)
│   ├── AdhocTaskButton
│   ├── AdhocTaskModal
│   └── AdhocTaskHistory
├── FilesTab (new)
│   ├── FileTree
│   ├── FileSearchBar
│   └── FileContentViewer
└── SteeringTab (new)
    ├── SteeringFileList
    ├── SteeringFileViewer
    └── GenerateSteeringButton
```

## 📋 Files in This Spec

- **requirements.md** - Complete requirements for all 3 features (30+ requirements)
- **design.md** - Consolidated design document with architecture and components
- **tasks.md** - Implementation plan with 40 tasks organized by phase
- **README.md** - This file

## 🚀 Getting Started

### For Implementation

1. Review the requirements document to understand all features
2. Review the design document to understand the architecture
3. Follow the tasks document in order (organized by phase)
4. Start with Phase 1 (Backend Services) in Week 1

### For Review

1. Check requirements.md for completeness
2. Verify design.md architecture makes sense
3. Ensure tasks.md covers all requirements
4. Provide feedback on priority and timeline

## 🎨 UI Preview

### New Tabs in Project Detail Page
```
┌─────────────────────────────────────────────────────┐
│  Overview | Specs | Tasks | Files | Steering       │
└─────────────────────────────────────────────────────┘
```

### Files Tab Layout
```
┌──────────────┬──────────────────────────────┐
│ 🔍 Search... │  File: src/app.py            │
├──────────────┤  ┌────────────────────────┐  │
│ 📁 src       │  │ import os              │  │
│  ├─ 📜 app.py│  │ from fastapi import... │  │
│  └─ 📁 utils │  │                        │  │
│ 📝 README.md │  │ def main():            │  │
└──────────────┴──┴────────────────────────┘  │
```

### Tasks Tab with Adhoc
```
┌─────────────────────────────────────────────────────┐
│  [⚡ Execute Adhoc Task (Ctrl+K)]                   │
│                                                     │
│  📋 Task List                                       │
│  ├─ [ ] 1. Task one                                │
│  └─ [x] 2. Task two                                │
│                                                     │
│  📜 Adhoc Task History                              │
│  ├─ ✅ Fix linting errors (2 min ago)              │
│  └─ ✅ Add unit tests (1 hour ago)                 │
└─────────────────────────────────────────────────────┘
```

## 🎯 Success Criteria

### File Explorer
- ✅ Users can browse project files in a tree view
- ✅ Users can view file contents with syntax highlighting
- ✅ Users can search for files quickly
- ✅ Works smoothly with 1000+ files

### Adhoc Task Execution
- ✅ Users can execute custom instructions easily
- ✅ Users can reuse previous instructions from history
- ✅ Users can use templates for common tasks
- ✅ Execution status is visible in real-time

### Steering Generation
- ✅ Steering files are generated automatically
- ✅ Users can edit steering files in the UI
- ✅ Steering files provide useful context to AI

## 📝 Notes

- All features integrate seamlessly into existing UI
- Consistent design language across all features
- Full keyboard navigation support
- Mobile-responsive design
- Accessibility compliant (WCAG 2.1 AA)

## 🔗 Related Specs

Individual feature specs are preserved for reference:
- `.kiro/specs/project-steering-generation/`
- `.kiro/specs/adhoc-task-execution-ui/`
- `.kiro/specs/project-file-explorer/`

This consolidated spec supersedes the individual specs for implementation purposes.
