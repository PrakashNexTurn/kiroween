# Implementation Plan: Ant Design Migration

- [x] 1. Install Ant Design and configure build system





  - Install antd package and fast-check for property-based testing
  - Remove Tailwind CSS dependencies from package.json
  - Delete tailwind.config.js and update postcss.config.js
  - Update vite.config.ts to optimize Ant Design imports
  - _Requirements: 9.1, 9.2, 9.3_


- [x] 2. Set up Ant Design ConfigProvider and theme system




  - Create theme token generation utility (themeToAntdConfig function)
  - Update ThemeContext to provide Ant Design theme configuration
  - Wrap application with ConfigProvider in App.tsx
  - Test theme token generation for all existing themes (light, dark, halloween)
  - _Requirements: 2.1, 2.2, 2.5_

- [ ]* 2.1 Write property test for theme conversion
  - **Property 4: Custom theme conversion produces valid config**
  - **Validates: Requirements 2.5**

- [ ]* 2.2 Write property test for theme selection
  - **Property 1: Theme selection updates Ant Design tokens**
  - **Validates: Requirements 2.1**

- [ ]* 2.3 Write property test for theme persistence
  - **Property 2: Theme persistence round-trip**
  - **Validates: Requirements 2.4**

- [ ]* 2.4 Write property test for theme switching
  - **Property 3: Theme switching propagates to components**
  - **Validates: Requirements 2.3**

- [x] 3. Replace common UI components with Ant Design equivalents





  - Replace Button component with Ant Design Button
  - Replace Input component with Ant Design Input
  - Replace Card component with Ant Design Card
  - Replace Modal component with Ant Design Modal
  - Replace Select component with Ant Design Select
  - Replace Textarea component with Ant Design Input.TextArea
  - Update component exports in index.ts files
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 3.1 Write unit tests for Button component replacement
  - Test variant mapping (primary, secondary, danger, ghost)
  - Test loading state
  - Test disabled state
  - _Requirements: 6.1_

- [ ]* 3.2 Write unit tests for Input component replacement
  - Test validation display
  - Test error states
  - Test helper text
  - _Requirements: 6.3_

- [ ]* 3.3 Write unit tests for Modal component replacement
  - Test modal open/close
  - Test focus trap functionality
  - Test escape key handling
  - _Requirements: 6.2_
-

- [x] 4. Replace utility components




  - Replace LoadingSpinner with Ant Design Spin
  - Replace Badge with Ant Design Badge
  - Replace ProgressBar with Ant Design Progress
  - Replace Toast notifications with Ant Design message/notification
  - Update Skeleton component to use Ant Design Skeleton
  - _Requirements: 7.1, 7.2_

- [ ]* 4.1 Write unit tests for notification system
  - Test error notifications display
  - Test success notifications display
  - Test loading indicators
  - _Requirements: 7.1, 7.2_

- [x] 5. Update layout structure with Ant Design Layout





  - Replace layout components with Ant Design Layout, Header, Content, Sider
  - Update responsive grid to use Ant Design Row and Col
  - Configure breakpoints to match Ant Design system
  - Update Layout component in components/layout
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 5.1 Write property test for responsive layout
  - **Property 5: Responsive layout adapts to viewport changes**
  - **Validates: Requirements 4.2**

- [ ]* 5.2 Write unit test for mobile navigation
  - Test mobile menu displays on small screens
  - Test drawer/menu functionality
  - _Requirements: 4.4_

- [x] 6. Migrate navigation components





  - Replace Breadcrumbs with Ant Design Breadcrumb
  - Update navigation menu components
  - Integrate routing with Ant Design navigation
  - _Requirements: 10.2_


- [x] 7. Replace FileTree with Ant Design Tree component




  - Migrate FileTree component to use Ant Design Tree
  - Implement expand/collapse functionality
  - Preserve keyboard navigation
  - Update FileTreeNode component
  - Maintain file selection and context menu integration
  - _Requirements: 10.1, 10.4_

- [ ]* 7.1 Write unit tests for file tree functionality
  - Test expand/collapse behavior
  - Test keyboard navigation (arrow keys, enter, space)
  - Test file selection
  - _Requirements: 10.1, 10.4_
