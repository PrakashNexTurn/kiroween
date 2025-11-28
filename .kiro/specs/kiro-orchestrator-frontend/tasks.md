# Implementation Plan

## Overview

This implementation plan breaks down the development of the Kiro Project Orchestrator Frontend into manageable tasks. The plan follows a logical progression: project setup → core infrastructure → UI components → features → testing → polish.

---

## Tasks

- [x] 1. Project Setup and Configuration






  - Initialize Vite + React + TypeScript project
  - Configure Tailwind CSS with custom theme configuration
  - Set up project structure (folders: components, pages, services, hooks, contexts, types, utils, styles)
  - Configure ESLint and Prettier for code quality
  - Set up environment variables (.env.example with VITE_API_BASE_URL)
  - Install core dependencies (react-router-dom, axios, framer-motion, lucide-react, react-hot-toast, react-markdown, @monaco-editor/react)
  - Configure path aliases in tsconfig.json and vite.config.ts
  - _Requirements: 13.1_

- [x] 2. Type Definitions and Data Models





  - Create TypeScript interfaces for Project, ProjectSummary, ProjectMetadata
  - Create TypeScript interfaces for Task, TaskStats, BuildConfig
  - Create TypeScript enums for Phase
  - Create TypeScript interfaces for API responses (ApiResponse, ApiError)
  - Create TypeScript interfaces for Theme system (Theme, ThemeColors, ThemeSpacing, etc.)
  - _Requirements: All (foundational)_

- [x] 3. Theme System Implementation










  - [x] 3.1 Create theme configuration files


    - Create light theme configuration (src/styles/themes/light.ts)
    - Create dark theme configuration (src/styles/themes/dark.ts)
    - Create theme registry (src/styles/themes/index.ts)
    - Define complete color palettes, spacing, typography, shadows, and animations for each theme
    - _Requirements: 2.2, 2.3_

  - [x] 3.2 Implement ThemeContext and ThemeProvider


    - Create ThemeContext with currentTheme, theme object, setTheme function, and availableThemes
    - Implement theme application function that injects CSS variables into document root
    - Implement theme persistence to localStorage
    - Implement theme restoration on app load
    - Add smooth transition animations for theme switching
    - _Requirements: 2.1, 2.4, 2.5_

  - [x] 3.3 Create useTheme custom hook


    - Implement hook to access theme context
    - Add error handling for usage outside ThemeProvider
    - _Requirements: 2.1_

  - [x] 3.4 Configure Tailwind CSS for dynamic theming


    - Extend Tailwind config with CSS variable mappings
    - Configure dark mode class strategy
    - Add custom color, spacing, and typography scales
    - _Requirements: 2.2, 2.3_

- [x] 4. API Service Layer




  - [x] 4.1 Create Axios instance and interceptors


    - Configure base URL from environment variables
    - Set default headers and timeout
    - Implement request interceptor for logging
    - Implement response interceptor for error handling (404, 500, network errors)
    - _Requirements: 13.1, 13.3, 13.4_

  - [x] 4.2 Implement projectService


    - Implement getProjects() - GET /projects
    - Implement getProjectStatus(projectId) - GET /projects/{project_id}/status
    - Implement createProject(name, description) - POST /projects/create
    - Implement readSpecFile(projectId, fileName) - GET /projects/{project_id}/files/{file_name}
    - Implement updateSpecFile(projectId, fileName, content) - PUT /projects/{project_id}/files/{file_name}
    - Implement generateSpec(projectId, specType, description) - POST /projects/{project_id}/spec/generate
    - Implement executeTask(projectId, taskNumber?) - POST /projects/{project_id}/tasks/execute
    - Implement buildProject(projectId) - POST /projects/{project_id}/build
    - Implement testProject(projectId) - POST /projects/{project_id}/test
    - Implement fixProject(projectId, failureDetails) - POST /projects/{project_id}/fix
    - _Requirements: 1.5, 3.2, 4.2, 5.2, 5.5, 6.3, 7.3, 9.2, 9.4, 10.2_

