"""Project manager module for the Kiro Project Orchestrator."""

import re
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from src.file_ops import FileOperations, FileOperationError
from src.models import (
    Project,
    ProjectMetadata,
    ProjectSummary,
    Phase,
    SpecGenerated,
    TaskStats,
    BuildConfig,
)
from src.logger import log_operation


class ProjectManagerError(Exception):
    """Base exception for project manager errors."""
    pass


class ProjectAlreadyExistsError(ProjectManagerError):
    """Exception raised when attempting to create a duplicate project."""
    pass


class ProjectNotFoundError(ProjectManagerError):
    """Exception raised when a project cannot be found."""
    pass


class InvalidProjectNameError(ProjectManagerError):
    """Exception raised when a project name is invalid."""
    pass


class ProjectManager:
    """Manages project lifecycle and operations."""

    def __init__(self, base_path: str = ".kiro/specs"):
        """
        Initialize the ProjectManager.

        Args:
            base_path: Base directory for storing projects (default: .kiro/specs)
        """
        self.base_path = Path(base_path)
        self.file_ops = FileOperations()

    def _get_project_root(self, project_id: str) -> Path:
        """
        Get the root directory for a project.

        Args:
            project_id: The project identifier

        Returns:
            Path to project root: <base_path>/<project_id>/
        """
        return self.base_path / project_id

    def _get_spec_dir(self, project_id: str) -> Path:
        """
        Get the spec directory for a project.

        Args:
            project_id: The project identifier

        Returns:
            Path to spec directory: <base_path>/<project_id>/.kiro/specs/
        """
        return self._get_project_root(project_id) / ".kiro" / "specs"

    @staticmethod
    def sanitize_project_name(name: str) -> str:
        """
        Sanitize a project name to kebab-case format.

        Converts the name to lowercase, replaces spaces and underscores with hyphens,
        removes invalid characters, and ensures no leading/trailing/consecutive hyphens.

        Args:
            name: The project name to sanitize

        Returns:
            Sanitized project name in kebab-case format

        Raises:
            InvalidProjectNameError: If the sanitized name is empty
        """
        if not name or not name.strip():
            raise InvalidProjectNameError("Project name cannot be empty")

        # Convert to lowercase
        sanitized = name.lower()

        # Replace spaces and underscores with hyphens
        sanitized = sanitized.replace(' ', '-').replace('_', '-')

        # Remove all characters except alphanumeric and hyphens
        sanitized = re.sub(r'[^a-z0-9-]', '', sanitized)

        # Remove consecutive hyphens
        sanitized = re.sub(r'-+', '-', sanitized)

        # Remove leading and trailing hyphens
        sanitized = sanitized.strip('-')

        if not sanitized:
            raise InvalidProjectNameError(
                f"Project name '{name}' results in empty string after sanitization"
            )

        return sanitized

    @log_operation("create_project")
    def create_project(self, name: str, description: str) -> Project:
        """
        Create a new project with directory structure and metadata.

        Args:
            name: Project name (will be sanitized to kebab-case)
            description: Project description

        Returns:
            Created Project object

        Raises:
            ProjectAlreadyExistsError: If a project with the same name already exists
            InvalidProjectNameError: If the project name is invalid
            ProjectManagerError: If project creation fails
        """
        # Sanitize the project name
        project_id = self.sanitize_project_name(name)

        # Get project paths using new structure
        project_root = self._get_project_root(project_id)
        spec_dir = self._get_spec_dir(project_id)

        # Check if project already exists
        if self.file_ops.directory_exists(str(project_root)):
            raise ProjectAlreadyExistsError(
                f"Project '{project_id}' already exists at {project_root.resolve()}"
            )

        # Log the paths being created
        from src.logger import get_logger
        logger = get_logger()
        logger.info(f"Creating project '{project_id}' at {project_root.resolve()}")
        logger.info(f"Spec directory will be created at {spec_dir.resolve()}")

        try:
            # Create project directory structure: <base_path>/<project_id>/.kiro/specs/
            self.file_ops.create_directory(str(spec_dir))

            # Create metadata
            now = datetime.utcnow()
            metadata = ProjectMetadata(
                project_id=project_id,
                name=name,
                description=description,
                phase=Phase.INIT,
                created_at=now,
                updated_at=now,
                spec_generated=SpecGenerated(),
                task_stats=TaskStats(),
                build_config=BuildConfig(),
                completion_percentage=0.0,
            )

            # Save metadata to project.json in spec directory
            metadata_path = spec_dir / "project.json"
            self.file_ops.write_json(str(metadata_path), metadata.to_dict())

            # Create empty spec files in spec directory
            requirements_path = spec_dir / "requirements.md"
            design_path = spec_dir / "design.md"
            tasks_path = spec_dir / "tasks.md"

            self.file_ops.write_file(str(requirements_path), "")
            self.file_ops.write_file(str(design_path), "")
            self.file_ops.write_file(str(tasks_path), "")

            # Create and return Project object
            return Project(
                metadata=metadata,
                project_root=str(project_root),
                spec_dir=str(spec_dir),
                project_path=str(spec_dir),  # Backward compatibility
                requirements_path=str(requirements_path),
                design_path=str(design_path),
                tasks_path=str(tasks_path),
            )

        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to create project '{project_id}' at {project_root.resolve()}: {str(e)}"
            ) from e

    @log_operation("load_project")
    def load_project(self, project_id: str) -> Project:
        """
        Load an existing project from disk.

        Args:
            project_id: The project identifier (sanitized name)

        Returns:
            Loaded Project object

        Raises:
            ProjectNotFoundError: If the project does not exist
            ProjectManagerError: If project loading fails
        """
        # Get project paths using new structure
        project_root = self._get_project_root(project_id)
        spec_dir = self._get_spec_dir(project_id)

        # Check if project root exists
        if not self.file_ops.directory_exists(str(project_root)):
            raise ProjectNotFoundError(
                f"Project '{project_id}' not found. Expected project root at: {project_root.resolve()}"
            )

        # Check if spec directory exists
        if not self.file_ops.directory_exists(str(spec_dir)):
            raise ProjectNotFoundError(
                f"Project '{project_id}' spec directory not found. Expected at: {spec_dir.resolve()}"
            )

        # Log the paths being loaded
        from src.logger import get_logger
        logger = get_logger()
        logger.info(f"Loading project '{project_id}' from {project_root.resolve()}")
        logger.info(f"Spec directory: {spec_dir.resolve()}")

        try:
            # Load metadata from spec directory
            metadata_path = spec_dir / "project.json"
            
            # Check if metadata file exists and provide clear error if missing
            if not self.file_ops.file_exists(str(metadata_path)):
                raise ProjectNotFoundError(
                    f"Project metadata file missing. Expected at: {metadata_path.resolve()}"
                )
            
            metadata_dict = self.file_ops.read_json(str(metadata_path))
            metadata = ProjectMetadata.from_dict(metadata_dict)

            # Build file paths in spec directory
            requirements_path = spec_dir / "requirements.md"
            design_path = spec_dir / "design.md"
            tasks_path = spec_dir / "tasks.md"
            
            # Check for missing spec files and report them
            missing_files = []
            if not self.file_ops.file_exists(str(requirements_path)):
                missing_files.append(f"requirements.md at {requirements_path.resolve()}")
            if not self.file_ops.file_exists(str(design_path)):
                missing_files.append(f"design.md at {design_path.resolve()}")
            if not self.file_ops.file_exists(str(tasks_path)):
                missing_files.append(f"tasks.md at {tasks_path.resolve()}")
            
            if missing_files:
                from src.logger import get_logger
                logger = get_logger()
                logger.warning(
                    f"Project '{project_id}' is missing spec files: {', '.join(missing_files)}"
                )

            return Project(
                metadata=metadata,
                project_root=str(project_root),
                spec_dir=str(spec_dir),
                project_path=str(spec_dir),  # Backward compatibility
                requirements_path=str(requirements_path),
                design_path=str(design_path),
                tasks_path=str(tasks_path),
            )

        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to load project '{project_id}' from {project_root.resolve()}: {str(e)}"
            ) from e
        except Exception as e:
            raise ProjectManagerError(
                f"Failed to parse project metadata for '{project_id}' at {spec_dir.resolve()}/project.json: {str(e)}"
            ) from e

    @log_operation("list_projects")
    def list_projects(self) -> List[ProjectSummary]:
        """
        List all projects in the base directory.

        Scans base path for directories containing .kiro/specs/project.json

        Returns:
            List of ProjectSummary objects for all valid projects

        Raises:
            ProjectManagerError: If listing projects fails
        """
        from src.logger import get_logger
        logger = get_logger()
        
        if not self.file_ops.directory_exists(str(self.base_path)):
            logger.info(f"Base path does not exist: {self.base_path.resolve()}")
            return []

        logger.info(f"Listing projects in base path: {self.base_path.resolve()}")
        projects = []

        try:
            # List all directories in base path
            items = self.file_ops.list_directory(str(self.base_path))

            for item in items:
                item_path = self.base_path / item
                if not self.file_ops.directory_exists(str(item_path)):
                    continue

                # Check if this directory contains .kiro/specs/project.json
                spec_dir = item_path / ".kiro" / "specs"
                metadata_path = spec_dir / "project.json"

                if not self.file_ops.file_exists(str(metadata_path)):
                    # Skip directories without valid project structure
                    continue

                # Try to load project metadata
                try:
                    project = self.load_project(item)
                    summary = ProjectSummary(
                        project_id=project.metadata.project_id,
                        name=project.metadata.name,
                        description=project.metadata.description,
                        phase=project.metadata.phase,
                        completion_percentage=project.metadata.completion_percentage,
                        updated_at=project.metadata.updated_at,
                    )
                    projects.append(summary)
                except (ProjectNotFoundError, ProjectManagerError):
                    # Skip invalid projects
                    continue

            return projects

        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to list projects in base path {self.base_path.resolve()}: {str(e)}"
            ) from e

    @log_operation("update_project_phase")
    def update_project_phase(self, project_id: str, phase: Phase) -> None:
        """
        Update the phase of a project and save metadata.

        Args:
            project_id: The project identifier
            phase: The new phase to set

        Raises:
            ProjectNotFoundError: If the project does not exist
            ProjectManagerError: If updating the phase fails
        """
        from src.logger import get_logger
        logger = get_logger()
        
        project = self.load_project(project_id)
        project.metadata.phase = phase
        project.metadata.updated_at = datetime.utcnow()
        
        logger.info(f"Updating project '{project_id}' phase to {phase.value} at {project.project_root}")
        self.save_metadata(project_id, project.metadata)

    def calculate_completion(self, project_id: str) -> float:
        """
        Calculate the completion percentage for a project based on task statistics.

        Args:
            project_id: The project identifier

        Returns:
            Completion percentage (0.0 to 100.0)

        Raises:
            ProjectNotFoundError: If the project does not exist
            ProjectManagerError: If calculation fails
        """
        project = self.load_project(project_id)
        task_stats = project.metadata.task_stats

        # Calculate total non-optional tasks
        # For now, we use the total from task_stats
        # In a real implementation, this would parse tasks.md to exclude optional tasks
        total_tasks = task_stats.total

        if total_tasks == 0:
            return 0.0

        completed_tasks = task_stats.completed
        percentage = (completed_tasks / total_tasks) * 100.0

        return round(percentage, 2)

    @log_operation("save_metadata")
    def save_metadata(self, project_id: str, metadata: Optional[ProjectMetadata] = None) -> None:
        """
        Save project metadata to disk immediately.

        Args:
            project_id: The project identifier
            metadata: Optional metadata to save. If None, loads current metadata.

        Raises:
            ProjectNotFoundError: If the project does not exist
            ProjectManagerError: If saving metadata fails
        """
        if metadata is None:
            project = self.load_project(project_id)
            metadata = project.metadata

        # Use new path structure: <base_path>/<project_id>/.kiro/specs/project.json
        spec_dir = self._get_spec_dir(project_id)
        metadata_path = spec_dir / "project.json"

        # Update the updated_at timestamp
        metadata.updated_at = datetime.utcnow()

        try:
            self.file_ops.write_json(str(metadata_path), metadata.to_dict())
        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to save metadata for project '{project_id}' at {metadata_path.resolve()}: {str(e)}"
            ) from e

