# Design Document

## Overview

The Kiro Project Orchestrator Frontend is a professional, enterprise-grade React application that provides a Jira-like interface for managing software project lifecycles. The application features a card-based project board, detailed project views with spec editing, task workflow execution, and comprehensive build/test/fix capabilities. The design emphasizes visual clarity, smooth interactions, and extensible theming.

### Key Design Principles

1. **Visual Hierarchy**: Clear information architecture with card-based layouts and tabbed navigation
2. **Progressive Disclosure**: Show essential information first, details on demand
3. **Responsive Feedback**: Immediate visual feedback for all user actions
4. **Extensible Theming**: Architecture supports multiple themes beyond light/dark
5. **Performance**: Optimized rendering and efficient API communication
6. **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation

## Architecture

### Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first styling with custom theme configuration
- **State Management**: React Context API + Custom Hooks for global state
- **Routing**: React Router v6 for navigation
- **HTTP Client**: Axios for API communication with interceptors
- **Markdown Rendering**: react-markdown with syntax highlighting
- **Code Editor**: Monaco Editor (VS Code editor) for spec file editing
- **Animations**: Framer Motion for smooth transitions and animations
- **Icons**: Lucide React for consistent iconography
- **Notifications**: React Hot Toast for toast notifications

### Application Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (Button, Card, Modal, etc.)
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── project/         # Project-specific components
│   └── task/            # Task-specific components
├── pages/               # Page components (routes)
│   ├── ProjectBoard.tsx
│   ├── ProjectDetail.tsx
│   └── NotFound.tsx
├── services/            # API service layer
│   ├── api.ts          # Axios instance and interceptors
│   └── projectService.ts
├── hooks/               # Custom React hooks
│   ├── useTheme.ts
│   ├── useProjects.ts
│   └── useKeyboard.ts
├── contexts/            # React contexts
│   ├── ThemeContext.tsx
│   └── ApiContext.tsx
├── types/               # TypeScript type definitions
│   ├── project.ts
│   ├── api.ts
│   └── theme.ts
├── utils/               # Utility functions
│   ├── theme.ts
│   ├── storage.ts
│   └── validation.ts
├── styles/              # Global styles and theme
│   ├── themes/
│   │   ├── light.ts
│   │   ├── dark.ts
│   │   └── index.ts
│   └── globals.css
├── config/              # Configuration
│   └── constants.ts
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## Components and Interfaces

### Core Components

#### 1. ProjectBoard Component

**Purpose**: Main dashboard displaying all projects as cards

**Props**:
```typescript
interface ProjectBoardProps {
  // No props - fetches data internally
}
```

**State**:
```typescript
interface ProjectBoardState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  showCreateModal: boolean;
  searchQuery: string;
  filterPhase: Phase | 'all';
}
```

**Key Features**:
- Grid layout of project cards (responsive: 1-4 columns)
- Search and filter functionality
- Create project button with modal
- Auto-refresh on interval
- Empty state when no projects

#### 2. ProjectCard Component

**Purpose**: Individual project card display

**Props**:
```typescript
interface ProjectCardProps {
  project: ProjectSummary;
  onClick: (projectId: string) => void;
}
```

**Visual Design**:
- Card elevation with hover effect
- Color-coded by phase (blue for INIT/SPEC, white/dark for others)
- Progress bar at bottom
- Phase badge in top-right corner
- Project name, description (truncated), completion %

#### 3. ProjectDetail Component

**Purpose**: Detailed project view with tabs

**Props**:
```typescript
interface ProjectDetailProps {
  projectId: string;
}
```

**State**:
```typescript
interface ProjectDetailState {
  project: ProjectMetadata | null;
  activeTab: 'overview' | 'specs' | 'tasks';
  loading: boolean;
  error: string | null;
}
```

**Tabs**:
- **Overview**: Status, statistics, phase timeline, quick actions
- **Specs**: View/edit requirements, design, tasks files
- **Tasks**: Task list with execution workflow

#### 4. SpecViewer Component

**Purpose**: View and edit specification files

**Props**:
```typescript
interface SpecViewerProps {
  projectId: string;
  fileName: 'requirements.md' | 'design.md' | 'tasks.md';
}
```

**State**:
```typescript
interface SpecViewerState {
  content: string;
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  showGenerateModal: boolean;
}
```

**Features**:
- Markdown preview mode with syntax highlighting
- Monaco editor for editing mode
- Generate button when empty
- Save/Cancel buttons when editing
- Unsaved changes warning

#### 5. TaskWorkflow Component

**Purpose**: Task execution interface with workflow controls

**Props**:
```typescript
interface TaskWorkflowProps {
  projectId: string;
  tasks: Task[];
  onTaskComplete: () => void;
}
```

**State**:
```typescript
interface TaskWorkflowState {
  currentTaskIndex: number;
  executingTask: string | null;
  logs: string;
  showLogs: boolean;
}
```

**Features**:
- Task list with status indicators
- "Execute Next" button
- Real-time log display
- Progress indicator
- Skip optional tasks option

#### 6. ThemeToggle Component

**Purpose**: Switch between themes

**Props**:
```typescript
interface ThemeToggleProps {
  // No props - uses theme context
}
```

**Visual Design**:
- Icon button (sun/moon)
- Smooth transition animation
- Tooltip on hover

#### 7. Modal Component

**Purpose**: Reusable modal dialog

**Props**:
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}
```

**Features**:
- Backdrop with click-to-close
- Escape key to close
- Smooth open/close animations
- Focus trap for accessibility

#### 8. LogViewer Component

**Purpose**: Display execution logs in terminal style

**Props**:
```typescript
interface LogViewerProps {
  logs: string;
  isStreaming: boolean;
  onClear?: () => void;
}
```

**Visual Design**:
- Monospace font
- Dark background (even in light mode)
- Auto-scroll to bottom
- Copy logs button
- Clear logs button

## Data Models

### TypeScript Interfaces

```typescript
// Project Types
interface ProjectSummary {
  projectId: string;
  name: string;
  description: string;
  phase: Phase;
  completionPercentage: number;
  updatedAt: string;
}

