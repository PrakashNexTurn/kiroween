# Kiro Project Orchestrator - Usage Guide

## Starting the Server

### Basic Usage

Start the server with default settings (development mode):

```bash
python main.py
```

This will start the server on `http://0.0.0.0:8000` with development settings.

### Command-Line Options

```bash
python main.py [OPTIONS]
```

#### Server Configuration

- `--host HOST` - Server host address (default: 0.0.0.0)
- `--port PORT` - Server port number (default: 8000)
- `--workers N` - Number of worker processes (default: 1 for dev, 4 for prod)
- `--reload` - Enable auto-reload on code changes (development only)
- `--no-reload` - Disable auto-reload

#### Environment Configuration

- `--env {development,production,testing}` - Application environment
- `--debug` - Enable debug mode

#### Logging Configuration

- `--log-level {DEBUG,INFO,WARNING,ERROR,CRITICAL}` - Logging level
- `--log-file PATH` - Path to log file (relative to base path or absolute)

#### Storage Configuration

- `--base-path PATH` - Base directory for project storage (root for all projects, default: .)

### Examples

#### Development Mode

Start with auto-reload enabled:

```bash
python main.py --reload --log-level DEBUG
```

#### Production Mode

Start in production mode with multiple workers:

```bash
python main.py --env production --workers 4 --port 8080
```

#### Custom Configuration

Start with custom host, port, and log file:

```bash
python main.py --host 127.0.0.1 --port 9000 --log-file /var/log/orchestrator.log
```

## Multi-Project Structure

### Overview

The orchestrator supports managing multiple projects with a configurable base path. Each project has its own directory containing both specs and code, enabling better organization and isolation.

### Directory Structure

**New Multi-Project Structure:**
```
<base_path>/
  ├── project1/
  │   ├── .kiro/
  │   │   └── specs/
  │   │       ├── project.json
  │   │       ├── requirements.md
  │   │       ├── design.md
  │   │       └── tasks.md
  │   ├── frontend/
  │   ├── backend/
  │   └── package.json
  └── project2/
      ├── .kiro/
      │   └── specs/
      │       ├── project.json
      │       ├── requirements.md
      │       ├── design.md
      │       └── tasks.md
      └── src/
```

**Legacy Flat Structure (Backward Compatible):**
```
.kiro/specs/
  ├── project1/
  │   ├── project.json
  │   ├── requirements.md
  │   ├── design.md
  │   └── tasks.md
  └── project2/
      ├── project.json
      ├── requirements.md
      ├── design.md
      └── tasks.md
```

### Configuring Base Path

Set the `KIRO_BASE_PATH` environment variable to specify where projects are stored:

```bash
# Multi-project structure (recommended)
KIRO_BASE_PATH=/home/user/projects

# Relative path
KIRO_BASE_PATH=./my-projects

# Backward compatible (legacy flat structure)
KIRO_BASE_PATH=.
```

### Example: Creating a Multi-Project Setup

1. **Configure base path:**
   ```bash
   export KIRO_BASE_PATH=/home/user/projects
   ```

2. **Start the orchestrator:**
   ```bash
   python main.py
   ```

3. **Create projects via API:**
   ```bash
   # Create project1
   curl -X POST http://localhost:8000/projects \
     -H "Content-Type: application/json" \
     -d '{"project_id": "project1", "name": "My First Project"}'
   
   # Create project2
   curl -X POST http://localhost:8000/projects \
     -H "Content-Type: application/json" \
     -d '{"project_id": "project2", "name": "My Second Project"}'
   ```

4. **Result:**
   ```
   /home/user/projects/
     ├── project1/.kiro/specs/
     └── project2/.kiro/specs/
   ```

### Migration Guide

#### Migrating from Legacy Structure to Multi-Project Structure

If you have existing projects in the legacy `.kiro/specs/` structure and want to migrate to the new multi-project structure:

**Option 1: Manual Migration**

```bash
# Set your desired base path
BASE_PATH=/home/user/projects

# For each project, create the new structure
mkdir -p $BASE_PATH/project1/.kiro
mv .kiro/specs/project1 $BASE_PATH/project1/.kiro/specs

mkdir -p $BASE_PATH/project2/.kiro
mv .kiro/specs/project2 $BASE_PATH/project2/.kiro/specs

# Update your environment configuration
echo "KIRO_BASE_PATH=$BASE_PATH" >> .env
```

**Option 2: Keep Legacy Structure**

To continue using the legacy flat structure, simply set:
```bash
KIRO_BASE_PATH=.
```

This maintains backward compatibility with existing projects.