- [x] 5. Custom Hooks





  - [x] 5.1 Create useProjects hook


    - Implement state management for projects list, loading, and error
    - Implement fetchProjects function
    - Add auto-refresh capability with configurable interval
    - Return projects, loading, error, and refetch function
    - _Requirements: 1.1, 1.5_

  - [x] 5.2 Create useKeyboard hook


    - Accept array of keyboard shortcuts with key, modifiers, and callback
    - Implement keydown event listener
    - Handle keyboard shortcut matching and execution
    - Clean up event listeners on unmount
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [x] 5.3 Create useProjectDetail hook


    - Implement state management for project metadata, loading, and error
    - Implement fetchProjectStatus function
    - Add auto-refresh capability
    - Return project, loading, error, and refetch function
    - _Requirements: 4.2_
-

- [x] 6. Common UI Components



  - [x] 6.1 Create Button component


    - Implement variants (primary, secondary, danger, ghost)
    - Implement sizes (sm, md, lg)
    - Add loading state with spinner
    - Add disabled state styling
    - Include proper ARIA attributes and keyboard support
    - _Requirements: All (foundational)_

  - [x] 6.2 Create Card component


    - Implement base card with padding and border radius
    - Add hover effect with elevation
    - Support custom background colors
    - Include proper semantic HTML
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 6.3 Create Modal component


    - Implement backdrop with click-to-close
    - Add Escape key handler to close modal
    - Implement focus trap for accessibility
    - Add smooth open/close animations (fade + scale)
    - Support different sizes (sm, md, lg, xl)
    - Include close button and title
    - _Requirements: 3.1, 6.2, 14.3, 15.2_

  - [x] 6.4 Create Input component


    - Implement text input with label
    - Add error state with validation message display
    - Add disabled state styling
    - Include proper ARIA attributes
    - _Requirements: 3.5, 12.3_

  - [x] 6.5 Create Textarea component


    - Implement textarea with label
    - Add error state with validation message display
    - Add auto-resize capability
    - Include proper ARIA attributes
    - _Requirements: 3.5, 6.2_

  - [x] 6.6 Create Badge component


    - Implement color variants for different phases
    - Add sizes (sm, md, lg)
    - Support custom colors
    - _Requirements: 11.3_

  - [x] 6.7 Create ProgressBar component


    - Implement progress bar with percentage
    - Add color variants (primary, success, warning, danger)
    - Support animated transitions
    - Display percentage label
    - _Requirements: 11.1_

  - [x] 6.8 Create LoadingSpinner component


    - Implement animated spinner
    - Add sizes (sm, md, lg)
    - Support different colors
    - _Requirements: 6.4, 7.4, 10.3_

  - [x] 6.9 Create Toast notification system


    - Configure react-hot-toast with custom styling
    - Create helper functions (showSuccess, showError, showInfo, showWarning)
    - Implement toast stacking without overlap
    - Add dismiss button to each toast
    - Style toasts according to theme
    - _Requirements: 12.1, 12.4, 12.5_
-

- [x] 7. Layout Components



  - [x] 7.1 Create Header component


    - Implement app logo/title
    - Add theme toggle button with sun/moon icon
    - Add navigation breadcrumbs
    - Make responsive for mobile
    - _Requirements: 2.1_

  - [x] 7.2 Create Layout component


    - Implement main layout structure with Header
    - Add React Router Outlet for page content
    - Apply theme background colors
    - Make responsive
    - _Requirements: All (foundational)_

  - [x] 7.3 Create ThemeToggle component


    - Implement toggle button with icon (sun for light, moon for dark)
    - Add smooth icon transition animation
    - Connect to useTheme hook
    - Add tooltip on hover
    - Include proper ARIA label
    - _Requirements: 2.1, 14.5_