interface ProjectMetadata extends ProjectSummary {
  createdAt: string;
  specGenerated: {
    requirements: string | null;
    design: string | null;
    tasks: string | null;
  };
  taskStats: TaskStats;
  buildConfig: BuildConfig;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  failed: number;
}

interface BuildConfig {
  buildCommand: string | null;
  testCommand: string | null;
  language: string | null;
}

enum Phase {
  INIT = 'INIT',
  SPEC = 'SPEC',
  BUILD = 'BUILD',
  TEST = 'TEST',
  FIX = 'FIX',
  COMPLETE = 'COMPLETE'
}

// Task Types
interface Task {
  number: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  isOptional: boolean;
  requirementsRefs: string[];
  parent: string | null;
  subtasks: string[];
}

// API Response Types
interface ApiResponse<T> {
  status: 'success' | 'failure';
  action: string;
  projectId: string;
  output: T;
  logs: string;
}

interface ApiError {
  code: string;
  message: string;
  details: Record<string, any>;
}

// Theme Types
interface Theme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  shadows: ThemeShadows;
  animations: ThemeAnimations;
}

interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  // Brand colors
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  // Phase colors
  phase: {
    init: string;
    spec: string;
    build: string;
    test: string;
    fix: string;
    complete: string;
  };
  // UI element colors
  border: string;
  hover: string;
  active: string;
  disabled: string;
}
```


## Theme System Architecture

### Theme Provider Structure

The theme system is designed to be extensible, allowing easy addition of new themes beyond light and dark modes.

```typescript
// Theme Registry
const themes: Record<string, Theme> = {
  light: lightTheme,
  dark: darkTheme,
  // Future themes can be added here:
  // highContrast: highContrastTheme,
  // solarized: solarizedTheme,
  // ocean: oceanTheme,
};

// Theme Context
interface ThemeContextValue {
  currentTheme: string;
  theme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}
```

### Theme Configuration Files

Each theme is defined in a separate file with complete color, spacing, and animation specifications:

**Light Theme** (`src/styles/themes/light.ts`):
```typescript
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#E9ECEF',
    },
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      tertiary: '#ADB5BD',
      inverse: '#FFFFFF',
    },
    brand: {
      primary: '#0066CC',
      secondary: '#0052A3',
      accent: '#FF6B35',
    },
    status: {
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#17A2B8',
    },
    phase: {
      init: '#0066CC',
      spec: '#0066CC',
      build: '#6C757D',
      test: '#17A2B8',
      fix: '#DC3545',
      complete: '#28A745',
    },
    border: '#DEE2E6',
    hover: '#F8F9FA',
    active: '#E9ECEF',
    disabled: '#E9ECEF',
  },
  // ... spacing, typography, shadows, animations
};
```

**Dark Theme** (`src/styles/themes/dark.ts`):
```typescript
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: '#1A1D23',
      secondary: '#22252B',
      tertiary: '#2A2D35',
    },
    text: {
      primary: '#E9ECEF',
      secondary: '#ADB5BD',
      tertiary: '#6C757D',
      inverse: '#212529',
    },
    brand: {
      primary: '#4A9EFF',
      secondary: '#3A8EEF',
      accent: '#FF8A5B',
    },
    status: {
      success: '#3DD365',
      warning: '#FFD93D',
      error: '#FF5757',
      info: '#4ECDC4',
    },
    phase: {
      init: '#4A9EFF',
      spec: '#4A9EFF',
      build: '#ADB5BD',
      test: '#4ECDC4',
      fix: '#FF5757',
      complete: '#3DD365',
    },
    border: '#3A3D45',
    hover: '#2A2D35',
    active: '#32353D',
    disabled: '#2A2D35',
  },
  // ... spacing, typography, shadows, animations
};
```

### Tailwind CSS Integration

Tailwind configuration dynamically applies theme colors:

```typescript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS variables that change with theme
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        // ... other color mappings
      },
    },
  },
};
```

### CSS Variables Injection

Theme colors are injected as CSS variables for seamless transitions:

```typescript
// Theme application function
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Apply background colors
  root.style.setProperty('--color-bg-primary', theme.colors.background.primary);
  root.style.setProperty('--color-bg-secondary', theme.colors.background.secondary);
  root.style.setProperty('--color-bg-tertiary', theme.colors.background.tertiary);
  
  // Apply text colors
  root.style.setProperty('--color-text-primary', theme.colors.text.primary);
  root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
  
  // ... apply all theme variables
  
  // Add transition for smooth theme switching
  root.style.setProperty('transition', 'background-color 0.3s ease, color 0.3s ease');
}
```

## API Service Layer

### Axios Configuration

```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 404) {
      // Handle not found
    } else if (error.response?.status === 500) {
      // Handle server error
    } else if (!error.response) {
      // Handle network error
    }
    return Promise.reject(error);
  }
);
```

### Project Service

```typescript
// src/services/projectService.ts
import { apiClient } from './api';
import type { 
  ProjectSummary, 
  ProjectMetadata, 
  ApiResponse 
} from '../types';

export const projectService = {
  // Get all projects
  async getProjects(): Promise<ProjectSummary[]> {
    const response = await apiClient.get<ProjectSummary[]>('/projects');
    return response.data;
  },

  // Get project status
  async getProjectStatus(projectId: string): Promise<ProjectMetadata> {
    const response = await apiClient.get<ProjectMetadata>(
      `/projects/${projectId}/status`
    );
    return response.data;
  },

  // Create project
  async createProject(name: string, description: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/projects/create',
      { name, description }
    );
    return response.data;
  },

  // Read spec file
  async readSpecFile(
    projectId: string, 
    fileName: string
  ): Promise<{ content: string; metadata: any }> {
    const response = await apiClient.get(
      `/projects/${projectId}/files/${fileName}`
    );
    return response.data;
  },

  // Update spec file
  async updateSpecFile(
    projectId: string,
    fileName: string,
    content: string
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.put<ApiResponse<any>>(
      `/projects/${projectId}/files/${fileName}`,
      { content }
    );
    return response.data;
  },

  // Generate spec
  async generateSpec(
    projectId: string,
    specType: 'requirements' | 'design' | 'tasks',
    description: string
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/projects/${projectId}/spec/generate`,
      { specType, description }
    );
    return response.data;
  },

  // Execute task
  async executeTask(
    projectId: string,
    taskNumber?: string
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/projects/${projectId}/tasks/execute`,
      taskNumber ? { taskNumber } : {}
    );
    return response.data;
  },

  // Build project
  async buildProject(projectId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/projects/${projectId}/build`
    );
    return response.data;
  },

  // Test project
  async testProject(projectId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/projects/${projectId}/test`
    );
    return response.data;
  },

  // Fix project
  async fixProject(
    projectId: string,
    failureDetails: string
  ): Promise<ApiResponse<any>> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/projects/${projectId}/fix`,
      { failureDetails }
    );
    return response.data;
  },
};
```

