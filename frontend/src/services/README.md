# API Service Layer

This directory contains the API service layer for the Kiro Project Orchestrator Frontend.

## Files

### `api.ts`
Configures the Axios HTTP client with:
- Base URL from environment variables (`VITE_API_BASE_URL`)
- 30-second timeout for long-running operations
- Request interceptor for logging outgoing requests
- Response interceptor for error handling (404, 500, network errors, etc.)

**Key Features:**
- Automatic error transformation to `ApiError` type
- Network error detection and user-friendly messages
- Structured error handling for common HTTP status codes
- Console logging for debugging

### `projectService.ts`
Provides all API methods for interacting with projects:

#### Project Management
- `getProjects()` - Fetch all projects (GET /projects)
- `getProjectStatus(projectId)` - Get detailed project status (GET /projects/{id}/status)
- `createProject(name, description)` - Create new project (POST /projects/create)

#### Spec File Operations
- `readSpecFile(projectId, fileName)` - Read spec file content (GET /projects/{id}/files/{file})
- `updateSpecFile(projectId, fileName, content)` - Update spec file (PUT /projects/{id}/files/{file})
- `generateSpec(projectId, specType, description)` - Generate spec file (POST /projects/{id}/spec/generate)

#### Task Execution
- `executeTask(projectId, taskNumber?)` - Execute task(s) (POST /projects/{id}/tasks/execute)

#### Build & Test Operations
- `buildProject(projectId)` - Build project (POST /projects/{id}/build)
- `testProject(projectId)` - Run tests (POST /projects/{id}/test)
- `fixProject(projectId, failureDetails)` - Auto-fix issues (POST /projects/{id}/fix)

### `index.ts`
Central export point for all service modules.

## Usage

```typescript
import { projectService, getApiBaseUrl } from '@/services';

// Fetch all projects
const projects = await projectService.getProjects();

// Get project status
const status = await projectService.getProjectStatus('my-project');

// Create a new project
const response = await projectService.createProject(
  'My Project',
  'Project description'
);

// Read a spec file
const spec = await projectService.readSpecFile('my-project', 'requirements.md');

// Update a spec file
await projectService.updateSpecFile(
  'my-project',
  'requirements.md',
  '# Updated content'
);

// Generate a spec
await projectService.generateSpec(
  'my-project',
  'requirements',
  'Create a todo app'
);

// Execute a task
await projectService.executeTask('my-project', '1.1');

// Build project
await projectService.buildProject('my-project');

// Run tests
await projectService.testProject('my-project');

// Fix issues
await projectService.fixProject('my-project', 'Test failure details');
```

## Error Handling

All service methods throw `ApiError` objects on failure:

```typescript
interface ApiError {
  code: string;
  message: string;
  details: Record<string, any>;
}
```

Common error codes:
- `NETWORK_ERROR` - Unable to connect to server
- `NOT_FOUND` - Resource not found (404)
- `UNAUTHORIZED` - Authentication/authorization error (401/403)
- `SERVER_ERROR` - Internal server error (500)
- `UNKNOWN_ERROR` - Unexpected error

Example error handling:

```typescript
try {
  const projects = await projectService.getProjects();
} catch (error: any) {
  if (error.code === 'NETWORK_ERROR') {
    // Handle network error
    console.error('Cannot connect to server:', error.message);
  } else if (error.code === 'NOT_FOUND') {
    // Handle not found
    console.error('Resource not found:', error.message);
  } else {
    // Handle other errors
    console.error('Error:', error.message);
  }
}
```

## Configuration

The API base URL is configured via environment variable:

```bash
# .env
VITE_API_BASE_URL=http://54.146.195.175:8000
```

To get the current API base URL:

```typescript
import { getApiBaseUrl } from '@/services';

const baseUrl = getApiBaseUrl();
console.log('API Base URL:', baseUrl);
```

## Testing

A test component is available at `src/components/common/ApiTest.tsx` for manual verification of the API service.

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 1.5**: Fetch project data from Backend API
- **Requirement 3.2**: Send POST request to create projects
- **Requirement 4.2**: Fetch project status from Backend API
- **Requirement 5.2**: Fetch spec file content from Backend API
- **Requirement 5.5**: Send PUT request to update spec files
- **Requirement 6.3**: Send POST request to generate specs
- **Requirement 7.3**: Send POST request to execute tasks
- **Requirement 9.2**: Send POST request to build projects
- **Requirement 9.4**: Send POST request to run tests
- **Requirement 10.2**: Send POST request to fix issues
- **Requirement 13.1**: Read backend API URL from environment configuration
- **Requirement 13.3**: Use configured backend URL as base URL
- **Requirement 13.4**: Handle backend unreachable and authentication errors

## Next Steps

The API service layer is now complete and ready to be used by:
- Custom hooks (useProjects, useProjectDetail, etc.)
- Page components (ProjectBoard, ProjectDetail, etc.)
- UI components that need to interact with the backend