- [x] 8. Project Board Page





  - [x] 8.1 Create ProjectBoard page component


    - Implement page layout with header section
    - Add "Create Project" button
    - Add search input field
    - Add phase filter dropdown
    - Implement grid layout for project cards (responsive: 1-4 columns)
    - Use useProjects hook to fetch data
    - Implement loading state with skeleton cards
    - Implement error state with error message
    - Implement empty state when no projects exist
    - Add auto-refresh every 30 seconds
    - _Requirements: 1.1, 1.5, 3.1_

  - [x] 8.2 Create ProjectCard component


    - Display project name, description (truncated to 2 lines), phase badge, and completion percentage
    - Implement phase-based background color (blue for INIT/SPEC, default for others)
    - Add progress bar at bottom of card
    - Add hover effect with elevation increase
    - Implement click handler to navigate to project detail
    - Add smooth animations on mount
    - _Requirements: 1.2, 1.3, 1.4, 4.1, 14.2_

  - [x] 8.3 Create CreateProjectModal component


    - Implement modal with form (name input, description textarea)
    - Add form validation (required fields, no whitespace-only)
    - Display validation errors inline
    - Implement submit handler that calls projectService.createProject
    - Show loading state during creation
    - Handle success (close modal, show toast, refresh project list)
    - Handle errors (show error toast)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_



  - [x] 8.4 Implement search and filter functionality

    - Add search input that filters projects by name or description
    - Add phase filter dropdown (All, INIT, SPEC, BUILD, TEST, FIX, COMPLETE)
    - Implement client-side filtering logic
    - Update displayed cards based on filters
    - _Requirements: 1.1_

- [x] 9. Project Detail Page





  - [x] 9.1 Create ProjectDetail page component


    - Implement page layout with back button and project name
    - Display phase badge and completion percentage
    - Add tab navigation (Overview, Specs, Tasks)
    - Use useProjectDetail hook to fetch project status
    - Implement loading state
    - Implement error state
    - Handle tab switching with URL parameters
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 9.2 Create OverviewTab component


    - Display project metadata (name, description, created date, updated date)
    - Show task statistics with counts (total, completed, in progress, pending, failed)
    - Display phase timeline with current phase highlighted
    - Add quick action buttons (Build Project, Run Tests, Fix Issues) based on phase
    - Show spec generation timestamps
    - _Requirements: 4.3, 9.1, 9.3, 11.2, 11.5_

  - [x] 9.3 Create PhaseTimeline component


    - Display all phases in horizontal timeline
    - Highlight current phase with distinct styling
    - Show checkmark for completed phases
    - Use color coding for each phase
    - Make responsive for mobile (vertical layout)
    - _Requirements: 11.5_

  - [x] 9.4 Implement build, test, and fix actions in OverviewTab


    - Add "Build Project" button (visible when phase is BUILD or later)
    - Add "Run Tests" button (visible when phase is TEST or later)
    - Add "Fix Issues" button (visible when tests have failed)
    - Implement click handlers that call respective API endpoints
    - Show loading state during execution
    - Display results in modal or toast
    - Update project status after completion
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.4, 10.5_

