# 👻 Kiro's Ghost - User Guide

Welcome to Kiro's Ghost! This guide will help you get the most out of your AI-powered development experience.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Project](#creating-your-first-project)
3. [Working with Specs](#working-with-specs)
4. [File Explorer](#file-explorer)
5. [Steering Files](#steering-files)
6. [Adhoc Task Execution](#adhoc-task-execution)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Tips & Best Practices](#tips--best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What is Kiro's Ghost?

Kiro's Ghost is a web-based AI-powered development orchestrator that helps you build software projects through spec-driven development. It works on any device with a browser - desktop, tablet, or mobile phone.

### Key Concepts

- **Project**: A software project with specs, tasks, and code
- **Specs**: Requirements, design, and task documents that define your project
- **Tasks**: Implementation steps that AI executes to build your project
- **Steering Files**: Context files that guide AI behavior
- **Adhoc Tasks**: Custom instructions you can execute on-demand

### Accessing the Application

1. Ensure the backend server is running (see [README.md](README.md))
2. Open your browser to `http://localhost:5173`
3. You'll see the project dashboard

---

## Creating Your First Project

### Step 1: Create a New Project

1. Click the **"Create New Project"** button on the dashboard
2. Enter a project name (e.g., "My Todo App")
3. Add a description (e.g., "A simple todo list with user authentication")
4. **Optional**: Check "Generate Steering Files" to auto-create AI context files
5. Click **"Create Project"**

### Step 2: Generate Requirements

1. Click on your newly created project
2. Navigate to the **"Specs"** tab
3. Click **"Generate Requirements"**
4. Provide additional details if needed
5. Wait for AI to generate your requirements document
6. Review the generated requirements

### Step 3: Generate Design

1. Once requirements are approved, click **"Generate Design"**
2. AI will create a technical design based on your requirements
3. Review the design document
4. Make any necessary edits using the Monaco editor

### Step 4: Generate Tasks

1. After design is complete, click **"Generate Tasks"**
2. AI will break down the design into actionable implementation tasks
3. Review the task list

### Step 5: Execute Tasks

1. Navigate to the **"Tasks"** tab
2. Click **"Execute"** next to any task to run it
3. Watch real-time progress and logs
4. Tasks will be marked as complete when done

---

## Working with Specs

### Viewing Specs

- Navigate to the **"Specs"** tab in any project
- Click on any spec file (requirements.md, design.md, tasks.md)
- View and edit in the Monaco editor

### Editing Specs

1. Click on a spec file to open it
2. Make your changes in the editor
3. Click **"Save"** to persist changes
4. Changes are immediately saved to the backend

### Spec Phases

Projects progress through phases:
- **INIT**: Just created
- **SPEC**: Generating or editing specifications
- **BUILD**: Executing implementation tasks
- **TEST**: Running tests
- **FIX**: Fixing issues
- **COMPLETE**: All tasks done

---

## File Explorer

The File Explorer lets you browse and view all files in your project.

### Accessing the File Explorer

1. Navigate to any project
2. Click the **"Files"** tab
3. The file tree appears on the left, content viewer on the right

### Navigating Files

**With Mouse:**
- Click folders to expand/collapse
- Click files to view their content
- Right-click for context menu (Copy Path)

**With Keyboard:**
- `Arrow Up/Down`: Navigate between items
- `Arrow Right`: Expand folder
- `Arrow Left`: Collapse folder
- `Enter`: Open selected file
- `Ctrl+F`: Focus search bar

### Searching Files

1. Click the search bar at the top of the file tree
2. Type your search query
3. File tree filters to show only matching files
4. Matching text is highlighted
5. Clear search to restore full tree

### Viewing File Content

- Files open in Monaco editor with syntax highlighting
- Line numbers and code folding enabled
- Binary files show "Binary file - cannot display"
- Large files (>1MB) show a warning

### File Tree Features

- **Automatic Exclusions**: node_modules, .git, __pycache__, etc. are hidden
- **File Type Icons**: Different icons for folders, files, and file types
- **Indentation**: Visual hierarchy shows folder structure
- **Caching**: Tree is cached for performance

---

## Steering Files

Steering files provide context and guidance to AI assistants working on your project.

### What are Steering Files?

Three markdown files that describe your project:
- **product.md**: Product overview, goals, and purpose
- **tech.md**: Technology stack, tools, and common commands
- **structure.md**: Project structure, conventions, and patterns

### Generating Steering Files

**During Project Creation:**
1. Check "Generate Steering Files" when creating a project
2. Files are automatically created with project-specific content

**For Existing Projects:**
1. Click **"Generate Steering"** button in project header
2. Confirm generation in the modal
3. Files are created in `.kiro/steering/`

### Viewing and Editing Steering Files

1. Navigate to the **"Steering"** tab
2. Click on any steering file to open it
3. Edit content in Monaco editor
4. Click **"Save"** to persist changes

### When to Update Steering Files

- After major architectural changes
- When adding new technologies
- When establishing new conventions
- When project goals evolve

### Best Practices

- Keep steering files up-to-date
- Be specific about technologies and versions
- Document common commands and workflows
- Include examples where helpful
- Update as your project evolves

---

## Adhoc Task Execution

Execute custom instructions that aren't part of your predefined task list.

### Opening the Adhoc Task Modal

**Three ways to open:**
1. Click **"Execute Adhoc Task"** button in Tasks tab
2. Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
3. Use the keyboard shortcut from anywhere in the project

### Writing Instructions

1. Type your instruction in the large text area
2. Be specific and clear about what you want
3. Up to 50,000 characters supported
4. Character counter shows remaining space

### Using Templates

1. Click the **"Templates"** dropdown
2. Select from 5 built-in templates:
   - **Fix Linting Errors**: Auto-fix code style issues
   - **Add Unit Tests**: Generate tests for existing code
   - **Update Documentation**: Improve or create docs
   - **Refactor Code**: Improve code structure
   - **Debug Issues**: Investigate and fix bugs
3. Template populates the text area
4. Edit as needed before executing

### Executing Instructions

1. Click **"Execute"** or press `Ctrl+Enter` / `Cmd+Enter`
2. Modal closes and execution begins
3. Real-time status indicator appears
4. Toast notification on completion

### Viewing Task History

1. Scroll down in the Tasks tab to see **"Adhoc Task History"**
2. Each entry shows:
   - Instruction text (truncated)
   - Execution timestamp
   - Status (success/failure)
3. Click to expand and see full details
4. Click **"Rerun"** to execute again

### History Features

- **Persistent**: Stored in browser localStorage
- **Limit**: Last 50 tasks kept
- **Expandable**: Click to see full instruction and logs
- **Reusable**: Rerun any previous task

### Example Instructions

**Frontend:**
```
Add error handling to all API calls in src/services/api.ts
with try-catch blocks and toast notifications
```

**Backend:**
```
Create a new endpoint POST /api/users/{id}/avatar
that accepts file uploads and saves them to disk
```

**Testing:**
```
Add unit tests for the authentication service
covering login, logout, and token refresh
```

**Documentation:**
```
Update the README.md with installation instructions
and add a troubleshooting section
```

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open adhoc task modal |
| `Escape` | Close modal/dialog |

### Adhoc Task Modal

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` / `Cmd+Enter` | Execute task |
| `Escape` | Close modal |

### File Explorer

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus search bar |
| `Arrow Up` | Navigate up |
| `Arrow Down` | Navigate down |
| `Arrow Right` | Expand folder |
| `Arrow Left` | Collapse folder |
| `Enter` | Open file |

### Monaco Editor

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save file |
| `Ctrl+F` / `Cmd+F` | Find in file |
| `Ctrl+H` / `Cmd+H` | Find and replace |
| `Ctrl+/` / `Cmd+/` | Toggle comment |

---

## Tips & Best Practices

### Project Organization

- Use descriptive project names
- Keep descriptions clear and concise
- Generate steering files for better AI context
- Review generated specs before executing tasks

### Working with Specs

- Review requirements carefully before generating design
- Edit specs to match your exact needs
- Keep specs updated as project evolves
- Use Monaco editor features (search, replace, etc.)

### Task Execution

- Execute tasks incrementally for better control
- Review task output and logs
- Fix issues as they arise
- Use adhoc tasks for quick fixes

### File Explorer

- Use search to quickly find files
- Learn keyboard shortcuts for efficiency
- Right-click for quick actions
- Keep file tree organized

### Steering Files

- Update steering files when adding technologies
- Be specific about versions and tools
- Document common commands
- Include project-specific conventions

### Adhoc Tasks

- Be specific in your instructions
- Use templates as starting points
- Review history to avoid repeating work
- Rerun successful tasks when needed

---

## Troubleshooting

### Project Not Loading

**Problem**: Project doesn't appear or load
**Solutions**:
- Refresh the page
- Check backend server is running
- Check browser console for errors
- Verify project exists in file system

### File Tree Not Showing

**Problem**: File tree is empty or not loading
**Solutions**:
- Ensure project has files
- Check project path is correct
- Refresh the Files tab
- Check backend logs for errors

### File Content Not Displaying

**Problem**: File content doesn't show
**Solutions**:
- Check if file is binary (not displayable)
- Check if file is too large (>1MB)
- Verify file path is correct
- Check file permissions

### Adhoc Task Not Executing

**Problem**: Adhoc task doesn't run
**Solutions**:
- Check instruction is not empty
- Verify backend connection
- Check character limit (50,000)
- Review backend logs

### Steering Files Not Generating

**Problem**: Steering generation fails
**Solutions**:
- Check if files already exist (use force option)
- Verify project path is correct
- Check backend logs for errors
- Ensure write permissions

### Monaco Editor Issues

**Problem**: Editor not loading or slow
**Solutions**:
- Wait for lazy loading to complete
- Refresh the page
- Check browser console
- Try a different browser

### Keyboard Shortcuts Not Working

**Problem**: Shortcuts don't respond
**Solutions**:
- Ensure focus is in correct area
- Check for browser extension conflicts
- Try clicking in the area first
- Verify shortcut key combination

### Performance Issues

**Problem**: App is slow or laggy
**Solutions**:
- Close unused tabs
- Clear browser cache
- Reduce file tree depth
- Check backend performance

---

## Getting Help

### Resources

- **Main README**: [README.md](README.md)
- **Backend Docs**: [backend/README.md](backend/README.md)
- **Frontend Docs**: [frontend/README.md](frontend/README.md)
- **API Reference**: [backend/API_REFERENCE.md](backend/API_REFERENCE.md)

### Common Issues

Check the troubleshooting section above for solutions to common problems.

### Reporting Bugs

When reporting issues, include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and version
- Console errors (if any)
- Backend logs (if relevant)

---

## Next Steps

Now that you know the basics:

1. Create your first project
2. Generate specs and review them
3. Execute some tasks
4. Explore the file tree
5. Try adhoc task execution
6. Customize steering files
7. Learn keyboard shortcuts

Happy coding with Kiro's Ghost! 👻✨