## Custom Hooks

### useTheme Hook

```typescript
// src/hooks/useTheme.ts
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### useProjects Hook

```typescript
// src/hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import type { ProjectSummary } from '../types';

export function useProjects(autoRefresh = false, interval = 30000) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    if (autoRefresh) {
      const intervalId = setInterval(fetchProjects, interval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefresh, interval]);

  return { projects, loading, error, refetch: fetchProjects };
}
```

### useKeyboard Hook

```typescript
// src/hooks/useKeyboard.ts
import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
}

export function useKeyboard(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
```


## Routing Structure

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProjectBoard />} />
            <Route path="projects/:projectId" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}
```

## UI/UX Design Specifications

### Color Palette

#### Light Mode
- **Primary Background**: #FFFFFF (Pure white)
- **Secondary Background**: #F8F9FA (Light gray)
- **Card Background (INIT/SPEC)**: #E3F2FD (Light blue)
- **Card Background (Other)**: #FFFFFF (White)
- **Primary Text**: #212529 (Dark gray)
- **Secondary Text**: #6C757D (Medium gray)
- **Border**: #DEE2E6 (Light gray)
- **Primary Brand**: #0066CC (Blue)
- **Success**: #28A745 (Green)
- **Warning**: #FFC107 (Amber)
- **Error**: #DC3545 (Red)

#### Dark Mode
- **Primary Background**: #1A1D23 (Very dark blue-gray)
- **Secondary Background**: #22252B (Dark blue-gray)
- **Card Background (INIT/SPEC)**: #1E3A5F (Dark blue)
- **Card Background (Other)**: #22252B (Dark gray)
- **Primary Text**: #E9ECEF (Light gray)
- **Secondary Text**: #ADB5BD (Medium gray)
- **Border**: #3A3D45 (Dark gray)
- **Primary Brand**: #4A9EFF (Bright blue)
- **Success**: #3DD365 (Bright green)
- **Warning**: #FFD93D (Bright amber)
- **Error**: #FF5757 (Bright red)

### Typography

- **Font Family**: 
  - Primary: 'Inter', system-ui, sans-serif
  - Monospace: 'Fira Code', 'Courier New', monospace
- **Font Sizes**:
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)
  - 4xl: 2.25rem (36px)
- **Font Weights**:
  - normal: 400
  - medium: 500
  - semibold: 600
  - bold: 700

### Spacing

- **Base Unit**: 4px
- **Scale**: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64
- **Container Max Width**: 1280px
- **Card Padding**: 24px
- **Modal Padding**: 32px

### Shadows

- **sm**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **base**: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- **md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- **lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- **xl**: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

### Border Radius

- **sm**: 0.25rem (4px)
- **base**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **full**: 9999px (circular)

### Animations

```typescript
export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  // Easing functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    cardHover: {
      rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
      hover: { scale: 1.02, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' },
    },
  },
};
```

## Page Layouts

### ProjectBoard Page

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                   │
│ [Logo] [Search] [Filter] [Theme Toggle] [+ New Project] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Project  │  │ Project  │  │ Project  │  │ Project  ││
│  │ Card 1   │  │ Card 2   │  │ Card 3   │  │ Card 4   ││
│  │          │  │          │  │          │  │          ││
│  │ [Phase]  │  │ [Phase]  │  │ [Phase]  │  │ [Phase]  ││
│  │ ████░░░  │  │ ████████ │  │ ██░░░░░░ │  │ ███░░░░░ ││
│  │ 45%      │  │ 100%     │  │ 25%      │  │ 33%      ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                          │
│  ┌──────────┐  ┌──────────┐                             │
│  │ Project  │  │ Project  │                             │
│  │ Card 5   │  │ Card 6   │                             │
│  │          │  │          │                             │
│  │ [Phase]  │  │ [Phase]  │                             │
│  │ ██████░░ │  │ █░░░░░░░ │                             │
│  │ 75%      │  │ 10%      │                             │
│  └──────────┘  └──────────┘                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### ProjectDetail Page

```
┌─────────────────────────────────────────────────────────┐
│ [← Back] Project Name                    [Theme Toggle] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Phase: BUILD  ████████░░ 80%                            │
│                                                          │
│ ┌─────────┬─────────┬─────────┐                        │
│ │Overview │  Specs  │  Tasks  │                        │
│ └─────────┴─────────┴─────────┘                        │
│ ┌─────────────────────────────────────────────────────┐│
│ │                                                      ││
│ │  [Tab Content Area]                                 ││
│ │                                                      ││
│ │  Overview Tab:                                      ││
│ │  - Status Summary                                   ││
│ │  - Phase Timeline                                   ││
│ │  - Task Statistics                                  ││
│ │  - Quick Actions (Build, Test, Fix)                ││
│ │                                                      ││
│ │  Specs Tab:                                         ││
│ │  - Sub-tabs: Requirements | Design | Tasks         ││
│ │  - Markdown viewer/editor                           ││
│ │  - Generate/Edit/Save buttons                       ││
│ │                                                      ││
│ │  Tasks Tab:                                         ││
│ │  - Task list with status                            ││
│ │  - Execute Next button                              ││
│ │  - Log viewer panel                                 ││
│ │                                                      ││
│ └─────────────────────────────────────────────────────┘│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Error Handling

### Error Display Strategy

1. **Toast Notifications**: For transient errors (network issues, validation errors)
2. **Inline Errors**: For form validation errors
3. **Error Boundaries**: For component-level errors
4. **Empty States**: For missing data scenarios

### Error Types and Handling

```typescript
interface ErrorHandler {
  // Network errors
  handleNetworkError(error: Error): void;
  
