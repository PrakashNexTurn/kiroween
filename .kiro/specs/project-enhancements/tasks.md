# Implementation Plan - Project Enhancements

This consolidated plan covers three major features: Steering Generation, Adhoc Task Execution UI, and File Explorer.

---

## Phase 1: Backend Services (Week 1)

### Steering Generation Backend

- [ ] 1. Create SteeringGenerator service
  - Create `backend/src/steering_generator.py`
  - Implement template generation methods for product.md, tech.md, structure.md
  - Add content population logic based on project metadata
  - _Requirements: 1.1.2, 1.1.3, 1.1.4, 1.1.5_

- [ ] 2. Add steering API endpoints
  - POST `/projects/{project_id}/steering/generate`
  - GET `/projects/{project_id}/steering/files`
  - GET `/projects/{project_id}/steering/files/{file_name}`
  - PUT `/projects/{project_id}/steering/files/{file_name}`
  - _Requirements: 1.2.1, 1.2.2, 1.2.3, 1.2.4, 1.2.5_

- [ ] 3. Integrate steering with project creation
  - Add optional `generate_steering` parameter to CreateProjectRequest
  - Call steering generator after project creation if enabled
  - Handle generation errors gracefully
  - _Requirements: 1.1.1_

### File Explorer Backend

- [ ] 4. Create FileSystemService
  - Create `backend/src/file_system_service.py`
  - Implement `get_directory_tree` method with caching
  - Implement `read_file_content` with size limits
  - Implement `is_binary_file` and `validate_path` for security
  - Add exclusion logic for node_modules, .git, etc.
  - _Requirements: 3.1.1, 3.1.2, 3.1.3, 3.2.1, 3.2.2, 3.2.3, 3.2.5_

- [ ] 5. Add file explorer API endpoints
  - GET `/projects/{project_id}/files/tree`
  - GET `/projects/{project_id}/files/content`
  - Add proper error handling and validation
  - _Requirements: 3.1.1, 3.1.4, 3.1.5, 3.2.1, 3.2.4_

- [ ]* 6. Write backend tests
  - Test SteeringGenerator
  - Test FileSystemService
  - Test all new API endpoints
  - Test security and validation

---

## Phase 2: Core Frontend Components (Week 2)

### File Explorer Frontend

- [ ] 7. Create FilesTab component
  - Create `frontend/src/components/project/FilesTab.tsx`
  - Implement split pane layout (30% tree / 70% viewer)
  - Add resizable divider
  - _Requirements: 3.3.1, 3.3.2_

- [ ] 8. Create FileTree component
  - Create `frontend/src/components/project/FileTree.tsx`
  - Fetch and display file tree from API
  - Implement expand/collapse logic
  - Handle file selection
  - Add loading skeleton and error handling
  - _Requirements: 3.3.3, 3.3.4, 3.3.5, 3.4.1, 3.4.2, 3.4.3, 3.4.4, 3.4.5_

- [ ] 9. Create FileTreeNode component
  - Create `frontend/src/components/project/FileTreeNode.tsx`
  - Render nodes recursively with proper indentation
  - Add file type icons
  - Handle click events
  - _Requirements: 3.4.1, 3.4.3_

- [ ] 10. Create FileContentViewer component
  - Create `frontend/src/components/project/FileContentViewer.tsx`
  - Integrate Monaco editor
  - Fetch and display file content
  - Apply syntax highlighting
  - Handle binary and large files
  - _Requirements: 3.5.1, 3.5.2, 3.5.3, 3.5.4, 3.5.5_

- [ ] 11. Create file system service
  - Create `frontend/src/services/fileSystemService.ts`
  - Implement `getFileTree` and `getFileContent` methods
  - Add TypeScript types

### Adhoc Task Execution Frontend

- [ ] 12. Create AdhocTaskModal component
  - Create `frontend/src/components/task/AdhocTaskModal.tsx`
  - Implement modal UI with large textarea
  - Add character counter (max 50,000)
  - Add template selector dropdown
  - Add real-time validation
  - Implement execute and cancel buttons
  - _Requirements: 2.1.2, 2.2.1, 2.2.2, 2.2.3, 2.2.4, 2.2.5, 2.4.1, 2.4.2_

- [ ] 13. Create instruction templates
  - Define 5 default templates (fix linting, add tests, update docs, refactor, debug)
  - Implement template selection logic
  - Add confirmation before overwriting user text
  - _Requirements: 2.4.3, 2.4.4, 2.4.5_

- [ ] 14. Create custom instruction service
  - Create `frontend/src/services/customInstructionService.ts`
  - Implement `executeCustomInstruction` method
  - Add TypeScript types
  - _Requirements: 2.3.1_

- [ ] 15. Create AdhocTaskHistory component
  - Create `frontend/src/components/task/AdhocTaskHistory.tsx`
  - Display list of executed adhoc tasks
  - Implement expandable items for logs
  - Add rerun button
  - Show status indicators and timestamps
  - _Requirements: 2.5.1, 2.5.2, 2.5.3, 2.5.4, 2.5.5_

- [ ] 16. Implement local storage for adhoc history
  - Save executed tasks to local storage
  - Load history on component mount
  - Limit to last 50 tasks
  - _Requirements: 2.5.1, 2.5.2_

- [ ] 17. Update TasksTab component
  - Add "Execute Adhoc Task" button
  - Integrate AdhocTaskModal
  - Integrate AdhocTaskHistory
  - Handle modal open/close state
  - _Requirements: 2.1.1, 2.1.2, 2.1.3, 2.1.4, 2.1.5, 2.3.5_

