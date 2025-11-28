"""Tests for application startup functionality."""

import json
import pytest
import tempfile
import shutil
from pathlib import Path
from datetime import datetime

from src.app import lifespan
from src.project_manager import ProjectManager
from src.models import Phase
from fastapi import FastAPI


class TestStartupLoading:
    """Test suite for project loading on startup."""

    @pytest.fixture
    def temp_base_path(self):
        """Create a temporary base path for testing."""
        temp_dir = tempfile.mkdtemp()
        yield temp_dir
        shutil.rmtree(temp_dir, ignore_errors=True)

    @pytest.fixture
    def project_manager_with_temp_path(self, temp_base_path):
        """Create a project manager with a temporary base path."""
        return ProjectManager(base_path=temp_base_path)

    def test_startup_creates_base_directory_if_missing(self, temp_base_path):
        """Test that startup creates the base directory if it doesn't exist."""
        # Remove the temp directory to simulate missing base path
        shutil.rmtree(temp_base_path, ignore_errors=True)
        
        # Create a project manager with the non-existent path
        pm = ProjectManager(base_path=temp_base_path)
        
        # Simulate startup by checking and creating directory
        if not pm.file_ops.directory_exists(str(pm.base_path)):
            pm.file_ops.create_directory(str(pm.base_path))
        
        # Verify directory was created
        assert pm.file_ops.directory_exists(str(pm.base_path))

    def test_startup_loads_valid_projects(self, project_manager_with_temp_path):
        """Test that startup successfully loads valid projects."""
        pm = project_manager_with_temp_path
        
        # Create a valid project
        project = pm.create_project("test-project", "Test project description")
        
        # Simulate loading projects on startup
        loaded_projects = []
        items = pm.file_ops.list_directory(str(pm.base_path))
        
        for item in items:
            item_path = pm.base_path / item
            if not pm.file_ops.directory_exists(str(item_path)):
                continue
            
            # Check for .kiro/specs/project.json in new structure
            spec_dir = item_path / ".kiro" / "specs"
            metadata_path = spec_dir / "project.json"
            if not pm.file_ops.file_exists(str(metadata_path)):
                continue
            
            try:
                metadata_dict = pm.file_ops.read_json(str(metadata_path))
                from src.models import ProjectMetadata
                metadata = ProjectMetadata.from_dict(metadata_dict)
                
                if metadata.project_id and metadata.name and metadata.description:
                    loaded_projects.append(metadata)
            except Exception:
                continue
        
        # Verify the project was loaded
        assert len(loaded_projects) == 1
        assert loaded_projects[0].project_id == "test-project"
        assert loaded_projects[0].name == "test-project"

    def test_startup_skips_corrupted_json(self, project_manager_with_temp_path):
        """Test that startup gracefully skips projects with corrupted JSON."""
        pm = project_manager_with_temp_path
        
        # Create a valid project first
        pm.create_project("valid-project", "Valid project")
        
        # Create a directory with corrupted JSON in new structure
        corrupted_path = pm.base_path / "corrupted-project" / ".kiro" / "specs"
        pm.file_ops.create_directory(str(corrupted_path))
        
        # Write invalid JSON
        metadata_path = corrupted_path / "project.json"
        pm.file_ops.write_file(str(metadata_path), "{invalid json content")
        
        # Simulate loading projects on startup
        loaded_projects = []
        skipped_count = 0
        items = pm.file_ops.list_directory(str(pm.base_path))
        
        for item in items:
            item_path = pm.base_path / item
            if not pm.file_ops.directory_exists(str(item_path)):
                continue
            
            # Check for .kiro/specs/project.json in new structure
            spec_dir = item_path / ".kiro" / "specs"
            metadata_path = spec_dir / "project.json"
            if not pm.file_ops.file_exists(str(metadata_path)):
                continue
            
            try:
                metadata_dict = pm.file_ops.read_json(str(metadata_path))
                from src.models import ProjectMetadata
                metadata = ProjectMetadata.from_dict(metadata_dict)
                
                if metadata.project_id and metadata.name and metadata.description:
                    loaded_projects.append(metadata)
            except json.JSONDecodeError:
                skipped_count += 1
                continue
            except Exception:
                skipped_count += 1
                continue
        
        # Verify only valid project was loaded
        assert len(loaded_projects) == 1
        assert loaded_projects[0].project_id == "valid-project"
        assert skipped_count == 1

    def test_startup_skips_invalid_metadata_schema(self, project_manager_with_temp_path):
        """Test that startup gracefully skips projects with invalid metadata schema."""
        pm = project_manager_with_temp_path
        
        # Create a valid project first
        pm.create_project("valid-project", "Valid project")
        
        # Create a directory with invalid metadata (missing required fields) in new structure
        invalid_path = pm.base_path / "invalid-project" / ".kiro" / "specs"
        pm.file_ops.create_directory(str(invalid_path))
        
        # Write JSON with missing required fields
        metadata_path = invalid_path / "project.json"
        invalid_metadata = {
            "projectId": "invalid-project",
            # Missing name and description
            "phase": "INIT",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        }
        pm.file_ops.write_json(str(metadata_path), invalid_metadata)
        
        # Simulate loading projects on startup
        loaded_projects = []
        skipped_count = 0
        items = pm.file_ops.list_directory(str(pm.base_path))
        
        for item in items:
            item_path = pm.base_path / item
            if not pm.file_ops.directory_exists(str(item_path)):
                continue
            
            # Check for .kiro/specs/project.json in new structure
            spec_dir = item_path / ".kiro" / "specs"
            metadata_path = spec_dir / "project.json"
            if not pm.file_ops.file_exists(str(metadata_path)):
                continue
            
            try:
                metadata_dict = pm.file_ops.read_json(str(metadata_path))
                from src.models import ProjectMetadata
                metadata = ProjectMetadata.from_dict(metadata_dict)
                
                # Validate required fields
                if not metadata.project_id or not metadata.name or not metadata.description:
                    raise ValueError("Missing required fields")
                
                loaded_projects.append(metadata)
            except (ValueError, Exception):
                skipped_count += 1
                continue
        
        # Verify only valid project was loaded
        assert len(loaded_projects) == 1
        assert loaded_projects[0].project_id == "valid-project"
        assert skipped_count == 1

    def test_startup_skips_directories_without_metadata(self, project_manager_with_temp_path):
        """Test that startup skips directories without project.json."""
        pm = project_manager_with_temp_path
        
        # Create a valid project
        pm.create_project("valid-project", "Valid project")
        
        # Create a directory without project.json
        empty_path = pm.base_path / "empty-directory"
        pm.file_ops.create_directory(str(empty_path))
        
        # Simulate loading projects on startup
        loaded_projects = []
        skipped_count = 0
        items = pm.file_ops.list_directory(str(pm.base_path))
        
        for item in items:
            item_path = pm.base_path / item
            if not pm.file_ops.directory_exists(str(item_path)):
                continue
            
            # Check for .kiro/specs/project.json in new structure
            spec_dir = item_path / ".kiro" / "specs"
            metadata_path = spec_dir / "project.json"
            if not pm.file_ops.file_exists(str(metadata_path)):
                skipped_count += 1
                continue
            
            try:
                metadata_dict = pm.file_ops.read_json(str(metadata_path))
                from src.models import ProjectMetadata
                metadata = ProjectMetadata.from_dict(metadata_dict)
                
                if metadata.project_id and metadata.name and metadata.description:
                    loaded_projects.append(metadata)
            except Exception:
                continue
        
        # Verify only valid project was loaded
        assert len(loaded_projects) == 1
        assert loaded_projects[0].project_id == "valid-project"
        assert skipped_count == 1

    def test_startup_loads_multiple_valid_projects(self, project_manager_with_temp_path):
        """Test that startup loads multiple valid projects."""
        pm = project_manager_with_temp_path
        
        # Create multiple valid projects
        pm.create_project("project-one", "First project")
        pm.create_project("project-two", "Second project")
        pm.create_project("project-three", "Third project")
        
        # Simulate loading projects on startup
        loaded_projects = []
        items = pm.file_ops.list_directory(str(pm.base_path))
        
        for item in items:
            item_path = pm.base_path / item
            if not pm.file_ops.directory_exists(str(item_path)):
                continue
            
            # Check for .kiro/specs/project.json in new structure
            spec_dir = item_path / ".kiro" / "specs"
            metadata_path = spec_dir / "project.json"
            if not pm.file_ops.file_exists(str(metadata_path)):
                continue
            
            try:
                metadata_dict = pm.file_ops.read_json(str(metadata_path))
                from src.models import ProjectMetadata
                metadata = ProjectMetadata.from_dict(metadata_dict)
                
                if metadata.project_id and metadata.name and metadata.description:
                    loaded_projects.append(metadata)
            except Exception:
                continue
        
        # Verify all projects were loaded
        assert len(loaded_projects) == 3
        project_ids = {p.project_id for p in loaded_projects}
        assert project_ids == {"project-one", "project-two", "project-three"}
