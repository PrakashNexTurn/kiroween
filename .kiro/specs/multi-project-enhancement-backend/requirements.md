# Requirements Document

## Introduction

This feature modifies the Kiro Project Orchestrator to support multiple projects with separate base paths. Currently, all projects are stored under a single `.kiro/specs` directory. The new structure will allow each project to have its own base directory (e.g., `<base_path>/project1/`) containing both the `.kiro/specs` folder and the actual project code (frontend, backend, etc.).

## Glossary

- **Base Path**: The root directory configured in `.env` where all projects are stored
- **Project Directory**: A top-level folder under the base path for a specific project (e.g., `project1`, `project2`)
- **Spec Directory**: The `.kiro/specs` folder within each project directory containing requirements, design, and tasks files
- **Project Code**: The actual application code folders (frontend, backend, etc.) within each project directory
- **Orchestrator**: The Kiro Project Orchestrator backend system
- **kiro-cli**: The command-line interface tool used to execute instructions

## Requirements

### Requirement 1

**User Story:** As a developer, I want to configure a base path for all projects, so that I can organize multiple projects in a centralized location.

#### Acceptance Criteria

1. WHEN the Orchestrator starts THEN the system SHALL read the base path from the `KIRO_BASE_PATH` environment variable
2. WHEN `KIRO_BASE_PATH` is not set THEN the system SHALL use the current working directory as the default base path
3. WHEN the base path is configured THEN the system SHALL validate that the path exists or can be created
4. WHEN the base path is invalid THEN the system SHALL log an error and fail to start
5. WHEN the base path is set THEN the system SHALL use it as the root for all project directories

### Requirement 2

**User Story:** As a developer, I want each project to have its own directory structure, so that project specs and code are co-located.

#### Acceptance Criteria

1. WHEN a project is created THEN the system SHALL create a directory structure `<base_path>/<project_id>/.kiro/specs/`
2. WHEN a project is created THEN the system SHALL store spec files (requirements.md, design.md, tasks.md) in `<base_path>/<project_id>/.kiro/specs/`
3. WHEN a project is created THEN the system SHALL store project metadata in `<base_path>/<project_id>/.kiro/specs/project.json`
4. WHEN project code is generated THEN the system SHALL place it in `<base_path>/<project_id>/` alongside the `.kiro` folder
5. WHEN listing projects THEN the system SHALL scan `<base_path>` for directories containing `.kiro/specs/project.json`

### Requirement 3

**User Story:** As a developer, I want kiro-cli instructions to reference the correct project paths, so that code generation works in the right location.

#### Acceptance Criteria

1. WHEN generating spec instructions THEN the system SHALL use the path `<base_path>/<project_id>/.kiro/specs/` in the instruction
2. WHEN generating task execution instructions THEN the system SHALL use the path `<base_path>/<project_id>/` as the working directory
3. WHEN generating build instructions THEN the system SHALL reference the project root `<base_path>/<project_id>/`
4. WHEN generating test instructions THEN the system SHALL reference the project root `<base_path>/<project_id>/`
5. WHEN generating fix instructions THEN the system SHALL reference the project root `<base_path>/<project_id>/`

### Requirement 4

**User Story:** As a developer, I want the system to maintain backward compatibility, so that existing projects continue to work.

#### Acceptance Criteria

1. WHEN `KIRO_BASE_PATH` is set to `.` THEN the system SHALL behave identically to the current implementation
2. WHEN existing projects are in `.kiro/specs/` THEN the system SHALL continue to load them correctly if base path is `.`
3. WHEN the base path changes THEN the system SHALL not automatically migrate existing projects
4. WHEN loading a project THEN the system SHALL construct paths relative to the configured base path
5. WHEN saving project metadata THEN the system SHALL use paths relative to the configured base path

### Requirement 5

**User Story:** As a developer, I want clear error messages when path configuration is incorrect, so that I can quickly diagnose issues.

#### Acceptance Criteria

1. WHEN the base path does not exist and cannot be created THEN the system SHALL log a descriptive error message
2. WHEN a project directory is missing THEN the system SHALL return a clear "project not found" error
3. WHEN spec files are missing THEN the system SHALL indicate which files are missing and their expected paths
4. WHEN path permissions are insufficient THEN the system SHALL log a permission error with the affected path
5. WHEN logging path-related operations THEN the system SHALL include the full resolved path for debugging
