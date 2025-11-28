# Custom Hooks

This directory contains custom React hooks for the Kiro Project Orchestrator Frontend.

## Available Hooks

### useTheme

Access and control the application theme.

```tsx
import { useTheme } from './hooks';

function MyComponent() {
  const { currentTheme, theme, setTheme, availableThemes } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Switch to Dark Mode
    </button>
  );
}
```

### useProjects

Fetch and manage the list of projects with optional auto-refresh.

```tsx
import { useProjects } from './hooks';

function ProjectBoard() {
  // Basic usage
  const { projects, loading, error, refetch } = useProjects();
  
  // With auto-refresh every 30 seconds
  // const { projects, loading, error } = useProjects(true, 30000);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.projectId} project={project} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useKeyboard

Handle keyboard shortcuts throughout the application.

```tsx
import { useKeyboard } from './hooks';

function MyComponent() {
  useKeyboard([
    {
      key: 'n',
      callback: () => openCreateModal(),
      description: 'Open new project modal'
    },
    {
      key: 'Escape',
      callback: () => closeModal(),
      description: 'Close modal'
    },
    {
      key: 's',
      ctrl: true,
      callback: () => saveFile(),
      description: 'Save file (Ctrl+S)'
    },
    {
      key: '/',
      callback: () => focusSearch(),
      description: 'Focus search input'
    }
  ]);
  
  return <div>Press 'n' to create a new project</div>;
}
```

**Features:**
- Automatically prevents shortcuts when typing in input fields
- Supports modifier keys (Ctrl/Cmd, Shift, Alt)
- Cleans up event listeners on unmount
- Case-insensitive key matching

### useProjectDetail

Fetch and manage detailed project metadata with optional auto-refresh.

```tsx
import { useProjectDetail } from './hooks';
import { useParams } from 'react-router-dom';

function ProjectDetailPage() {
  const { projectId } = useParams();
  
  // Basic usage
  const { project, loading, error, refetch } = useProjectDetail(projectId!);
  
  // With auto-refresh every 30 seconds
  // const { project, loading, error } = useProjectDetail(projectId!, true, 30000);
  
  if (loading) return <div>Loading project...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;
  
  return (
    <div>
      <h1>{project.name}</h1>
      <p>Phase: {project.phase}</p>
      <p>Completion: {project.completionPercentage}%</p>
      <p>Tasks: {project.taskStats.completed}/{project.taskStats.total}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Hook Patterns

All data-fetching hooks follow a consistent pattern:

1. **State Management**: Manage `data`, `loading`, and `error` states
2. **Auto-refresh**: Optional automatic data refresh with configurable interval
3. **Manual Refetch**: Expose a `refetch` function for manual updates
4. **Error Handling**: Catch and expose errors for UI handling
5. **Cleanup**: Properly clean up intervals and event listeners

## Requirements Mapping

- **useProjects**: Requirements 1.1, 1.5
- **useKeyboard**: Requirements 15.1, 15.2, 15.3, 15.4, 15.5
- **useProjectDetail**: Requirements 4.2
