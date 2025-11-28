# Requirements Document - Project Enhancements

## Introduction

This document consolidates three major enhancements to Kiro's Ghost: Project Steering Generation, Adhoc Task Execution UI, and Project File Explorer. These features work together to provide a comprehensive project management and development experience.

## Glossary

- **Steering Files**: Markdown files that guide AI assistants with project-specific context and conventions
- **Adhoc Task**: A custom instruction provided by the user that is not part of the predefined task list
- **File Tree**: Hierarchical representation of project files and folders
- **Project Root**: The base directory for a project (`<base_path>/<project_id>/`)
- **System**: Kiro's Ghost backend and frontend application
- **Monaco Editor**: In-browser code editor

---

## Feature 1: Project Steering Generation

### Requirement 1.1: Generate Steering Files on Project Creation

**User Story:** As a developer, I want steering files automatically generated when I create a project, so that AI assistants have project-specific context from the start.

#### Acceptance Criteria

1. WHEN a user creates a new project THEN the System SHALL create a `.kiro/steering/` directory in the project root
2. WHEN steering files are generated THEN the System SHALL create three default files: `product.md`, `tech.md`, and `structure.md`
3. WHEN generating `product.md` THEN the System SHALL include the project name, description, and purpose
4. WHEN generating `tech.md` THEN the System SHALL include placeholder sections for technology stack and common commands
5. WHEN generating `structure.md` THEN the System SHALL include the project's directory structure and naming conventions

### Requirement 1.2: API Endpoint for Steering Generation

**User Story:** As a developer, I want an API endpoint to generate or regenerate steering files, so that I can update project context as the project evolves.

#### Acceptance Criteria

1. WHEN the System receives a POST request to `/projects/{project_id}/steering/generate` THEN the System SHALL generate steering files for that project
2. WHEN steering files already exist THEN the System SHALL prompt for confirmation before overwriting
3. WHEN generation succeeds THEN the System SHALL return an OrchestratorResponse with status "success" and list of created files
4. WHEN generation fails THEN the System SHALL return an OrchestratorResponse with status "failure" and error details
5. WHEN the project does not exist THEN the System SHALL return a 404 error with ProjectNotFoundError

### Requirement 1.3: Frontend UI for Steering Management

**User Story:** As a user, I want a UI option to generate steering files for my project, so that I can easily manage project context without using the API directly.

#### Acceptance Criteria

1. WHEN viewing a project detail page THEN the System SHALL display a "Generate Steering" button in the project actions
2. WHEN the user clicks "Generate Steering" THEN the System SHALL show a modal explaining what steering files are
3. WHEN steering files already exist THEN the System SHALL show a warning that existing files will be overwritten
4. WHEN the user confirms generation THEN the System SHALL call the API and display a success toast notification
5. WHEN generation fails THEN the System SHALL display an error toast with the failure reason

### Requirement 1.4: Steering File Viewing and Editing

**User Story:** As a user, I want to view and edit steering files through the UI, so that I can customize project context without leaving the application.

#### Acceptance Criteria

1. WHEN viewing a project detail page THEN the System SHALL display a "Steering" tab alongside Specs and Tasks tabs
2. WHEN the user clicks the "Steering" tab THEN the System SHALL list all steering files in the project
3. WHEN the user clicks a steering file THEN the System SHALL display the file content in the Monaco editor
4. WHEN the user edits and saves a steering file THEN the System SHALL update the file via the API
5. WHEN no steering files exist THEN the System SHALL display a message with a "Generate Steering" button

---

## Feature 2: Adhoc Task Execution UI

### Requirement 2.1: Adhoc Task Execution Button

**User Story:** As a user, I want a button to execute custom instructions, so that I can run tasks that aren't in my predefined task list.

#### Acceptance Criteria

1. WHEN viewing the Tasks tab THEN the System SHALL display an "Execute Adhoc Task" button prominently
2. WHEN the user clicks the "Execute Adhoc Task" button THEN the System SHALL open a modal dialog
3. WHEN the button is displayed THEN the System SHALL use a distinct visual style to differentiate it from regular task execution
4. WHEN the project is loading THEN the System SHALL disable the button
5. WHEN an adhoc task is already executing THEN the System SHALL disable the button and show a loading state