-

- [x] 8. Replace ContextMenu with Ant Design Dropdown and Menu




  - Migrate ContextMenu to use Ant Design Dropdown + Menu
  - Preserve right-click functionality
  - Update menu item actions
  - _Requirements: 10.3_

- [ ]* 8.1 Write unit tests for context menu
  - Test context menu opens on right-click
  - Test menu item actions
  - Test menu positioning
  - _Requirements: 10.3_
-

- [x] 9. Update form components to use Ant Design Form




  - Migrate CreateProjectModal to use Ant Design Form
  - Migrate GenerateSpecModal to use Ant Design Form
  - Migrate GenerateSteeringModal to use Ant Design Form
  - Migrate AdhocTaskModal to use Ant Design Form
  - Implement form validation with Ant Design
  - _Requirements: 3.3, 7.4_

- [ ]* 9.1 Write unit tests for form validation
  - Test form validation displays correctly
  - Test form submission
  - Test validation error messages
  - _Requirements: 7.4_

- [x] 10. Update task and list components





  - Migrate TaskItem to use Ant Design List.Item
  - Update TasksTab to use Ant Design List or Tree
  - Preserve task status indicators
  - Maintain task interaction functionality
  - _Requirements: 3.4_

- [x] 11. Integrate Monaco Editor with Ant Design theme




  - Update FileContentViewer to integrate Monaco with Ant Design layout
  - Synchronize Monaco Editor theme with application theme
  - Ensure editor renders correctly within Ant Design Card/Layout
  - _Requirements: 8.1, 8.3_

- [ ]* 11.1 Write property test for Monaco theme synchronization
  - **Property 6: Monaco Editor theme synchronization**
  - **Validates: Requirements 8.3**

- [ ]* 11.2 Write unit test for Monaco Editor rendering
  - Test Monaco Editor displays within Ant Design layout
  - Test editor functionality preserved
  - _Requirements: 8.1_

- [x] 12. Style React Markdown to complement Ant Design





  - Update markdown rendering styles to match Ant Design typography
  - Ensure syntax highlighting works with Ant Design theme
  - Update SpecViewer and SteeringFileViewer components
  - _Requirements: 8.2, 8.4_

- [ ]* 12.1 Write unit tests for markdown rendering
  - Test markdown renders correctly
  - Test syntax highlighting works
  - _Requirements: 8.2, 8.4_
-

- [x] 13. Update page components with Ant Design




  - Update ProjectBoardPage to use Ant Design Grid and Card
  - Update ProjectDetailPage to use Ant Design Tabs and Layout
  - Update NotFoundPage styling
  - Ensure all pages are responsive
  - _Requirements: 3.1, 3.2_


- [x] 14. Update remaining components and utilities




  - Update ErrorBoundary to display errors with Ant Design Alert
  - Update any remaining custom styled components
  - Remove Tailwind utility classes from all components
  - Update CSS files to remove Tailwind directives
  - _Requirements: 1.2, 1.3_


- [x] 15. Clean up and optimize




  - Remove all Tailwind CSS imports and classes
  - Delete unused custom component files if fully replaced
  - Optimize Ant Design imports for tree-shaking
  - Update index.css to remove Tailwind base styles
  - Verify no Tailwind references remain in codebase
  - _Requirements: 1.3, 9.5_

- [ ]* 15.1 Write verification tests for build configuration
  - Test Tailwind is not in package.json
  - Test Tailwind config files are deleted
  - Test Ant Design is in dependencies
  - _Requirements: 1.3, 9.1, 9.2, 9.3_

- [ ] 16. Update documentation
  - Update README.md with Ant Design information
  - Update component documentation
  - Document theme customization with Ant Design
  - Update styling guide for developers
  - _Requirements: 1.1_

- [ ] 17. Final testing and validation checkpoint
  - Ensure all tests pass, ask the user if questions arise
  - Verify all pages render correctly
  - Test theme switching on all pages
  - Test responsive behavior on mobile, tablet, desktop
  - Verify keyboard navigation works
  - Test accessibility features
  - Validate bundle size is acceptable
