# Project Structure

## Repository Organization

This is a monorepo with separate backend and frontend applications:

```
.
├── backend/              # Python FastAPI backend
├── frontend/             # React TypeScript frontend
├── .kiro/               # Kiro specs and steering rules
└── README.md            # Main documentation
```

## Backend Structure

```
backend/
├── src/                          # Application source code
│   ├── app.py                   # FastAPI application and routes
│   ├── config.py                # Configuration management
│   ├── project_manager.py       # Project CRUD operations
│   ├── instruction_generator.py # Instruction generation for kiro-cli
│   ├── cli_executor.py          # CLI command execution
│   ├── file_ops.py              # File system operations
│   ├── models.py                # Pydantic data models
│   ├── response_formatter.py    # API response formatting
│   └── logger.py                # Logging utilities
├── tests/
│   ├── unit/                    # Unit tests
│   ├── property/                # Property-based tests
│   └── integration/             # Integration tests
├── main.py                      # Application entry point
├── requirements.txt             # Python dependencies
├── pyproject.toml               # Project configuration
├── README.md                    # Backend documentation
├── USAGE.md                     # Detailed usage guide
└── API_REFERENCE.md             # API reference
```

### Backend Conventions

- **Models**: Use Pydantic with `model_config = ConfigDict(populate_by_name=True)` for camelCase/snake_case conversion
- **API Responses**: All endpoints return `OrchestratorResponse` format with status, action, projectId, output, and logs
- **Error Handling**: Custom exception handlers for ProjectNotFoundError, ValidationError, etc.
- **Logging**: Use `get_logger()` from `src.logger` with structured logging
- **File Operations**: Use `file_ops.py` abstraction, never direct file I/O
- **Async**: FastAPI endpoints are async where appropriate

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   ├── layout/              # Layout components
│   │   ├── project/             # Project-specific components
│   │   └── task/                # Task-specific components
│   ├── config/                  # Configuration constants
│   ├── contexts/                # React contexts (Theme, etc.)
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Page components
│   ├── services/                # API service layer
│   │   ├── api.ts              # Axios configuration
│   │   └── projectService.ts   # Project API calls
│   ├── styles/
│   │   └── themes/             # Theme definitions
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Root component with routing
│   └── main.tsx                 # Entry point
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint configuration
└── package.json                 # Dependencies and scripts
```

### Frontend Conventions

- **Components**: Functional components with TypeScript
- **Styling**: Tailwind CSS utility classes with CSS variables for theming
- **API Calls**: Use service layer (`services/api.ts`, `services/projectService.ts`)
- **Types**: Define in `types/` directory, use camelCase for API compatibility
- **Hooks**: Custom hooks in `hooks/` directory
- **Routing**: React Router with AnimatePresence for transitions
- **Error Handling**: ErrorBoundary wrapper with toast notifications
- **Path Aliases**: Use `@/` prefix (e.g., `@/components/common/Button`)

## Project Storage Structure

Projects are stored in a configurable base path with the following structure:

```
<base_path>/
└── <project-id>/
    ├── .kiro/
    │   └── specs/
    │       ├── project.json      # Project metadata
    │       ├── requirements.md   # Requirements specification
    │       ├── design.md         # Design document
    │       └── tasks.md          # Task list
    ├── frontend/                 # Frontend code (if applicable)
    ├── backend/                  # Backend code (if applicable)
    └── ...                       # Other project files
```

### Project Metadata (project.json)

```json
{
  "projectId": "my-project",
  "name": "My Project",
  "description": "Project description",
  "phase": "SPEC",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "specGenerated": {
    "requirements": "2024-01-01T00:00:00Z",
    "design": null,
    "tasks": null
  },
  "taskStats": {
    "total": 0,
    "completed": 0,
    "inProgress": 0,
    "pending": 0,
    "failed": 0
  },
  "buildConfig": {
    "buildCommand": null,
    "testCommand": null,
    "language": null
  },
  "completionPercentage": 0.0
}
```

## Naming Conventions

### Backend (Python)
- **Files**: `snake_case.py`
- **Classes**: `PascalCase`
- **Functions/Variables**: `snake_case`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private**: `_leading_underscore`

### Frontend (TypeScript/React)
- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for utilities
- **Components**: `PascalCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **CSS Classes**: Tailwind utilities (no custom classes preferred)

### API
- **Endpoints**: `/kebab-case`
- **JSON Keys**: `camelCase` (frontend) ↔ `snake_case` (backend) with Pydantic conversion
- **Project IDs**: `kebab-case` (sanitized from project names)