  // API errors
  handleApiError(error: ApiError): void;
  
  // Validation errors
  handleValidationError(errors: ValidationError[]): void;
  
  // Component errors
  handleComponentError(error: Error, errorInfo: ErrorInfo): void;
}

// Error notification component
function showError(message: string, duration = 5000) {
  toast.error(message, {
    duration,
    position: 'top-right',
    style: {
      background: 'var(--color-status-error)',
      color: 'var(--color-text-inverse)',
    },
  });
}
```

## Testing Strategy

### Unit Testing

- **Framework**: Vitest
- **Coverage Target**: 80%+ for utilities and hooks
- **Test Files**: Co-located with source files (*.test.ts, *.test.tsx)

**Example Test**:
```typescript
// src/utils/theme.test.ts
import { describe, it, expect } from 'vitest';
import { applyTheme, getStoredTheme } from './theme';

describe('Theme Utilities', () => {
  it('should apply theme colors to CSS variables', () => {
    const theme = lightTheme;
    applyTheme(theme);
    
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--color-bg-primary')).toBe('#FFFFFF');
  });

  it('should retrieve stored theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    expect(getStoredTheme()).toBe('dark');
  });
});
```

### Component Testing

- **Framework**: React Testing Library
- **Focus**: User interactions and accessibility

**Example Test**:
```typescript
// src/components/ProjectCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    projectId: 'test-project',
    name: 'Test Project',
    description: 'Test description',
    phase: 'BUILD',
    completionPercentage: 50,
    updatedAt: '2025-01-01T00:00:00Z',
  };

  it('should render project information', () => {
    render(<ProjectCard project={mockProject} onClick={() => {}} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ProjectCard project={mockProject} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledWith('test-project');
  });
});
```

### End-to-End Testing

- **Framework**: Playwright
- **Coverage**: Critical user flows

**Example Test**:
```typescript
// tests/e2e/project-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('complete project workflow', async ({ page }) => {
  await page.goto('/');
  
  // Create project
  await page.click('text=New Project');
  await page.fill('input[name="name"]', 'E2E Test Project');
  await page.fill('textarea[name="description"]', 'Test description');
  await page.click('button:has-text("Create")');
  
  // Verify project appears
  await expect(page.locator('text=E2E Test Project')).toBeVisible();
  
  // Open project
  await page.click('text=E2E Test Project');
  
  // Navigate to specs
  await page.click('text=Specs');
  
  // Generate requirements
  await page.click('text=Generate Requirements');
  await page.fill('textarea', 'Test requirements description');
  await page.click('button:has-text("Generate")');
  
  // Wait for generation
  await expect(page.locator('text=Requirements generated')).toBeVisible();
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Project card information completeness
*For any* project data received from the API, the rendered project card should display the project name, description, phase, and completion percentage.
**Validates: Requirements 1.2**

### Property 2: Phase-based card styling (early phases)
*For any* project in INIT or SPEC phase, the project card should have a blue background color.
**Validates: Requirements 1.3**

### Property 3: Phase-based card styling (later phases)
*For any* project in BUILD, TEST, FIX, or COMPLETE phase, the project card should have the theme's default card background color (white in light mode, dark gray in dark mode).
**Validates: Requirements 1.4**

### Property 4: Theme toggle behavior
*For any* current theme state, clicking the theme toggle button should switch to a different theme (light ↔ dark).
**Validates: Requirements 2.1**

### Property 5: Theme persistence round-trip
*For any* theme selection, after setting the theme and reloading the application, the theme retrieved from localStorage should match the theme that was set.
**Validates: Requirements 2.4, 2.5**

### Property 6: Project creation API call
*For any* valid project name and description, submitting the creation form should trigger a POST request to /projects/create with the provided data.
**Validates: Requirements 3.2**

### Property 7: Form validation prevents invalid submission
*For any* invalid form input (empty name, empty description, or whitespace-only values), the form should not submit and should display validation error messages.
**Validates: Requirements 3.5**

### Property 8: Project detail API call
*For any* project ID, navigating to the project detail view should trigger a GET request to /projects/{project_id}/status.
**Validates: Requirements 4.2**

### Property 9: Project detail information completeness
*For any* project status data, the project detail view should display the project name, phase, completion percentage, and task statistics (total, completed, in progress, pending, failed).
**Validates: Requirements 4.3**

### Property 10: Spec file fetching
*For any* spec file selection (requirements.md, design.md, or tasks.md), the application should fetch the file content from GET /projects/{project_id}/files/{file_name}.
**Validates: Requirements 5.2**

### Property 11: Markdown rendering
*For any* markdown content string, the spec viewer should render it as formatted HTML with proper heading, list, code block, and link formatting.
**Validates: Requirements 5.3**

### Property 12: Spec file update API call
*For any* edited spec file content, saving the changes should trigger a PUT request to /projects/{project_id}/files/{file_name} with the new content.
**Validates: Requirements 5.5**

### Property 13: Spec generation API call
*For any* spec type (requirements, design, or tasks) and description, submitting the generation request should trigger a POST request to /projects/{project_id}/spec/generate with the spec type and description.
**Validates: Requirements 6.3**

### Property 14: Task list rendering
*For any* list of tasks, the Tasks tab should display all tasks with their task number, description, and status.
**Validates: Requirements 7.1, 7.2**

### Property 15: Task execution API call
*For any* pending task, clicking "Execute Next Task" should trigger a POST request to /projects/{project_id}/tasks/execute with the task number of the next pending task.
**Validates: Requirements 7.3**

### Property 16: Log content appending
*For any* existing log content and new log content, when new logs are received, the log panel should contain both the old content and the new content (appended, not replaced).
**Validates: Requirements 8.2**

### Property 17: Build button visibility
*For any* project phase that is BUILD, TEST, FIX, or COMPLETE, the "Build Project" button should be visible in the UI.
**Validates: Requirements 9.1**