- [x] 10. Specs Tab Implementation




  - [x] 10.1 Create SpecsTab component


    - Implement sub-tab navigation (Requirements, Design, Tasks)
    - Render SpecViewer component for selected spec file
    - Handle sub-tab switching
    - _Requirements: 5.1_

  - [x] 10.2 Create SpecViewer component



    - Fetch spec file content using projectService.readSpecFile
    - Implement view mode with markdown rendering (react-markdown)
    - Implement edit mode with Monaco editor
    - Add "Edit" button in view mode
    - Add "Save" and "Cancel" buttons in edit mode
    - Show "Generate" button when content is empty
    - Implement unsaved changes warning
    - Handle save operation with API call
    - Show loading state during fetch and save
    - Handle errors with toast notifications
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 6.1_

  - [x] 10.3 Create GenerateSpecModal component


    - Implement modal with description textarea
    - Add form validation
    - Implement submit handler that calls projectService.generateSpec
    - Show loading state during generation
    - Handle success (close modal, show toast, refresh spec content)
    - Handle errors (show error toast)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.4 Implement markdown rendering with syntax highlighting


    - Configure react-markdown with plugins (remark-gfm for tables, lists)
    - Add syntax highlighting for code blocks (react-syntax-highlighter)
    - Style markdown elements according to theme
    - Handle links, images, tables, and lists
    - _Requirements: 5.3_


  - [x] 10.5 Integrate Monaco Editor for spec editing

    - Configure Monaco editor with markdown language
    - Apply theme colors to editor
    - Add keyboard shortcuts (Ctrl+S to save)
    - Implement auto-save draft to localStorage
    - _Requirements: 5.4, 5.5_

- [x] 11. Tasks Tab Implementation





  - [x] 11.1 Create TasksTab component


    - Fetch tasks.md content and parse tasks
wA      - Display task list with TaskItem components
    - Show task execution controls
    - Display log viewer panel
    - Implement "Execute Next Task" button
    - Implement "Execute All Tasks" button
    - Show loading state during task execution
    - _Requirements: 7.1, 7.2_

  - [x] 11.2 Create TaskItem component


    - Display task number, description, and status
    - Use color-coded status indicators (gray=pending, blue=in progress, green=completed, red=failed)
    - Show checkbox icon based on status
    - Highlight optional tasks differently
    - Make clickable to show task details
    - _Requirements: 7.2_

  - [x] 11.3 Implement task execution workflow

    - Find next pending task in the list
    - Call projectService.executeTask with task number
    - Update task status to "in progress" during execution
    - Stream logs to LogViewer component
    - Update task status based on execution result
    - Handle errors with toast notifications
    - Refresh project status after task completion
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 11.4 Create LogViewer component


    - Implement terminal-style panel with dark background and monospace font
    - Display logs with proper formatting
    - Implement auto-scroll to bottom when new logs arrive
    - Add "Clear Logs" button
    - Add "Copy Logs" button
    - Show/hide toggle
    - Make resizable
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 11.5 Implement task parsing from tasks.md


    - Parse markdown task list format (- [ ] 1. Task description)
    - Extract task number, description, status, and optional flag
    - Handle nested tasks (subtasks)
    - Build task tree structure
    - _Requirements: 7.1_

- [x] 12. Routing and Navigation




  - [x] 12.1 Set up React Router


    - Configure BrowserRouter in App.tsx
    - Define routes (/, /projects/:projectId)
    - Implement 404 NotFound page
    - Add route transitions with Framer Motion
    - _Requirements: 4.1, 4.5, 14.1_


  - [x] 12.2 Implement navigation helpers

    - Create useNavigate wrapper for type-safe navigation
    - Implement back button functionality
    - Add breadcrumb navigation
    - _Requirements: 4.5_

- [x] 13. Keyboard Shortcuts




  - [x] 13.1 Implement global keyboard shortcuts


    - Add 'N' shortcut to open create project modal
    - Add 'Escape' shortcut to close modals and return to previous view
    - Add '/' shortcut to focus search input
    - Prevent shortcuts when typing in input fields
    - _Requirements: 15.1, 15.2, 15.3_

  - [x] 13.2 Implement project detail keyboard shortcuts


    - Add 'T' shortcut to switch to Tasks tab
    - Add 'S' shortcut to switch to Specs tab
    - Add 'O' shortcut to switch to Overview tab
    - Only activate when in project detail view
    - _Requirements: 15.4, 15.5_

