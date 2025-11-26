# Kiro Project Orchestrator - Quick Reference

## Server

```bash
# Start server
python main.py

# Production mode
python main.py --env production --port 8080

# API Docs
http://localhost:8000/docs
```

## Essential Commands

### 1. Create Project
```bash
curl -X POST http://localhost:8000/projects/create \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "description": "App description"}'
```

### 2. Generate Specs
```bash
# Requirements
curl -X POST http://localhost:8000/projects/my-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{"specType": "requirements", "description": "Feature description"}'

# Design
curl -X POST http://localhost:8000/projects/my-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{"specType": "design"}'

# Tasks
curl -X POST http://localhost:8000/projects/my-app/spec/generate \
  -H "Content-Type: application/json" \
  -d '{"specType": "tasks"}'
```

### 3. Execute Tasks
```bash
# Single task
curl -X POST http://localhost:8000/projects/my-app/tasks/execute \
  -H "Content-Type: application/json" \
  -d '{"taskNumber": "1.1"}'

# All tasks
curl -X POST http://localhost:8000/projects/my-app/tasks/execute \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Build & Test
```bash
# Build
curl -X POST http://localhost:8000/projects/my-app/build

# Test
curl -X POST http://localhost:8000/projects/my-app/test

# Fix
curl -X POST http://localhost:8000/projects/my-app/fix \
  -H "Content-Type: application/json" \
  -d '{"failureDetails": "Error details"}'
```

### 5. Status & Files
```bash
# Get status
curl http://localhost:8000/projects/my-app/status

# List projects
curl http://localhost:8000/projects

# Read file
curl http://localhost:8000/projects/my-app/files/requirements.md

# Update file
curl -X PUT http://localhost:8000/projects/my-app/files/requirements.md \
  -H "Content-Type: application/json" \
  -d '{"content": "Updated content"}'
```

## Complete Workflow (One-Liner)

```bash
# Create → Requirements → Design → Tasks → Execute → Build → Test
curl -X POST http://localhost:8000/projects/create -H "Content-Type: application/json" -d '{"name":"Todo App","description":"Simple todo"}' && \
curl -X POST http://localhost:8000/projects/todo-app/spec/generate -H "Content-Type: application/json" -d '{"specType":"requirements","description":"Todo with CRUD"}' && \
curl -X POST http://localhost:8000/projects/todo-app/spec/generate -H "Content-Type: application/json" -d '{"specType":"design"}' && \
curl -X POST http://localhost:8000/projects/todo-app/spec/generate -H "Content-Type: application/json" -d '{"specType":"tasks"}' && \
curl -X POST http://localhost:8000/projects/todo-app/tasks/execute -H "Content-Type: application/json" -d '{}' && \
curl -X POST http://localhost:8000/projects/todo-app/build && \
curl -X POST http://localhost:8000/projects/todo-app/test
```

## Response Format

**Success:**
```json
{
  "status": "success",
  "action": "operation-name",
  "projectId": "project-id",
  "output": { /* data */ },
  "logs": "logs"
}
```

**Error:**
```json
{
  "status": "failure",
  "action": "operation-name",
  "projectId": "project-id",
  "output": {
    "error": {
      "code": "ERROR_CODE",
      "message": "Error message",
      "details": {}
    }
  },
  "logs": "error logs"
}
```

## Project Phases

- `INIT` → Project created
- `SPEC` → Generating specs
- `BUILD` → Executing tasks
- `TEST` → Running tests
- `FIX` → Fixing issues
- `COMPLETE` → All done

## Valid File Names

- `requirements.md`
- `design.md`
- `tasks.md`

## Common Errors

| Code | Status | Fix |
|------|--------|-----|
| `PROJECT_NOT_FOUND` | 404 | Check project ID |
| `PROJECT_ALREADY_EXISTS` | 409 | Use different name |
| `INVALID_STATE_TRANSITION` | 409 | Generate prerequisites first |
| `VALIDATION_ERROR` | 400 | Check request format |

## Environment Variables

```bash
export KIRO_ENVIRONMENT=production
export KIRO_HOST=0.0.0.0
export KIRO_PORT=8080
export KIRO_LOG_LEVEL=INFO
```

## Logs

- Console: stdout
- File: `.kiro/specs/orchestrator.log`

## Project Structure

```
.kiro/specs/my-app/
├── project.json          # Metadata
├── requirements.md       # Requirements
├── design.md            # Design
└── tasks.md             # Tasks
```

---

**Full Documentation:** See `API_REFERENCE.md` for complete details.