### Property 18: Test button visibility
*For any* project phase that is TEST, FIX, or COMPLETE, the "Run Tests" button should be visible in the UI.
**Validates: Requirements 9.3**

### Property 19: Fix issues API call
*For any* failure details string, clicking "Fix Issues" should trigger a POST request to /projects/{project_id}/fix with the failure details in the request body.
**Validates: Requirements 10.2**

### Property 20: Progress bar rendering
*For any* project with a completion percentage value, the project display should include a progress bar element with a width proportional to the completion percentage.
**Validates: Requirements 11.1**

### Property 21: Task statistics display
*For any* task statistics object, the display should show all five counts: total, completed, in progress, pending, and failed.
**Validates: Requirements 11.2**

### Property 22: Phase badge coloring
*For any* project phase, the phase badge should use the correct color: blue for INIT/SPEC, gray for BUILD, cyan for TEST, red for FIX, and green for COMPLETE.
**Validates: Requirements 11.3**

### Property 23: Timeline phase highlighting
*For any* current project phase, the visual timeline should highlight that specific phase (and only that phase).
**Validates: Requirements 11.5**

### Property 24: API error notification
*For any* API request that fails with an error response, an error notification should be displayed containing the error message from the response.
**Validates: Requirements 12.1**

### Property 25: Validation error field highlighting
*For any* validation error on a form field, that field should be visually highlighted (with error styling) and display the specific error message.
**Validates: Requirements 12.3**

### Property 26: Error notification dismiss button
*For any* error notification displayed, the notification should include a dismiss button that removes the notification when clicked.
**Validates: Requirements 12.4**

### Property 27: Error notification stacking
*For any* number of simultaneous errors (n > 1), all error notifications should be visible and stacked vertically without overlapping each other.
**Validates: Requirements 12.5**

### Property 28: API base URL usage
*For any* API request made by the application, the request URL should start with the configured backend base URL from environment configuration.
**Validates: Requirements 13.3**

### Property 29: Escape key modal closing
*For any* open modal, pressing the Escape key should close the modal.
**Validates: Requirements 15.2**

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Lazy load routes and heavy components
```typescript
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const SpecViewer = lazy(() => import('./components/SpecViewer'));
```

2. **Memoization**: Prevent unnecessary re-renders
```typescript
const ProjectCard = memo(({ project, onClick }: ProjectCardProps) => {
  // Component implementation
});
```

3. **Virtual Scrolling**: For large task lists
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={tasks.length}
  itemSize={60}
  width="100%"
>
  {TaskRow}
</FixedSizeList>
```

4. **Debounced Search**: Reduce API calls during search
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    // Perform search
  }, 300),
  []
);
```

5. **Request Caching**: Cache API responses
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
    },
  },
});
```

### Performance Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**
   - All interactive elements accessible via Tab key
   - Focus indicators visible on all focusable elements
   - Keyboard shortcuts for common actions

2. **Screen Reader Support**
   - Semantic HTML elements (nav, main, article, etc.)
   - ARIA labels for icon buttons
   - ARIA live regions for dynamic content updates
   - Alt text for all images

3. **Color Contrast**
   - Text contrast ratio ≥ 4.5:1 for normal text
   - Text contrast ratio ≥ 3:1 for large text
   - UI component contrast ratio ≥ 3:1

4. **Focus Management**
   - Focus trap in modals
   - Focus restoration when closing modals
   - Skip to main content link

5. **Responsive Text**
   - Text resizable up to 200% without loss of functionality
   - No horizontal scrolling at 320px width

### Example Accessibility Implementation

```typescript
// Accessible button component
function Button({ children, onClick, ariaLabel, ...props }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="focus:outline-none focus:ring-2 focus:ring-brand-primary"
      {...props}
    >
      {children}
    </button>
  );
}

// Accessible modal with focus trap
function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Focus first focusable element
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }
  }, [isOpen]);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

## Security Considerations

### Input Validation

- Sanitize all user inputs before rendering
- Validate data on both client and server side
- Use DOMPurify for sanitizing HTML content

### XSS Prevention

```typescript
import DOMPurify from 'dompurify';

function SafeMarkdown({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### CSRF Protection

- Use SameSite cookies if authentication is added
- Include CSRF tokens in state-changing requests

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' ${API_BASE_URL};">
```

## Deployment