- [x] 14. Error Handling and Validation





  - [x] 14.1 Implement global error boundary

    - Create ErrorBoundary component
    - Catch component errors and display fallback UI
    - Log errors to console
    - Provide "Reload" button
    - _Requirements: 12.1_

  - [x] 14.2 Implement API error handling


    - Handle network errors with user-friendly messages
    - Handle 404 errors (project not found)
    - Handle 401/403 errors (authentication)
    - Handle 500 errors (server error)
    - Display errors using toast notifications
    - _Requirements: 12.1, 12.2, 13.4, 13.5_

  - [x] 14.3 Implement form validation utilities


    - Create validation functions (required, minLength, maxLength, pattern)
    - Create useForm hook for form state management
    - Implement field-level validation
    - Display validation errors inline
    - Prevent submission when validation fails
    - _Requirements: 3.5, 12.3_

- [x] 15. Animations and Transitions




  - [x] 15.1 Implement page transitions


    - Add fade transition between routes
    - Add slide transition for modals
    - Configure Framer Motion AnimatePresence
    - _Requirements: 14.1, 14.3_


  - [x] 15.2 Implement component animations

    - Add card hover animations (elevation + scale)
    - Add button hover and active states
    - Add loading spinner animations
    - Add progress bar fill animations
    - Add toast slide-in animations
    - _Requirements: 14.2, 14.4_

  - [x] 15.3 Implement theme transition animations


    - Add smooth color transitions when switching themes
    - Animate theme toggle icon rotation
    - Use CSS transitions for background and text colors
    - _Requirements: 14.5_

- [x] 16. Accessibility Improvements






  - [x] 16.1 Add ARIA labels and roles

    - Add aria-label to icon buttons
    - Add role="dialog" to modals
    - Add aria-live regions for dynamic content
    - Add aria-expanded for collapsible sections
    - _Requirements: All (accessibility)_

  - [x] 16.2 Implement keyboard navigation


    - Ensure all interactive elements are keyboard accessible
    - Add visible focus indicators
    - Implement focus trap in modals
    - Add skip-to-content link
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_


  - [x] 16.3 Ensure color contrast compliance

    - Verify all text meets WCAG AA contrast ratios (4.5:1 for normal, 3:1 for large)
    - Test with contrast checker tools
    - Adjust colors if needed
    - _Requirements: 2.2, 2.3_

- [ ] 17. Responsive Design
  - [ ] 17.1 Implement mobile-responsive layouts
    - Make project board responsive (1 column on mobile, 2-4 on larger screens)
    - Make header responsive with hamburger menu on mobile
    - Make project detail tabs scrollable on mobile
    - Make phase timeline vertical on mobile
    - Test on various screen sizes (320px to 1920px)
    - _Requirements: All (responsive)_

  - [ ] 17.2 Optimize touch interactions
    - Increase touch target sizes on mobile (min 44x44px)
    - Add touch-friendly spacing
    - Implement swipe gestures for tab navigation
    - _Requirements: All (mobile)_

- [ ] 18. Performance Optimization
  - [ ] 18.1 Implement code splitting
    - Lazy load route components
    - Lazy load Monaco editor
    - Lazy load heavy components (SpecViewer, LogViewer)
    - Add loading fallbacks
    - _Requirements: All (performance)_

  - [ ] 18.2 Implement memoization
    - Memoize expensive computations with useMemo
    - Memoize callbacks with useCallback
    - Memoize components with React.memo
    - _Requirements: All (performance)_

  - [ ] 18.3 Optimize re-renders
    - Use React DevTools Profiler to identify unnecessary re-renders
    - Optimize context usage to prevent cascading updates
    - Implement virtual scrolling for large task lists
    - _Requirements: All (performance)_