### Steering Frontend

- [ ] 18. Create SteeringTab component
  - Create `frontend/src/components/project/SteeringTab.tsx`
  - List all steering files
  - Show empty state with generate button
  - Handle file selection
  - _Requirements: 1.4.1, 1.4.2, 1.4.5_

- [ ] 19. Create GenerateSteeringModal component
  - Create `frontend/src/components/project/GenerateSteeringModal.tsx`
  - Add explanation of steering files
  - Add force regeneration checkbox
  - Handle API calls
  - _Requirements: 1.3.2, 1.3.3, 1.3.4, 1.3.5_

- [ ] 20. Create SteeringFileViewer component
  - Create `frontend/src/components/project/SteeringFileViewer.tsx`
  - Display file content in Monaco editor
  - Add save functionality
  - Show loading and error states
  - _Requirements: 1.4.3, 1.4.4_

- [ ] 21. Add "Generate Steering" button
  - Add button to project detail page header
  - Open GenerateSteeringModal on click
  - Refresh steering tab after generation
  - _Requirements: 1.3.1_

- [ ] 22. Create steering service
  - Create `frontend/src/services/steeringService.ts`
  - Implement all steering API calls
  - Add TypeScript types

---

## Phase 3: Enhanced Features (Week 3)

### File Explorer Enhancements

- [ ] 23. Add file search functionality
  - Create `frontend/src/components/project/FileSearchBar.tsx`
  - Implement debounced search
  - Filter tree based on search query
  - Highlight matching text
  - _Requirements: 3.6.1, 3.6.2, 3.6.3, 3.6.4, 3.6.5_

- [ ] 24. Add keyboard navigation to file tree
  - Arrow Up/Down for navigation
  - Arrow Right/Left for expand/collapse
  - Enter to open file
  - Ctrl+F to focus search
  - _Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5_

- [ ] 25. Add context menu for files
  - Create context menu component
  - Add "Copy Path" action
  - Handle right-click events
  - Close menu on outside click
  - _Requirements: 3.4.1_

- [ ] 26. Add file type icons
  - Create icon mapping for common file types
  - Add folder icons (open/closed)
  - Add generic file icon for unknown types
  - _Requirements: 3.4.3_

### Adhoc Task Enhancements

- [ ] 27. Add keyboard shortcuts for adhoc tasks
  - Ctrl+K (Cmd+K) to open modal
  - Ctrl+Enter (Cmd+Enter) to execute
  - Escape to close modal
  - Add visual feedback
  - _Requirements: 2.1.2_

- [ ] 28. Add execution status indicator
  - Create `frontend/src/components/task/ExecutionStatusIndicator.tsx`
  - Display animated spinner during execution
  - Show status message
  - Make dismissible after completion
  - _Requirements: 2.3.2, 2.3.3_

- [ ] 29. Add execution logs viewer
  - Create expandable logs section
  - Add syntax highlighting for logs
  - Implement copy-to-clipboard
  - Format logs for readability
  - _Requirements: 2.5.3_

### Integration

- [ ] 30. Integrate all tabs into ProjectDetailPage
  - Add Files tab
  - Add Steering tab
  - Update Tasks tab with adhoc functionality
  - Ensure smooth tab switching
  - Preserve state within tabs
  - _Requirements: 4.1.1, 4.1.2, 4.1.3, 4.1.4, 4.1.5_

---

## Phase 4: Polish and Optimization (Week 4)

### Performance Optimizations

- [ ] 31. Optimize file tree performance
  - Add virtual scrolling for large trees (react-window)
  - Memoize tree nodes with React.memo
  - Lazy load Monaco editor
  - Cache tree state in Context
  - _Requirements: 3.4.5_

- [ ] 32. Optimize adhoc task modal
  - Debounce character counter
  - Optimize re-renders
  - Cache templates in memory

- [ ] 33. Add loading states and skeletons
  - Loading skeletons for file tree
  - Loading indicators for file content
  - Loading states for steering files
  - Consistent loading UI across features
  - _Requirements: 3.3.4, 4.1.3_

### UI/UX Polish

- [ ] 34. Apply consistent styling
  - Ensure all components use theme variables
  - Add hover states and transitions
  - Ensure mobile responsiveness
  - Support dark mode
  - _Requirements: 4.2.1, 4.2.2, 4.2.3, 4.2.4, 4.2.5_

- [ ] 35. Add toast notifications
  - Success toasts for all operations
  - Error toasts with retry options
  - Info toasts for long-running operations
  - _Requirements: 2.3.3, 2.3.4_

- [ ] 36. Improve error handling
  - User-friendly error messages
  - Retry functionality
  - Graceful degradation
  - _Requirements: 3.3.5_

### Accessibility

- [ ] 37. Add accessibility features
  - ARIA labels on all interactive elements
  - Keyboard navigation for all features
  - Focus management
  - Screen reader support
  - High contrast mode support
  - _Requirements: 3.7.1, 3.7.2, 3.7.3, 3.7.4, 3.7.5_

### Testing

- [ ]* 38. Write frontend tests
  - Component rendering tests
  - User interaction tests
  - API integration tests
  - Error state tests
  - Accessibility tests

### Documentation

- [ ] 39. Update documentation
  - Add feature documentation to README
  - Document API endpoints
  - Add user guides
  - Document keyboard shortcuts
  - Add inline code comments

- [ ] 40. Final testing and bug fixes
  - Test all features end-to-end
  - Test on different browsers
  - Test on mobile devices
  - Fix any discovered bugs
  - Performance testing with large projects
