# Kiro Project Orchestrator - API Reference

Complete API reference with curl examples for all endpoints.

## Table of Contents
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
  - [Health Check](#1-health-check)
  - [Create Project](#2-create-project)
  - [List Projects](#3-list-projects)
  - [Get Project Status](#4-get-project-status)
  - [Generate Requirements](#5-generate-requirements)
  - [Generate Design](#6-generate-design)
  - [Generate Tasks](#7-generate-tasks)
  - [Read Spec File](#8-read-spec-file)
  - [Update Spec File](#9-update-spec-file)
  - [Execute Specific Task](#10-execute-specific-task)
  - [Execute All Tasks](#11-execute-all-tasks)
  - [Build Project](#12-build-project)
  - [Run Tests](#13-run-tests)
  - [Fix Issues](#14-fix-issues)
- [Complete Workflow](#complete-workflow)
- [Response Format](#response-format)
- [Error Codes](#error-codes)

---

## Quick Start

```bash
# Start the server
python main.py

# Server runs at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

---

## API Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint:** `GET /health`

```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "kiro-project-orchestrator",
  "version": "1.0.0"
}
```

---

### 2. Create Project

Create a new project with a name and description.

**Endpoint:** `POST /projects/create`

```bash
curl -X POST http://localhost:8000/projects/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Todo App",
    "description": "A simple todo list application with user authentication"
  }'
```

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (required)"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "create-project",
  "projectId": "my-todo-app",
  "output": {
    "projectId": "my-todo-app",
    "name": "My Todo App",
    "description": "A simple todo list application with user authentication",
    "phase": "INIT",
    "createdAt": "2025-11-26T10:30:00Z",
    "updatedAt": "2025-11-26T10:30:00Z"
  },
  "logs": "Project created successfully"
}
```

**Notes:**
- Project names are automatically sanitized to kebab-case
- Creates directory at `.kiro/specs/<project-id>/`
- Initializes empty spec files

---

### 3. List Projects

Get a list of all projects.

**Endpoint:** `GET /projects`

```bash
curl http://localhost:8000/projects
```

**Response:**
```json
{
  "status": "success",
  "action": "list-projects",
  "projectId": "all",
  "output": {
    "projects": [
      {
        "projectId": "my-todo-app",
        "name": "My Todo App",
        "phase": "SPEC",
        "completionPercentage": 25.0,
        "createdAt": "2025-11-26T10:30:00Z",
        "updatedAt": "2025-11-26T10:35:00Z"
      }
    ],
    "total": 1
  },
  "logs": "Listed 1 projects"
}
```

---

### 4. Get Project Status

Get detailed status of a specific project.

**Endpoint:** `GET /projects/{project_id}/status`

```bash
curl http://localhost:8000/projects/my-todo-app/status
```

**Response:**
```json
{
  "status": "success",
  "action": "get-status",
  "projectId": "my-todo-app",
  "output": {
    "projectId": "my-todo-app",
    "name": "My Todo App",
    "phase": "BUILD",
    "completionPercentage": 45.0,
    "taskStats": {
      "total": 20,
      "completed": 9,
      "inProgress": 1,
      "pending": 10,
      "failed": 0
    },
    "specGenerated": {
      "requirements": "2025-11-26T10:31:00Z",
      "design": "2025-11-26T10:33:00Z",
      "tasks": "2025-11-26T10:35:00Z"
    },
    "nextAction": "Execute task 1.2 or continue with remaining tasks",
    "createdAt": "2025-11-26T10:30:00Z",
    "updatedAt": "2025-11-26T11:15:00Z"
  },
  "logs": "Project status retrieved"
}
```

**Project Phases:**
- `INIT` - Project created, no specs generated
- `SPEC` - Generating or editing specifications
- `BUILD` - Executing implementation tasks
- `TEST` - Running tests
- `FIX` - Fixing issues
- `COMPLETE` - All tasks completed

---

### 5. Generate Requirements

Generate requirements.md from project description.

**Endpoint:** `POST /projects/{project_id}/spec/generate`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{
    "specType": "requirements",
    "description": "A todo app with user authentication, task creation, completion tracking, and deletion. Users should be able to filter tasks by status."
  }'
```

**Request Body:**
```json
{
  "specType": "requirements",
  "description": "string (required)"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "generate-spec-requirements",
  "projectId": "my-todo-app",
  "output": {
    "specType": "requirements",
    "filePath": ".kiro/specs/my-todo-app/requirements.md",
    "generatedAt": "2025-11-26T10:31:00Z"
  },
  "logs": "Requirements generated successfully via kiro-cli"
}
```

---

### 6. Generate Design

Generate design.md based on requirements.

**Endpoint:** `POST /projects/{project_id}/spec/generate`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{
    "specType": "design",
    "description": "Design a React-based frontend with FastAPI backend"
  }'
```

**Request Body:**
```json
{
  "specType": "design",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "generate-spec-design",
  "projectId": "my-todo-app",
  "output": {
    "specType": "design",
    "filePath": ".kiro/specs/my-todo-app/design.md",
    "generatedAt": "2025-11-26T10:33:00Z"
  },
  "logs": "Design generated successfully via kiro-cli"
}
```

**Prerequisites:** Requires `requirements.md` to exist.

---

### 7. Generate Tasks

Generate tasks.md implementation plan from design.

**Endpoint:** `POST /projects/{project_id}/spec/generate`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{
    "specType": "tasks",
    "description": "Create detailed implementation tasks"
  }'
```

**Request Body:**
```json
{
  "specType": "tasks",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "generate-spec-tasks",
  "projectId": "my-todo-app",
  "output": {
    "specType": "tasks",
    "filePath": ".kiro/specs/my-todo-app/tasks.md",
    "generatedAt": "2025-11-26T10:35:00Z"
  },
  "logs": "Tasks generated successfully via kiro-cli"
}
```

**Prerequisites:** Requires `design.md` to exist.

---

### 8. Read Spec File

Read the content of a spec file.

**Endpoint:** `GET /projects/{project_id}/files/{file_name}`

```bash
# Read requirements
curl http://localhost:8000/projects/my-todo-app/files/requirements.md

# Read design
curl http://localhost:8000/projects/my-todo-app/files/design.md

# Read tasks
curl http://localhost:8000/projects/my-todo-app/files/tasks.md
```

**Valid file names:**
- `requirements.md`
- `design.md`
- `tasks.md`

**Response:**
```json
{
  "status": "success",
  "action": "read-file",
  "projectId": "my-todo-app",
  "output": {
    "projectId": "my-todo-app",
    "fileName": "requirements.md",
    "content": "# Requirements Document\n\n## Introduction\n...",
    "metadata": {
      "projectName": "My Todo App",
      "phase": "SPEC",
      "updatedAt": "2025-11-26T10:31:00Z"
    }
  },
  "logs": "File read successfully"
}
```

---

### 9. Update Spec File

Update the content of a spec file.

**Endpoint:** `PUT /projects/{project_id}/files/{file_name}`

```bash
curl -X PUT http://localhost:8000/projects/my-todo-app/files/requirements.md \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Updated Requirements\n\n## Introduction\n\nThis is the updated requirements document..."
  }'
```

**Request Body:**
```json
{
  "content": "string (required)"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "update-file-requirements.md",
  "projectId": "my-todo-app",
  "output": {
    "file_name": "requirements.md",
    "updated_at": "2025-11-26T11:20:00Z"
  },
  "logs": "File updated successfully via kiro-cli"
}
```

---

### 10. Execute Specific Task

Execute a single task by task number.

**Endpoint:** `POST /projects/{project_id}/tasks/execute`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/tasks/execute \
  -H "Content-Type: application/json" \
  -d '{
    "taskNumber": "1.1"
  }'
```

**Request Body:**
```json
{
  "taskNumber": "string (required) - e.g., '1.1', '2.3'"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "execute-tasks",
  "projectId": "my-todo-app",
  "output": {
    "task_number": "1.1",
    "phase": "BUILD",
    "completion_percentage": 50.0,
    "task_stats": {
      "total": 20,
      "completed": 10,
      "inProgress": 0,
      "pending": 10,
      "failed": 0
    }
  },
  "logs": "Task 1.1 executed successfully via kiro-cli"
}
```

---

### 11. Execute All Tasks

Execute all tasks in sequence.

**Endpoint:** `POST /projects/{project_id}/tasks/execute`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/tasks/execute \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "status": "success",
  "action": "execute-tasks",
  "projectId": "my-todo-app",
  "output": {
    "task_number": "all",
    "phase": "COMPLETE",
    "completion_percentage": 100.0,
    "task_stats": {
      "total": 20,
      "completed": 20,
      "inProgress": 0,
      "pending": 0,
      "failed": 0
    }
  },
  "logs": "All tasks executed successfully"
}
```

**Notes:**
- Executes tasks sequentially in order
- Stops on first failure
- Updates project phase to COMPLETE when all tasks done

---

### 12. Build Project

Run the project build command.

**Endpoint:** `POST /projects/{project_id}/build`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/build
```

**Response:**
```json
{
  "status": "success",
  "action": "build-project",
  "projectId": "my-todo-app",
  "output": {
    "build_status": "success",
    "build_logs": "Building project...\nBuild completed successfully"
  },
  "logs": "Build executed via kiro-cli"
}
```

---

### 13. Run Tests

Execute project tests.

**Endpoint:** `POST /projects/{project_id}/test`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/test
```

**Response:**
```json
{
  "status": "success",
  "action": "test-project",
  "projectId": "my-todo-app",
  "output": {
    "test_status": "passed",
    "tests_passed": 45,
    "tests_failed": 0,
    "test_logs": "Running tests...\n45 tests passed"
  },
  "logs": "Tests executed via kiro-cli"
}
```

---

### 14. Fix Issues

Auto-fix failing tests or build issues.

**Endpoint:** `POST /projects/{project_id}/fix`

```bash
curl -X POST http://localhost:8000/projects/my-todo-app/fix \
  -H "Content-Type: application/json" \
  -d '{
    "failureDetails": "Test failed: test_user_login - AssertionError: Expected status 200, got 401"
  }'
```

**Request Body:**
```json
{
  "failureDetails": "string (required)"
}
```

**Response:**
```json
{
  "status": "success",
  "action": "fix-project",
  "projectId": "my-todo-app",
  "output": {
    "fix_status": "success",
    "files_modified": ["src/auth.py", "tests/test_auth.py"],
    "retest_results": {
      "test_status": "passed",
      "tests_passed": 45,
      "tests_failed": 0
    }
  },
  "logs": "Issues fixed and retested via kiro-cli"
}
```

---

## Complete Workflow

Here's a complete end-to-end workflow:

```bash
# 1. Create project
curl -X POST http://localhost:8000/projects/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Todo App", "description": "A simple todo list application"}'

# 2. Generate requirements
curl -X POST http://localhost:8000/projects/todo-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{"specType": "requirements", "description": "Todo app with task creation, completion, and deletion"}'

# 3. Review requirements (optional)
curl http://localhost:8000/projects/todo-app/files/requirements.md

# 4. Generate design
curl -X POST http://localhost:8000/projects/todo-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{"specType": "design", "description": "React frontend with FastAPI backend"}'

# 5. Review design (optional)
curl http://localhost:8000/projects/todo-app/files/design.md

# 6. Generate tasks
curl -X POST http://localhost:8000/projects/todo-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{"specType": "tasks", "description": "Implementation tasks"}'

# 7. Review tasks (optional)
curl http://localhost:8000/projects/todo-app/files/tasks.md

# 8. Execute all tasks
curl -X POST http://localhost:8000/projects/todo-app/tasks/execute \
  -H "Content-Type: application/json" \
  -d '{}'

# 9. Build project
curl -X POST http://localhost:8000/projects/todo-app/build

# 10. Run tests
curl -X POST http://localhost:8000/projects/todo-app/test

# 11. If tests fail, fix issues
curl -X POST http://localhost:8000/projects/todo-app/fix \
  -H "Content-Type: application/json" \
  -d '{"failureDetails": "Test failures from previous step"}'

# 12. Check final status
curl http://localhost:8000/projects/todo-app/status
```

---

## Response Format

### Success Response

```json
{
  "status": "success",
  "action": "operation-name",
  "projectId": "project-id",
  "output": {
    // Operation-specific data
  },
  "logs": "Operation logs"
}
```

### Error Response

```json
{
  "status": "failure",
  "action": "operation-name",
  "projectId": "project-id",
  "output": {
    "error": {
      "code": "ERROR_CODE",
      "message": "Human-readable error message",
      "details": {
        // Error-specific details
      }
    }
  },
  "logs": "Error logs and stack trace"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PROJECT_NOT_FOUND` | 404 | Project doesn't exist |
| `PROJECT_ALREADY_EXISTS` | 409 | Duplicate project name |
| `INVALID_PROJECT_NAME` | 400 | Invalid project name format |
| `INVALID_STATE_TRANSITION` | 409 | Operation not allowed in current state |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `TASK_EXECUTION_FAILED` | 500 | Task execution error |
| `CLI_EXECUTION_ERROR` | 500 | kiro-cli execution failed |
| `FILE_NOT_FOUND` | 404 | Requested file doesn't exist |
| `INVALID_FILE_NAME` | 400 | Invalid file name (must be requirements.md, design.md, or tasks.md) |

---

## Tips & Best Practices

1. **Always check status** before executing tasks to ensure specs are generated
2. **Review generated specs** before executing tasks to ensure quality
3. **Execute tasks incrementally** for better control and debugging
4. **Monitor logs** for detailed execution information
5. **Use fix endpoint** when tests fail for automatic issue resolution
6. **Keep project names descriptive** but concise (they become directory names)

---

## Interactive API Documentation

Once the server is running, access interactive documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Need Help?

- Check logs at `.kiro/specs/orchestrator.log`
- Review project metadata at `.kiro/specs/<project-id>/project.json`
- Ensure kiro-cli is installed and accessible in PATH
- Verify all spec files exist before executing dependent operations
