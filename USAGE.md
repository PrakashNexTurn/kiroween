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

- `--base-path PATH` - Base directory for project storage (default: .kiro/specs)

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
- `KIRO_BASE_PATH` - Base directory for project storage
- `KIRO_KIRO_CLI_COMMAND` - Command to execute kiro-cli
- `KIRO_CLI_TIMEOUT` - Timeout for CLI commands in seconds
- `KIRO_CORS_ENABLED` - Enable CORS middleware (true/false)
- `KIRO_CORS_ORIGINS` - Allowed CORS origins (JSON array)

### Example .env File

```bash
KIRO_ENVIRONMENT=production
KIRO_HOST=0.0.0.0
KIRO_PORT=8000
KIRO_WORKERS=4
KIRO_LOG_LEVEL=INFO
KIRO_LOG_FILE=orchestrator.log
KIRO_BASE_PATH=.kiro/specs
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

## Logging

Logs are written to both:

1. Console (stdout)
2. Log file (default: `.kiro/specs/orchestrator.log`)

Log files are automatically rotated when they exceed the configured size limit (default: 10 MB).