- [ ] 19. Testing
  - [ ]* 19.1 Write unit tests for utilities
    - Test theme utility functions
    - Test validation functions
    - Test parsing functions (task parsing)
    - Test storage utilities (localStorage)
    - Target 80%+ coverage
    - _Requirements: All_

  - [ ]* 19.2 Write component tests
    - Test Button component (rendering, click, disabled state)
    - Test Card component (rendering, hover)
    - Test Modal component (open/close, escape key, backdrop click)
    - Test Input component (value change, validation)
    - Test ProjectCard component (rendering, click, phase colors)
    - Test ThemeToggle component (toggle functionality)
    - Use React Testing Library
    - _Requirements: All_

  - [ ]* 19.3 Write integration tests
    - Test project creation flow (open modal, fill form, submit, verify)
    - Test spec editing flow (open spec, edit, save, verify)
    - Test task execution flow (click execute, verify API call, check logs)
    - Test theme switching flow (toggle theme, verify persistence)
    - _Requirements: All_

  - [ ]* 19.4 Write E2E tests with Playwright
    - Test complete project workflow (create → generate specs → execute tasks → build → test)
    - Test navigation between pages
    - Test error scenarios
    - Test keyboard shortcuts
    - _Requirements: All_

- [ ] 20. Documentation
  - [ ]* 20.1 Write component documentation
    - Document all component props with JSDoc comments
    - Add usage examples for complex components
    - Document custom hooks
    - _Requirements: All_

  - [ ]* 20.2 Write README
    - Add project overview and features
    - Add setup instructions
    - Add environment variable configuration
    - Add build and deployment instructions
    - Add development guidelines
    - _Requirements: All_

  - [ ]* 20.3 Write CONTRIBUTING guide
    - Add code style guidelines
    - Add commit message conventions
    - Add PR process
    - Add testing requirements
    - _Requirements: All_

- [ ] 21. Build and Deployment Configuration
  - [ ] 21.1 Configure production build
    - Optimize Vite build configuration
    - Configure code splitting and chunking
    - Enable source maps for debugging
    - Minify and compress assets
    - _Requirements: All_

  - [ ] 21.2 Create Docker configuration
    - Write Dockerfile with multi-stage build
    - Write docker-compose.yml for local development
    - Configure nginx for serving static files
    - _Requirements: All_

  - [ ]* 21.3 Set up CI/CD pipeline
    - Configure GitHub Actions workflow
    - Add build step
    - Add test step
    - Add lint step
    - Add deployment step
    - _Requirements: All_

- [ ] 22. Final Polish and Testing
  - [ ] 22.1 Cross-browser testing
    - Test on Chrome, Firefox, Safari, Edge
    - Fix any browser-specific issues
    - Test on different operating systems
    - _Requirements: All_

  - [ ] 22.2 Accessibility audit
    - Run automated accessibility tests (axe, Lighthouse)
    - Manual keyboard navigation testing
    - Screen reader testing
    - Fix any accessibility issues
    - _Requirements: All_

  - [ ] 22.3 Performance audit
    - Run Lighthouse performance audit
    - Optimize bundle size
    - Optimize images and assets
    - Achieve target performance metrics (FCP < 1.5s, TTI < 3.5s, LCP < 2.5s)
    - _Requirements: All_

  - [ ] 22.4 User acceptance testing
    - Test all user flows end-to-end
    - Verify all requirements are met
    - Fix any bugs or issues
    - Get user feedback and iterate
    - _Requirements: All_