### Build Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react'],
          editor: ['@monaco-editor/react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### Environment Variables

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Kiro Project Orchestrator
VITE_APP_VERSION=1.0.0
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run lint
      - name: Deploy to production
        run: |
          # Deployment commands
```

## Future Enhancements

### Phase 2 Features

1. **Real-time Collaboration**: WebSocket support for multi-user editing
2. **Project Templates**: Pre-configured project templates for common use cases
3. **Advanced Search**: Full-text search across all project specs
4. **Export/Import**: Export projects as ZIP files, import from templates
5. **Analytics Dashboard**: Project metrics and timeline visualization
6. **Custom Workflows**: User-defined task execution workflows
7. **Integration Plugins**: GitHub, GitLab, Jira integration
8. **Mobile App**: React Native mobile application

### Additional Themes

1. **High Contrast**: For accessibility
2. **Solarized**: Popular developer theme
3. **Ocean**: Blue-tinted theme
4. **Forest**: Green-tinted theme
5. **Sunset**: Warm orange/red theme
6. **Custom**: User-defined color schemes

### Theme Extension Example

```typescript
// src/styles/themes/ocean.ts
export const oceanTheme: Theme = {
  name: 'ocean',
  colors: {
    background: {
      primary: '#0A1929',
      secondary: '#132F4C',
      tertiary: '#1A4971',
    },
    brand: {
      primary: '#3399FF',
      secondary: '#0072E5',
      accent: '#66B2FF',
    },
    // ... other colors
  },
  // ... spacing, typography, etc.
};

// Register in theme registry
const themes = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme, // New theme added
};
```

## Visual Enhancement Design

### Design Philosophy

The visual enhancement focuses on creating a **consistent, professional interface** with:
- **Professional Color Scheme**: Dark blue (#0052A3, #003D7A) with white text for a corporate, trustworthy appearance
- **Consistent Rounded Corners**: 12px for inputs/buttons, 16px for cards/modals
- **Uniform Sizing**: 48px height for all interactive controls
- **Consistent Spacing**: 24px padding for cards and modals
- **Clear Visual Hierarchy**: Larger, bolder text with consistent styling

### Enhanced UI Element Specifications

To improve visual hierarchy and make interactive elements more prominent, the following enhancements should be applied:

#### Search Input Enhancement

**Current Issue**: Search inputs blend in with regular text and labels.

**Enhanced Design**:
```typescript
// Enhanced search input styling - Professional Dark Blue Theme
const searchInputStyles = {
  height: '48px',  // Consistent height
  fontSize: '16px',
  padding: '12px 16px',
  border: '2px solid #0052A3',  // Professional dark blue border
  borderRadius: '12px',  // Consistent rounded corners
  backgroundColor: '#FFFFFF',  // White background
  color: '#003D7A',  // Dark blue text
  boxShadow: '0 2px 8px rgba(0, 82, 163, 0.15)',
  transition: 'all 0.2s ease',
  
  // Hover state
  '&:hover': {
    borderColor: '#003D7A',  // Darker blue on hover
    boxShadow: '0 4px 12px rgba(0, 82, 163, 0.25)',
  },
  
  // Focus state
  '&:focus': {
    outline: 'none',
    borderColor: '#003D7A',
    boxShadow: '0 0 0 4px rgba(0, 82, 163, 0.15)',
  },
  
  // Placeholder
  '&::placeholder': {
    color: '#6C757D',  // Gray placeholder
  },
};
```

**Visual Characteristics**:
- Height: 48px (consistent with all inputs)
- Border: 2px solid dark blue (#0052A3)
- Border Radius: 12px (consistent rounded corners)
- Background: White (#FFFFFF)
- Text: Dark blue (#003D7A)
- Icon: Magnifying glass icon in dark blue, 20px size

#### Dropdown/Select Enhancement

**Current Issue**: Dropdowns look like plain text.

**Enhanced Design**:
```typescript
// Enhanced dropdown styling - Professional Dark Blue Theme
const dropdownStyles = {
  height: '48px',  // Consistent height
  fontSize: '16px',
  padding: '12px 16px',
  border: '2px solid #0052A3',  // Professional dark blue border
  borderRadius: '12px',  // Consistent rounded corners
  backgroundColor: '#FFFFFF',  // White background
  color: '#003D7A',  // Dark blue text
  backgroundImage: `url("data:image/svg+xml,...")`,  // Dark blue arrow icon
  backgroundPosition: 'right 12px center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '20px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0, 82, 163, 0.15)',
  
  // Hover state
  '&:hover': {
    borderColor: '#003D7A',  // Darker blue on hover
    boxShadow: '0 4px 12px rgba(0, 82, 163, 0.25)',
  },
  
  // Focus state
  '&:focus': {
    outline: 'none',
    borderColor: '#003D7A',
    boxShadow: '0 0 0 4px rgba(0, 82, 163, 0.15)',
  },
  
  // Open state
  '&[aria-expanded="true"]': {
    borderColor: '#003D7A',
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',
  },
};

// Dropdown menu styling
const dropdownMenuStyles = {
  border: '2px solid #003D7A',  // Dark blue border
  borderTop: 'none',
  borderRadius: '0 0 12px 12px',  // Consistent rounded corners
  backgroundColor: '#FFFFFF',  // White background
  boxShadow: '0 8px 16px rgba(0, 82, 163, 0.2)',
  maxHeight: '300px',
  overflowY: 'auto',
};

// Dropdown option styling
const dropdownOptionStyles = {
  padding: '12px 16px',
  fontSize: '16px',
  color: '#003D7A',  // Dark blue text
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  
  '&:hover': {
    backgroundColor: '#E3F2FD',  // Light blue hover
  },
  
  '&[aria-selected="true"]': {
    backgroundColor: '#0052A3',  // Dark blue background
    color: '#FFFFFF',  // White text
    fontWeight: 600,
  },
};
```

**Visual Characteristics**:
- Height: 48px (consistent)
- Border: 2px solid dark blue (#0052A3)
- Border Radius: 12px (consistent rounded corners)
- Background: White (#FFFFFF)
- Text: Dark blue (#003D7A)
- Arrow Icon: Dark blue chevron icon (20px)
- Selected option: Dark blue background with white text

#### Project Card Enhancement

**Current Issue**: Cards look flat and text-heavy.

**Enhanced Design**:
```typescript
// Enhanced project card styling - Professional Dark Blue Theme
const projectCardStyles = {
  padding: '24px',  // Consistent padding
  borderRadius: '16px',  // Consistent rounded corners for cards
  border: '2px solid #0052A3',  // Professional dark blue border
  backgroundColor: '#FFFFFF',  // White background
  boxShadow: '0 4px 12px rgba(0, 82, 163, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  
  // Hover state
  '&:hover': {
    transform: 'translateY(-4px)',  // Lift effect
    boxShadow: '0 12px 24px rgba(0, 82, 163, 0.25)',
    borderColor: '#003D7A',  // Darker blue on hover
  },
  
  // Phase-specific accent colors (subtle, professional)
  '&[data-phase="INIT"], &[data-phase="SPEC"]': {
    borderLeftWidth: '6px',  // Accent border on left
    borderLeftColor: '#0052A3',  // Dark blue accent
  },
  
  '&[data-phase="BUILD"]': {
    borderLeftWidth: '6px',
    borderLeftColor: '#6C757D',  // Gray accent
  },
  
  '&[data-phase="TEST"]': {
    borderLeftWidth: '6px',
    borderLeftColor: '#17A2B8',  // Cyan accent
  },
  
  '&[data-phase="FIX"]': {
    borderLeftWidth: '6px',
    borderLeftColor: '#DC3545',  // Red accent
  },
  
  '&[data-phase="COMPLETE"]': {
    borderLeftWidth: '6px',
    borderLeftColor: '#28A745',  // Green accent
  },
};

