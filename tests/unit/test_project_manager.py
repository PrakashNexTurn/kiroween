"""Unit tests for the ProjectManager class."""

import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

from src.project_manager import (
    ProjectManager,
    ProjectAlreadyExistsError,
    ProjectNotFoundError,
    InvalidProjectNameError,
    ProjectManagerError,
)
from src.models import Phase, ProjectMetadata, TaskStats


class TestProjectManager:
    """Test suite for ProjectManager."""

    @pytest.fixture
    def temp_dir(self):
        """Create a temporary directory for testing."""
        temp_path = tempfile.mkdtemp()
        yield temp_path
        shutil.rmtree(temp_path, ignore_errors=True)

    @pytest.fixture
    def project_manager(self, temp_dir):
        """Create a ProjectManager instance with a temporary base path."""
        return ProjectManager(base_path=temp_dir)

    def test_sanitize_project_name_basic(self):
        """Test basic project name sanitization."""
        assert ProjectManager.sanitize_project_name("My Project") == "my-project"
        assert ProjectManager.sanitize_project_name("Test_Project") == "test-project"
        assert ProjectManager.sanitize_project_name("UPPERCASE") == "uppercase"

    def test_sanitize_project_name_special_chars(self):
        """Test sanitization removes special characters."""
        assert ProjectManager.sanitize_project_name("My Project!") == "my-project"
        assert ProjectManager.sanitize_project_name("Test@#$%Project") == "testproject"
        assert ProjectManager.sanitize_project_name("Hello (World)") == "hello-world"

    def test_sanitize_project_name_consecutive_hyphens(self):
        """Test sanitization removes consecutive hyphens."""
        assert ProjectManager.sanitize_project_name("My---Project") == "my-project"
        assert ProjectManager.sanitize_project_name("Test  Project") == "test-project"

    def test_sanitize_project_name_leading_trailing_hyphens(self):
        """Test sanitization removes leading and trailing hyphens."""
        assert ProjectManager.sanitize_project_name("-My-Project-") == "my-project"
        assert ProjectManager.sanitize_project_name("___Test___") == "test"

    def test_sanitize_project_name_empty_raises_error(self):
        """Test that empty names raise InvalidProjectNameError."""
        with pytest.raises(InvalidProjectNameError):
            ProjectManager.sanitize_project_name("")
        
        with pytest.raises(InvalidProjectNameError):
            ProjectManager.sanitize_project_name("   ")
        
        with pytest.raises(InvalidProjectNameError):
            ProjectManager.sanitize_project_name("@#$%")

    def test_create_project_success(self, project_manager, temp_dir):
        """Test successful project creation."""
        project = project_manager.create_project("Test Project", "A test project")

        # Verify project ID is sanitized
        assert project.metadata.project_id == "test-project"
        assert project.metadata.name == "Test Project"
        assert project.metadata.description == "A test project"
        assert project.metadata.phase == Phase.INIT
        assert project.metadata.completion_percentage == 0.0

        # Verify directory structure
        project_path = Path(temp_dir) / "test-project"
        assert project_path.exists()
        assert (project_path / "project.json").exists()
        assert (project_path / "requirements.md").exists()
        assert (project_path / "design.md").exists()
        assert (project_path / "tasks.md").exists()

        # Verify empty spec files
        assert (project_path / "requirements.md").read_text() == ""
        assert (project_path / "design.md").read_text() == ""
        assert (project_path / "tasks.md").read_text() == ""

    def test_create_project_duplicate_raises_error(self, project_manager):
        """Test that creating a duplicate project raises an error."""
        project_manager.create_project("Test Project", "First project")

        with pytest.raises(ProjectAlreadyExistsError):
            project_manager.create_project("Test Project", "Duplicate project")

    def test_create_project_invalid_name_raises_error(self, project_manager):
        """Test that invalid project names raise an error."""
        with pytest.raises(InvalidProjectNameError):
            project_manager.create_project("", "Empty name")

        with pytest.raises(InvalidProjectNameError):
            project_manager.create_project("@#$%", "Only special chars")

    def test_load_project_success(self, project_manager):
        """Test successful project loading."""
        # Create a project first
        created_project = project_manager.create_project("Load Test", "Test loading")

        # Load the project
        loaded_project = project_manager.load_project("load-test")

        assert loaded_project.metadata.project_id == "load-test"
        assert loaded_project.metadata.name == "Load Test"
        assert loaded_project.metadata.description == "Test loading"
        assert loaded_project.metadata.phase == Phase.INIT

    def test_load_project_not_found_raises_error(self, project_manager):
        """Test that loading a non-existent project raises an error."""
        with pytest.raises(ProjectNotFoundError):
            project_manager.load_project("non-existent-project")

    def test_list_projects_empty(self, project_manager):
        """Test listing projects when none exist."""
        projects = project_manager.list_projects()
        assert projects == []

    def test_list_projects_multiple(self, project_manager):
        """Test listing multiple projects."""
        # Create multiple projects
        project_manager.create_project("Project One", "First project")
        project_manager.create_project("Project Two", "Second project")
        project_manager.create_project("Project Three", "Third project")

        # List projects
        projects = project_manager.list_projects()

        assert len(projects) == 3
        project_ids = {p.project_id for p in projects}
        assert project_ids == {"project-one", "project-two", "project-three"}

        # Verify summary fields
        for project in projects:
            assert project.name is not None
            assert project.description is not None
            assert project.phase is not None
            assert project.completion_percentage is not None
            assert project.updated_at is not None

    def test_update_project_phase(self, project_manager):
        """Test updating project phase."""
        # Create a project
        project_manager.create_project("Phase Test", "Test phase updates")

        # Update phase
        project_manager.update_project_phase("phase-test", Phase.SPEC)

        # Verify phase was updated
        loaded_project = project_manager.load_project("phase-test")
        assert loaded_project.metadata.phase == Phase.SPEC

    def test_update_project_phase_not_found_raises_error(self, project_manager):
        """Test that updating phase of non-existent project raises an error."""
        with pytest.raises(ProjectNotFoundError):
            project_manager.update_project_phase("non-existent", Phase.SPEC)

    def test_calculate_completion_zero_tasks(self, project_manager):
        """Test completion calculation with zero tasks."""
        project_manager.create_project("Zero Tasks", "No tasks")

        completion = project_manager.calculate_completion("zero-tasks")
        assert completion == 0.0

    def test_calculate_completion_with_tasks(self, project_manager, temp_dir):
        """Test completion calculation with tasks."""
        # Create a project
        project = project_manager.create_project("Task Test", "Test tasks")

        # Update task stats
        project.metadata.task_stats.total = 10
        project.metadata.task_stats.completed = 4
        project_manager.save_metadata("task-test", project.metadata)

        # Calculate completion
        completion = project_manager.calculate_completion("task-test")
        assert completion == 40.0

    def test_calculate_completion_all_complete(self, project_manager):
        """Test completion calculation when all tasks are complete."""
        # Create a project
        project = project_manager.create_project("Complete Test", "All done")

        # Update task stats
        project.metadata.task_stats.total = 5
        project.metadata.task_stats.completed = 5
        project_manager.save_metadata("complete-test", project.metadata)

        # Calculate completion
        completion = project_manager.calculate_completion("complete-test")
        assert completion == 100.0

    def test_save_metadata_updates_timestamp(self, project_manager):
        """Test that saving metadata updates the timestamp."""
        # Create a project
        project = project_manager.create_project("Timestamp Test", "Test timestamps")
        original_updated_at = project.metadata.updated_at

        # Wait a tiny bit and save metadata
        import time
        time.sleep(0.01)

        project.metadata.description = "Updated description"
        project_manager.save_metadata("timestamp-test", project.metadata)

        # Load and verify timestamp was updated
        loaded_project = project_manager.load_project("timestamp-test")
        assert loaded_project.metadata.updated_at > original_updated_at
        assert loaded_project.metadata.description == "Updated description"

    def test_save_metadata_without_metadata_param(self, project_manager):
        """Test saving metadata without passing metadata parameter."""
        # Create a project
        project_manager.create_project("Save Test", "Test save")

        # Save metadata without parameter (should load current metadata)
        project_manager.save_metadata("save-test")

        # Verify project still loads correctly
        loaded_project = project_manager.load_project("save-test")
        assert loaded_project.metadata.project_id == "save-test"