- [ ] 23. Professional Visual Enhancement Implementation






  - [x] 23.1 Update theme color palette to professional dark blue

    - Update light mode brand colors (primary: #0052A3, secondary: #003D7A)
    - Update dark mode brand colors (primary: #4A9EFF, secondary: #3A8EEF)
    - Update phase colors for professional appearance
    - Update status colors (success, warning, error, info)
    - Ensure all colors meet WCAG AA contrast requirements
    - _Requirements: 16.2_

  - [x] 23.2 Enhance Button component with consistent styling


    - Set height to 48px (consistent)
    - Set border-radius to 12px (consistent)
    - Primary button: Dark blue background (#0052A3), white text
    - Secondary button: White background, dark blue border (2px), dark blue text
    - Hover: Darken to #003D7A, lift -2px, increase shadow
    - Font: 16px, weight 600
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

  - [x] 23.3 Enhance Input component with consistent styling


    - Set height to 48px (consistent)
    - Set border-radius to 12px (consistent)
    - Add 2px dark blue border (#0052A3)
    - White background, dark blue text (#003D7A)
    - Hover: Darken border to #003D7A, increase shadow
    - Focus: Dark blue ring with 4px spread
    - Font: 16px
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

  - [x] 23.4 Enhance Textarea component with consistent styling






    - Set border-radius to 12px (consistent)
    - Add 2px dark blue border (#0052A3)
    - White background, dark blue text (#003D7A)
    - Padding: 12px 16px (consistent)
    - Hover and focus states matching Input component
    - Font: 16px
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

  - [x] 23.5 Create enhanced Select/Dropdown component



    - Set height to 48px (consistent)
    - Set border-radius to 12px (consistent)
    - Add 2px dark blue border (#0052A3)
    - White background, dark blue text (#003D7A)
    - Add dark blue arrow icon (20px)
    - Dropdown menu: 2px dark blue border, 12px bottom radius, white background
    - Selected option: Dark blue background, white text
    - Hover states for options
    - _Requirements: 16.1, 16.2, 16.3, 16.5_

  - [ ] 23.6 Enhance ProjectCard component with professional styling
    - Set padding to 24px (consistent)
    - Set border-radius to 16px (consistent for cards)
    - Add 2px dark blue border (#0052A3)
    - White background
    - Title: 24px, bold (700), dark blue text (#003D7A)
    - Add 6px left border accent in phase-specific color
    - Phase badge: Dark blue background, white text, 20px radius
    - Progress bar: 12px height, dark blue fill
    - Hover: Lift -4px, darken border to #003D7A, increase shadow
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ] 23.7 Enhance Modal component with consistent styling
    - Set border-radius to 16px (consistent for modals)
    - Set padding to 24px (consistent)
    - Add 2px dark blue border (#0052A3)
    - White background
    - Title: 24px, bold (700), dark blue text
    - Overlay: Dark blue tinted (rgba(0, 61, 122, 0.5)) with blur
    - Close button: Hover state with light gray background
    - Footer: 2px top border, buttons with 12px gap
    - _Requirements: 16.1, 16.2, 16.4_

  - [ ] 23.8 Enhance Card component with consistent styling
    - Set border-radius to 16px (consistent for cards)
    - Set padding to 24px (consistent)
    - Add 2px border (color configurable)
    - Hover: Lift effect, increase shadow
    - Ensure consistent with ProjectCard styling
    - _Requirements: 16.1, 16.4_

  - [ ] 23.9 Update Badge component with professional colors
    - Use professional phase colors (dark blue for INIT/SPEC, etc.)
    - Set border-radius to 20px (pill shape)
    - Padding: 8px 16px
    - Font: 14px, weight 700, uppercase
    - White text on colored backgrounds
    - Add subtle shadow
    - _Requirements: 16.2, 16.3_

  - [ ] 23.10 Update ProgressBar component with professional styling
    - Set height to 12px
    - Set border-radius to 6px
    - Container: Light gray background (#E9ECEF), inset shadow
    - Fill: Dark blue (#0052A3)
    - Smooth width transition animation
    - _Requirements: 16.2, 16.3_

  - [ ] 23.11 Apply consistent styling to search inputs
    - Use enhanced Input component styling
    - Add magnifying glass icon in dark blue
    - Ensure 48px height, 12px radius, 2px dark blue border
    - _Requirements: 16.1, 16.2, 16.3_

  - [ ] 23.12 Test consistency across all components
    - Verify all interactive elements are 48px height
    - Verify all inputs/buttons have 12px border-radius
    - Verify all cards/modals have 16px border-radius
    - Verify all containers have 24px padding
    - Verify all elements use dark blue (#0052A3) and white (#FFFFFF)
    - Test hover states darken to #003D7A consistently
    - Test on both light and dark modes
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 24. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