### Requirement 2.2: Adhoc Task Input Modal

**User Story:** As a user, I want a clear interface to enter my custom instruction, so that I can easily describe what I want the AI to do.

#### Acceptance Criteria

1. WHEN the modal opens THEN the System SHALL display a large textarea for instruction input
2. WHEN the modal opens THEN the System SHALL display helpful placeholder text with examples
3. WHEN the modal opens THEN the System SHALL display a character counter showing remaining characters (max 50,000)
4. WHEN the user types in the textarea THEN the System SHALL validate the input in real-time
5. WHEN the instruction is empty THEN the System SHALL disable the "Execute" button

### Requirement 2.3: Adhoc Task Execution

**User Story:** As a user, I want to execute my custom instruction and see the results, so that I can accomplish tasks not covered by the predefined task list.

#### Acceptance Criteria

1. WHEN the user clicks "Execute" THEN the System SHALL call the POST `/projects/{project_id}/custom` API endpoint
2. WHEN the API call is in progress THEN the System SHALL show a loading spinner and disable the execute button
3. WHEN execution succeeds THEN the System SHALL close the modal and display a success toast notification
4. WHEN execution fails THEN the System SHALL display an error message in the modal without closing it
5. WHEN execution completes THEN the System SHALL refresh the project status and task list

### Requirement 2.4: Instruction Templates

**User Story:** As a user, I want quick access to common instruction templates, so that I can execute frequent tasks without typing the same instructions repeatedly.

#### Acceptance Criteria

1. WHEN the adhoc task modal opens THEN the System SHALL display a "Templates" dropdown
2. WHEN the user selects a template THEN the System SHALL populate the textarea with the template text
3. WHEN templates are displayed THEN the System SHALL include at least 5 common templates
4. WHEN a template is selected THEN the System SHALL allow the user to edit the instruction before executing
5. WHEN the user has typed custom text THEN the System SHALL warn before overwriting with a template

### Requirement 2.5: Adhoc Task History

**User Story:** As a user, I want to see a history of my adhoc tasks, so that I can track what custom instructions I've run and reuse them if needed.

#### Acceptance Criteria

1. WHEN viewing the Tasks tab THEN the System SHALL display an "Adhoc Task History" section
2. WHEN adhoc tasks have been executed THEN the System SHALL list them with timestamp and status
3. WHEN the user clicks a history item THEN the System SHALL expand it to show the full instruction and logs
4. WHEN the user clicks "Rerun" on a history item THEN the System SHALL open the modal with the instruction pre-filled
5. WHEN no adhoc tasks have been executed THEN the System SHALL display a message "No adhoc tasks executed yet"

---

## Feature 3: Project File Explorer

### Requirement 3.1: File Tree API Endpoints

**User Story:** As a developer, I want API endpoints to retrieve the project file structure, so that the frontend can display the file tree.

#### Acceptance Criteria

1. WHEN the System receives a GET request to `/projects/{project_id}/files/tree` THEN the System SHALL return the complete directory structure
2. WHEN returning the file tree THEN the System SHALL include file names, paths, types (file/folder), and sizes
3. WHEN a folder is empty THEN the System SHALL include it in the tree with an empty children array
4. WHEN the project does not exist THEN the System SHALL return a 404 error
5. WHEN file system access fails THEN the System SHALL return a 500 error with details

### Requirement 3.2: File Content API Endpoint

**User Story:** As a developer, I want an API endpoint to retrieve file contents, so that I can view any file in my project.

#### Acceptance Criteria

1. WHEN the System receives a GET request to `/projects/{project_id}/files/content` with a file path THEN the System SHALL return the file content
2. WHEN the file is binary THEN the System SHALL return metadata indicating it's not viewable
3. WHEN the file is too large (>1MB) THEN the System SHALL return a warning and truncated content
4. WHEN the file does not exist THEN the System SHALL return a 404 error
5. WHEN the file path is outside the project root THEN the System SHALL return a 403 forbidden error