// Enhanced card title
const cardTitleStyles = {
  fontSize: '24px',  // Larger, prominent
  fontWeight: 700,  // Bold
  color: '#003D7A',  // Dark blue text
  marginBottom: '12px',
  lineHeight: 1.3,
};

// Enhanced card description
const cardDescriptionStyles = {
  fontSize: '16px',
  color: '#6C757D',  // Gray text
  marginBottom: '16px',
  lineHeight: 1.5,
};

// Enhanced phase badge
const phaseBadgeStyles = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 700,
  borderRadius: '20px',  // Rounded pill shape
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  
  // Phase-specific colors with dark blue theme
  '&[data-phase="INIT"]': {
    backgroundColor: '#0052A3',  // Dark blue
    color: '#FFFFFF',
  },
  '&[data-phase="SPEC"]': {
    backgroundColor: '#003D7A',  // Darker blue
    color: '#FFFFFF',
  },
  '&[data-phase="BUILD"]': {
    backgroundColor: '#6C757D',  // Gray
    color: '#FFFFFF',
  },
  '&[data-phase="TEST"]': {
    backgroundColor: '#17A2B8',  // Cyan
    color: '#FFFFFF',
  },
  '&[data-phase="FIX"]': {
    backgroundColor: '#DC3545',  // Red
    color: '#FFFFFF',
  },
  '&[data-phase="COMPLETE"]': {
    backgroundColor: '#28A745',  // Green
    color: '#FFFFFF',
  },
};

// Enhanced progress bar
const progressBarStyles = {
  height: '12px',  // Thicker, more visible
  borderRadius: '6px',
  backgroundColor: '#E9ECEF',  // Light gray background
  overflow: 'hidden',
  marginTop: '16px',
  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
};

const progressBarFillStyles = {
  height: '100%',
  borderRadius: '6px',
  backgroundColor: '#0052A3',  // Dark blue fill
  transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};
