# Design Document

## Overview

This design modifies the Kiro Project Orchestrator to support a configurable base path for projects, enabling a multi-project directory structure where each project has its own folder containing both specs and code. The key change is moving from a flat `.kiro/specs/{project_id}` structure to a hierarchical `<base_path>/{project_id}/.kiro/specs` structure.

## Architecture

The architecture remains largely unchanged, with modifications focused on path resolution:

1. **Configuration Layer** (`src/config.py`): Reads `KIRO_BASE_PATH` from environment
2. **Project Manager** (`src/project_manager.py`): Constructs project paths using base path
3. **Instruction Generator** (`src/instruction_generator.py`): Generates instructions with correct paths
4. **File Operations** (`src/file_ops.py`): No changes needed (already path-agnostic)

### Path Structure

**Current Structure:**
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

**New Structure:**
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
      │       ├── project.json
      │       ├── requirements.md
      │       ├── design.md
      │       └── tasks.md
      ├── frontend/
      └── backend/
```

## Components and Interfaces

### 1. Configuration (`src/config.py`)

**Changes:**
- Update `base_path` field to accept absolute paths
- Add validation for base path existence
- Update `.env.example` with new `KIRO_BASE_PATH` format

**Interface:**
```python
class Settings(BaseSettings):
    base_path: Path  # Now represents the root for all projects
```

### 2. Project Manager (`src/project_manager.py`)

**Changes:**
- Modify `create_project()` to create `<base_path>/<project_id>/.kiro/specs/` structure
- Update `load_project()` to construct paths using new structure
- Modify `list_projects()` to scan base path for project directories
- Update all path construction logic

**Key Methods:**
```python
def _get_project_root(self, project_id: str) -> Path:
    """Get the root directory for a project."""
    return self.base_path / project_id

def _get_spec_dir(self, project_id: str) -> Path:
    """Get the spec directory for a project."""
    return self._get_project_root(project_id) / ".kiro" / "specs"
```

### 3. Instruction Generator (`src/instruction_generator.py`)

**Changes:**
- Update all instruction templates to use `<base_path>/<project_id>/.kiro/specs/` for spec files
- Update task execution instructions to use `<base_path>/<project_id>/` as working directory
- Pass base path information to instruction generator

**Modified Instructions:**
- Spec generation: Reference `.kiro/specs/` within project directory
- Task execution: Use project root as working directory
- Build/Test: Reference project root

### 4. CLI Executor (`src/cli_executor.py`)

**Changes:**
- Update working directory to project root (`<base_path>/<project_id>/`)
- Ensure kiro-cli executes in the correct context

## Data Models

### Project Model

**Changes to `Project` class:**
```python
@dataclass
class Project:
    metadata: ProjectMetadata
    project_root: str  # NEW: <base_path>/<project_id>/
    spec_dir: str      # NEW: <base_path>/<project_id>/.kiro/specs/
    requirements_path: str
    design_path: str
    tasks_path: str
```

### ProjectMetadata

No changes required - metadata structure remains the same.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Base path configuration loading
*For any* valid environment configuration, when the system starts, the loaded base path should match the `KIRO_BASE_PATH` environment variable value
**Validates: Requirements 1.1**

### Property 2: Path construction consistency
*For any* base path and project ID, all constructed paths (spec dir, requirements, design, tasks) should be relative to `<base_path>/<project_id>/.kiro/specs/`
**Validates: Requirements 1.5, 4.4**

### Property 3: Project directory structure creation
*For any* project creation request, the resulting directory structure should contain `<base_path>/<project_id>/.kiro/specs/` with all required spec files
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 4: Project discovery completeness
*For any* set of projects created under the base path, the list_projects operation should return all projects that have a valid `.kiro/specs/project.json` file
**Validates: Requirements 2.5**

### Property 5: Instruction path correctness
*For any* instruction generation (spec, task, build, test, fix), the generated instruction should reference paths relative to the configured base path
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

### Property 6: Metadata persistence location
*For any* project metadata save operation, the metadata file should be written to `<base_path>/<project_id>/.kiro/specs/project.json`
**Validates: Requirements 4.5**

### Property 7: Logging path completeness
*For any* path-related log message, the logged path should be the full resolved absolute path
**Validates: Requirements 5.5**

## Error Handling

### Path Validation Errors

1. **Invalid Base Path**: If base path cannot be created or accessed, log error and fail startup
2. **Project Not Found**: Return 404 with clear message indicating expected path
3. **Missing Spec Files**: Return error with list of missing files and their expected locations
4. **Permission Errors**: Log permission error with affected path and operation

### Error Response Format

All path-related errors should include:
- Error code (e.g., `PATH_NOT_FOUND`, `PERMISSION_DENIED`)
- Descriptive message
- Full path that caused the error
- Suggested resolution

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Configuration loading with various `KIRO_BASE_PATH` values
- Path construction methods in ProjectManager
- Instruction generation with different base paths
- Project listing with various directory structures
- Error handling for invalid paths

### Property-Based Testing

Property-based tests will use the Hypothesis library for Python. Each test will run a minimum of 100 iterations.

**Test Strategy:**
1. Generate random base paths and project IDs
2. Verify path construction properties hold
3. Test with various directory structures
4. Validate instruction generation correctness

**Generators:**
- Valid project IDs (kebab-case strings)
- Valid file system paths
- Project metadata with various configurations

### Integration Testing

Integration tests will verify:
- End-to-end project creation with custom base path
- Project loading and listing across multiple projects
- Instruction execution with kiro-cli in correct working directory
- Backward compatibility with base path set to "."

### Manual Testing

Manual testing scenarios:
1. Set `KIRO_BASE_PATH` to a custom directory and create projects
2. Verify generated code appears in project root
3. Test with multiple projects in different base paths
4. Verify backward compatibility with existing projects

## Implementation Notes

### Migration Strategy

No automatic migration is provided. Users must manually move projects if they want to use the new structure:

```bash
# Old structure: .kiro/specs/project1/
# New structure: /path/to/projects/project1/.kiro/specs/

mkdir -p /path/to/projects/project1/.kiro/
mv .kiro/specs/project1 /path/to/projects/project1/.kiro/specs
```

### Configuration Example

Update `.env`:
```
# For new multi-project structure
KIRO_BASE_PATH=/path/to/projects

# For backward compatibility
KIRO_BASE_PATH=.
```

### Path Resolution

All path operations should:
1. Resolve base path to absolute path at startup
2. Construct project paths using `Path` objects for cross-platform compatibility
3. Log full resolved paths for debugging
4. Validate paths before operations

### CLI Executor Changes

The CLI executor should:
1. Set working directory to project root (`<base_path>/<project_id>/`)
2. Pass spec directory path in instructions
3. Ensure kiro-cli has access to both spec files and project code

## Dependencies

- No new external dependencies required
- Uses existing `pathlib.Path` for path operations
- Leverages existing `pydantic` for configuration validation

## Performance Considerations

- Path resolution happens once at startup (base path)
- Project path construction is lightweight (string concatenation)
- No performance impact on existing operations
- Project listing may be slightly slower if base path contains many directories (mitigated by checking for `.kiro/specs/project.json`)

## Security Considerations

- Validate base path to prevent directory traversal attacks
- Ensure base path is within allowed directories
- Check file permissions before operations
- Log all path operations for audit trail