### Requirement 3.3: File Explorer UI Component

**User Story:** As a user, I want a file explorer in the project detail page, so that I can browse my project structure visually.

#### Acceptance Criteria

1. WHEN viewing a project detail page THEN the System SHALL display a "Files" tab alongside other tabs
2. WHEN the user clicks the "Files" tab THEN the System SHALL load and display the file tree
3. WHEN the file tree loads THEN the System SHALL show folders with expand/collapse icons
4. WHEN the file tree is loading THEN the System SHALL display a loading skeleton
5. WHEN the file tree fails to load THEN the System SHALL display an error message with retry button

### Requirement 3.4: Interactive File Tree

**User Story:** As a user, I want to interact with the file tree, so that I can navigate through folders and select files.

#### Acceptance Criteria

1. WHEN the user clicks a folder THEN the System SHALL expand or collapse that folder
2. WHEN the user clicks a file THEN the System SHALL load and display the file content
3. WHEN a folder is expanded THEN the System SHALL show all its children with proper indentation
4. WHEN a file is selected THEN the System SHALL highlight it in the tree
5. WHEN navigating the tree THEN the System SHALL remember expanded/collapsed states

### Requirement 3.5: File Content Viewer

**User Story:** As a user, I want to view file contents in a code editor, so that I can read and understand my project files.

#### Acceptance Criteria

1. WHEN a file is selected THEN the System SHALL display its content in a Monaco editor
2. WHEN displaying file content THEN the System SHALL apply syntax highlighting based on file extension
3. WHEN the file is binary THEN the System SHALL display a message "Binary file - cannot display"
4. WHEN the file is too large THEN the System SHALL display a warning and show truncated content
5. WHEN the file content loads THEN the System SHALL show line numbers and enable code folding

### Requirement 3.6: File Search and Filtering

**User Story:** As a user, I want to search for files in the tree, so that I can quickly find specific files without browsing.

#### Acceptance Criteria

1. WHEN viewing the file tree THEN the System SHALL display a search input at the top
2. WHEN the user types in the search input THEN the System SHALL filter the tree to show only matching files/folders
3. WHEN a search is active THEN the System SHALL highlight matching text in file names
4. WHEN the search input is cleared THEN the System SHALL restore the full tree
5. WHEN no files match the search THEN the System SHALL display "No files found"

### Requirement 3.7: Keyboard Navigation

**User Story:** As a developer, I want keyboard shortcuts for file navigation, so that I can browse files efficiently without using the mouse.

#### Acceptance Criteria

1. WHEN the file tree has focus THEN pressing Arrow Up/Down SHALL navigate between files
2. WHEN a folder is focused THEN pressing Arrow Right SHALL expand it
3. WHEN a folder is focused THEN pressing Arrow Left SHALL collapse it
4. WHEN a file is focused THEN pressing Enter SHALL open it
5. WHEN the file tree has focus THEN pressing Ctrl+F SHALL focus the search input

---

## Cross-Feature Integration

### Requirement 4.1: Unified Tab Navigation

**User Story:** As a user, I want seamless navigation between all project tabs, so that I can access all features easily.

#### Acceptance Criteria

1. WHEN viewing a project THEN the System SHALL display tabs for: Overview, Specs, Tasks, Files, and Steering
2. WHEN switching tabs THEN the System SHALL preserve state within each tab
3. WHEN a tab is loading THEN the System SHALL show a loading indicator
4. WHEN switching tabs THEN the System SHALL use smooth transitions
5. WHEN on mobile THEN the System SHALL display tabs in a scrollable horizontal layout

### Requirement 4.2: Consistent UI/UX

**User Story:** As a user, I want all new features to follow the same design language, so that the application feels cohesive.

#### Acceptance Criteria

1. WHEN using any feature THEN the System SHALL use consistent button styles and colors
2. WHEN displaying modals THEN the System SHALL use the same modal component and styling
3. WHEN showing errors THEN the System SHALL use consistent error message formatting
4. WHEN displaying loading states THEN the System SHALL use consistent loading indicators
5. WHEN using Monaco editor THEN the System SHALL apply the same theme across all editors