```

**Visual Characteristics**:
- Padding: 24px (consistent)
- Border Radius: 16px (consistent for cards)
- Border: 2px solid dark blue (#0052A3)
- Background: White (#FFFFFF)
- Title: 24px, bold (700), dark blue text
- Phase badge: Dark blue/phase-specific colors with white text
- Progress bar: 12px height, dark blue fill
- Hover: Lifts up with darker border and increased shadow
- Phase accent: 6px left border in phase-specific color

#### Button Enhancement

**Current Issue**: Buttons don't stand out enough.

**Enhanced Design**:
```typescript
// Enhanced button styling - Professional Dark Blue Theme
const buttonStyles = {
  // Primary button - Dark blue with white text
  primary: {
    height: '48px',  // Consistent height
    padding: '0 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',  // Consistent rounded corners
    border: 'none',
    backgroundColor: '#0052A3',  // Professional dark blue
    color: '#FFFFFF',  // White text
    boxShadow: '0 4px 12px rgba(0, 82, 163, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: '#003D7A',  // Darker blue on hover
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0, 82, 163, 0.4)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0, 82, 163, 0.3)',
    },
    
    '&:disabled': {
      backgroundColor: '#6C757D',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  
  // Secondary button - White with dark blue border and text
  secondary: {
    height: '48px',  // Consistent height
    padding: '0 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',  // Consistent rounded corners
    border: '2px solid #0052A3',  // Dark blue border
    backgroundColor: '#FFFFFF',  // White background
    color: '#0052A3',  // Dark blue text
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: '#0052A3',  // Dark blue background on hover
      color: '#FFFFFF',  // White text on hover
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 82, 163, 0.25)',
    },
    
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  
  // Danger button - Red for destructive actions
  danger: {
    height: '48px',
    padding: '0 24px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#DC3545',
    color: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: '#C82333',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)',
    },
  },
};
```

**Visual Characteristics**:
- Height: 48px (consistent)
- Border Radius: 12px (consistent rounded corners)
- Primary: Dark blue (#0052A3) background, white text
- Secondary: White background, dark blue border and text
- Font: 16px, weight 600
- Hover: Darkens and lifts with shadow increase

#### Modal Enhancement

**Current Issue**: Modals don't have consistent styling.

**Enhanced Design**:
```typescript
// Enhanced modal styling - Professional Dark Blue Theme
const modalStyles = {
  // Modal overlay
  overlay: {
    backgroundColor: 'rgba(0, 61, 122, 0.5)',  // Dark blue tinted overlay
    backdropFilter: 'blur(4px)',
  },
  
  // Modal container
  container: {
    backgroundColor: '#FFFFFF',  // White background
    borderRadius: '16px',  // Consistent rounded corners for modals
    padding: '24px',  // Consistent padding
    border: '2px solid #0052A3',  // Dark blue border
    boxShadow: '0 20px 40px rgba(0, 82, 163, 0.3)',
    maxWidth: '600px',
    width: '90%',
  },
  
  // Modal header
  header: {
    borderBottom: '2px solid #E9ECEF',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  
  // Modal title
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#003D7A',  // Dark blue text
  },
  
  // Modal close button
  closeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#6C757D',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: '#F8F9FA',
      color: '#003D7A',
    },
  },
  
  // Modal footer
  footer: {
    borderTop: '2px solid #E9ECEF',
    paddingTop: '16px',
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
};
```

**Visual Characteristics**:
- Border Radius: 16px (consistent for modals)
- Padding: 24px (consistent)
- Border: 2px solid dark blue (#0052A3)
- Background: White (#FFFFFF)
- Title: 24px, bold, dark blue
- Overlay: Dark blue tinted with blur effect

### Professional Color Palette

#### Primary Colors - Dark Blue & White Theme
```typescript
const professionalColors = {
  // Core brand colors - Professional dark blue
  brand: {
    primary: '#0052A3',      // Professional dark blue
    secondary: '#003D7A',    // Darker blue for hover states
    tertiary: '#0066CC',     // Lighter blue for accents
  },
  
  // Text colors
  text: {
    primary: '#003D7A',      // Dark blue for headings
    secondary: '#6C757D',    // Gray for body text
    inverse: '#FFFFFF',      // White for dark backgrounds
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',      // White
    secondary: '#F8F9FA',    // Light gray
    tertiary: '#E9ECEF',     // Medium gray
  },
  
  // Phase colors (professional, muted)
  phase: {
    init: '#0052A3',         // Dark blue
    spec: '#003D7A',         // Darker blue
    build: '#6C757D',        // Gray
    test: '#17A2B8',         // Cyan
    fix: '#DC3545',          // Red
    complete: '#28A745',     // Green
  },
  
  // Status colors
  status: {
    success: '#28A745',      // Green
    warning: '#FFC107',      // Amber
    error: '#DC3545',        // Red
    info: '#17A2B8',         // Cyan
  },
  
  // Border colors
  border: {
    primary: '#0052A3',      // Dark blue
    secondary: '#DEE2E6',    // Light gray
  },
};
```

#### Dark Mode Colors
```typescript
const professionalDarkColors = {
  // Core brand colors - Brighter for dark mode
  brand: {
    primary: '#4A9EFF',      // Bright blue
    secondary: '#3A8EEF',    // Medium blue
    tertiary: '#5AADFF',     // Lighter blue
  },
  
  // Text colors
  text: {
    primary: '#E9ECEF',      // Light gray for headings
    secondary: '#ADB5BD',    // Medium gray for body
    inverse: '#212529',      // Dark for light backgrounds
  },
  
  // Background colors
  background: {
    primary: '#1A1D23',      // Very dark blue-gray
    secondary: '#22252B',    // Dark blue-gray
    tertiary: '#2A2D35',     // Medium dark gray
  },
  
  // Phase colors (brighter for dark mode)
  phase: {
    init: '#4A9EFF',         // Bright blue
    spec: '#3A8EEF',         // Medium blue
    build: '#9E9E9E',        // Light gray
    test: '#4ECDC4',         // Bright cyan
    fix: '#FF5757',          // Bright red
    complete: '#3DD365',     // Bright green
  },
  
  // Status colors (brighter for dark mode)
  status: {
    success: '#3DD365',      // Bright green
    warning: '#FFD93D',      // Bright amber
    error: '#FF5757',        // Bright red
    info: '#4ECDC4',         // Bright cyan
  },
  
  // Border colors
  border: {
    primary: '#4A9EFF',      // Bright blue
    secondary: '#3A3D45',    // Dark gray
  },
};
```

### Implementation Guidelines

1. **Consistent Sizing**:
   - All interactive elements: 48px height (buttons, inputs, dropdowns)
   - Cards and modals: 24px padding
   - Text inputs: 48px height, 16px font
   - Buttons: 48px height, 16px font, 600 weight
   - Card titles: 24px font, 700 weight
   - Badges: 14px font, 8px/16px padding

2. **Consistent Rounded Corners**:
   - Inputs, buttons, dropdowns: 12px border-radius
   - Cards, modals: 16px border-radius
   - Badges: 20px border-radius (pill shape)
   - Progress bars: 6px border-radius

3. **Professional Color Scheme**:
   - Primary color: Dark blue (#0052A3)
   - Hover color: Darker blue (#003D7A)
   - Text on dark blue: White (#FFFFFF)
   - Text on white: Dark blue (#003D7A)
   - All interactive elements: 2px dark blue borders
   - Backgrounds: White (#FFFFFF) for light mode

4. **Consistent Visual Feedback**:
   - All interactive elements must have hover states
   - Hover states: Darken color (#0052A3 → #003D7A), increase shadow, lift (-2px to -4px)
   - Focus states: Dark blue outline/ring with 4px spread
   - Active states: Remove lift (translateY(0))
   - Disabled states: Gray (#6C757D) with no hover effects

5. **Consistent Spacing**:
   - Card padding: 24px
   - Modal padding: 24px
   - Button padding: 0 24px
   - Input padding: 12px 16px
   - Gap between elements: 12px-16px
   - Section margins: 24px

6. **Typography Consistency**:
   - Headings: Dark blue (#003D7A), bold (700)
   - Body text: Gray (#6C757D), regular (400)
   - Button text: 16px, weight 600
   - Input text: 16px, regular (400)
   - All text: Clear, readable font sizes (minimum 14px)

### Correctness Properties for Visual Enhancements

### Property 30: Consistent rounded corners for inputs
*For any* interactive input element (search, text input, dropdown), it should have a border-radius of exactly 12px.
**Validates: Requirements 16.1**

### Property 31: Consistent rounded corners for containers
*For any* container element (card, modal), it should have a border-radius of exactly 16px.
**Validates: Requirements 16.1, 16.4**

### Property 32: Consistent height for interactive controls
*For any* interactive control (button, input, dropdown), it should have a height of exactly 48px.
**Validates: Requirements 16.3**

### Property 33: Professional color scheme for buttons
*For any* primary button, it should have a dark blue background (#0052A3) with white text (#FFFFFF).
**Validates: Requirements 16.2, 16.3**

### Property 34: Professional color scheme for inputs
*For any* input or dropdown element, it should have a 2px dark blue border (#0052A3), white background (#FFFFFF), and dark blue text (#003D7A).
**Validates: Requirements 16.2, 16.3**

### Property 35: Consistent padding for containers
*For any* card or modal container, it should have exactly 24px padding on all sides.
**Validates: Requirements 16.4**

### Property 36: Consistent hover feedback
*For any* interactive element, hovering should darken the color (e.g., #0052A3 → #003D7A) and apply a translateY lift effect.
**Validates: Requirements 16.5**

## Conclusion

This design provides a comprehensive blueprint for building a professional, scalable, and maintainable frontend application for the Kiro Project Orchestrator. The architecture emphasizes:

- **Modularity**: Clear separation of concerns with reusable components
- **Extensibility**: Easy to add new themes, features, and integrations
- **Performance**: Optimized rendering and efficient API communication
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Developer Experience**: TypeScript for type safety, modern tooling, comprehensive testing
- **Visual Hierarchy**: Enhanced UI elements with vibrant colors, larger sizes, and clear affordances

The theme system is designed to be flexible, allowing easy addition of new themes beyond the initial light and dark modes. The component architecture supports progressive enhancement and can scale to accommodate future features without major refactoring. The visual enhancements ensure that interactive elements are immediately recognizable and provide clear feedback to users.

