# Kiro Project Orchestrator - Logging System

## Overview

The Kiro Project Orchestrator includes a comprehensive logging system that captures all operations, API requests, errors, and system events. The logging system provides both console output and persistent file logging with automatic rotation.

## Features

### 1. Dual Output
- **Console Handler**: Logs INFO level and above to stdout for real-time monitoring
- **File Handler**: Logs DEBUG level and above to `.kiro/specs/orchestrator.log` for detailed analysis

### 2. Automatic Log Rotation
- **Max File Size**: 10 MB per log file
- **Backup Count**: 5 backup files retained
- **Automatic Rotation**: When the log file reaches 10 MB, it's automatically rotated

### 3. Detailed Logging
All log entries include:
- Timestamp (YYYY-MM-DD HH:MM:SS)
- Log level (DEBUG, INFO, WARNING, ERROR)
- Logger name (kiro-orchestrator)
- Function name and line number
- Log message

### 4. Operation Tracking
The `@log_operation` decorator automatically logs:
- Operation start with parameters
- Execution duration
- Success/failure status
- Full stack traces on errors

### 5. API Request Tracking
The `@log_api_request` decorator automatically logs:
- HTTP method and endpoint
- Request parameters
- Response status
- Execution duration
- Error details with stack traces

## Usage

### Basic Logging

```python
from src.logger import get_logger

logger = get_logger()

logger.debug("Detailed debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error message")
```

### Operation Logging

```python
from src.logger import log_operation

@log_operation("create_project")
def create_project(name: str, description: str):
    # Your implementation
    pass
```

This automatically logs:
- Operation start: "Starting operation: create_project"
- Parameters: "Parameters: name=my-project, description=A test project"
- Completion: "Operation completed: create_project | Duration: 0.123s | Status: SUCCESS"
- Or failure: "Operation failed: create_project | Duration: 0.045s | Status: FAILURE | Error: ValueError: ..."

### API Request Logging

```python
from src.logger import log_api_request

@log_api_request("/projects/create", "POST")
async def create_project(request: CreateProjectRequest):
    # Your implementation
    pass
```

This automatically logs:
- Request: "API Request: POST /projects/create"
- Response: "API Response: POST /projects/create | Duration: 0.234s | Status: SUCCESS"
- Or error: "API Error: POST /projects/create | Duration: 0.123s | Error: ..."

### Error Logging with Context

```python
from src.logger import log_error_with_context

try:
    # Some operation
    pass
except Exception as e:
    log_error_with_context(
        error=e,
        context="processing user input",
        additional_info={"user_id": "123", "action": "create"}
    )
```

### Startup/Shutdown Logging

```python
from src.logger import log_startup_info, log_shutdown_info

# At application startup
log_startup_info(
    app_name="Kiro Project Orchestrator",
    version="1.0.0",
    environment="production",
    port=8000
)

# At application shutdown
log_shutdown_info("Kiro Project Orchestrator")
```

## Log File Location

**Primary Log File**: `.kiro/specs/orchestrator.log`

**Rotated Log Files**:
- `.kiro/specs/orchestrator.log.1`
- `.kiro/specs/orchestrator.log.2`
- `.kiro/specs/orchestrator.log.3`
- `.kiro/specs/orchestrator.log.4`
- `.kiro/specs/orchestrator.log.5`

## Log Format

### Console Format
```
2025-11-26 12:31:33 | INFO     | Operation completed successfully
```

### File Format
```
2025-11-26 12:31:33 | INFO     | kiro-orchestrator | create_project:123 | Operation completed successfully
```

## Configuration

The logging system is configured in `src/logger.py`:

```python
LOG_DIR = Path(".kiro/specs")
LOG_FILE = LOG_DIR / "orchestrator.log"
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10 MB
BACKUP_COUNT = 5  # Keep 5 backup files
```

## Integration

The logging system is integrated throughout the application:

1. **FastAPI Application** (`src/app.py`):
   - All API endpoints use `@log_api_request` decorator
   - Startup and shutdown events are logged
   - All operations are tracked

2. **Project Manager** (`src/project_manager.py`):
   - All project operations use `@log_operation` decorator
   - Project creation, loading, and updates are logged

3. **CLI Executor** (`src/cli_executor.py`):
   - CLI command execution is logged with `@log_operation`
   - Command output and errors are captured

## Benefits

1. **Debugging**: Detailed logs help identify issues quickly
2. **Monitoring**: Real-time console output for system monitoring
3. **Auditing**: Persistent logs provide audit trail of all operations
4. **Performance**: Execution duration tracking helps identify bottlenecks
5. **Error Analysis**: Full stack traces aid in error diagnosis
6. **Compliance**: Comprehensive logging meets operational requirements

## Requirements Validation

This logging implementation satisfies all requirements from the specification:

- ✅ **12.1**: Logs all operations with timestamp, type, and parameters
- ✅ **12.2**: Logs execution duration and outcome for all operations
- ✅ **12.3**: Logs full error details with stack traces on failures
- ✅ **12.4**: Writes logs to both console and persistent log files
- ✅ **12.5**: Implements log rotation based on file size (10 MB limit, 5 backups)

## Testing

The logging system includes comprehensive unit tests in `tests/unit/test_logger.py`:

- Singleton pattern verification
- Handler configuration tests
- Operation logging tests
- API request logging tests
- Error logging tests
- Log rotation configuration tests
- Log content and formatting tests

Run tests with:
```bash
python -m pytest tests/unit/test_logger.py -v
```

## Demo

A demonstration script is available at `demo_logging.py`:

```bash
python demo_logging.py
```

This demonstrates:
- Successful operations with timing
- Multiple log levels
- Error handling with stack traces
- Log file information