**Important Notes:**
- The orchestrator does NOT automatically migrate projects
- Choose one structure and stick with it for consistency
- When using multi-project structure, generated code will be placed in the project root (`<base_path>/<project_id>/`)
- When using legacy structure, you'll need to manually organize generated code

### Working Directory for Code Generation

When executing tasks with kiro-cli:

- **Multi-project structure**: Working directory is `<base_path>/<project_id>/`
- **Legacy structure**: Working directory is current directory (`.`)

This means generated code automatically goes into the correct project directory when using the multi-project structure.

## Environment Variables

You can also configure the server using environment variables. Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your settings
```

### Available Environment Variables

All environment variables are prefixed with `KIRO_`:

- `KIRO_HOST` - Server host address
- `KIRO_PORT` - Server port number
- `KIRO_WORKERS` - Number of worker processes
- `KIRO_RELOAD` - Enable auto-reload (true/false)
- `KIRO_ENVIRONMENT` - Application environment (development/production/testing)
- `KIRO_DEBUG` - Enable debug mode (true/false)
- `KIRO_LOG_LEVEL` - Logging level
- `KIRO_LOG_FILE` - Path to log file
- `KIRO_LOG_MAX_BYTES` - Maximum log file size before rotation
- `KIRO_LOG_BACKUP_COUNT` - Number of backup log files to keep
- `KIRO_BASE_PATH` - Base directory for project storage (root for all projects)
- `KIRO_KIRO_CLI_COMMAND` - Command to execute kiro-cli
- `KIRO_CLI_TIMEOUT` - Timeout for CLI commands in seconds
- `KIRO_CORS_ENABLED` - Enable CORS middleware (true/false)
- `KIRO_CORS_ORIGINS` - Allowed CORS origins (JSON array)

### Example .env File

**Multi-Project Setup:**
```bash
KIRO_ENVIRONMENT=production
KIRO_HOST=0.0.0.0
KIRO_PORT=8000
KIRO_WORKERS=4
KIRO_LOG_LEVEL=INFO
KIRO_LOG_FILE=orchestrator.log
KIRO_BASE_PATH=/home/user/projects
```

**Legacy Setup (Backward Compatible):**
```bash
KIRO_ENVIRONMENT=production
KIRO_HOST=0.0.0.0
KIRO_PORT=8000
KIRO_WORKERS=4
KIRO_LOG_LEVEL=INFO
KIRO_LOG_FILE=orchestrator.log
KIRO_BASE_PATH=.
```

## Configuration Priority

Settings are loaded in the following order (later sources override earlier ones):

1. Default values in code
2. Environment-specific defaults (DevelopmentSettings, ProductionSettings, TestingSettings)
3. Environment variables (prefixed with `KIRO_`)
4. `.env` file
5. Command-line arguments

## Environment Presets

### Development

- Debug mode enabled
- Auto-reload enabled
- Log level: DEBUG
- Single worker process

### Production

- Debug mode disabled
- Auto-reload disabled
- Log level: INFO
- 4 worker processes
- CORS origins must be explicitly configured

### Testing

- Debug mode enabled
- Log level: DEBUG
- Base path: .kiro/specs/test

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Health Check

Check if the server is running:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "kiro-project-orchestrator"
}
```

## Stopping the Server

Press `CTRL+C` to gracefully stop the server.

## Troubleshooting

### Port Already in Use

If you get an error that the port is already in use, either:

1. Stop the process using that port
2. Use a different port: `python main.py --port 8001`

### Permission Denied

If you get permission errors when creating directories or log files:

1. Check file permissions
2. Use a different base path: `python main.py --base-path /path/to/writable/directory`

### Auto-reload Not Working

Auto-reload requires a single worker process. If you have multiple workers configured, auto-reload will be automatically disabled.

### Project Not Found

If you get "project not found" errors:

1. Check that `KIRO_BASE_PATH` is set correctly
2. Verify the project directory exists at `<base_path>/<project_id>/`
3. Ensure `.kiro/specs/project.json` exists in the project directory
4. Check the logs for the full expected path

### Base Path Configuration Issues

If projects aren't being created or found:

1. Verify `KIRO_BASE_PATH` points to a valid, writable directory
2. Check that the path exists or can be created
3. For relative paths, ensure they're relative to where you start the server
4. Use absolute paths to avoid confusion: `KIRO_BASE_PATH=/home/user/projects`

## Logging

Logs are written to both:

1. Console (stdout)
2. Log file (default: `.kiro/specs/orchestrator.log`)

Log files are automatically rotated when they exceed the configured size limit (default: 10 MB).
