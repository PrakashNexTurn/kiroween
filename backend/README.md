# Kiro Project Orchestrator - Backend

A backend system for automating software project lifecycles with support for multi-project management.

## Features

- **Multi-Project Support**: Manage multiple projects with separate base paths
- **Spec-Driven Development**: Create requirements, design documents, and task lists
- **Automated Code Generation**: Execute tasks using kiro-cli integration
- **RESTful API**: Full API for project management and orchestration
- **Flexible Configuration**: Environment-based configuration with CLI overrides

## Quick Start

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Start the server:
   ```bash
   python main.py
   ```

The server will start on `http://0.0.0.0:8000` by default.

## Configuration

### Base Path Configuration

The orchestrator supports a configurable base path for organizing multiple projects. Each project gets its own directory containing both specs and code.

**Environment Variable:**
```bash
KIRO_BASE_PATH=/path/to/projects
```

**Directory Structure:**
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
  │   └── backend/
  └── project2/
      ├── .kiro/
      │   └── specs/
      └── src/
```

**Backward Compatibility:**
Set `KIRO_BASE_PATH=.` to use the legacy flat structure (`.kiro/specs/project_id/`).

### Other Configuration Options

See [USAGE.md](USAGE.md) for detailed configuration options including:
- Server settings (host, port, workers)
- Logging configuration
- CLI integration
- CORS settings

## API Documentation

Once running, access the interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

For complete API reference with curl examples, see [API_REFERENCE.md](API_REFERENCE.md).

## Project Structure

```
backend/
├── src/                    # Application source code
│   ├── app.py             # FastAPI application
│   ├── config.py          # Configuration management
│   ├── project_manager.py # Project operations
│   ├── instruction_generator.py # Instruction generation
│   ├── cli_executor.py    # CLI command execution
│   ├── file_ops.py        # File operations
│   ├── models.py          # Data models
│   ├── response_formatter.py # Response formatting
│   └── logger.py          # Logging system
├── tests/                 # Test suite
│   ├── unit/             # Unit tests
│   ├── property/         # Property-based tests
│   └── integration/      # Integration tests
├── main.py               # Application entry point
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Project configuration
├── .env.example          # Example environment configuration
├── README.md             # This file
├── USAGE.md              # Detailed usage guide
└── API_REFERENCE.md      # Complete API reference
```

## Usage

See [USAGE.md](USAGE.md) for detailed usage instructions including:
- Starting the server
- Command-line options
- Environment configuration
- Multi-project setup
- Migration guide

## Development

### Running Tests

```bash
# Run all tests
pytest

# Run specific test suite
pytest tests/unit/
pytest tests/property/
pytest tests/integration/

# Run with coverage
pytest --cov=src
```

### Development Mode

Start with auto-reload:
```bash
python main.py --reload --log-level DEBUG
```

## Documentation

- **[USAGE.md](USAGE.md)** - Comprehensive usage guide with examples
- **[API_REFERENCE.md](API_REFERENCE.md)** - Complete API reference with curl examples

## Requirements

- Python 3.8+
- kiro-cli (must be available in PATH or configured via `KIRO_KIRO_CLI_COMMAND`)
- FastAPI
- Uvicorn
- Pydantic

See `requirements.txt` for complete list of dependencies.

## License

[Add your license here]
