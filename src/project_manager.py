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

        # Check if project already exists
        project_path = self.base_path / project_id
        if self.file_ops.directory_exists(str(project_path)):
            raise ProjectAlreadyExistsError(
                f"Project '{project_id}' already exists at {project_path}"
            )

        try:
            # Create project directory
            self.file_ops.create_directory(str(project_path))

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

            # Save metadata to project.json
            metadata_path = project_path / "project.json"
            self.file_ops.write_json(str(metadata_path), metadata.to_dict())

            # Create empty spec files
            requirements_path = project_path / "requirements.md"
            design_path = project_path / "design.md"
            tasks_path = project_path / "tasks.md"

            self.file_ops.write_file(str(requirements_path), "")
            self.file_ops.write_file(str(design_path), "")
            self.file_ops.write_file(str(tasks_path), "")

            # Create and return Project object
            return Project(
                metadata=metadata,
                project_path=str(project_path),
                requirements_path=str(requirements_path),
                design_path=str(design_path),
                tasks_path=str(tasks_path),
            )

        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to create project '{project_id}': {str(e)}"
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
        project_path = self.base_path / project_id

        if not self.file_ops.directory_exists(str(project_path)):
            raise ProjectNotFoundError(f"Project '{project_id}' not found")

        try:
            # Load metadata
            metadata_path = project_path / "project.json"
            metadata_dict = self.file_ops.read_json(str(metadata_path))
            metadata = ProjectMetadata.from_dict(metadata_dict)

            # Build file paths
            requirements_path = project_path / "requirements.md"
            design_path = project_path / "design.md"
            tasks_path = project_path / "tasks.md"

            return Project(
                metadata=metadata,
                project_path=str(project_path),
                requirements_path=str(requirements_path),
                design_path=str(design_path),
                tasks_path=str(tasks_path),
            )

        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to load project '{project_id}': {str(e)}"
            ) from e
        except Exception as e:
            raise ProjectManagerError(
                f"Failed to parse project metadata for '{project_id}': {str(e)}"
            ) from e

    @log_operation("list_projects")
    def list_projects(self) -> List[ProjectSummary]:
        """
        List all projects in the base directory.

        Returns:
            List of ProjectSummary objects for all valid projects

        Raises:
            ProjectManagerError: If listing projects fails
        """
        if not self.file_ops.directory_exists(str(self.base_path)):
            return []

        projects = []

        try:
            # List all directories in base path
            items = self.file_ops.list_directory(str(self.base_path))

            for item in items:
                item_path = self.base_path / item
                if not self.file_ops.directory_exists(str(item_path)):
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
                f"Failed to list projects: {str(e)}"
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
        project = self.load_project(project_id)
        project.metadata.phase = phase
        project.metadata.updated_at = datetime.utcnow()
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

        project_path = self.base_path / project_id
        metadata_path = project_path / "project.json"

        # Update the updated_at timestamp
        metadata.updated_at = datetime.utcnow()

        try:
            self.file_ops.write_json(str(metadata_path), metadata.to_dict())
        except FileOperationError as e:
            raise ProjectManagerError(
                f"Failed to save metadata for project '{project_id}': {str(e)}"
            ) from e

